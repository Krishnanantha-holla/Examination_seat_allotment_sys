#!/bin/bash

# Examination Seat Allotment System - Quick Setup Script
# This script automates the initial setup process

echo "======================================"
echo "  Exam Seating System - Quick Setup  "
echo "======================================"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version is too old. Please upgrade to Node.js 18+."
    exit 1
fi
echo "✅ Node.js $(node -v) found"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You'll need to run PostgreSQL manually."
else
    echo "✅ Docker $(docker --version | cut -d' ' -f3) found"
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  Docker Compose is not installed."
else
    echo "✅ Docker Compose found"
fi

echo ""
echo "======================================"
echo "  Step 1: Environment Configuration  "
echo "======================================"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    
    # Generate a random JWT secret
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    
    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=\"$JWT_SECRET\"|g" .env
    else
        # Linux
        sed -i "s|JWT_SECRET=.*|JWT_SECRET=\"$JWT_SECRET\"|g" .env
    fi
    
    echo "✅ .env file created with secure JWT secret"
else
    echo "ℹ️  .env file already exists"
fi

echo ""
echo "======================================"
echo "  Step 2: Backend Setup               "
echo "======================================"

cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
    echo "✅ Backend dependencies installed"
else
    echo "ℹ️  Backend dependencies already installed"
fi

echo ""
echo "======================================"
echo "  Step 3: Frontend Setup              "
echo "======================================"

cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "ℹ️  Frontend dependencies already installed"
fi

cd ..

echo ""
echo "======================================"
echo "  Step 4: Choose Setup Method         "
echo "======================================"
echo ""
echo "How would you like to run the application?"
echo ""
echo "1) Docker Compose (Recommended - Everything automated)"
echo "2) Manual Setup (Run services individually)"
echo ""
read -p "Enter your choice (1 or 2): " choice

if [ "$choice" == "1" ]; then
    echo ""
    echo "Starting with Docker Compose..."
    echo ""
    
    # Check if Docker is available
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not available. Please install it first."
        exit 1
    fi
    
    echo "Building and starting containers..."
    docker-compose up -d --build
    
    echo ""
    echo "Waiting for services to be ready..."
    sleep 10
    
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "======================================"
    echo "  Application is now running!         "
    echo "======================================"
    echo ""
    echo "🌐 Frontend:  http://localhost:3000"
    echo "🔧 Backend:   http://localhost:5000"
    echo "🗄️  Database: postgresql://localhost:5432/examseating"
    echo ""
    echo "Default Login Credentials:"
    echo "  Admin: admin@examseating.edu / Admin@123"
    echo "  Staff: staff@examseating.edu / Staff@123"
    echo ""
    echo "Useful commands:"
    echo "  - View logs:        docker-compose logs -f"
    echo "  - Stop services:    docker-compose down"
    echo "  - Restart:          docker-compose restart"
    echo ""
    
elif [ "$choice" == "2" ]; then
    echo ""
    echo "======================================"
    echo "  Manual Setup Instructions           "
    echo "======================================"
    echo ""
    echo "You'll need to run these commands in separate terminals:"
    echo ""
    echo "Terminal 1 - Database:"
    echo "  Make sure PostgreSQL is running on port 5432"
    echo "  Update DATABASE_URL in .env if needed"
    echo ""
    echo "Terminal 2 - Backend:"
    echo "  cd backend"
    echo "  npx prisma generate"
    echo "  npx prisma migrate dev"
    echo "  npm run prisma:seed"
    echo "  npm run dev"
    echo ""
    echo "Terminal 3 - Frontend:"
    echo "  cd frontend"
    echo "  npm run dev"
    echo ""
    echo "After starting all services:"
    echo "🌐 Frontend:  http://localhost:3000"
    echo "🔧 Backend:   http://localhost:5000"
    echo ""
    
else
    echo "Invalid choice. Exiting."
    exit 1
fi

echo "======================================"
echo ""
echo "For more information, see README.md"
echo "Need help? Open an issue on GitHub"
echo ""
echo "Happy seat allocating! 🎓"
echo ""
