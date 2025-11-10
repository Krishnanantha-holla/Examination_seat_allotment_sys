import { body, param, query } from 'express-validator';

export const studentValidation = {
  create: [
    body('usn').trim().notEmpty().withMessage('USN is required')
      .isLength({ min: 10, max: 10 }).withMessage('USN must be exactly 10 characters'),
    body('name').trim().notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('contact').optional().isMobilePhone('any').withMessage('Invalid contact number'),
    body('email').optional().isEmail().withMessage('Invalid email address'),
    body('courseId').notEmpty().withMessage('Course ID is required').isUUID().withMessage('Invalid course ID'),
    body('examId').notEmpty().withMessage('Exam ID is required').isUUID().withMessage('Invalid exam ID'),
    body('subjectIds').isArray({ min: 1 }).withMessage('At least one subject is required'),
    body('subjectIds.*').isUUID().withMessage('Invalid subject ID'),
  ],
  update: [
    param('id').isUUID().withMessage('Invalid student ID'),
    body('usn').optional().trim().isLength({ min: 10, max: 10 }).withMessage('USN must be exactly 10 characters'),
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('contact').optional().isMobilePhone('any').withMessage('Invalid contact number'),
    body('email').optional().isEmail().withMessage('Invalid email address'),
    body('courseId').optional().isUUID().withMessage('Invalid course ID'),
    body('examId').optional().isUUID().withMessage('Invalid exam ID'),
    body('subjectIds').optional().isArray().withMessage('Subject IDs must be an array'),
    body('subjectIds.*').optional().isUUID().withMessage('Invalid subject ID'),
  ],
  delete: [
    param('id').isUUID().withMessage('Invalid student ID'),
  ],
};

export const courseValidation = {
  create: [
    body('code').trim().notEmpty().withMessage('Course code is required')
      .isLength({ min: 2, max: 20 }).withMessage('Course code must be between 2 and 20 characters'),
    body('name').trim().notEmpty().withMessage('Course name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Course name must be between 2 and 100 characters'),
  ],
  update: [
    param('id').isUUID().withMessage('Invalid course ID'),
    body('code').optional().trim().isLength({ min: 2, max: 20 }).withMessage('Course code must be between 2 and 20 characters'),
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Course name must be between 2 and 100 characters'),
  ],
};

export const subjectValidation = {
  create: [
    body('code').trim().notEmpty().withMessage('Subject code is required')
      .isLength({ min: 2, max: 20 }).withMessage('Subject code must be between 2 and 20 characters'),
    body('name').trim().notEmpty().withMessage('Subject name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Subject name must be between 2 and 100 characters'),
  ],
  update: [
    param('id').isUUID().withMessage('Invalid subject ID'),
    body('code').optional().trim().isLength({ min: 2, max: 20 }).withMessage('Subject code must be between 2 and 20 characters'),
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Subject name must be between 2 and 100 characters'),
  ],
};

export const examValidation = {
  create: [
    body('code').trim().notEmpty().withMessage('Exam code is required'),
    body('name').trim().notEmpty().withMessage('Exam name is required'),
    body('date').isISO8601().withMessage('Invalid date format'),
    body('startTime').isISO8601().withMessage('Invalid start time format'),
    body('endTime').isISO8601().withMessage('Invalid end time format'),
    body('subjectIds').optional().isArray().withMessage('Subject IDs must be an array'),
    body('classroomIds').optional().isArray().withMessage('Classroom IDs must be an array'),
  ],
  update: [
    param('id').isUUID().withMessage('Invalid exam ID'),
    body('code').optional().trim().notEmpty().withMessage('Exam code cannot be empty'),
    body('name').optional().trim().notEmpty().withMessage('Exam name cannot be empty'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('startTime').optional().isISO8601().withMessage('Invalid start time format'),
    body('endTime').optional().isISO8601().withMessage('Invalid end time format'),
  ],
};

export const classroomValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Classroom name is required'),
    body('floor').trim().notEmpty().withMessage('Floor is required'),
    body('benchesCount').isInt({ min: 1 }).withMessage('Benches count must be at least 1'),
    body('seatsPerBench').isInt({ min: 1, max: 4 }).withMessage('Seats per bench must be between 1 and 4'),
  ],
  update: [
    param('id').isUUID().withMessage('Invalid classroom ID'),
    body('name').optional().trim().notEmpty().withMessage('Classroom name cannot be empty'),
    body('floor').optional().trim().notEmpty().withMessage('Floor cannot be empty'),
    body('benchesCount').optional().isInt({ min: 1 }).withMessage('Benches count must be at least 1'),
    body('seatsPerBench').optional().isInt({ min: 1, max: 4 }).withMessage('Seats per bench must be between 1 and 4'),
  ],
};

export const invigilatorValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('contact').isMobilePhone('any').withMessage('Invalid contact number'),
    body('email').optional().isEmail().withMessage('Invalid email address'),
  ],
  update: [
    param('id').isUUID().withMessage('Invalid invigilator ID'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('contact').optional().isMobilePhone('any').withMessage('Invalid contact number'),
    body('email').optional().isEmail().withMessage('Invalid email address'),
  ],
};

export const seatingValidation = {
  plan: [
    body('examId').notEmpty().withMessage('Exam ID is required').isUUID().withMessage('Invalid exam ID'),
    body('classroomIds').optional().isArray().withMessage('Classroom IDs must be an array'),
    body('seatsPerBench').optional().isInt({ min: 1, max: 4 }).withMessage('Seats per bench must be between 1 and 4'),
  ],
  export: [
    query('examId').notEmpty().withMessage('Exam ID is required').isUUID().withMessage('Invalid exam ID'),
    query('format').optional().isIn(['pdf', 'csv']).withMessage('Format must be pdf or csv'),
    query('classroomId').optional().isUUID().withMessage('Invalid classroom ID'),
  ],
  studentSeat: [
    query('usn').notEmpty().withMessage('USN is required'),
  ],
};

export const authValidation = {
  login: [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  register: [
    body('email').isEmail().withMessage('Invalid email address'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').isIn(['ADMIN', 'STAFF', 'STUDENT']).withMessage('Invalid role'),
  ],
};
