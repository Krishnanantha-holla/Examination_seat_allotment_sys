import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import fs from 'fs';
import csv from 'csv-parser';
import { Readable } from 'stream';

interface StudentData {
  usn: string;
  name: string;
  contact?: string;
  email?: string;
  courseId: string;
  examId: string;
  subjectIds: string[];
}

interface CSVRow {
  usn: string;
  name: string;
  contact?: string;
  email?: string;
  courseCode: string;
  examCode: string;
  subjectCodes: string;
}

export class StudentService {
  async create(data: StudentData) {
    // Check if USN already exists
    const existing = await prisma.student.findUnique({
      where: { usn: data.usn },
    });

    if (existing) {
      throw new AppError(`Student with USN ${data.usn} already exists`, 400);
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Verify exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: data.examId },
    });

    if (!exam) {
      throw new AppError('Exam not found', 404);
    }

    // Verify all subjects exist
    const subjects = await prisma.subject.findMany({
      where: { id: { in: data.subjectIds } },
    });

    if (subjects.length !== data.subjectIds.length) {
      throw new AppError('One or more subjects not found', 404);
    }

    const student = await prisma.student.create({
      data: {
        usn: data.usn,
        name: data.name,
        contact: data.contact,
        email: data.email,
        courseId: data.courseId,
        examId: data.examId,
        subjects: {
          create: data.subjectIds.map((subjectId) => ({
            subjectId,
          })),
        },
      },
      include: {
        course: true,
        exam: true,
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });

    return student;
  }

  async findAll(filters?: {
    courseId?: string;
    examId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.courseId) {
      where.courseId = filters.courseId;
    }

    if (filters?.examId) {
      where.examId = filters.examId;
    }

    if (filters?.search) {
      where.OR = [
        { usn: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          course: true,
          exam: true,
          subjects: {
            include: {
              subject: true,
            },
          },
        },
        orderBy: { usn: 'asc' },
        skip,
        take: limit,
      }),
      prisma.student.count({ where }),
    ]);

    return {
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        course: true,
        exam: true,
        subjects: {
          include: {
            subject: true,
          },
        },
        seatingAssignments: {
          include: {
            classroom: true,
            exam: true,
          },
        },
      },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    return student;
  }

  async findByUsn(usn: string) {
    const student = await prisma.student.findUnique({
      where: { usn },
      include: {
        course: true,
        exam: true,
        subjects: {
          include: {
            subject: true,
          },
        },
        seatingAssignments: {
          include: {
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
        },
      },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    return student;
  }

  async update(id: string, data: Partial<StudentData>) {
    const existing = await prisma.student.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Student not found', 404);
    }

    // If updating USN, check for duplicates
    if (data.usn && data.usn !== existing.usn) {
      const duplicate = await prisma.student.findUnique({
        where: { usn: data.usn },
      });

      if (duplicate) {
        throw new AppError(`Student with USN ${data.usn} already exists`, 400);
      }
    }

    const updateData: any = {
      usn: data.usn,
      name: data.name,
      contact: data.contact,
      email: data.email,
      courseId: data.courseId,
      examId: data.examId,
    };

    // Handle subject updates
    if (data.subjectIds) {
      await prisma.studentSubject.deleteMany({
        where: { studentId: id },
      });

      updateData.subjects = {
        create: data.subjectIds.map((subjectId) => ({
          subjectId,
        })),
      };
    }

    const student = await prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        course: true,
        exam: true,
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });

    return student;
  }

  async delete(id: string) {
    const existing = await prisma.student.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Student not found', 404);
    }

    await prisma.student.delete({
      where: { id },
    });
  }

  async importFromCSV(filePath: string) {
    const results: {
      success: any[];
      errors: any[];
    } = {
      success: [],
      errors: [],
    };

    const rows: CSVRow[] = [];

    // Read CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    // Process each row
    for (const row of rows) {
      try {
        // Validate required fields
        if (!row.usn || !row.name || !row.courseCode || !row.examCode || !row.subjectCodes) {
          results.errors.push({
            row,
            error: 'Missing required fields',
          });
          continue;
        }

        // Find course by code
        const course = await prisma.course.findUnique({
          where: { code: row.courseCode },
        });

        if (!course) {
          results.errors.push({
            row,
            error: `Course ${row.courseCode} not found`,
          });
          continue;
        }

        // Find exam by code
        const exam = await prisma.exam.findUnique({
          where: { code: row.examCode },
        });

        if (!exam) {
          results.errors.push({
            row,
            error: `Exam ${row.examCode} not found`,
          });
          continue;
        }

        // Parse subject codes (comma-separated)
        const subjectCodes = row.subjectCodes.split(',').map((s) => s.trim());

        // Find subjects by codes
        const subjects = await prisma.subject.findMany({
          where: { code: { in: subjectCodes } },
        });

        if (subjects.length !== subjectCodes.length) {
          results.errors.push({
            row,
            error: 'One or more subjects not found',
          });
          continue;
        }

        // Check if student already exists
        const existing = await prisma.student.findUnique({
          where: { usn: row.usn },
        });

        if (existing) {
          // Update existing student
          const updated = await prisma.student.update({
            where: { usn: row.usn },
            data: {
              name: row.name,
              contact: row.contact,
              email: row.email,
              courseId: course.id,
              examId: exam.id,
              subjects: {
                deleteMany: {},
                create: subjects.map((subject) => ({
                  subjectId: subject.id,
                })),
              },
            },
            include: {
              course: true,
              exam: true,
              subjects: {
                include: {
                  subject: true,
                },
              },
            },
          });

          results.success.push({
            action: 'updated',
            student: updated,
          });
        } else {
          // Create new student
          const created = await this.create({
            usn: row.usn,
            name: row.name,
            contact: row.contact,
            email: row.email,
            courseId: course.id,
            examId: exam.id,
            subjectIds: subjects.map((s) => s.id),
          });

          results.success.push({
            action: 'created',
            student: created,
          });
        }
      } catch (error: any) {
        results.errors.push({
          row,
          error: error.message,
        });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    return results;
  }
}
