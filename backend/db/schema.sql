-- Create database
CREATE DATABASE exam_seating_db;

-- Users Table (for authentication)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'staff', 'student')),
  full_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Floors Table
CREATE TABLE floors (
  id SERIAL PRIMARY KEY,
  floor_number INT NOT NULL,
  floor_name VARCHAR(255),
  total_classrooms INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classrooms Table
CREATE TABLE classrooms (
  id SERIAL PRIMARY KEY,
  floor_id INT NOT NULL,
  classroom_number VARCHAR(50) NOT NULL,
  classroom_code VARCHAR(50) UNIQUE NOT NULL,
  total_benches INT NOT NULL,
  capacity INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE
);

-- Courses Table
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  course_code VARCHAR(50) UNIQUE NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  semester INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students Table
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  usn VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  course_id INT NOT NULL,
  semester INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Exams Table
CREATE TABLE exams (
  id SERIAL PRIMARY KEY,
  exam_date DATE NOT NULL,
  exam_time_start TIME NOT NULL,
  exam_time_end TIME NOT NULL,
  subject_code VARCHAR(50),
  subject_name VARCHAR(255) NOT NULL,
  course_id INT NOT NULL,
  semester INT,
  total_students INT,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Exam Students Mapping Table
CREATE TABLE exam_students (
  id SERIAL PRIMARY KEY,
  exam_id INT NOT NULL,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE(exam_id, student_id)
);

-- Benches Table
CREATE TABLE benches (
  id SERIAL PRIMARY KEY,
  classroom_id INT NOT NULL,
  bench_number INT NOT NULL,
  capacity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
  UNIQUE(classroom_id, bench_number)
);

-- Seating Allocations Table
CREATE TABLE seating_allocations (
  id SERIAL PRIMARY KEY,
  exam_id INT NOT NULL,
  student_id INT NOT NULL,
  floor_id INT NOT NULL,
  classroom_id INT NOT NULL,
  bench_id INT NOT NULL,
  seat_number INT NOT NULL,
  invigilator_assigned VARCHAR(255),
  allocation_status VARCHAR(50) DEFAULT 'allocated' CHECK (allocation_status IN ('allocated', 'cancelled', 'no_show')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
  FOREIGN KEY (bench_id) REFERENCES benches(id) ON DELETE CASCADE
);

-- Invigilators Table
CREATE TABLE invigilators (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exam Invigilators Assignment Table
CREATE TABLE exam_invigilators (
  id SERIAL PRIMARY KEY,
  exam_id INT NOT NULL,
  classroom_id INT NOT NULL,
  invigilator_id INT NOT NULL,
  assignment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
  FOREIGN KEY (invigilator_id) REFERENCES invigilators(id) ON DELETE CASCADE,
  UNIQUE(exam_id, classroom_id)
);

-- Audit Logs Table
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_students_course_id ON students(course_id);
CREATE INDEX idx_students_usn ON students(usn);
CREATE INDEX idx_exams_course_id ON exams(course_id);
CREATE INDEX idx_exams_date ON exams(exam_date);
CREATE INDEX idx_exam_students_exam_id ON exam_students(exam_id);
CREATE INDEX idx_exam_students_student_id ON exam_students(student_id);
CREATE INDEX idx_seating_exam_id ON seating_allocations(exam_id);
CREATE INDEX idx_seating_student_id ON seating_allocations(student_id);
CREATE INDEX idx_seating_classroom_id ON seating_allocations(classroom_id);
CREATE INDEX idx_classrooms_floor_id ON classrooms(floor_id);
CREATE INDEX idx_benches_classroom_id ON benches(classroom_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
