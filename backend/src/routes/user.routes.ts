import { Router } from 'express';
import prisma from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';
import bcrypt from 'bcrypt';

const router = Router();
router.use(authenticate);

// Get all users (admin and staff)
router.get('/', authorize('ADMIN'), asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'STAFF'] } },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
}));

// Get user by ID
router.get('/:id', authorize('ADMIN'), asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
  });
  
  if (!user) throw new AppError('User not found', 404);
  res.json(user);
}));

// Update user
router.put('/:id', authorize('ADMIN'), asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;
  
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { name, email, role },
    select: { id: true, name: true, email: true, role: true, updatedAt: true },
  });
  
  res.json(user);
}));

// Delete user
router.delete('/:id', authorize('ADMIN'), asyncHandler(async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

// Change password
router.put('/:id/password', asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new AppError('User not found', 404);
  
  const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isValid) throw new AppError('Invalid old password', 400);
  
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: req.params.id }, data: { passwordHash } });
  
  res.json({ message: 'Password updated successfully' });
}));

export default router;
