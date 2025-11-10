@echo off
REM Examination Seat Allotment System - Quick Setup Script (Windows)
REM This script automates the initial setup process

echo ======================================
echo   Exam Seating System - Quick Setup
echo ======================================
echo.

echo Checking prerequisites...

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)
echo [✓] Node.js found

REM Check Docker
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] Docker is not installed. You'll need to run PostgreSQL manually.
) else (
    echo [✓] Docker found
)

echo.
echo ======================================
echo   Step 1: Environment Configuration
echo ======================================
echo.

if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo [✓] .env file created
) else (
    echo [i] .env file already exists
)

echo.
echo ======================================
echo   Step 2: Backend Setup
echo ======================================
echo.

cd backend

if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
    echo [✓] Backend dependencies installed
) else (
    echo [i] Backend dependencies already installed
)

echo.
echo ======================================
echo   Step 3: Frontend Setup
echo ======================================
echo.

cd ..\frontend

if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
    echo [✓] Frontend dependencies installed
) else (
    echo [i] Frontend dependencies already installed
)

cd ..

echo.
echo ======================================
echo   Step 4: Choose Setup Method
echo ======================================
echo.
echo How would you like to run the application?
echo.
echo 1) Docker Compose (Recommended - Everything automated)
echo 2) Manual Setup (Run services individually)
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo Starting with Docker Compose...
    echo.
    
    where docker-compose >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [X] Docker Compose is not available. Please install it first.
        pause
        exit /b 1
    )
    
    echo Building and starting containers...
    docker-compose up -d --build
    
    echo.
    echo Waiting for services to be ready...
    timeout /t 10 /nobreak >nul
    
    echo.
    echo [✓] Setup complete!
    echo.
    echo ======================================
    echo   Application is now running!
    echo ======================================
    echo.
    echo Frontend:  http://localhost:3000
    echo Backend:   http://localhost:5000
    echo Database:  postgresql://localhost:5432/examseating
    echo.
    echo Default Login Credentials:
    echo   Admin: admin@examseating.edu / Admin@123
    echo   Staff: staff@examseating.edu / Staff@123
    echo.
    echo Useful commands:
    echo   - View logs:     docker-compose logs -f
    echo   - Stop services: docker-compose down
    echo   - Restart:       docker-compose restart
    echo.
    
) else if "%choice%"=="2" (
    echo.
    echo ======================================
    echo   Manual Setup Instructions
    echo ======================================
    echo.
    echo You'll need to run these commands in separate terminals:
    echo.
    echo Terminal 1 - Database:
    echo   Make sure PostgreSQL is running on port 5432
    echo   Update DATABASE_URL in .env if needed
    echo.
    echo Terminal 2 - Backend:
    echo   cd backend
    echo   npx prisma generate
    echo   npx prisma migrate dev
    echo   npm run prisma:seed
    echo   npm run dev
    echo.
    echo Terminal 3 - Frontend:
    echo   cd frontend
    echo   npm run dev
    echo.
    echo After starting all services:
    echo   Frontend:  http://localhost:3000
    echo   Backend:   http://localhost:5000
    echo.
    
) else (
    echo Invalid choice. Exiting.
    pause
    exit /b 1
)

echo ======================================
echo.
echo For more information, see README.md
echo Need help? Open an issue on GitHub
echo.
echo Happy seat allocating! 🎓
echo.
pause
