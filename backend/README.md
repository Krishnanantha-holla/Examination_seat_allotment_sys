# Exam Seating System - Backend

Express.js backend for the Examination Seat Allotment System.

## Setup

### Prerequisites
- Node.js v16+
- PostgreSQL 12+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure database in `.env`

4. Create database and schema:
```bash
psql -U postgres -f db/schema.sql
```

5. Start development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Exams
- `GET /api/exams` - Get all exams
- `POST /api/exams` - Create exam
- `PUT /api/exams/:id` - Update exam
- `DELETE /api/exams/:id` - Delete exam

### Classrooms
- `GET /api/classrooms` - Get all classrooms
- `POST /api/classrooms` - Create classroom
- `PUT /api/classrooms/:id` - Update classroom
- `DELETE /api/classrooms/:id` - Delete classroom

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create student
- `POST /api/students/upload/csv` - Upload students from CSV
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Seating
- `POST /api/seating/allocate` - Allocate seats
- `GET /api/seating/exam/:examId` - Get seating allocation
- `POST /api/seating/assign-invigilator` - Assign invigilator

### Reports
- `GET /api/reports/exam/:examId` - Get exam report
- `GET /api/reports/statistics/exam/:examId` - Get statistics
- `GET /api/reports/classroom/:classroomId/exam/:examId` - Get classroom report

## Features

- Role-based authentication (Admin, Staff, Student)
- Exam management
- Classroom and bench management
- Student data management with CSV import
- Intelligent seat allocation algorithm
- Report generation with sorting options
- Invigilator assignment
