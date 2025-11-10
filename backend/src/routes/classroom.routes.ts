import { Router } from 'express';
import prisma from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { classroomValidation } from '../middleware/validation';
import { auditLog } from '../middleware/audit';
import { validationResult } from 'express-validator';

const router = Router();
router.use(authenticate);

router.post('/', authorize('ADMIN', 'STAFF'), classroomValidation.create, auditLog('CREATE_CLASSROOM'), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  const { benchesCount, seatsPerBench, ...rest } = req.body;
  const classroom = await prisma.classroom.create({
    data: { ...rest, benchesCount, seatsPerBench, totalCapacity: benchesCount * seatsPerBench },
  });
  res.status(201).json(classroom);
}));

router.get('/', asyncHandler(async (req, res) => {
  const classrooms = await prisma.classroom.findMany({ orderBy: { name: 'asc' } });
  res.json(classrooms);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const classroom = await prisma.classroom.findUnique({
    where: { id: req.params.id },
    include: { seatingAssignments: true, invigilators: { include: { invigilator: true } } },
  });
  if (!classroom) return res.status(404).json({ error: 'Classroom not found' });
  res.json(classroom);
}));

router.put('/:id', authorize('ADMIN', 'STAFF'), classroomValidation.update, auditLog('UPDATE_CLASSROOM'), asyncHandler(async (req, res) => {
  const { benchesCount, seatsPerBench, ...rest } = req.body;
  const updateData: any = { ...rest };
  
  if (benchesCount && seatsPerBench) {
    updateData.benchesCount = benchesCount;
    updateData.seatsPerBench = seatsPerBench;
    updateData.totalCapacity = benchesCount * seatsPerBench;
  }
  
  const classroom = await prisma.classroom.update({ where: { id: req.params.id }, data: updateData });
  res.json(classroom);
}));

router.delete('/:id', authorize('ADMIN', 'STAFF'), auditLog('DELETE_CLASSROOM'), asyncHandler(async (req, res) => {
  await prisma.classroom.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

export default router;
