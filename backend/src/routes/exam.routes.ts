import { Router } from 'express';
import prisma from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { examValidation } from '../middleware/validation';
import { auditLog } from '../middleware/audit';
import { validationResult } from 'express-validator';

const router = Router();
router.use(authenticate);

router.post('/', authorize('ADMIN', 'STAFF'), examValidation.create, auditLog('CREATE_EXAM'), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  const { subjectIds, classroomIds, ...examData } = req.body;
  
  const exam = await prisma.exam.create({
    data: {
      ...examData,
      subjects: subjectIds ? { create: subjectIds.map((id: string) => ({ subjectId: id })) } : undefined,
      classrooms: classroomIds ? { create: classroomIds.map((id: string) => ({ classroomId: id })) } : undefined,
    },
    include: { subjects: { include: { subject: true } }, classrooms: { include: { classroom: true } } },
  });
  res.status(201).json(exam);
}));

router.get('/', asyncHandler(async (req, res) => {
  const exams = await prisma.exam.findMany({
    include: { subjects: { include: { subject: true } }, classrooms: { include: { classroom: true } } },
    orderBy: { date: 'desc' },
  });
  res.json(exams);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const exam = await prisma.exam.findUnique({
    where: { id: req.params.id },
    include: { students: true, subjects: { include: { subject: true } }, classrooms: { include: { classroom: true } } },
  });
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  res.json(exam);
}));

router.put('/:id', authorize('ADMIN', 'STAFF'), examValidation.update, auditLog('UPDATE_EXAM'), asyncHandler(async (req, res) => {
  const exam = await prisma.exam.update({ where: { id: req.params.id }, data: req.body });
  res.json(exam);
}));

router.delete('/:id', authorize('ADMIN', 'STAFF'), auditLog('DELETE_EXAM'), asyncHandler(async (req, res) => {
  await prisma.exam.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

export default router;
