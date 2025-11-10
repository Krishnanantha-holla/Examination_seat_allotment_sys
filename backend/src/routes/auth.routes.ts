import { Router } from 'express';
import { login, register, logout, me } from '../controllers/auth.controller';
import { authValidation } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/login', authValidation.login, login);
router.post('/register', authenticate, authorize('ADMIN'), authValidation.register, register);
router.post('/logout', logout);
router.get('/me', authenticate, me);

export default router;
