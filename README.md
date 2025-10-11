# 💼 Finance Portfolio Tracker

A comprehensive finance portfolio management system with **real-time tracking** for cryptocurrencies, stocks, and bank balances, along with property and vehicle asset management.

## ✨ Features

### Live Tracking (Real-time API Integration)
- **📈 Stock Tracker**: Live stock prices via Yahoo Finance API
- **₿ Crypto Tracker**: Real-time cryptocurrency prices via CoinGecko API
- **🏦 Bank Balance**: Ready for API integration (Plaid/bank APIs)
- **Auto-refresh**: Updates every 30 seconds automatically

### Asset Management
- **🏠 Property Portfolio**: Track real estate investments with purchase prices and current valuations
- **🚗 Vehicle Portfolio**: Manage vehicle assets with detailed information
- **📊 Portfolio Summary**: Real-time dashboard showing total portfolio value
- **💹 Profit/Loss Tracking**: Calculate gains/losses on investments

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Installation

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Run the application**:
```bash
python app.py
```

3. **Open your browser**:
Navigate to `http://localhost:5000`

That's it! The application will create the database automatically on first run.

## 📱 Usage Guide

### Adding Assets

#### Properties
1. Click on the "🏠 Properties" tab
2. Click "+ Add Property"
3. Fill in details: name, type, location, prices, etc.
4. Submit to save

#### Vehicles
1. Go to "🚗 Vehicles" tab
2. Click "+ Add Vehicle"
3. Enter vehicle details: make, model, year, values
4. Submit to save

#### Bank Accounts
1. Navigate to "🏦 Bank Accounts" tab
2. Click "+ Add Bank Account"
3. Enter bank name, account type, and current balance
4. Note: Currently uses manual balance entry (ready for API integration)

#### Cryptocurrency Holdings
1. Go to "₿ Crypto (Live)" tab
2. Click "+ Add Crypto"
3. Enter crypto ID (e.g., bitcoin, ethereum), symbol, and amount
4. **Prices update automatically in real-time!**

Common Crypto IDs:
- bitcoin (BTC)
- ethereum (ETH)
- binancecoin (BNB)
- cardano (ADA)
- solana (SOL)
- polkadot (DOT)
- dogecoin (DOGE)
- ripple (XRP)

#### Stock Holdings
1. Go to "📈 Stocks (Live)" tab
2. Click "+ Add Stock"
3. Enter ticker symbol (e.g., AAPL, GOOGL) and number of shares
4. **Stock prices fetch automatically from Yahoo Finance!**

### Live Tracking Features

- **Real-time Updates**: Crypto and stock prices refresh every 30 seconds
- **24-hour Change**: See percentage changes for crypto assets
- **Profit/Loss**: Automatic calculation based on purchase price vs current value
- **Portfolio Summary**: Live calculation of total portfolio value

## 🔧 Technical Details

### Technology Stack
- **Backend**: Python Flask
- **Database**: SQLite (file-based, no setup required)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **APIs**: 
  - CoinGecko API (Cryptocurrency prices - FREE)
  - Yahoo Finance API via yfinance library (Stock prices - FREE)

### Project Structure
```
├── app.py                 # Flask application & API endpoints
├── requirements.txt       # Python dependencies
├── portfolio.db          # SQLite database (auto-created)
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css     # Styling
│   └── js/
│       └── app.js        # Frontend JavaScript
└── .env.example          # Environment variables template
```

### Database Schema
- **Properties**: Real estate holdings
- **Vehicles**: Vehicle assets
- **BankAccounts**: Bank account balances
- **CryptoHoldings**: Cryptocurrency positions
- **StockHoldings**: Stock market investments

## 🔐 Bank Balance Live Integration

The system is **ready for live bank balance integration**. To enable:

1. Sign up for a bank API service (e.g., Plaid, Yodlee, TrueLayer)
2. Get API credentials
3. Add credentials to `.env` file
4. Uncomment and configure the bank API integration code in `app.py`

### Recommended Bank APIs
- **Plaid**: Most popular, supports 11,000+ institutions
- **Yodlee**: Enterprise-grade bank data aggregation
- **TrueLayer**: European bank API
- **Finicity**: Mastercard's financial data platform

## 🎨 Features Highlight

### Modern UI/UX
- Beautiful gradient design
- Responsive layout (mobile-friendly)
- Smooth animations and transitions
- Color-coded profit/loss indicators
- Real-time data refresh indicators

### Portfolio Analytics
- Total portfolio value calculation
- Asset allocation by category
- Individual asset performance
- 24-hour price change tracking
- Percentage gains/losses

## 📊 API Information

### CoinGecko API (Cryptocurrency)
- **Rate Limit**: 10-50 calls/minute (free tier)
- **Coverage**: 10,000+ cryptocurrencies
- **No API key required**
- **Documentation**: https://www.coingecko.com/api/documentation

### Yahoo Finance (Stocks)
- **Rate Limit**: Generous free tier
- **Coverage**: Global stock markets
- **No API key required**
- **Library**: yfinance Python package

## 🔄 Auto-Refresh

The application automatically refreshes live data (crypto & stocks) every 30 seconds. You can also manually refresh by clicking the "🔄 Refresh" button in the header.

## 🐛 Troubleshooting

### Database Issues
If you encounter database errors, delete `portfolio.db` and restart the app to recreate it.

### API Connection Issues
- **Crypto prices not loading**: Check internet connection, CoinGecko API might be down
- **Stock prices not loading**: Yahoo Finance might be rate-limiting, wait a few minutes

### Port Already in Use
If port 5000 is busy, modify the last line in `app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5001)  # Change port
```

## 🚀 Future Enhancements

- [ ] Bank API integration (Plaid/Yodlee)
- [ ] Advanced charts and visualizations
- [ ] Historical performance tracking
- [ ] Multi-currency support
- [ ] Export to CSV/PDF
- [ ] Email/SMS alerts for price changes
- [ ] Mobile app version
- [ ] Multi-user support with authentication

## 📝 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Feel free to fork, modify, and submit pull requests!

## 📧 Support

For issues or questions, please open an issue on the repository.

---

**Happy Portfolio Tracking! 💰📈**
