# Examination Seat Allotment System - Setup & Development Guide

## 📋 Project Overview

This is a full-stack examination seating allocation system with intelligent seat assignment algorithm. The system ensures:
- ✅ No students from the same course sit on the same bench
- ✅ No students taking the same subject sit together
- ✅ Flexible capacity (1-3 students per bench)
- ✅ Sortable reports (by floor, classroom, course)

## 🚀 Quick Start

### Step 1: Clone and Setup Directory

```powershell
# Navigate to your projects folder
cd "c:\projects\Mini Projects\5th sem"

# The exam-seating-system folder is already created
cd exam-seating-system
```

### Step 2: Backend Setup

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment variables
copy .env.example .env

# Edit .env with your database credentials
notepad .env
```

Update `.env` with:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=exam_seating_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_super_secret_jwt_key_change_in_production
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Step 3: Create Database

Open PostgreSQL command prompt and run:

```sql
-- Create database
CREATE DATABASE exam_seating_db;

-- Connect to database
\c exam_seating_db

-- Run schema (copy content from backend/db/schema.sql)
-- Paste the entire schema.sql content here
```

Or run directly:
```powershell
psql -U postgres -f db/schema.sql
```

### Step 4: Start Backend Server

```powershell
# From backend directory
npm run dev
```

You should see:
```
Server is running on port 5000
Environment: development
```

### Step 5: Frontend Setup (New Terminal)

```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

## 🔐 First Time Login

### Create Admin Account

1. Go to `http://localhost:3000/register`
2. Fill in:
   - Full Name: `Admin User`
   - Username: `admin`
   - Email: `admin@example.com`
   - Password: `Admin@123`
   - Role: `Admin`
3. Click Register
4. Go to login and use those credentials

## 📚 Features to Explore

### 1. **Dashboard** (`/dashboard`)
- Overview statistics
- Quick action buttons
- System health

### 2. **Exams Management** (`/exams`)
- Create new exams
- View all exams
- Edit/Delete exams
- Set date, time, subject

### 3. **Classrooms** (`/classrooms`)
- Create floors
- Add classrooms per floor
- Configure benches
- Set bench capacity

### 4. **Students** (`/students`)
- Add students individually
- Bulk import via CSV
- View student list
- Edit/Delete students

### 5. **Seating Allocation** (`/seating`)
- Run allocation algorithm
- View seating arrangements
- Assign invigilators
- Print seating plans

### 6. **Reports** (`/reports`)
- Sort by floor
- Sort by classroom
- Sort by course
- View statistics

## 🛠️ API Testing with Postman/Curl

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "role": "admin"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123"
  }'
```

Copy the returned `token` and use in other requests:

### Get All Exams
```bash
curl -X GET http://localhost:5000/api/exams \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📝 CSV Format for Student Bulk Upload

Create a `students.csv` file:
```csv
usn,full_name,email,course_code,semester
1PG20CS001,Alice Johnson,alice@example.com,CS101,5
1PG20CS002,Bob Smith,bob@example.com,CS101,5
1PG20CS003,Charlie Davis,charlie@example.com,CS102,5
1PG20CS004,Diana Wilson,diana@example.com,CS102,5
```

Upload via UI: Go to Students → Upload CSV

## 🧮 Seat Allocation Algorithm

The algorithm works as follows:

```
1. Get all students enrolled in exam
2. Sort students by course_id (to mix different courses)
3. Get all available benches in classrooms
4. For each student:
   - Check if bench has space
   - Check if bench has same course already
   - If yes, move to next bench
   - If no, allocate student to bench + seat number
5. Save all allocations to database
```

**Example:**
- Exam: Database Systems
- Benches: Each holds 3 students max
- Students: CS (10), ECE (8), ME (6)

**Result:**
```
Bench 1: CS001, ECE001, ME001
Bench 2: CS002, ECE002, ME002
Bench 3: CS003, ECE003, ME003
...and so on
```

## 📊 Database Schema Overview

### Key Tables:
- **users** - Authentication & roles
- **exams** - Examination details
- **courses** - Course information
- **students** - Student data
- **classrooms** - Classroom & bench info
- **seating_allocations** - Seat assignments
- **invigilators** - Exam invigilators
- **audit_logs** - Admin action logs

## 🔒 Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Password Hashing** - bcryptjs with salting
3. **Role-Based Access** - Admin, Staff, Student roles
4. **CORS Protection** - Cross-origin requests controlled
5. **Input Validation** - All inputs validated
6. **SQL Injection Prevention** - Parameterized queries
7. **XSS Protection** - React auto-escaping
8. **Audit Logging** - All admin actions logged

## 🚨 Common Issues & Solutions

### Issue: "connect ECONNREFUSED" on port 5432
**Solution:** PostgreSQL not running
```powershell
# Windows - Restart PostgreSQL
net stop postgresql-x64-15
net start postgresql-x64-15

# Or use Services app
```

### Issue: "Port 5000 already in use"
**Solution:** Kill process on port
```powershell
# Find process
netstat -ano | findstr :5000

# Kill it (replace PID with actual number)
taskkill /PID PID_NUMBER /F
```

### Issue: CORS errors
**Solution:** Check backend `.env` CORS_ORIGIN matches frontend URL

### Issue: "Token not provided" on API calls
**Solution:** Login first and include token in Authorization header

## 📱 Responsive Design

The system is fully responsive:
- ✅ Desktop (1920px+)
- ✅ Laptop (1024px+)
- ✅ Tablet (768px+)
- ✅ Mobile (375px+)

All tables, forms, and modals adapt to screen size.

## 🔧 Development Commands

### Backend
```powershell
npm start          # Start production
npm run dev        # Start with nodemon (auto-reload)
npm test           # Run tests
```

### Frontend
```powershell
npm start          # Start dev server (auto-reload)
npm build          # Create production build
npm test           # Run tests
npm run eject      # Eject from create-react-app (not recommended)
```

## 🌐 Deployment Checklist

Before deploying to production:

- [ ] Update `.env` with production values
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Enable HTTPS/SSL
- [ ] Setup database backups
- [ ] Configure email notifications
- [ ] Add rate limiting
- [ ] Setup monitoring/logging
- [ ] Create admin accounts
- [ ] Test all workflows
- [ ] Document system
- [ ] Train users

## 📖 API Documentation

See `/backend/README.md` for complete API documentation with all endpoints.

## 🤝 Contributing

When adding features:
1. Create feature branch
2. Add backend API routes
3. Add frontend pages/components
4. Test thoroughly
5. Update documentation
6. Commit with clear messages

## 📞 Support & Help

For issues:
1. Check the troubleshooting section above
2. Review API response errors
3. Check browser console for frontend errors
4. Check server logs for backend errors
5. Verify database connection

## 🎯 Next Steps

1. **Explore the codebase** - Understand folder structure
2. **Add more pages** - Create Classrooms, Students pages (template provided)
3. **Implement reports** - Build report generation UI
4. **Add testing** - Write unit & integration tests
5. **Deploy** - Get ready for production

---

**Happy Coding! 🚀**

For questions or issues, refer to the main README.md or ask!
