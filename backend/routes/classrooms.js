import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Get all classrooms
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, f.floor_number, f.floor_name 
       FROM classrooms c 
       JOIN floors f ON c.floor_id = f.id 
       ORDER BY f.floor_number, c.classroom_number`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch classrooms' });
  }
});

// Get classrooms by floor
router.get('/floor/:floorId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM classrooms WHERE floor_id = $1 ORDER BY classroom_number`,
      [req.params.floorId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch classrooms' });
  }
});

// Create classroom
router.post('/', verifyToken, [
  body('floor_id').isInt().withMessage('Valid floor ID is required'),
  body('classroom_number').notEmpty().withMessage('Classroom number is required'),
  body('classroom_code').notEmpty().withMessage('Classroom code is required'),
  body('total_benches').isInt({ min: 1 }).withMessage('Total benches must be at least 1')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { floor_id, classroom_number, classroom_code, total_benches, capacity } = req.body;

    // Check if classroom code already exists
    const existingClassroom = await pool.query(
      'SELECT * FROM classrooms WHERE classroom_code = $1',
      [classroom_code]
    );

    if (existingClassroom.rows.length > 0) {
      return res.status(400).json({ error: 'Classroom code already exists' });
    }

    const result = await pool.query(
      `INSERT INTO classrooms (floor_id, classroom_number, classroom_code, total_benches, capacity)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [floor_id, classroom_number, classroom_code, total_benches, capacity]
    );

    // Create benches for the classroom
    for (let i = 1; i <= total_benches; i++) {
      await pool.query(
        `INSERT INTO benches (classroom_id, bench_number, capacity)
         VALUES ($1, $2, $3)`,
        [result.rows[0].id, i, capacity || 3]
      );
    }

    res.status(201).json({
      message: 'Classroom created successfully',
      classroom: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create classroom' });
  }
});

// Update classroom
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { classroom_number, total_benches, capacity } = req.body;

    const result = await pool.query(
      `UPDATE classrooms 
       SET classroom_number = COALESCE($1, classroom_number),
           total_benches = COALESCE($2, total_benches),
           capacity = COALESCE($3, capacity),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [classroom_number, total_benches, capacity, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    res.json({
      message: 'Classroom updated successfully',
      classroom: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update classroom' });
  }
});

// Delete classroom
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM classrooms WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    res.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete classroom' });
  }
});

export default router;
