# PostgreSQL Not Running - Quick Fix Guide

## Problem
PostgreSQL is installed but not running on your system.

## Solutions (Try in Order)

### Solution 1: Start PostgreSQL Service (Easiest)

1. **Open Services:**
   - Press `Win + R`
   - Type: `services.msc`
   - Press Enter

2. **Find PostgreSQL service:**
   - Look for service named like:
     - `postgresql-x64-18`
     - `postgresql-x64-16`
     - Or just search for "postgres"

3. **Start the service:**
   - Right-click the service
   - Click "Start"
   - Set "Startup type" to "Automatic" (so it starts on boot)

### Solution 2: Start from PowerShell (Run as Administrator)

```powershell
# Try these commands (one should work):
Start-Service postgresql-x64-18
# or
Start-Service postgresql-x64-16
# or
net start postgresql-x64-18
```

### Solution 3: Start from PostgreSQL Installation Directory

1. Open PowerShell as Administrator
2. Run:
```powershell
cd "C:\Program Files\PostgreSQL\18\bin"
.\pg_ctl.exe -D "C:\Program Files\PostgreSQL\18\data" start
```

### Solution 4: Use pgAdmin to Start

1. Search for "pgAdmin" in Start Menu
2. Open pgAdmin
3. It should prompt to start the PostgreSQL server
4. Or: Right-click on the server → Connect

---

## After PostgreSQL is Running

### Verify it's running:
```powershell
netstat -ano | findstr ":5432 :5433"
```
You should see output showing PostgreSQL is listening.

### Then run database setup:
```powershell
cd "c:\projects\Mini Projects\5th sem\exam-seating-system\backend"
node setup-db.js
```

---

## Alternative: Use pgAdmin GUI (If You Have It)

1. **Find pgAdmin** in Start Menu
2. **Connect to server** (localhost)
3. **Create Database:**
   - Right-click "Databases"
   - Click "Create" → "Database"
   - Name: `exam_seating_db`
   - Click "Save"

4. **Run Schema:**
   - Right-click `exam_seating_db`
   - Click "Query Tool"
   - Open file: `backend/db/schema.sql`
   - Click Execute (F5)

---

## Still Not Working?

### Check what ports are in use:
```powershell
netstat -ano | findstr "5432"
netstat -ano | findstr "5433"
```

### Check if PostgreSQL data directory exists:
```powershell
Test-Path "C:\Program Files\PostgreSQL\18\data"
Test-Path "C:\Program Files\PostgreSQL\16\data"
```

### Find PostgreSQL service name:
```powershell
Get-Service | Where-Object {$_.DisplayName -like "*postgres*"}
```

---

## Need to Reinstall PostgreSQL?

If PostgreSQL installation is incomplete:

1. Download from: https://www.postgresql.org/download/windows/
2. Install with these options:
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4
   - ✅ Command Line Tools
   - ✅ Stack Builder
3. Set a password you'll remember
4. Use port 5432 (default)
5. Remember to update `backend/.env` with your password

---

## Quick Commands Reference

**Check if running:**
```powershell
Get-Service | Where-Object {$_.Name -like "*postgres*"}
```

**Start service:**
```powershell
Start-Service postgresql-x64-18
```

**Check port:**
```powershell
netstat -ano | findstr ":5432"
```

**Run setup script:**
```powershell
cd backend
node setup-db.js
```
