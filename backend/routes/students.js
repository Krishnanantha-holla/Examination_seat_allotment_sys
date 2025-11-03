import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { verifyToken } from './auth.js';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Get all students
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, c.course_code, c.course_name 
       FROM students s 
       JOIN courses c ON s.course_id = c.id 
       ORDER BY s.usn`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get student by USN
router.get('/:usn', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, c.course_code, c.course_name 
       FROM students s 
       JOIN courses c ON s.course_id = c.id 
       WHERE s.usn = $1`,
      [req.params.usn]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Create student
router.post('/', verifyToken, [
  body('usn').notEmpty().withMessage('USN is required'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('course_id').isInt().withMessage('Valid course ID is required'),
  body('semester').isInt().withMessage('Semester is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { usn, full_name, email, course_id, semester } = req.body;

    // Check if student exists
    const existingStudent = await pool.query(
      'SELECT * FROM students WHERE usn = $1',
      [usn]
    );

    if (existingStudent.rows.length > 0) {
      return res.status(400).json({ error: 'Student with this USN already exists' });
    }

    const result = await pool.query(
      `INSERT INTO students (usn, full_name, email, course_id, semester)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [usn, full_name, email, course_id, semester]
    );

    res.status(201).json({
      message: 'Student created successfully',
      student: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// Bulk upload students from CSV
router.post('/upload/csv', verifyToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const students = [];
  const errors = [];

  try {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        students.push(row);
      })
      .on('end', async () => {
        try {
          let uploadedCount = 0;

          for (const student of students) {
            try {
              // Find course by course_code
              const courseResult = await pool.query(
                'SELECT id FROM courses WHERE course_code = $1',
                [student.course_code]
              );

              if (courseResult.rows.length === 0) {
                errors.push(`Course ${student.course_code} not found for student ${student.usn}`);
                continue;
              }

              const courseId = courseResult.rows[0].id;

              // Insert student
              await pool.query(
                `INSERT INTO students (usn, full_name, email, course_id, semester)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (usn) DO NOTHING`,
                [student.usn, student.full_name, student.email, courseId, student.semester]
              );

              uploadedCount++;
            } catch (error) {
              errors.push(`Error processing student ${student.usn}: ${error.message}`);
            }
          }

          // Clean up uploaded file
          fs.unlink(req.file.path, (err) => {
            if (err) console.error(err);
          });

          res.json({
            message: 'CSV upload completed',
            uploadedCount,
            totalRecords: students.length,
            errors
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to process CSV' });
        }
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload CSV' });
  }
});

// Update student
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { full_name, email, semester } = req.body;

    const result = await pool.query(
      `UPDATE students 
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           semester = COALESCE($3, semester),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [full_name, email, semester, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      message: 'Student updated successfully',
      student: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Delete student
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM students WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

export default router;
