import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export const auditLog = (action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'STAFF')) {
        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action,
            details: {
              method: req.method,
              path: req.path,
              body: req.body,
              query: req.query,
            },
            ipAddress: req.ip,
          },
        });
      }
      next();
    } catch (error) {
      logger.error('Audit log failed:', error);
      next(); // Don't block the request if audit fails
    }
  };
};
