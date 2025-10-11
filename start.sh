#!/bin/bash

echo "🚀 Starting Finance Portfolio Tracker..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "🔨 Building frontend..."
    npm run build
    echo ""
fi

# Check if database exists
if [ ! -f "portfolio.db" ]; then
    echo "📊 Setting up database with sample data..."
    node demo-data.js
    echo ""
fi

echo "🌐 Starting server on port 3001..."
echo "📱 Open your browser and visit: http://localhost:3001"
echo ""

# Start the server
PORT=3001 npm start