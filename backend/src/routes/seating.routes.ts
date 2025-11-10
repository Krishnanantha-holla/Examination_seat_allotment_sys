import { Router } from 'express';
import { SeatingAlgorithmService } from '../services/seating.service';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { seatingValidation } from '../middleware/validation';
import { auditLog } from '../middleware/audit';
import { validationResult } from 'express-validator';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const router = Router();
const seatingService = new SeatingAlgorithmService();

router.use(authenticate);

// Generate seating plan
router.post('/plan', authorize('ADMIN', 'STAFF'), seatingValidation.plan, auditLog('GENERATE_SEATING_PLAN'), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { examId, classroomIds, seatsPerBench } = req.body;
  const result = await seatingService.generateSeatingPlan(examId, classroomIds, seatsPerBench);
  res.json(result);
}));

// Get seating assignments for an exam
router.get('/exam/:examId', asyncHandler(async (req, res) => {
  const { classroomId } = req.query;
  const assignments = await seatingService.getSeatingByExam(req.params.examId, classroomId as string);
  res.json(assignments);
}));

// Get student seat by USN
router.get('/student', seatingValidation.studentSeat, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { usn, examId } = req.query;
  const assignment = await seatingService.getStudentSeat(usn as string, examId as string);
  res.json(assignment);
}));

// Export seating plan
router.get('/export', authorize('ADMIN', 'STAFF'), seatingValidation.export, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { examId, format, classroomId } = req.query;
  const assignments = await seatingService.getSeatingByExam(examId as string, classroomId as string);

  if (format === 'csv') {
    const csv = [
      ['USN', 'Name', 'Course', 'Classroom', 'Bench', 'Seat', 'Position'].join(','),
      ...assignments.map(a => [
        a.student.usn,
        a.student.name,
        a.student.course.code,
        a.classroom.name,
        a.benchNumber,
        a.seatIndex + 1,
        a.position,
      ].join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=seating-${examId}.csv`);
    res.send(csv);
  } else {
    // Generate PDF
    const doc = new PDFDocument();
    const filename = `seating-${examId}-${Date.now()}.pdf`;
    const filepath = path.join(process.env.EXPORT_DIR || './exports', filename);

    doc.pipe(fs.createWriteStream(filepath));
    
    doc.fontSize(20).text('Examination Seating Plan', { align: 'center' });
    doc.moveDown();

    const groupedByClassroom = assignments.reduce((acc, assignment) => {
      const key = assignment.classroom.name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(assignment);
      return acc;
    }, {} as any);

    for (const [classroom, seats] of Object.entries(groupedByClassroom) as any) {
      doc.fontSize(16).text(`Classroom: ${classroom}`, { underline: true });
      doc.moveDown();
      
      seats.forEach((seat: any) => {
        doc.fontSize(10).text(
          `Bench ${seat.benchNumber} | Seat ${seat.seatIndex + 1} (${seat.position}) | ${seat.student.usn} - ${seat.student.name}`
        );
      });
      
      doc.moveDown();
    }

    doc.end();

    res.json({ success: true, filename, downloadUrl: `/exports/${filename}` });
  }
}));

export default router;
