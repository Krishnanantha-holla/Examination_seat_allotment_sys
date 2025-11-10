import { Router } from 'express';
import prisma from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { subjectValidation } from '../middleware/validation';
import { auditLog } from '../middleware/audit';
import { validationResult } from 'express-validator';

const router = Router();
router.use(authenticate);

router.post('/', authorize('ADMIN', 'STAFF'), subjectValidation.create, auditLog('CREATE_SUBJECT'), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  const subject = await prisma.subject.create({ data: req.body });
  res.status(201).json(subject);
}));

router.get('/', asyncHandler(async (req, res) => {
  const subjects = await prisma.subject.findMany({ orderBy: { code: 'asc' } });
  res.json(subjects);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const subject = await prisma.subject.findUnique({ where: { id: req.params.id } });
  if (!subject) return res.status(404).json({ error: 'Subject not found' });
  res.json(subject);
}));

router.put('/:id', authorize('ADMIN', 'STAFF'), subjectValidation.update, auditLog('UPDATE_SUBJECT'), asyncHandler(async (req, res) => {
  const subject = await prisma.subject.update({ where: { id: req.params.id }, data: req.body });
  res.json(subject);
}));

router.delete('/:id', authorize('ADMIN', 'STAFF'), auditLog('DELETE_SUBJECT'), asyncHandler(async (req, res) => {
  await prisma.subject.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

export default router;
