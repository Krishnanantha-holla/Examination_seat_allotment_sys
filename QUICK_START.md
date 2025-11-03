# Quick Setup - PostgreSQL & Git

## ✅ Git Setup - COMPLETED
- ✓ Git repository initialized
- ✓ Initial commit created (58a9da3)
- ✓ All project files committed

## 🗄️ PostgreSQL Setup - DO THIS NOW

### Step 1: Open SQL Shell (psql)
1. Press `Windows Key` and search for "**SQL Shell**" or "**psql**"
2. Open it
3. Press `Enter` for:
   - Server (should default to localhost)
   - Database (should default to postgres)
   - Port (likely **5433** based on your earlier screenshot - if it says 5432, press Enter)
   - Username (postgres)
4. Enter your PostgreSQL password

### Step 2: Create Database
Once connected, run this command (copy and paste):
```sql
CREATE DATABASE exam_seating_db;
```

You should see: `CREATE DATABASE`

### Step 3: Connect to New Database
```sql
\c exam_seating_db
```

You should see: `You are now connected to database "exam_seating_db"...`

### Step 4: Load Schema
Run this command (adjust the path if needed):
```sql
\i 'C:/projects/Mini Projects/5th sem/exam-seating-system/backend/db/schema.sql'
```

You should see lots of `CREATE TABLE`, `CREATE INDEX`, etc. messages.

### Step 5: Verify Tables
```sql
\dt
```

You should see a list of tables like:
- users
- exams
- courses
- students
- classrooms
- benches
- seating_allocations
- exam_students
- invigilators
- exam_invigilators
- audit_logs

## 🔧 After Database Setup

### 1. Configure Backend
Edit `backend/.env`:
```powershell
cd "c:\projects\Mini Projects\5th sem\exam-seating-system\backend"
copy .env.example .env
notepad .env
```

**IMPORTANT:** Set `DB_PORT=5433` if that's your PostgreSQL port (check the SQL Shell when you connected)

### 2. Install Backend Dependencies
```powershell
cd "c:\projects\Mini Projects\5th sem\exam-seating-system\backend"
npm install
```

### 3. Start Backend Server
```powershell
npm run dev
```

Should show: "Server is running on port 5000"

### 4. Install Frontend Dependencies (New Terminal)
```powershell
cd "c:\projects\Mini Projects\5th sem\exam-seating-system\frontend"
npm install
```

### 5. Start Frontend
```powershell
npm start
```

Browser opens at: http://localhost:3000

## 🔄 Git - Frequent Commits

After you make changes:
```powershell
cd "c:\projects\Mini Projects\5th sem\exam-seating-system"

# See what changed
git status

# Add changes
git add .

# Commit with message
git commit -m "Your message here"

# Example commits:
git commit -m "feat: Added database setup"
git commit -m "fix: Updated .env configuration"
git commit -m "docs: Updated setup instructions"
```

### Quick Commit Aliases (Optional)
```powershell
# Add to your PowerShell profile for quick commits
function gac { git add .; git commit -m $args[0] }

# Usage: gac "My commit message"
```

## 🚨 Troubleshooting

### "Permission denied" in psql
- Run SQL Shell as Administrator

### "Port 5432 connection refused"
- Your PostgreSQL might be on port 5433 (check SQL Shell)
- Update backend/.env: `DB_PORT=5433`

### "psql command not found"
- Use "SQL Shell (psql)" from Start Menu instead
- Don't use PowerShell for psql commands

## 📊 Check Your Progress

- [✓] Git initialized
- [✓] Initial commit done
- [ ] Database created
- [ ] Schema loaded
- [ ] Tables verified
- [ ] Backend .env configured
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Both servers running

---

**Next:** Follow the PostgreSQL setup steps above, then run the application!
