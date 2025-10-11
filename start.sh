#!/bin/bash

echo "🚀 Starting Finance Portfolio Tracker..."
echo ""
echo "Installing dependencies (if needed)..."
pip install -r requirements.txt --quiet

echo ""
echo "✅ Starting Flask application..."
echo "📊 Access your portfolio tracker at: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python app.py
