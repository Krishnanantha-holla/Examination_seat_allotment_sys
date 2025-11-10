import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../middleware/errorHandler';
import { validationResult } from 'express-validator';
import { AppError } from '../middleware/errorHandler';

const authService = new AuthService();

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const result = await authService.login(email, password);

  res.cookie('token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json(result);
});

export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, name, password, role } = req.body;

  const user = await authService.register({ email, name, password, role });

  res.status(201).json(user);
});

export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

export const me = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new AppError('Not authenticated', 401);
  }

  const user = await authService.validateToken(token);

  res.json(user);
});
