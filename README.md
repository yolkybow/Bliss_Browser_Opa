# Finance Portfolio Tracker

A comprehensive finance portfolio tracker with real-time data integration for stocks, cryptocurrency, and bank accounts, plus manual tracking for properties and vehicles.

## Features

### 🏠 **Property Management**
- Track real estate investments
- Record purchase price, current value, and property details
- Calculate gains/losses automatically

### 🚗 **Vehicle Tracking**
- Monitor vehicle assets
- Track depreciation and current market value
- Record mileage and condition

### 📈 **Live Stock Tracking**
- Real-time stock price updates via Alpha Vantage API
- Track multiple stock positions
- Automatic gain/loss calculations
- Live price indicators

### ₿ **Live Crypto Tracking**
- Real-time cryptocurrency price updates via CoinGecko API
- Support for all major cryptocurrencies
- Automatic portfolio value calculations
- Live price indicators

### 🏦 **Bank Account Monitoring**
- Track multiple bank accounts
- Live balance updates (mock API for demo)
- Account type categorization
- Secure account number masking

### 📊 **Portfolio Overview**
- Real-time total portfolio value
- Breakdown by asset type
- Live data updates every 30 seconds
- Responsive dashboard design

## Technology Stack

- **Backend**: Node.js, Express.js, SQLite3
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Real-time**: WebSocket connections
- **APIs**: Alpha Vantage (stocks), CoinGecko (crypto)
- **Build**: Webpack

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build Frontend**
   ```bash
   npm run build
   ```

3. **Start Server**
   ```bash
   npm start
   ```

4. **Access Application**
   Open your browser and navigate to `http://localhost:3001`

## API Endpoints

### Properties
- `GET /api/properties` - Get all properties
- `POST /api/properties` - Add new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Add new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Stocks
- `GET /api/stocks` - Get all stocks with live prices
- `POST /api/stocks` - Add new stock position
- `DELETE /api/stocks/:id` - Delete stock position

### Cryptocurrency
- `GET /api/crypto` - Get all crypto with live prices
- `POST /api/crypto` - Add new crypto position
- `DELETE /api/crypto/:id` - Delete crypto position

### Bank Accounts
- `GET /api/bank-accounts` - Get all bank accounts with live balances
- `POST /api/bank-accounts` - Add new bank account
- `DELETE /api/bank-accounts/:id` - Delete bank account

### Portfolio Summary
- `GET /api/portfolio/summary` - Get total portfolio value breakdown

## Real-time Features

- **WebSocket Connection**: Live data updates without page refresh
- **Stock Prices**: Updated every 30 seconds via Alpha Vantage API
- **Crypto Prices**: Updated every 30 seconds via CoinGecko API
- **Bank Balances**: Mock live updates (replace with real banking APIs)
- **Visual Indicators**: Live data indicators show real-time status

## Data Storage

- **SQLite Database**: Local file-based storage
- **Automatic Schema**: Tables created on first run
- **Data Persistence**: All portfolio data saved locally

## Security Features

- **Account Number Masking**: Only last 4 digits displayed
- **CORS Protection**: Configured for secure API access
- **Input Validation**: Server-side data validation

## Customization

### Adding Real Banking APIs
Replace the mock `getBankBalance` function in `server.js` with real banking API integrations:

```javascript
const getBankBalance = async (accountId) => {
  // Integrate with Plaid, Yodlee, or other banking APIs
  const response = await bankingAPI.getBalance(accountId);
  return response.balance;
};
```

### Adding More Stock/Crypto APIs
The application supports multiple data sources. Add more APIs in the respective functions:

```javascript
const getStockPrice = async (symbol) => {
  // Add fallback APIs or premium data sources
  try {
    return await alphaVantageAPI(symbol);
  } catch (error) {
    return await fallbackAPI(symbol);
  }
};
```

## Development

### Development Mode
```bash
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
npm run build:dev  # Development build with source maps
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License - feel free to use and modify for your personal finance tracking needs.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues or questions, please check the GitHub issues page or create a new issue.

---

**Note**: This application uses free-tier APIs for demonstration. For production use, consider upgrading to premium API plans for higher rate limits and more reliable data access.