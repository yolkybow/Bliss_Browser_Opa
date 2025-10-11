# Troubleshooting Guide

## Common Issues and Solutions

### 1. Application Won't Start

#### Error: "Port 5000 is already in use"
**Solution**:
```bash
# Option 1: Kill the process using port 5000
lsof -ti:5000 | xargs kill -9

# Option 2: Change the port in app.py (last line)
app.run(debug=True, host='0.0.0.0', port=5001)
```

#### Error: "Module not found"
**Solution**:
```bash
# Reinstall dependencies
pip install -r requirements.txt

# Or install missing package individually
pip install flask flask-cors sqlalchemy requests yfinance
```

---

### 2. Database Issues

#### Error: "Database is locked"
**Solution**:
```bash
# Delete the database and restart (you'll lose data)
rm portfolio.db
python app.py
```

#### Database corruption
**Solution**:
```bash
# Backup data first if possible
cp portfolio.db portfolio.db.backup

# Delete and recreate
rm portfolio.db
python app.py
```

---

### 3. API Issues

#### Crypto prices not loading
**Possible Causes**:
- CoinGecko API is down
- Rate limit exceeded
- Network connectivity issues
- Invalid crypto ID

**Solutions**:
```bash
# Test the API directly
curl "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"

# Check if crypto ID is correct
# Use lowercase, hyphenated names: bitcoin, ethereum, binance-coin (not binancecoin)
```

**Valid Crypto IDs**: Check https://www.coingecko.com/en/api/documentation

#### Stock prices not loading
**Possible Causes**:
- Yahoo Finance is rate limiting
- Invalid ticker symbol
- Market is closed (will show previous close)
- Network issues

**Solutions**:
```python
# Test ticker directly in Python
import yfinance as yf
stock = yf.Ticker("AAPL")
print(stock.info)
```

**Tips**:
- Use valid ticker symbols (AAPL not Apple)
- Add .L for London stocks (HSBA.L)
- Add .TO for Toronto stocks (TD.TO)

---

### 4. Frontend Issues

#### Page loads but no data shows
**Check**:
1. Open browser console (F12)
2. Look for JavaScript errors
3. Check Network tab for failed API calls

**Solution**:
```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

# Check if Flask is running
curl http://localhost:5000/api/portfolio/summary
```

#### Auto-refresh not working
**Solution**:
- Check browser console for errors
- Refresh the page manually
- Clear browser cache and cookies

---

### 5. Performance Issues

#### App is slow
**Solutions**:
```python
# 1. Reduce auto-refresh frequency
# Edit static/js/app.js, line ~15:
autoRefreshInterval = setInterval(() => {
    refreshLiveData();
}, 60000); // Change from 30000 (30s) to 60000 (60s)

# 2. Limit number of holdings
# Too many stocks/crypto can slow down API calls

# 3. Add caching (advanced)
```

#### High CPU usage
**Cause**: Too frequent API calls
**Solution**: Increase refresh interval as shown above

---

### 6. Installation Issues

#### pip install fails
**Solutions**:
```bash
# Update pip
python -m pip install --upgrade pip

# Use virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Install with --user flag
pip install -r requirements.txt --user
```

#### SSL Certificate errors
**Solution**:
```bash
# Update certifi
pip install --upgrade certifi

# Or temporarily disable SSL verification (not recommended for production)
```

---

### 7. Data Issues

#### Can't delete items
**Check**: Browser console for errors

**Solution**:
```bash
# Restart the application
# If persists, check database directly:
sqlite3 portfolio.db "SELECT * FROM properties;"
```

#### Profit/Loss calculations wrong
**Cause**: Purchase price not set or incorrect

**Solution**:
- Edit the holding and add correct purchase price
- Delete and re-add with correct data

---

### 8. Bank Integration Issues

#### Plaid integration not working
**Check**:
1. API credentials are correct in `.env`
2. Environment (sandbox/development/production) matches your Plaid account
3. Link token is being generated

**Debug**:
```python
# Add debug logging in app.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

---

## Browser Compatibility

**Recommended Browsers**:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**Known Issues**:
- Internet Explorer: Not supported
- Older browsers: May have CSS issues

---

## Getting Help

### Enable Debug Mode
Already enabled in `app.py`:
```python
app.run(debug=True, ...)
```

This shows detailed error messages in terminal.

### Check Logs
Look at terminal where `python app.py` is running for error messages.

### API Status
- CoinGecko Status: https://www.coingeckostatus.com/
- Yahoo Finance: Check https://finance.yahoo.com/

### Test Individual Components

**Test Flask API**:
```bash
curl http://localhost:5000/api/portfolio/summary
```

**Test Database**:
```bash
sqlite3 portfolio.db
.tables
SELECT * FROM crypto_holdings;
.quit
```

**Test Frontend**:
Open browser console (F12) and check for JavaScript errors

---

## Fresh Start (Reset Everything)

If nothing works, start fresh:

```bash
# Stop the app (Ctrl+C)

# Delete database
rm portfolio.db

# Clear Python cache
rm -rf __pycache__

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Start fresh
python app.py
```

---

## Performance Optimization Tips

1. **Limit Holdings**: Don't add hundreds of stocks/crypto
2. **Increase Refresh Interval**: Change from 30s to 60s or more
3. **Use Caching**: Implement Redis caching for API responses (advanced)
4. **Optimize Queries**: Add database indexes (for large datasets)

---

## Security Best Practices

1. **Don't commit `.env`**: Already in `.gitignore`
2. **Use environment variables**: For all API keys
3. **Enable HTTPS**: In production
4. **Add authentication**: For multi-user deployment
5. **Rate limiting**: Implement on API endpoints

---

## Still Having Issues?

1. Check that all files are present (see README project structure)
2. Verify Python version: `python --version` (should be 3.8+)
3. Check network connectivity
4. Look for firewall blocking port 5000
5. Try different browser
6. Check system resources (RAM, CPU)

---

## Feature Requests / Bug Reports

Create an issue on the repository with:
- Description of the issue
- Steps to reproduce
- Error messages (from browser console and terminal)
- System info (OS, Python version, browser)
- Screenshots if applicable

---

## Quick Diagnostic

Run this diagnostic script:

```python
#!/usr/bin/env python3
import sys
import platform

print("=== System Diagnostics ===")
print(f"OS: {platform.system()} {platform.release()}")
print(f"Python: {sys.version}")

try:
    import flask
    print(f"Flask: {flask.__version__}")
except ImportError:
    print("Flask: NOT INSTALLED")

try:
    import requests
    print(f"Requests: {requests.__version__}")
except ImportError:
    print("Requests: NOT INSTALLED")

try:
    import yfinance
    print(f"YFinance: {yfinance.__version__}")
except ImportError:
    print("YFinance: NOT INSTALLED")

try:
    import sqlalchemy
    print(f"SQLAlchemy: {sqlalchemy.__version__}")
except ImportError:
    print("SQLAlchemy: NOT INSTALLED")

# Test API connectivity
try:
    import requests
    r = requests.get("https://api.coingecko.com/api/v3/ping", timeout=5)
    print(f"CoinGecko API: {'✓ ONLINE' if r.status_code == 200 else '✗ ERROR'}")
except:
    print("CoinGecko API: ✗ UNREACHABLE")

print("\n=== Checking Files ===")
import os
files = ['app.py', 'requirements.txt', 'templates/index.html', 
         'static/css/style.css', 'static/js/app.js']
for f in files:
    exists = "✓" if os.path.exists(f) else "✗"
    print(f"{exists} {f}")
```

Save as `diagnostic.py` and run: `python diagnostic.py`
