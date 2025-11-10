# 🎓 Examination Seat Allotment System

A complete, production-ready full-stack web application for managing examination seating arrangements with intelligent seat allocation algorithms and role-based access control.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-v18%2B-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-v5.3-blue.svg)

## ✨ Features

### 🔐 Three-Tier Authentication System
- **Admin**: Full system control, user management, and audit log access
- **Staff (Seat Planner)**: Student/classroom/exam management and seating generation
- **Student**: USN-based seat lookup with printable tickets

### 📊 Core Functionality

#### Student Management
- ✅ **Dual Input Methods**: CSV bulk import OR manual web form entry
- ✅ Real-time validation (USN format, course/subject verification)
- ✅ Duplicate USN prevention
- ✅ Full CRUD operations with instant PostgreSQL sync
- ✅ Advanced search and filtering
- ✅ Pagination for large datasets

#### Intelligent Seating Algorithm
- 🧠 **USN-sorted allocation** (ascending order)
- 🚫 **Constraint enforcement**:
  - No same course/subject on adjacent seats
  - Special 3-seat bench rules (edges same course, middle different)
  - Configurable lookahead window for conflict resolution
- ⚠️ **Conflict detection & reporting** with detailed logs
- 🔄 **Smart swap logic** for optimization
- ⚙️ **Configurable** seats per bench (1-4)

#### Comprehensive Data Management
- 📚 **Courses**: Computer Science, Electronics, Mechanical, etc.
- 📖 **Subjects**: Engineering Mathematics, Physics, Data Structures, etc.
- 📝 **Exams**: Mid-sem, Final, Makeup with dates/times
- 🏫 **Classrooms**: Room capacity, floor info, bench counts
- 👨‍🏫 **Invigilators**: Assignment to specific classrooms/exams

#### Reports & Export
- 📄 **PDF Export**: Classroom-wise seating charts
- 📊 **CSV Export**: Complete seating data for analysis
- 🎫 **Student Tickets**: Printable seat confirmation with QR codes
- 🔍 **Filtering**: By classroom, floor, course, or exam

#### Security & Audit
- 🔒 JWT-based authentication with bcrypt password hashing
- 🛡️ Role-based access control (RBAC) middleware
- 📋 **Audit logs** tracking all admin/staff actions
- 🌐 HTTPS-ready, CORS-configured, XSS/CSRF protection
- 🔑 Secure cookie/session management

---

## 🏗️ Architecture

### Tech Stack

#### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 15+
- **ORM**: Prisma (with migrations)
- **Auth**: JWT + bcrypt
- **File Uploads**: Multer
- **Logging**: Winston
- **Testing**: Jest + Supertest

#### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State**: Zustand (lightweight store)
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Testing**: React Testing Library

#### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (for frontend)
- **Database**: PostgreSQL (containerized)

---

## 📂 Project Structure

```
exam-seating-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.ts                # Initial data seeder
│   ├── src/
│   │   ├── config/                # Database & app config
│   │   ├── controllers/           # Route controllers
│   │   ├── services/              # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── student.service.ts
│   │   │   └── seating.service.ts  # Core algorithm
│   │   ├── middleware/            # Auth, validation, audit
│   │   ├── routes/                # API endpoints
│   │   ├── utils/                 # Helpers & logger
│   │   └── server.ts              # App entry point
│   ├── uploads/                   # CSV file storage
│   ├── exports/                   # PDF/CSV outputs
│   ├── logs/                      # Application logs
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Route pages
│   │   │   ├── LoginPage.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── StaffDashboard.tsx
│   │   │   └── StudentPage.tsx
│   │   ├── stores/                # Zustand state stores
│   │   ├── lib/                   # API client & utilities
│   │   ├── App.tsx                # Main app component
│   │   └── main.tsx               # Entry point
│   ├── index.html
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── tailwind.config.js
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml             # Multi-container setup
├── .env.example                   # Environment template
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/))
- **PostgreSQL** 15+ (if running locally without Docker)

### 1️⃣ Clone Repository
```bash
git clone https://github.com/yourusername/exam-seating-system.git
cd exam-seating-system
```

### 2️⃣ Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configurations
# Key variables:
# - DATABASE_URL
# - JWT_SECRET
# - ADMIN_EMAIL
# - ADMIN_PASSWORD
```

### 3️⃣ Using Docker (Recommended)

#### Start All Services
```bash
docker-compose up -d
```

This will:
- ✅ Start PostgreSQL database on port **5432**
- ✅ Run backend API on port **5000**
- ✅ Serve frontend on port **3000**
- ✅ Apply database migrations
- ✅ Create admin user

#### Check Status
```bash
docker-compose ps
```

#### View Logs
```bash
docker-compose logs -f backend
```

#### Stop Services
```bash
docker-compose down
```

### 4️⃣ Manual Setup (Without Docker)

#### Backend
```bash
cd backend

# Install dependencies
npm install

# Setup database (update .env with your PostgreSQL URL)
npx prisma generate
npx prisma migrate dev

# Seed initial data
npm run prisma:seed

# Start development server
npm run dev
```

Backend runs on **http://localhost:5000**

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on **http://localhost:3000**

---

## 🔑 Default Login Credentials

| Role    | Email                        | Password   |
|---------|------------------------------|------------|
| Admin   | admin@examseating.edu        | Admin@123  |
| Staff   | staff@examseating.edu        | Staff@123  |

> ⚠️ **Important**: Change these passwords immediately in production!

---

## 📝 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

### Core Endpoints

#### 🔐 Authentication
```http
POST   /auth/login              # User login
POST   /auth/register           # Create new user (Admin only)
POST   /auth/logout             # Logout
GET    /auth/me                 # Get current user
```

#### 👨‍🎓 Students
```http
POST   /students                # Create student (manual)
POST   /students/import-csv     # Bulk import via CSV
GET    /students                # List all (with pagination)
GET    /students/:id            # Get by ID
GET    /students/usn/:usn       # Get by USN
PUT    /students/:id            # Update student
DELETE /students/:id            # Delete student
```

**CSV Format Example:**
```csv
usn,name,contact,email,courseCode,examCode,subjectCodes
1CS21CS001,John Doe,9876543210,john@example.com,CSE,MID-SEM-2024,"MATH101,PHY101,CSE201"
1CS21CS002,Jane Smith,9876543211,jane@example.com,CSE,MID-SEM-2024,"MATH101,CSE201,CSE202"
```

#### 📚 Courses
```http
POST   /courses                 # Create course
GET    /courses                 # List all
GET    /courses/:id             # Get by ID
PUT    /courses/:id             # Update course
DELETE /courses/:id             # Delete course
```

#### 📖 Subjects
```http
POST   /subjects                # Create subject
GET    /subjects                # List all
GET    /subjects/:id            # Get by ID
PUT    /subjects/:id            # Update subject
DELETE /subjects/:id            # Delete subject
```

#### 📝 Exams
```http
POST   /exams                   # Create exam
GET    /exams                   # List all
GET    /exams/:id               # Get by ID
PUT    /exams/:id               # Update exam
DELETE /exams/:id               # Delete exam
```

#### 🏫 Classrooms
```http
POST   /classrooms              # Create classroom
GET    /classrooms              # List all
GET    /classrooms/:id          # Get by ID
PUT    /classrooms/:id          # Update classroom
DELETE /classrooms/:id          # Delete classroom
```

#### 👨‍🏫 Invigilators
```http
POST   /invigilators            # Create invigilator
POST   /invigilators/:id/assign # Assign to classroom
GET    /invigilators            # List all
GET    /invigilators/:id        # Get by ID
PUT    /invigilators/:id        # Update invigilator
DELETE /invigilators/:id        # Delete invigilator
```

#### 🪑 Seating
```http
POST   /seating/plan            # Generate seating plan
GET    /seating/exam/:examId    # Get seating for exam
GET    /seating/student?usn=XXX # Get student's seat
GET    /seating/export          # Export as PDF/CSV
```

**Generate Seating Request:**
```json
{
  "examId": "uuid-here",
  "classroomIds": ["uuid1", "uuid2"],  // optional
  "seatsPerBench": 3                   // optional, overrides classroom default
}
```

**Response:**
```json
{
  "success": true,
  "statistics": {
    "totalStudents": 120,
    "totalAssignments": 120,
    "classroomsUsed": 3,
    "conflicts": 0
  },
  "conflicts": []
}
```

#### 📋 Audit Logs
```http
GET    /audit                   # View audit logs (Admin only)
```

#### 👥 User Management
```http
GET    /users                   # List users (Admin only)
GET    /users/:id               # Get user by ID
PUT    /users/:id               # Update user
DELETE /users/:id               # Delete user
PUT    /users/:id/password      # Change password
```

---

## 🧮 Seating Algorithm Details

### Core Logic

1. **Student Sorting**: Sort all students by USN (ascending)

2. **Classroom Allocation**: Distribute students across available classrooms based on capacity

3. **Bench Assignment with Constraints**:
   ```typescript
   For each bench seat:
     - Check if student's course/subject conflicts with adjacent seats
     - If conflict exists:
       * Search lookahead window for suitable student
       * Swap if found
       * Log conflict if no solution
     - Assign student to seat
   ```

4. **Position Determination** (seats per bench):
   - **1 seat**: `SINGLE`
   - **2 seats**: `LEFT`, `RIGHT`
   - **3 seats**: `LEFT`, `MIDDLE`, `RIGHT`
   - **4 seats**: `LEFT`, `MIDDLE`, `MIDDLE`, `RIGHT`

### Constraint Rules

#### Same Course Check
```
Student A (CSE) cannot sit next to Student B (CSE)
```

#### Same Subject Check
```
Student A (subjects: MATH101, PHY101)
Student B (subjects: MATH101, CSE201)
❌ Cannot sit together (common subject: MATH101)
```

#### Special 3-Seat Bench Rule
```
[Edge Seat] [Middle Seat] [Edge Seat]
  CSE          ECE           CSE         ✅ Valid
  CSE          CSE           ECE         ❌ Invalid
```

### Configuration (via `.env`)
```bash
SEATING_LOOKAHEAD_WINDOW=5       # How many students ahead to check for swaps
SEATING_MAX_SWAP_ATTEMPTS=100    # Maximum swap iterations
```

---

## 🗄️ Database Schema

### Core Tables

```sql
users (id, email, name, password_hash, role, created_at, updated_at)
students (id, usn, name, contact, email, course_id, exam_id, user_id)
courses (id, code, name)
subjects (id, code, name)
exams (id, code, name, date, start_time, end_time)
classrooms (id, name, floor, benches_count, seats_per_bench, total_capacity)
invigilators (id, name, contact, email)
seating_assignments (id, student_id, classroom_id, exam_id, bench_number, seat_index, position)
audit_logs (id, user_id, action, details, ip_address, timestamp)
```

### Relationships
- Students → Course (Many-to-One)
- Students ↔ Subjects (Many-to-Many)
- Students → Exam (Many-to-One)
- Seating Assignment → Student, Classroom, Exam (Many-to-One each)
- Audit Log → User (Many-to-One)

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm test -- --coverage    # Coverage report
```

### Frontend Tests
```bash
cd frontend
npm test                  # Run React component tests
```

### Manual API Testing (using curl)
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@examseating.edu","password":"Admin@123"}'

# Get Students (with token)
curl http://localhost:5000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔧 Configuration

### Backend Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/examseating"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# Algorithm
SEATING_LOOKAHEAD_WINDOW=5
SEATING_MAX_SWAP_ATTEMPTS=100

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR="./uploads"
EXPORT_DIR="./exports"

# Admin Setup (First Run)
ADMIN_EMAIL="admin@examseating.edu"
ADMIN_PASSWORD="Admin@123"
ADMIN_NAME="System Administrator"
```

### Frontend Environment Variables
```bash
VITE_API_URL=http://localhost:5000/api
```

---

## 🚢 Production Deployment

### 1. Update Environment
```bash
# Generate strong JWT secret
JWT_SECRET=$(openssl rand -base64 64)

# Use production database URL
DATABASE_URL="postgresql://prod_user:prod_pass@db_host:5432/examseating_prod"

# Enable production mode
NODE_ENV="production"
```

### 2. Build & Deploy with Docker
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### 3. SSL/TLS Setup (Nginx)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 4. Database Backups
```bash
# Automated backup script (add to cron)
#!/bin/bash
pg_dump -U examuser examseating > backup_$(date +%Y%m%d).sql
gzip backup_$(date +%Y%m%d).sql
# Upload to S3/Cloud Storage
```

### 5. Monitoring
- **Logs**: Winston logs to `/backend/logs/`
- **Metrics**: Integrate Prometheus + Grafana
- **Alerts**: Set up error notifications (email/Slack)

---

## 🐛 Troubleshooting

### Issue: Port Already in Use
```bash
# Find process using port
lsof -i :5000
# Kill process
kill -9 <PID>
```

### Issue: Database Connection Failed
```bash
# Check PostgreSQL status
docker-compose logs db

# Verify DATABASE_URL format
postgresql://user:password@host:port/database
```

### Issue: Prisma Migration Errors
```bash
# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Or manually fix
npx prisma migrate resolve --applied "migration_name"
```

### Issue: Frontend Build Fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node -v  # Should be 18+
```

---

## 📊 Sample Data

### Create Sample Course
```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"code":"CSE","name":"Computer Science Engineering"}'
```

### Import Sample Students (CSV)
Create `students.csv`:
```csv
usn,name,contact,email,courseCode,examCode,subjectCodes
1CS21CS001,Alice Johnson,9876543210,alice@edu,CSE,MID-SEM-2024,"MATH101,CSE201"
1CS21CS002,Bob Smith,9876543211,bob@edu,CSE,MID-SEM-2024,"MATH101,CSE202"
1EC21EC001,Carol White,9876543212,carol@edu,ECE,MID-SEM-2024,"MATH101,ECE201"
```

Upload via UI or:
```bash
curl -X POST http://localhost:5000/api/students/import-csv \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@students.csv"
```

---

## 📞 Support & Contribution

### Reporting Issues
Open an issue on [GitHub Issues](https://github.com/yourusername/exam-seating-system/issues)

### Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Style
- **Backend**: ESLint + Prettier (TypeScript)
- **Frontend**: ESLint + Prettier (React/TypeScript)
- **Commits**: Conventional Commits format

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Prisma](https://www.prisma.io/) for excellent ORM
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [React](https://react.dev/) for UI framework
- [Express.js](https://expressjs.com/) for backend framework

---

## 📈 Roadmap

### v1.1 (Upcoming)
- [ ] Email notifications for seat assignments
- [ ] SMS integration for reminders
- [ ] QR code generation for tickets
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

### v2.0 (Future)
- [ ] AI-powered conflict resolution
- [ ] Blockchain-based audit trail
- [ ] Real-time seating updates (WebSockets)
- [ ] Integration with university ERP systems

---

**Made with ❤️ for Educational Institutions**

For questions or support, contact: support@examseating.edu
