# PostgreSQL Database Setup Script for Exam Seating System
# Run this script to create the database and load the schema

Write-Host "=== Exam Seating System - Database Setup ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$DB_NAME = "exam_seating_db"
$DB_USER = "postgres"
$SCHEMA_FILE = "backend\db\schema.sql"

# Try to find psql in common locations
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\18\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\PostgreSQL\bin\psql.exe"
)

$psqlPath = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        Write-Host "✓ Found psql at: $path" -ForegroundColor Green
        break
    }
}

if (-not $psqlPath) {
    # Try to use psql from PATH
    try {
        $testPsql = Get-Command psql -ErrorAction Stop
        $psqlPath = "psql"
        Write-Host "✓ Found psql in system PATH" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Could not find psql.exe" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please ensure PostgreSQL is installed and psql is in your PATH." -ForegroundColor Yellow
        Write-Host "You can also manually run these commands in SQL Shell (psql):" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  1. Open SQL Shell (psql) from Start Menu" -ForegroundColor White
        Write-Host "  2. Connect with your credentials" -ForegroundColor White
        Write-Host "  3. Run: CREATE DATABASE exam_seating_db;" -ForegroundColor White
        Write-Host "  4. Run: \c exam_seating_db" -ForegroundColor White
        Write-Host "  5. Run: \i '$pwd\backend\db\schema.sql'" -ForegroundColor White
        Write-Host ""
        exit 1
    }
}

Write-Host ""
Write-Host "Step 1: Creating database '$DB_NAME'..." -ForegroundColor Yellow

# Try default port first (5432), then 5433
$ports = @(5432, 5433)
$successPort = $null

foreach ($port in $ports) {
    Write-Host "  Trying port $port..." -ForegroundColor Gray
    
    try {
        # Create database
        $createCmd = "CREATE DATABASE $DB_NAME;"
        
        if ($psqlPath -eq "psql") {
            $result = & psql -U $DB_USER -p $port -c $createCmd 2>&1
        } else {
            $result = & $psqlPath -U $DB_USER -p $port -c $createCmd 2>&1
        }
        
        if ($LASTEXITCODE -eq 0 -or $result -like "*already exists*") {
            $successPort = $port
            if ($result -like "*already exists*") {
                Write-Host "  ✓ Database already exists on port $port" -ForegroundColor Green
            } else {
                Write-Host "  ✓ Database created successfully on port $port" -ForegroundColor Green
            }
            break
        }
    }
    catch {
        Write-Host "  ✗ Failed on port $port" -ForegroundColor Red
    }
}

if (-not $successPort) {
    Write-Host ""
    Write-Host "✗ Could not create database on any port" -ForegroundColor Red
    Write-Host "Please check if PostgreSQL is running and you have the correct credentials." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 2: Loading schema from $SCHEMA_FILE..." -ForegroundColor Yellow

# Check if schema file exists
if (-not (Test-Path $SCHEMA_FILE)) {
    Write-Host "✗ Schema file not found: $SCHEMA_FILE" -ForegroundColor Red
    exit 1
}

try {
    # Load schema
    if ($psqlPath -eq "psql") {
        $result = & psql -U $DB_USER -p $successPort -d $DB_NAME -f $SCHEMA_FILE 2>&1
    } else {
        $result = & $psqlPath -U $DB_USER -p $successPort -d $DB_NAME -f $SCHEMA_FILE 2>&1
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Schema loaded successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Error loading schema:" -ForegroundColor Red
        Write-Host $result
        exit 1
    }
}
catch {
    Write-Host "✗ Error loading schema: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Verifying tables..." -ForegroundColor Yellow

try {
    # List tables
    if ($psqlPath -eq "psql") {
        $result = & psql -U $DB_USER -p $successPort -d $DB_NAME -c "\dt" 2>&1
    } else {
        $result = & $psqlPath -U $DB_USER -p $successPort -d $DB_NAME -c "\dt" 2>&1
    }
    
    Write-Host $result
    Write-Host ""
    Write-Host "✓ Database setup complete!" -ForegroundColor Green
}
catch {
    Write-Host "✗ Error verifying tables: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Update backend/.env with DB_PORT=$successPort" -ForegroundColor White
Write-Host "2. Run: cd backend; npm install" -ForegroundColor White
Write-Host "3. Run: cd backend; npm run dev" -ForegroundColor White
Write-Host "4. Run: cd frontend; npm install" -ForegroundColor White
Write-Host "5. Run: cd frontend; npm start" -ForegroundColor White
Write-Host ""
