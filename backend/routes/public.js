import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Student lookup by USN - no auth required
router.get('/student-lookup', async (req, res) => {
  try {
    const { usn } = req.query;
    if (!usn) return res.status(400).json({ error: 'usn is required' });

    // Get student basic info
    const sres = await pool.query(
      `SELECT s.id, s.usn, s.full_name, s.email, s.semester,
              c.course_code, c.course_name
       FROM students s
       LEFT JOIN courses c ON s.course_id = c.id
       WHERE s.usn = $1`,
      [usn]
    );

    if (sres.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = sres.rows[0];

    // Get seating allocations for the student
    const ares = await pool.query(
      `SELECT sa.id as allocation_id,
              e.id as exam_id, e.subject_name, e.subject_code, e.exam_date, e.exam_time_start, e.exam_time_end,
              cl.room_number, cl.floor_id,
              b.bench_number, sa.seat_number
       FROM seating_allocations sa
       JOIN exams e ON sa.exam_id = e.id
       JOIN classrooms cl ON sa.classroom_id = cl.id
       JOIN benches b ON sa.bench_id = b.id
       WHERE sa.student_id = $1
       ORDER BY e.exam_date DESC, e.exam_time_start DESC`,
      [student.id]
    );

    res.json({ student, allocations: ares.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to lookup student' });
  }
});

export default router;
