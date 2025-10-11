#!/bin/bash

# Portfolio Tracker Setup Script

echo "🚀 Setting up Portfolio Tracker..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. Please install PostgreSQL and create a database."
    echo "   Example: createdb portfolio_db"
fi

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "📦 Installing Node.js dependencies..."
cd frontend
npm install
cd ..

echo "⚙️  Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your API keys and database settings."
else
    echo "✅ .env file already exists."
fi

echo "🗄️  Database setup..."
echo "Please ensure your PostgreSQL database is running and update the DATABASE_URL in .env"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your database URL and API keys"
echo "2. Create PostgreSQL database: createdb portfolio_db"
echo "3. Start the backend: cd backend && python run.py"
echo "4. Start the frontend: cd frontend && npm start"
echo ""
echo "The application will be available at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- API Docs: http://localhost:8000/docs"