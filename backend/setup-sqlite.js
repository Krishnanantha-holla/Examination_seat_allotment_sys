// SQLite Database Setup Script
// This creates a local SQLite database file and sets up all tables
// Run: node setup-sqlite.js

import Database from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { verbose } = Database;
const sqlite3 = verbose();

const dbPath = path.join(__dirname, 'exam_seating.db');

// Convert PostgreSQL schema to SQLite
const sqliteSchema = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'staff', 'student')) DEFAULT 'student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_code TEXT UNIQUE NOT NULL,
    course_name TEXT NOT NULL,
    department TEXT,
    semester INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Floors table
CREATE TABLE IF NOT EXISTS floors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    floor_number INTEGER NOT NULL UNIQUE,
    building_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    floor_id INTEGER NOT NULL,
    room_number TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 30,
    total_benches INTEGER NOT NULL DEFAULT 10,
    students_per_bench INTEGER NOT NULL DEFAULT 3,
    is_available INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE
);

-- Benches table
CREATE TABLE IF NOT EXISTS benches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    classroom_id INTEGER NOT NULL,
    bench_number INTEGER NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 3,
    is_available INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usn TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    course_id INTEGER,
    semester INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_name TEXT,
    exam_date DATE NOT NULL,
    exam_time TIME,
    exam_time_start TEXT,
    exam_time_end TEXT,
    subject TEXT,
    subject_code TEXT,
    subject_name TEXT,
    course_id INTEGER,
    semester INTEGER,
    duration INTEGER DEFAULT 180,
    status TEXT DEFAULT 'scheduled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

-- Exam Students (enrollment)
CREATE TABLE IF NOT EXISTS exam_students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE(exam_id, student_id)
);

-- Seating Allocations table
CREATE TABLE IF NOT EXISTS seating_allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    classroom_id INTEGER NOT NULL,
    bench_id INTEGER NOT NULL,
    seat_number INTEGER NOT NULL,
    allocated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
    FOREIGN KEY (bench_id) REFERENCES benches(id) ON DELETE CASCADE,
    UNIQUE(exam_id, student_id)
);

-- Invigilators table
CREATE TABLE IF NOT EXISTS invigilators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Exam Invigilators junction table
CREATE TABLE IF NOT EXISTS exam_invigilators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    invigilator_id INTEGER NOT NULL,
    classroom_id INTEGER NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (invigilator_id) REFERENCES invigilators(id) ON DELETE CASCADE,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
    UNIQUE(exam_id, classroom_id)
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id INTEGER,
    old_value TEXT,
    new_value TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_students_usn ON students(usn);
CREATE INDEX IF NOT EXISTS idx_students_course ON students(course_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_floor ON classrooms(floor_id);
CREATE INDEX IF NOT EXISTS idx_benches_classroom ON benches(classroom_id);
CREATE INDEX IF NOT EXISTS idx_seating_exam ON seating_allocations(exam_id);
CREATE INDEX IF NOT EXISTS idx_seating_student ON seating_allocations(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_students_exam ON exam_students(exam_id);
`;

async function setupSQLite() {
    console.log('\n=== SQLite Database Setup Starting ===\n');
    
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('✗ Error creating database:', err.message);
                reject(err);
                return;
            }
            
            console.log(`✓ Connected to SQLite database at: ${dbPath}`);
            
            // Execute schema
            db.exec(sqliteSchema, (err) => {
                if (err) {
                    console.error('✗ Error creating tables:', err.message);
                    reject(err);
                    return;
                }
                
                console.log('✓ All tables created successfully');
                
                // Verify tables
                db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, tables) => {
                    if (err) {
                        console.error('✗ Error verifying tables:', err.message);
                        reject(err);
                        return;
                    }
                    
                    console.log('\nCreated tables:');
                    tables.forEach(table => {
                        console.log(`  - ${table.name}`);
                    });
                    
                    console.log('\n✓ Database setup complete!\n');
                    console.log('=== Next Steps ===');
                    console.log('1. Database file created at:', dbPath);
                    console.log('2. Update config/database.js to use SQLite');
                    console.log('3. Run: npm run dev');
                    console.log('4. In another terminal: cd ../frontend && npm start');
                    console.log('5. Open: http://localhost:3000\n');
                    
                    db.close();
                    resolve();
                });
            });
        });
    });
}

// Run setup
setupSQLite().catch(err => {
    console.error('Setup failed:', err);
    process.exit(1);
});
