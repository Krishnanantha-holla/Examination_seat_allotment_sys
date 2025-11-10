import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'Admin@123',
    10
  );

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@examseating.edu' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@examseating.edu',
      name: process.env.ADMIN_NAME || 'System Administrator',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  console.log('Admin user created:', admin.email);

  // Create sample staff user
  const staffPasswordHash = await bcrypt.hash('Staff@123', 10);

  const staff = await prisma.user.upsert({
    where: { email: 'staff@examseating.edu' },
    update: {},
    create: {
      email: 'staff@examseating.edu',
      name: 'Staff Member',
      passwordHash: staffPasswordHash,
      role: 'STAFF',
    },
  });

  console.log('Staff user created:', staff.email);

  // Create sample courses
  const courses = await Promise.all([
    prisma.course.upsert({
      where: { code: 'CSE' },
      update: {},
      create: { code: 'CSE', name: 'Computer Science Engineering' },
    }),
    prisma.course.upsert({
      where: { code: 'ECE' },
      update: {},
      create: { code: 'ECE', name: 'Electronics and Communication Engineering' },
    }),
    prisma.course.upsert({
      where: { code: 'ME' },
      update: {},
      create: { code: 'ME', name: 'Mechanical Engineering' },
    }),
    prisma.course.upsert({
      where: { code: 'CE' },
      update: {},
      create: { code: 'CE', name: 'Civil Engineering' },
    }),
  ]);

  console.log(`Created ${courses.length} courses`);

  // Create sample subjects
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { code: 'MATH101' },
      update: {},
      create: { code: 'MATH101', name: 'Engineering Mathematics I' },
    }),
    prisma.subject.upsert({
      where: { code: 'PHY101' },
      update: {},
      create: { code: 'PHY101', name: 'Engineering Physics' },
    }),
    prisma.subject.upsert({
      where: { code: 'CSE201' },
      update: {},
      create: { code: 'CSE201', name: 'Data Structures' },
    }),
    prisma.subject.upsert({
      where: { code: 'CSE202' },
      update: {},
      create: { code: 'CSE202', name: 'Database Management Systems' },
    }),
    prisma.subject.upsert({
      where: { code: 'ECE201' },
      update: {},
      create: { code: 'ECE201', name: 'Digital Electronics' },
    }),
  ]);

  console.log(`Created ${subjects.length} subjects`);

  // Create sample exam
  const exam = await prisma.exam.upsert({
    where: { code: 'MID-SEM-2024' },
    update: {},
    create: {
      code: 'MID-SEM-2024',
      name: 'Mid Semester Examination 2024',
      date: new Date('2024-12-15'),
      startTime: new Date('2024-12-15T10:00:00'),
      endTime: new Date('2024-12-15T13:00:00'),
      subjects: {
        create: subjects.map((subject) => ({
          subjectId: subject.id,
        })),
      },
    },
  });

  console.log('Created exam:', exam.name);

  // Create sample classrooms
  const classrooms = await Promise.all([
    prisma.classroom.upsert({
      where: { name: 'Room 101' },
      update: {},
      create: {
        name: 'Room 101',
        floor: 'First Floor',
        benchesCount: 20,
        seatsPerBench: 3,
        totalCapacity: 60,
      },
    }),
    prisma.classroom.upsert({
      where: { name: 'Room 102' },
      update: {},
      create: {
        name: 'Room 102',
        floor: 'First Floor',
        benchesCount: 20,
        seatsPerBench: 3,
        totalCapacity: 60,
      },
    }),
    prisma.classroom.upsert({
      where: { name: 'Room 201' },
      update: {},
      create: {
        name: 'Room 201',
        floor: 'Second Floor',
        benchesCount: 25,
        seatsPerBench: 2,
        totalCapacity: 50,
      },
    }),
  ]);

  console.log(`Created ${classrooms.length} classrooms`);

  // Link classrooms to exam
  await Promise.all(
    classrooms.map((classroom) =>
      prisma.examClassroom.upsert({
        where: {
          examId_classroomId: {
            examId: exam.id,
            classroomId: classroom.id,
          },
        },
        update: {},
        create: {
          examId: exam.id,
          classroomId: classroom.id,
        },
      })
    )
  );

  // Create sample invigilators (use findFirst/create because `contact` is not a unique field)
  const inv1 =
    (await prisma.invigilator.findFirst({ where: { contact: '+919876543210' } })) ||
    (await prisma.invigilator.create({
      data: {
        name: 'Dr. John Smith',
        contact: '+919876543210',
        email: 'john.smith@examseating.edu',
      },
    }));

  const inv2 =
    (await prisma.invigilator.findFirst({ where: { contact: '+919876543211' } })) ||
    (await prisma.invigilator.create({
      data: {
        name: 'Prof. Jane Doe',
        contact: '+919876543211',
        email: 'jane.doe@examseating.edu',
      },
    }));

  const invigilators = [inv1, inv2];

  console.log(`Created ${invigilators.length} invigilators`);

  // Assign invigilators to classrooms
  await prisma.classroomInvigilator.upsert({
    where: {
      classroomId_invigilatorId: {
        classroomId: classrooms[0].id,
        invigilatorId: invigilators[0].id,
      },
    },
    update: {},
    create: {
      classroomId: classrooms[0].id,
      invigilatorId: invigilators[0].id,
      examId: exam.id,
    },
  });

  console.log('Database seeding completed successfully!');
  console.log('\nLogin credentials:');
  console.log('Admin:', admin.email, '/ Admin@123');
  console.log('Staff:', staff.email, '/ Staff@123');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
