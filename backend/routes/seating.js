import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Core algorithm for seating allocation
async function allocateSeats(examId, studentsPerBench) {
  try {
    // Get all students enrolled in this exam
    const studentResult = await pool.query(
      `SELECT DISTINCT es.student_id, s.usn, s.full_name, s.course_id, c.course_code
       FROM exam_students es
       JOIN students s ON es.student_id = s.id
       JOIN courses c ON s.course_id = c.id
       WHERE es.exam_id = $1
       ORDER BY s.usn`,
      [examId]
    );

    const students = studentResult.rows;

    if (students.length === 0) {
      throw new Error('No students enrolled in this exam');
    }

    // Get all classrooms with benches
    const classroomResult = await pool.query(
      `SELECT c.*, b.id as bench_id, b.bench_number, b.capacity
       FROM classrooms c
       JOIN benches b ON c.id = b.classroom_id
       ORDER BY c.floor_id, c.id, b.bench_number`
    );

    const benches = classroomResult.rows;

    if (benches.length === 0) {
      throw new Error('No classrooms/benches available');
    }

    // Sort students by course to avoid same course in same bench
    const studentsByIndex = students.map((s, idx) => ({ ...s, index: idx }))
      .sort((a, b) => a.course_id - b.course_id);

    // Allocate students to benches
    let benchIndex = 0;
    let seatCount = 0;
    let currentBench = benches[benchIndex];
    let benchStudents = [];
    const allocations = [];

    for (const student of studentsByIndex) {
      if (seatCount >= studentsPerBench || seatCount >= currentBench.capacity) {
        // Move to next bench
        benchIndex++;
        if (benchIndex >= benches.length) {
          throw new Error('Not enough benches for all students');
        }
        currentBench = benches[benchIndex];
        seatCount = 0;
        benchStudents = [];
      }

      // Check if bench has same course already
      if (benchStudents.some(s => s.course_id === student.course_id)) {
        // Skip to next bench
        benchIndex++;
        if (benchIndex >= benches.length) {
          throw new Error('Cannot allocate seats: same course constraint violation');
        }
        currentBench = benches[benchIndex];
        seatCount = 0;
        benchStudents = [];
      }

      // Allocate student to bench
      benchStudents.push(student);
      allocations.push({
        exam_id: examId,
        student_id: student.student_id,
        floor_id: currentBench.floor_id,
        classroom_id: currentBench.id,
        bench_id: currentBench.bench_id,
        seat_number: seatCount + 1,
        invigilator_assigned: null
      });

      seatCount++;
    }

    // Insert all allocations
    for (const allocation of allocations) {
      await pool.query(
        `INSERT INTO seating_allocations 
         (exam_id, student_id, floor_id, classroom_id, bench_id, seat_number)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (exam_id, student_id) DO UPDATE SET
         floor_id = $3, classroom_id = $4, bench_id = $5, seat_number = $6`,
        [allocation.exam_id, allocation.student_id, allocation.floor_id, 
         allocation.classroom_id, allocation.bench_id, allocation.seat_number]
      );
    }

    return {
      success: true,
      totalAllocations: allocations.length,
      allocations
    };
  } catch (error) {
    throw error;
  }
}

// Allocate seats for an exam
router.post('/allocate', verifyToken, [
  body('exam_id').isInt().withMessage('Valid exam ID is required'),
  body('students_per_bench').isInt({ min: 1, max: 3 }).withMessage('Students per bench must be 1-3')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { exam_id, students_per_bench } = req.body;

    // Verify exam exists
    const examResult = await pool.query('SELECT * FROM exams WHERE id = $1', [exam_id]);
    if (examResult.rows.length === 0) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const result = await allocateSeats(exam_id, students_per_bench);

    res.json({
      message: 'Seats allocated successfully',
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to allocate seats' });
  }
});

// Get seating allocation for an exam
router.get('/exam/:examId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sa.*, s.usn, s.full_name, c.classroom_code, f.floor_number, b.bench_number
       FROM seating_allocations sa
       JOIN students s ON sa.student_id = s.id
       JOIN classrooms c ON sa.classroom_id = c.id
       JOIN floors f ON sa.floor_id = f.id
       JOIN benches b ON sa.bench_id = b.id
       WHERE sa.exam_id = $1
       ORDER BY f.floor_number, c.classroom_code, b.bench_number, sa.seat_number`,
      [req.params.examId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch seating allocation' });
  }
});

// Get seating allocation for a student in an exam
router.get('/student/:studentId/exam/:examId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sa.*, s.usn, s.full_name, c.classroom_code, f.floor_number, b.bench_number
       FROM seating_allocations sa
       JOIN students s ON sa.student_id = s.id
       JOIN classrooms c ON sa.classroom_id = c.id
       JOIN floors f ON sa.floor_id = f.id
       JOIN benches b ON sa.bench_id = b.id
       WHERE sa.student_id = $1 AND sa.exam_id = $2`,
      [req.params.studentId, req.params.examId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Seating allocation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch seating allocation' });
  }
});

// Assign invigilator to classroom
router.post('/assign-invigilator', verifyToken, [
  body('exam_id').isInt().withMessage('Valid exam ID is required'),
  body('classroom_id').isInt().withMessage('Valid classroom ID is required'),
  body('invigilator_id').isInt().withMessage('Valid invigilator ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { exam_id, classroom_id, invigilator_id } = req.body;

    const result = await pool.query(
      `INSERT INTO exam_invigilators (exam_id, classroom_id, invigilator_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (exam_id, classroom_id) 
       DO UPDATE SET invigilator_id = $3
       RETURNING *`,
      [exam_id, classroom_id, invigilator_id]
    );

    res.json({
      message: 'Invigilator assigned successfully',
      assignment: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to assign invigilator' });
  }
});

export default router;
