# 🚀 Quick Start Guide

## Installation (Choose One Method)

### Option 1: Automated Setup Script (Easiest)

**On Windows:**
```cmd
setup.bat
```

**On macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Docker Compose (Recommended)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start all services
docker-compose up -d

# 3. Access the application
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

### Option 3: Manual Setup

#### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Default Credentials

| Role  | Email                    | Password  |
|-------|--------------------------|-----------|
| Admin | admin@examseating.edu    | Admin@123 |
| Staff | staff@examseating.edu    | Staff@123 |

---

## 📋 Core Features Checklist

### ✅ Completed Features

- [x] Three-tier role-based authentication (Admin, Staff, Student)
- [x] JWT-based secure authentication with bcrypt
- [x] Student management with dual input (CSV import + manual form)
- [x] Comprehensive CRUD for all entities (Students, Courses, Subjects, Exams, Classrooms, Invigilators)
- [x] Intelligent seating algorithm with constraint validation
- [x] USN-sorted student allocation
- [x] Adjacent seat conflict prevention (same course/subject)
- [x] Special 3-seat bench rules
- [x] Configurable lookahead window and swap logic
- [x] Conflict detection and detailed reporting
- [x] PDF export for seating charts
- [x] CSV export for data analysis
- [x] Printable student seat tickets
- [x] Classroom-wise seating reports
- [x] Audit logging for admin/staff actions
- [x] Responsive UI with Tailwind CSS
- [x] Real-time validation and error handling
- [x] Toast notifications for user feedback
- [x] Protected routes with role-based access
- [x] Pagination for large datasets
- [x] Search and filter functionality
- [x] Docker containerization
- [x] PostgreSQL with Prisma ORM
- [x] Comprehensive API documentation
- [x] Sample data seeder
- [x] Production-ready configuration

---

## 🏗️ Project Structure Overview

```
exam-seating-system/
├── backend/                    # Node.js + TypeScript + Express
│   ├── prisma/                # Database schema & migrations
│   ├── src/
│   │   ├── services/          # Business logic & seating algorithm
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth, validation, audit
│   │   └── routes/            # API endpoints
│   └── Dockerfile
├── frontend/                   # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── pages/             # Main dashboards
│   │   ├── components/        # Reusable UI components
│   │   └── stores/            # State management
│   └── Dockerfile
├── docker-compose.yml          # Multi-container orchestration
└── README.md                   # Complete documentation
```

---

## 🧮 Seating Algorithm Flow

```
1. Fetch all students for exam → Sort by USN (ascending)
2. Allocate classrooms based on capacity
3. For each bench:
   3.1. Try to assign student to seat
   3.2. Check adjacent seat constraints:
        - Same course? → Conflict
        - Common subject? → Conflict
   3.3. If conflict:
        - Search lookahead window for suitable student
        - Swap if found
        - Log conflict if no solution
   3.4. Assign student and move to next seat
4. Save all assignments to database
5. Return statistics and conflict report
```

---

## 📊 Sample CSV Format

**students.csv:**
```csv
usn,name,contact,email,courseCode,examCode,subjectCodes
1CS21CS001,Alice Johnson,9876543210,alice@edu,CSE,MID-SEM-2024,"MATH101,CSE201"
1EC21EC001,Bob Smith,9876543211,bob@edu,ECE,MID-SEM-2024,"MATH101,ECE201"
```

**Field Descriptions:**
- `usn`: Exactly 10 characters (e.g., 1CS21CS001)
- `name`: Full name of student
- `contact`: 10-digit mobile number
- `email`: Valid email address
- `courseCode`: Must match existing course (CSE, ECE, ME, CE)
- `examCode`: Must match existing exam (MID-SEM-2024)
- `subjectCodes`: Comma-separated, wrapped in quotes

---

## 🔧 Environment Variables

**Critical Variables:**
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/examseating
JWT_SECRET=your-secure-secret-key-minimum-32-characters
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Algorithm Tuning:**
```env
SEATING_LOOKAHEAD_WINDOW=5      # Students ahead to check for swaps
SEATING_MAX_SWAP_ATTEMPTS=100   # Maximum swap iterations
```

---

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Restart specific service
docker-compose restart backend

# Rebuild after code changes
docker-compose up -d --build

# Clean everything (⚠️ removes data)
docker-compose down -v
```

---

## 🧪 Testing the System

### 1. Create Basic Data

**Course:**
```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"code":"CSE","name":"Computer Science"}'
```

**Subject:**
```bash
curl -X POST http://localhost:5000/api/subjects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"code":"MATH101","name":"Mathematics"}'
```

**Exam:**
```bash
curl -X POST http://localhost:5000/api/exams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "code":"MID-SEM-2024",
    "name":"Mid Semester Exam",
    "date":"2024-12-15T00:00:00Z",
    "startTime":"2024-12-15T10:00:00Z",
    "endTime":"2024-12-15T13:00:00Z"
  }'
```

### 2. Import Students

Use the provided `sample-students.csv` via UI or API:
```bash
curl -X POST http://localhost:5000/api/students/import-csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@sample-students.csv"
```

### 3. Generate Seating

```bash
curl -X POST http://localhost:5000/api/seating/plan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"examId":"YOUR_EXAM_ID"}'
```

---

## 📱 User Workflows

### Admin Workflow
1. Login → Admin Dashboard
2. Manage staff users (create/delete)
3. View audit logs for compliance
4. Configure system settings

### Staff Workflow
1. Login → Staff Dashboard
2. **Option A**: Add students manually via form
3. **Option B**: Import students via CSV
4. Manage courses, subjects, exams, classrooms
5. Generate seating plan for exam
6. Export seating chart as PDF/CSV

### Student Workflow
1. Login → Student Portal
2. Enter USN
3. View seat assignment details
4. Print seat ticket

---

## 🚨 Common Issues & Solutions

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
docker-compose ps

# Check DATABASE_URL in .env
echo $DATABASE_URL
```

### Prisma Migration Error
```bash
# Reset database (⚠️ deletes data)
cd backend
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

---

## 📈 Performance Tips

### Database Optimization
- Indexes created automatically by Prisma for frequent queries
- USN, course_id, exam_id are indexed
- Use pagination for large student lists

### Seating Algorithm Optimization
- Adjust `SEATING_LOOKAHEAD_WINDOW` (5-10 recommended)
- Lower value = faster but more conflicts
- Higher value = slower but fewer conflicts

### Scaling Considerations
- Backend: Increase Node.js `--max-old-space-size`
- Database: Enable PostgreSQL connection pooling
- Frontend: Build with `npm run build` for production

---

## 🔒 Security Best Practices

### Production Checklist
- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (64+ characters)
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for specific domains
- [ ] Enable database backups
- [ ] Set up monitoring and alerts
- [ ] Regular security audits

---

## 📞 Support

**Documentation:** See comprehensive [README.md](README.md)

**Issues:** Report bugs on GitHub Issues

**Questions:** Email support@examseating.edu

---

## 🎯 Next Steps

1. ✅ Complete initial setup
2. ✅ Login with default credentials
3. ✅ Create sample courses and subjects
4. ✅ Import students using provided CSV
5. ✅ Create exam with classrooms
6. ✅ Generate seating plan
7. ✅ View and export results

**Congratulations! Your Examination Seat Allotment System is ready to use! 🎉**

---

Made with ❤️ for Educational Institutions
