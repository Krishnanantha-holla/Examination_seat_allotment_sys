import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Get all exams
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, c.course_name, c.course_code 
       FROM exams e 
       JOIN courses c ON e.course_id = c.id 
       ORDER BY e.exam_date DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// Get exam by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, c.course_name, c.course_code 
       FROM exams e 
       JOIN courses c ON e.course_id = c.id 
       WHERE e.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch exam' });
  }
});

// Create exam
router.post('/', verifyToken, [
  body('exam_date').isISO8601().withMessage('Valid date is required'),
  body('exam_time_start').matches(/^\d{2}:\d{2}$/).withMessage('Valid time is required'),
  body('exam_time_end').matches(/^\d{2}:\d{2}$/).withMessage('Valid time is required'),
  body('subject_name').notEmpty().withMessage('Subject name is required'),
  body('course_id').isInt().withMessage('Valid course ID is required'),
  body('semester').isInt().withMessage('Semester is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { exam_date, exam_time_start, exam_time_end, subject_code, subject_name, course_id, semester } = req.body;

    const result = await pool.query(
      `INSERT INTO exams (exam_date, exam_time_start, exam_time_end, subject_code, subject_name, course_id, semester)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [exam_date, exam_time_start, exam_time_end, subject_code, subject_name, course_id, semester]
    );

    res.status(201).json({
      message: 'Exam created successfully',
      exam: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

// Update exam
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { exam_date, exam_time_start, exam_time_end, subject_name, status } = req.body;

    const result = await pool.query(
      `UPDATE exams 
       SET exam_date = COALESCE($1, exam_date),
           exam_time_start = COALESCE($2, exam_time_start),
           exam_time_end = COALESCE($3, exam_time_end),
           subject_name = COALESCE($4, subject_name),
           status = COALESCE($5, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [exam_date, exam_time_start, exam_time_end, subject_name, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.json({
      message: 'Exam updated successfully',
      exam: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update exam' });
  }
});

// Delete exam
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM exams WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete exam' });
  }
});

export default router;
