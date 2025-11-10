import { Router } from 'express';
import prisma from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { invigilatorValidation } from '../middleware/validation';
import { auditLog } from '../middleware/audit';
import { validationResult } from 'express-validator';

const router = Router();
router.use(authenticate);

router.post('/', authorize('ADMIN', 'STAFF'), invigilatorValidation.create, auditLog('CREATE_INVIGILATOR'), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  const invigilator = await prisma.invigilator.create({ data: req.body });
  res.status(201).json(invigilator);
}));

router.get('/', asyncHandler(async (req, res) => {
  const invigilators = await prisma.invigilator.findMany({ orderBy: { name: 'asc' } });
  res.json(invigilators);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const invigilator = await prisma.invigilator.findUnique({
    where: { id: req.params.id },
    include: { classrooms: { include: { classroom: true } } },
  });
  if (!invigilator) return res.status(404).json({ error: 'Invigilator not found' });
  res.json(invigilator);
}));

router.put('/:id', authorize('ADMIN', 'STAFF'), invigilatorValidation.update, auditLog('UPDATE_INVIGILATOR'), asyncHandler(async (req, res) => {
  const invigilator = await prisma.invigilator.update({ where: { id: req.params.id }, data: req.body });
  res.json(invigilator);
}));

router.delete('/:id', authorize('ADMIN', 'STAFF'), auditLog('DELETE_INVIGILATOR'), asyncHandler(async (req, res) => {
  await prisma.invigilator.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

// Assign invigilator to classroom
router.post('/:id/assign', authorize('ADMIN', 'STAFF'), auditLog('ASSIGN_INVIGILATOR'), asyncHandler(async (req, res) => {
  const { classroomId, examId } = req.body;
  
  await prisma.classroomInvigilator.create({
    data: { invigilatorId: req.params.id, classroomId, examId },
  });
  
  res.status(201).json({ message: 'Invigilator assigned successfully' });
}));

export default router;
