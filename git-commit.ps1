# Quick Git Commit Script
# Usage: .\git-commit.ps1 "Your commit message"
# Or: .\git-commit.ps1 (will prompt for message)

param(
    [string]$Message = ""
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "=== Quick Git Commit ===" -ForegroundColor Cyan
Write-Host ""

# Check if there are changes
$status = git status --porcelain

if (-not $status) {
    Write-Host "✓ No changes to commit - working tree clean" -ForegroundColor Green
    Write-Host ""
    git status
    exit 0
}

Write-Host "Changes detected:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Get commit message if not provided
if (-not $Message) {
    $Message = Read-Host "Enter commit message"
    
    if (-not $Message) {
        Write-Host "✗ No commit message provided - aborting" -ForegroundColor Red
        exit 1
    }
}

# Add all changes
Write-Host "Adding all changes..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "Committing with message: '$Message'" -ForegroundColor Yellow
git commit -m $Message

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Commit successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Recent commits:" -ForegroundColor Cyan
    git log --oneline -5
} else {
    Write-Host ""
    Write-Host "✗ Commit failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  - To push: git push origin master" -ForegroundColor White
Write-Host "  - To view log: git log --oneline" -ForegroundColor White
Write-Host "  - To see diff: git diff" -ForegroundColor White
Write-Host ""
