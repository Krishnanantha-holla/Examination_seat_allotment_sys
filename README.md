# Examination Seat Allotment System

A full-stack web application for managing examination seat allocation with intelligent algorithm implementation.

## Features

✅ **User Authentication** - Role-based login (Admin, Staff, Student)
✅ **Exam Management** - Create and manage examinations
✅ **Classroom Setup** - Configure floors, classrooms, and benches
✅ **Student Management** - Add students individually or via CSV bulk upload
✅ **Intelligent Seat Allocation** - Algorithm ensures:
   - No students from same course in same bench
   - No students of same subject in same bench
   - Configurable students per bench (1-3)
✅ **Seating Reports** - Sortable by floor, classroom, or course
✅ **Responsive UI** - Works on desktop, tablet, and mobile
✅ **Security** - JWT authentication, encrypted communication

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator
- **File Upload**: multer + csv-parser

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Utilities**: date-fns, PapaParse

## Project Structure

```
exam-seating-system/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── exams.js
│   │   ├── classrooms.js
│   │   ├── students.js
│   │   ├── seating.js
│   │   └── reports.js
│   ├── db/
│   │   └── schema.sql
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── components/
│   │   │   ├── ProtectedRoute.js
│   │   │   └── Layout.js
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── DashboardPage.js
│   │   │   └── ExamsPage.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── .github/
    └── copilot-instructions.md
```

## Installation & Setup

### Prerequisites
- Node.js v16 or higher
- PostgreSQL 12 or higher
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from template:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=exam_seating_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
```

5. Create database and schema:
```bash
psql -U postgres -f db/schema.sql
```

6. Start backend server:
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

Frontend runs on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Exams Management
- `GET /api/exams` - Get all exams
- `GET /api/exams/:id` - Get exam by ID
- `POST /api/exams` - Create new exam
- `PUT /api/exams/:id` - Update exam
- `DELETE /api/exams/:id` - Delete exam

### Classroom Management
- `GET /api/classrooms` - Get all classrooms
- `GET /api/classrooms/floor/:floorId` - Get classrooms by floor
- `POST /api/classrooms` - Create classroom
- `PUT /api/classrooms/:id` - Update classroom
- `DELETE /api/classrooms/:id` - Delete classroom

### Student Management
- `GET /api/students` - Get all students
- `GET /api/students/:usn` - Get student by USN
- `POST /api/students` - Create student
- `POST /api/students/upload/csv` - Bulk upload students from CSV
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Seating Allocation
- `POST /api/seating/allocate` - Allocate seats with algorithm
- `GET /api/seating/exam/:examId` - Get seating for exam
- `GET /api/seating/student/:studentId/exam/:examId` - Get student seating
- `POST /api/seating/assign-invigilator` - Assign invigilator

### Reports
- `GET /api/reports/exam/:examId?sortBy=classroom` - Get exam report (sort by: classroom, floor, course)
- `GET /api/reports/statistics/exam/:examId` - Get statistics
- `GET /api/reports/classroom/:classroomId/exam/:examId` - Get classroom-wise report

## CSV Format for Student Upload

```csv
usn,full_name,email,course_code,semester
1PG20CS001,John Doe,john@example.com,CS101,5
1PG20CS002,Jane Smith,jane@example.com,CS101,5
1PG20CS003,Bob Johnson,bob@example.com,CS102,5
```

## Usage Guide

### 1. Admin Setup
- Register as Admin
- Create floors and classrooms
- Create courses
- Import student data via CSV

### 2. Configure Exam
- Create exam with date, time, subject
- Enroll students in exam
- Assign invigilators

### 3. Allocate Seats
- Go to Seating module
- Select exam
- Choose students per bench (1-3)
- Click "Allocate Seats"
- System will run algorithm and assign seats

### 4. Generate Report
- Go to Reports section
- Select exam
- Choose sort option (Floor/Classroom/Course)
- View or print seating arrangement

## Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Input validation & sanitization
- ✅ SQL injection protection (parameterized queries)
- ✅ XSS protection (React escaping)
- ✅ Audit logging for admin actions

## Performance Considerations

- Database indexes on frequently queried columns
- Pagination support for large datasets
- Session management for concurrent users
- Connection pooling for database

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
netstat -an | grep 5000

# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Database connection error
```bash
# Check PostgreSQL is running
psql -U postgres -d exam_seating_db

# Re-run schema
psql -U postgres -f db/schema.sql
```

### Frontend not connecting to backend
- Verify backend is running on localhost:5000
- Check CORS settings in backend/server.js
- Update .env CORS_ORIGIN if needed

## Future Enhancements

- [ ] Email notifications for students
- [ ] Real-time exam monitoring
- [ ] Mobile app for students
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Integration with SIS
- [ ] Automated backup system
- [ ] Cloud deployment templates

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
