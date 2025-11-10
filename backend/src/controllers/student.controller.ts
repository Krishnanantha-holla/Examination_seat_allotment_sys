import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service';
import { asyncHandler } from '../middleware/errorHandler';
import { validationResult } from 'express-validator';

const studentService = new StudentService();

export const createStudent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const student = await studentService.create(req.body);
  res.status(201).json(student);
});

export const getStudents = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { courseId, examId, search, page, limit } = req.query;

  const result = await studentService.findAll({
    courseId: courseId as string,
    examId: examId as string,
    search: search as string,
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
  });

  res.json(result);
});

export const getStudentById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const student = await studentService.findById(req.params.id);
  res.json(student);
});

export const getStudentByUsn = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const student = await studentService.findByUsn(req.params.usn);
  res.json(student);
});

export const updateStudent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const student = await studentService.update(req.params.id, req.body);
  res.json(student);
});

export const deleteStudent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  await studentService.delete(req.params.id);
  res.status(204).send();
});

export const importStudentsCSV = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const result = await studentService.importFromCSV(req.file.path);
  res.json(result);
});
