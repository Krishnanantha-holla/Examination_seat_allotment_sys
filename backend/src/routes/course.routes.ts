import { Router } from 'express';
import prisma from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { courseValidation } from '../middleware/validation';
import { auditLog } from '../middleware/audit';
import { validationResult } from 'express-validator';

const router = Router();
router.use(authenticate);

router.post('/', authorize('ADMIN', 'STAFF'), courseValidation.create, auditLog('CREATE_COURSE'), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  const course = await prisma.course.create({ data: req.body });
  res.status(201).json(course);
}));

router.get('/', asyncHandler(async (req, res) => {
  const courses = await prisma.course.findMany({ orderBy: { code: 'asc' } });
  res.json(courses);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.id }, include: { students: true } });
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
}));

router.put('/:id', authorize('ADMIN', 'STAFF'), courseValidation.update, auditLog('UPDATE_COURSE'), asyncHandler(async (req, res) => {
  const course = await prisma.course.update({ where: { id: req.params.id }, data: req.body });
  res.json(course);
}));

router.delete('/:id', authorize('ADMIN', 'STAFF'), auditLog('DELETE_COURSE'), asyncHandler(async (req, res) => {
  await prisma.course.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

export default router;
