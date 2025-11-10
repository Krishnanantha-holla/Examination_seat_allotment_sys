import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { SeatPosition } from '@prisma/client';
import { logger } from '../utils/logger';

interface StudentWithDetails {
  id: string;
  usn: string;
  name: string;
  courseId: string;
  subjects: Array<{
    subject: {
      id: string;
      code: string;
    };
  }>;
}

interface Bench {
  benchNumber: number;
  seats: Array<{
    seatIndex: number;
    position: SeatPosition;
    student: StudentWithDetails | null;
  }>;
}

interface ConflictReport {
  benchNumber: number;
  seatIndex: number;
  student: StudentWithDetails;
  conflict: string;
}

export class SeatingAlgorithmService {
  private lookaheadWindow: number;
  private maxSwapAttempts: number;

  constructor() {
    this.lookaheadWindow = parseInt(process.env.SEATING_LOOKAHEAD_WINDOW || '5');
    this.maxSwapAttempts = parseInt(process.env.SEATING_MAX_SWAP_ATTEMPTS || '100');
  }

  async generateSeatingPlan(
    examId: string,
    classroomIds?: string[],
    seatsPerBench?: number
  ) {
    // Fetch exam details
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        students: {
          include: {
            course: true,
            subjects: {
              include: {
                subject: true,
              },
            },
          },
        },
        classrooms: {
          include: {
            classroom: true,
          },
        },
      },
    });

    if (!exam) {
      throw new AppError('Exam not found', 404);
    }

    // Sort students by USN (ascending)
    const students = exam.students.sort((a, b) => a.usn.localeCompare(b.usn));

    if (students.length === 0) {
      throw new AppError('No students registered for this exam', 400);
    }

    // Determine classrooms
    let classrooms = exam.classrooms.map((ec) => ec.classroom);

    if (classroomIds && classroomIds.length > 0) {
      classrooms = classrooms.filter((c) => classroomIds.includes(c.id));
    }

    if (classrooms.length === 0) {
      throw new AppError('No classrooms assigned to this exam', 400);
    }

    // Calculate total capacity
    const totalCapacity = classrooms.reduce((sum, c) => {
      const seats = seatsPerBench || c.seatsPerBench;
      return sum + c.benchesCount * seats;
    }, 0);

    if (students.length > totalCapacity) {
      throw new AppError(
        `Insufficient capacity: ${students.length} students but only ${totalCapacity} seats available`,
        400
      );
    }

    // Delete existing seating assignments for this exam
    await prisma.seatingAssignment.deleteMany({
      where: { examId },
    });

    // Allocate students to classrooms
    const assignments: any[] = [];
    const conflicts: ConflictReport[] = [];
    let studentIndex = 0;

    for (const classroom of classrooms) {
      const benchCount = classroom.benchesCount;
      const seatCount = seatsPerBench || classroom.seatsPerBench;

      const benches: Bench[] = Array.from({ length: benchCount }, (_, i) => ({
        benchNumber: i + 1,
        seats: Array.from({ length: seatCount }, (_, j) => ({
          seatIndex: j,
          position: this.getSeatPosition(j, seatCount),
          student: null,
        })),
      }));

      // Assign students to benches with constraint checking
      for (let benchIdx = 0; benchIdx < benches.length && studentIndex < students.length; benchIdx++) {
        const bench = benches[benchIdx];

        for (let seatIdx = 0; seatIdx < bench.seats.length && studentIndex < students.length; seatIdx++) {
          const student = students[studentIndex];
          const seat = bench.seats[seatIdx];

          // Check adjacency constraints
          if (this.canAssignSeat(bench, seatIdx, student, seatCount)) {
            seat.student = student;
            studentIndex++;
          } else {
            // Try to find a suitable student from lookahead window
            let swapped = false;

            for (
              let lookIdx = studentIndex + 1;
              lookIdx < Math.min(studentIndex + this.lookaheadWindow, students.length);
              lookIdx++
            ) {
              const candidateStudent = students[lookIdx];

              if (this.canAssignSeat(bench, seatIdx, candidateStudent, seatCount)) {
                // Swap students
                students[lookIdx] = student;
                students[studentIndex] = candidateStudent;
                seat.student = candidateStudent;
                studentIndex++;
                swapped = true;
                break;
              }
            }

            if (!swapped) {
              // Force assignment and log conflict
              seat.student = student;
              conflicts.push({
                benchNumber: bench.benchNumber,
                seatIndex: seatIdx,
                student,
                conflict: 'Could not satisfy adjacency constraints',
              });
              studentIndex++;
            }
          }
        }
      }

      // Create database records
      for (const bench of benches) {
        for (const seat of bench.seats) {
          if (seat.student) {
            assignments.push({
              studentId: seat.student.id,
              classroomId: classroom.id,
              examId,
              benchNumber: bench.benchNumber,
              seatIndex: seat.seatIndex,
              position: seat.position,
            });
          }
        }
      }
    }

    // Save assignments to database
    await prisma.seatingAssignment.createMany({
      data: assignments,
    });

    logger.info(`Generated seating plan for exam ${examId}`, {
      totalStudents: students.length,
      totalAssignments: assignments.length,
      conflicts: conflicts.length,
    });

    return {
      success: true,
      statistics: {
        totalStudents: students.length,
        totalAssignments: assignments.length,
        classroomsUsed: classrooms.length,
        conflicts: conflicts.length,
      },
      conflicts,
    };
  }

  private canAssignSeat(
    bench: Bench,
    seatIndex: number,
    student: StudentWithDetails,
    totalSeats: number
  ): boolean {
    // Get adjacent seats
    const leftSeat = seatIndex > 0 ? bench.seats[seatIndex - 1] : null;
    const rightSeat = seatIndex < totalSeats - 1 ? bench.seats[seatIndex + 1] : null;

    // Check left neighbor
    if (leftSeat && leftSeat.student) {
      if (this.hasConflict(student, leftSeat.student)) {
        return false;
      }
    }

    // Check right neighbor
    if (rightSeat && rightSeat.student) {
      if (this.hasConflict(student, rightSeat.student)) {
        return false;
      }
    }

    // For 3-seat benches, check special constraint
    if (totalSeats === 3 && seatIndex === 1) {
      // Middle seat should be different from edge seats
      if (leftSeat && leftSeat.student && rightSeat && rightSeat.student) {
        // Both edges occupied - middle must be different
        if (
          student.courseId === leftSeat.student.courseId ||
          student.courseId === rightSeat.student.courseId
        ) {
          return false;
        }

        const studentSubjects = student.subjects.map((s) => s.subject.id);
        const leftSubjects = leftSeat.student.subjects.map((s) => s.subject.id);
        const rightSubjects = rightSeat.student.subjects.map((s) => s.subject.id);

        const hasCommonWithLeft = studentSubjects.some((id) => leftSubjects.includes(id));
        const hasCommonWithRight = studentSubjects.some((id) => rightSubjects.includes(id));

        if (hasCommonWithLeft || hasCommonWithRight) {
          return false;
        }
      }
    }

    return true;
  }

  private hasConflict(student1: StudentWithDetails, student2: StudentWithDetails): boolean {
    // Same course check
    if (student1.courseId === student2.courseId) {
      return true;
    }

    // Same subject check
    const subjects1 = student1.subjects.map((s) => s.subject.id);
    const subjects2 = student2.subjects.map((s) => s.subject.id);

    const hasCommonSubject = subjects1.some((id) => subjects2.includes(id));

    return hasCommonSubject;
  }

  private getSeatPosition(seatIndex: number, totalSeats: number): SeatPosition {
    if (totalSeats === 1) {
      return 'SINGLE';
    } else if (totalSeats === 2) {
      return seatIndex === 0 ? 'LEFT' : 'RIGHT';
    } else if (totalSeats === 3) {
      if (seatIndex === 0) return 'LEFT';
      if (seatIndex === 1) return 'MIDDLE';
      return 'RIGHT';
    } else {
      // totalSeats === 4
      if (seatIndex === 0) return 'LEFT';
      if (seatIndex === 3) return 'RIGHT';
      return 'MIDDLE';
    }
  }

  async getSeatingByExam(examId: string, classroomId?: string) {
    const where: any = { examId };

    if (classroomId) {
      where.classroomId = classroomId;
    }

    const assignments = await prisma.seatingAssignment.findMany({
      where,
      include: {
        student: {
          include: {
            course: true,
            subjects: {
              include: {
                subject: true,
              },
            },
          },
        },
        classroom: {
          include: {
            invigilators: {
              include: {
                invigilator: true,
              },
            },
          },
        },
        exam: true,
      },
      orderBy: [{ classroom: { name: 'asc' } }, { benchNumber: 'asc' }, { seatIndex: 'asc' }],
    });

    return assignments;
  }

  async getStudentSeat(usn: string, examId?: string) {
    const where: any = {
      student: { usn },
    };

    if (examId) {
      where.examId = examId;
    }

    const assignment = await prisma.seatingAssignment.findFirst({
      where,
      include: {
        student: {
          include: {
            course: true,
            subjects: {
              include: {
                subject: true,
              },
            },
          },
        },
        classroom: {
          include: {
            invigilators: {
              include: {
                invigilator: true,
              },
            },
          },
        },
        exam: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!assignment) {
      throw new AppError('Seat assignment not found for this student', 404);
    }

    return assignment;
  }
}
