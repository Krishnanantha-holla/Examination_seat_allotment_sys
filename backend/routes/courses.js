import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Get all courses
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM courses ORDER BY course_code'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Create course
router.post('/', verifyToken, [
  body('course_code').notEmpty().withMessage('Course code is required'),
  body('course_name').notEmpty().withMessage('Course name is required'),
  body('semester').isInt().withMessage('Semester is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { course_code, course_name, semester } = req.body;

    const result = await pool.query(
      `INSERT INTO courses (course_code, course_name, semester)
       VALUES ($1, $2, $3) RETURNING *`,
      [course_code, course_name, semester]
    );

    res.status(201).json({
      message: 'Course created successfully',
      course: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Enroll students in exam
router.post('/enroll', verifyToken, async (req, res) => {
  try {
    const { exam_id, student_ids } = req.body;

    if (!student_ids || student_ids.length === 0) {
      return res.status(400).json({ error: 'No students provided' });
    }

    let enrolledCount = 0;
    for (const student_id of student_ids) {
      const studentResult = await pool.query(
        'SELECT course_id FROM students WHERE id = $1',
        [student_id]
      );

      if (studentResult.rows.length === 0) {
        continue;
      }

      const course_id = studentResult.rows[0].course_id;

      await pool.query(
        `INSERT INTO exam_students (exam_id, student_id, course_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (exam_id, student_id) DO NOTHING`,
        [exam_id, student_id, course_id]
      );
      enrolledCount++;
    }

    res.json({
      message: `Successfully enrolled ${enrolledCount} students`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to enroll students' });
  }
});

// Get students enrolled in an exam
router.get('/exam/:examId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT es.*, s.usn, s.full_name, c.course_code, c.course_name
       FROM exam_students es
       JOIN students s ON es.student_id = s.id
       JOIN courses c ON es.course_id = c.id
       WHERE es.exam_id = $1
       ORDER BY s.usn`,
      [req.params.examId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch exam students' });
  }
});

export default router;
