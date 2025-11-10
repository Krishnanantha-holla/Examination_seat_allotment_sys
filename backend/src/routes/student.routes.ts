import { Router } from 'express';
import {
  createStudent,
  getStudents,
  getStudentById,
  getStudentByUsn,
  updateStudent,
  deleteStudent,
  importStudentsCSV,
} from '../controllers/student.controller';
import { studentValidation } from '../middleware/validation';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { auditLog } from '../middleware/audit';

const router = Router();

// All routes require authentication
router.use(authenticate);

// CSV import
router.post(
  '/import-csv',
  authorize('ADMIN', 'STAFF'),
  upload.single('file'),
  auditLog('IMPORT_STUDENTS_CSV'),
  importStudentsCSV
);

// CRUD operations
router.post(
  '/',
  authorize('ADMIN', 'STAFF'),
  studentValidation.create,
  auditLog('CREATE_STUDENT'),
  createStudent
);

router.get('/', getStudents);

router.get('/usn/:usn', getStudentByUsn);

router.get('/:id', getStudentById);

router.put(
  '/:id',
  authorize('ADMIN', 'STAFF'),
  studentValidation.update,
  auditLog('UPDATE_STUDENT'),
  updateStudent
);

router.delete(
  '/:id',
  authorize('ADMIN', 'STAFF'),
  studentValidation.delete,
  auditLog('DELETE_STUDENT'),
  deleteStudent
);

export default router;
