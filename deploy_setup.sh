#!/bin/bash

echo "======================================"
echo "  Quick Deploy Setup for Render.com"
echo "======================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - Finance Portfolio Tracker"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

echo ""
echo "📋 Next Steps to Deploy Online:"
echo ""
echo "1. Create a GitHub repository:"
echo "   - Go to https://github.com/new"
echo "   - Name it: finance-portfolio-tracker"
echo "   - Don't initialize with README"
echo ""
echo "2. Push your code to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/finance-portfolio-tracker.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Deploy to Render (FREE):"
echo "   - Go to https://render.com and sign up"
echo "   - Click 'New +' → 'Web Service'"
echo "   - Connect your GitHub repository"
echo "   - Use these settings:"
echo "     * Build Command: pip install -r requirements.txt"
echo "     * Start Command: gunicorn app:app"
echo "     * Instance Type: Free"
echo "   - Click 'Create Web Service'"
echo ""
echo "4. Your app will be live at:"
echo "   https://finance-portfolio-tracker-xxxx.onrender.com"
echo ""
echo "======================================"
echo ""
echo "✅ All deployment files are ready!"
echo "   - Procfile created"
echo "   - gunicorn added to requirements.txt"
echo "   - Production config updated"
echo ""
echo "📖 For detailed instructions, see: DEPLOYMENT_GUIDE.md"
echo ""

# Check if files are ready
echo "🔍 Checking deployment files..."
if [ -f "Procfile" ]; then
    echo "  ✅ Procfile"
else
    echo "  ❌ Procfile missing"
fi

if grep -q "gunicorn" requirements.txt; then
    echo "  ✅ gunicorn in requirements.txt"
else
    echo "  ❌ gunicorn not in requirements.txt"
fi

if [ -f "app.py" ]; then
    echo "  ✅ app.py"
else
    echo "  ❌ app.py missing"
fi

echo ""
echo "🚀 Ready to deploy!"
echo ""
