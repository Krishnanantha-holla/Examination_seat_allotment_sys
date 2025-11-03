import express from 'express';
import { query, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Get seating report for an exam
router.get('/exam/:examId', verifyToken, [
  query('sortBy').optional().isIn(['classroom', 'floor', 'course']).withMessage('Invalid sort option')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { sortBy = 'classroom' } = req.query;

    let orderBy = 'f.floor_number, c.classroom_code';

    if (sortBy === 'floor') {
      orderBy = 'f.floor_number, c.classroom_code';
    } else if (sortBy === 'course') {
      orderBy = 'crs.course_code, f.floor_number, c.classroom_code';
    }

    const result = await pool.query(
      `SELECT 
        sa.id,
        sa.seat_number,
        s.usn,
        s.full_name,
        crs.course_code,
        crs.course_name,
        f.floor_number,
        c.classroom_code,
        b.bench_number,
        inv.full_name as invigilator_name,
        e.subject_name,
        e.exam_date,
        e.exam_time_start,
        e.exam_time_end
       FROM seating_allocations sa
       JOIN students s ON sa.student_id = s.id
       JOIN courses crs ON s.course_id = crs.id
       JOIN classrooms c ON sa.classroom_id = c.id
       JOIN floors f ON sa.floor_id = f.id
       JOIN benches b ON sa.bench_id = b.id
       JOIN exams e ON sa.exam_id = e.id
       LEFT JOIN exam_invigilators ei ON e.id = ei.exam_id AND c.id = ei.classroom_id
       LEFT JOIN invigilators inv ON ei.invigilator_id = inv.id
       WHERE sa.exam_id = $1
       ORDER BY ${orderBy}, b.bench_number, sa.seat_number`,
      [req.params.examId]
    );

    // Group by classroom for better formatting
    const groupedData = {};

    result.rows.forEach(row => {
      const key = `${row.floor_number}-${row.classroom_code}`;
      if (!groupedData[key]) {
        groupedData[key] = {
          floor: row.floor_number,
          classroom: row.classroom_code,
          invigilator: row.invigilator_name,
          subject: row.subject_name,
          examDate: row.exam_date,
          examTime: `${row.exam_time_start} - ${row.exam_time_end}`,
          students: []
        };
      }
      groupedData[key].students.push({
        seat: row.seat_number,
        bench: row.bench_number,
        usn: row.usn,
        name: row.full_name,
        course: row.course_code
      });
    });

    res.json({
      message: 'Report generated successfully',
      sortedBy: sortBy,
      totalRecords: result.rows.length,
      data: groupedData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Get seating statistics for an exam
router.get('/statistics/exam/:examId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(DISTINCT sa.student_id) as total_students,
        COUNT(DISTINCT sa.classroom_id) as total_classrooms,
        COUNT(DISTINCT sa.floor_id) as total_floors,
        COUNT(DISTINCT sa.bench_id) as total_benches_used,
        MAX(sa.seat_number) as max_students_per_bench,
        COUNT(DISTINCT s.course_id) as total_courses
       FROM seating_allocations sa
       JOIN students s ON sa.student_id = s.id
       WHERE sa.exam_id = $1`,
      [req.params.examId]
    );

    res.json({
      message: 'Statistics retrieved successfully',
      statistics: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get classroom-wise seating report
router.get('/classroom/:classroomId/exam/:examId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        sa.id,
        sa.seat_number,
        s.usn,
        s.full_name,
        crs.course_code,
        b.bench_number,
        c.classroom_code,
        f.floor_number
       FROM seating_allocations sa
       JOIN students s ON sa.student_id = s.id
       JOIN courses crs ON s.course_id = crs.id
       JOIN benches b ON sa.bench_id = b.id
       JOIN classrooms c ON sa.classroom_id = c.id
       JOIN floors f ON sa.floor_id = f.id
       WHERE sa.classroom_id = $1 AND sa.exam_id = $2
       ORDER BY b.bench_number, sa.seat_number`,
      [req.params.classroomId, req.params.examId]
    );

    // Group by bench
    const groupedData = {};

    result.rows.forEach(row => {
      if (!groupedData[row.bench_number]) {
        groupedData[row.bench_number] = {
          benchNumber: row.bench_number,
          students: []
        };
      }
      groupedData[row.bench_number].students.push({
        seat: row.seat_number,
        usn: row.usn,
        name: row.full_name,
        course: row.course_code
      });
    });

    res.json({
      classroom: result.rows[0]?.classroom_code || 'N/A',
      floor: result.rows[0]?.floor_number || 'N/A',
      benches: groupedData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch classroom report' });
  }
});

export default router;
