import express from 'express';
import { body, validationResult } from 'express-validator';
import bcryptjs from 'bcryptjs';
import pool from '../config/database.js';
import { verifyToken, verifyAdmin } from './auth.js';

const router = express.Router();

// Create staff user (admin only)
router.post('/staff', verifyToken, verifyAdmin, [
  body('username').isLength({ min: 3 }),
  body('email').isEmail(),
  body('full_name').notEmpty(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { username, email, full_name, password } = req.body;

    const exists = await pool.query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (exists.rows.length > 0) return res.status(400).json({ error: 'User already exists' });

    const hashed = await bcryptjs.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password, full_name, role) VALUES ($1,$2,$3,$4,$5) RETURNING id, username, email, full_name, role',
      [username, email, hashed, full_name, 'staff']
    );

    res.status(201).json({ message: 'Staff created', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create staff' });
  }
});

// List staff (admin only)
router.get('/staff', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, full_name, role, created_at FROM users WHERE role = $1 ORDER BY created_at DESC', ['staff']);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

export default router;
