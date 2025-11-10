import { Router } from 'express';
import prisma from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, userId, action } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (userId) where.userId = userId as string;
  if (action) where.action = { contains: action as string, mode: 'insensitive' };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { timestamp: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.auditLog.count({ where }),
  ]);

  res.json({
    logs,
    pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
  });
}));

export default router;
