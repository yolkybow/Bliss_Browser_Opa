# Finance Portfolio Tracker

A comprehensive real-time finance portfolio tracker that helps you manage and monitor all your assets including properties, vehicles, bank accounts, stocks, and cryptocurrency.

## Features

### 🏠 **Property Management**
- Track real estate investments
- Monitor property values, mortgage balances, and rental income
- Calculate net property equity

### 🚗 **Vehicle Portfolio**
- Manage vehicle assets and depreciation
- Track loan balances and payments
- Monitor insurance and registration costs

### 🏦 **Live Bank Integration**
- Real-time bank account balance tracking via Plaid API
- Support for multiple account types (checking, savings, etc.)
- Secure bank connection with industry-standard encryption

### 📈 **Stock Market Tracker**
- Live stock price tracking using Yahoo Finance API
- Portfolio performance analytics with gain/loss calculations
- Support for multiple brokers and sectors

### ₿ **Cryptocurrency Tracker**
- Real-time crypto price feeds from multiple exchanges
- Support for major cryptocurrencies
- Wallet address tracking and portfolio allocation

### 📊 **Portfolio Analytics**
- Comprehensive net worth calculation
- Asset allocation visualization
- Performance tracking and historical analysis
- Real-time data refresh capabilities

## Technology Stack

### Backend
- **FastAPI** - Modern, fast Python web framework
- **SQLAlchemy** - Database ORM with PostgreSQL
- **Plaid API** - Bank account integration
- **yfinance** - Stock market data
- **CCXT** - Cryptocurrency exchange data
- **JWT Authentication** - Secure user authentication

### Frontend
- **React** with TypeScript
- **Material-UI (MUI)** - Modern component library
- **Recharts** - Data visualization
- **Axios** - API client

### Database
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL
- Redis (optional, for caching)

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   pip install -r ../requirements.txt
   ```

2. **Environment Configuration**
   ```bash
   cp ../.env.example .env
   # Edit .env with your API keys and database settings
   ```

3. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb portfolio_db
   
   # The app will automatically create tables on first run
   ```

4. **Get API Keys**
   - **Plaid**: Sign up at [Plaid Dashboard](https://dashboard.plaid.com/) for bank integration
   - **Alpha Vantage**: Get free API key at [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
   - **CoinMarketCap**: Get API key at [CoinMarketCap API](https://coinmarketcap.com/api/)

5. **Run Backend**
   ```bash
   python run.py
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## API Key Configuration

### Required APIs for Live Data

1. **Plaid (Bank Integration)**
   - Sign up at https://dashboard.plaid.com/
   - Get Client ID and Secret Key
   - Set environment to 'sandbox' for testing

2. **Stock Data (Free)**
   - Uses Yahoo Finance API (no key required)
   - Optional: Alpha Vantage for additional data

3. **Cryptocurrency Data**
   - CCXT library provides free access to exchange APIs
   - Optional: CoinMarketCap API for enhanced data

### Sample Environment File
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio_db

# Security
SECRET_KEY=your-super-secret-key-here
JWT_SECRET=your-jwt-secret-key

# API Keys
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-secret
PLAID_ENV=sandbox
COINMARKETCAP_API_KEY=your-coinmarketcap-key
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
```

## Usage Guide

### 1. Create Account
- Register with email and password
- Secure authentication with JWT tokens

### 2. Add Assets
- **Properties**: Enter property details, purchase prices, and mortgages
- **Vehicles**: Add vehicle information, loans, and depreciation
- **Stocks**: Input stock symbols, shares, and average cost
- **Crypto**: Add cryptocurrency holdings and amounts

### 3. Connect Bank Accounts
- Use Plaid integration to securely connect bank accounts
- Real-time balance tracking across multiple accounts
- Support for major US banks and credit unions

### 4. Monitor Performance
- View real-time portfolio overview
- Track gains/losses across all asset classes
- Refresh market data with one click
- Analyze portfolio allocation and diversification

## API Endpoints

### Authentication
- `POST /auth/register` - Create new user account
- `POST /auth/login` - User login

### Portfolio Management
- `GET /portfolio/summary` - Get portfolio overview
- `GET /portfolio/performance` - Get performance analytics
- `POST /portfolio/refresh` - Refresh all live data

### Asset Management
- `GET|POST|PUT|DELETE /properties` - Property management
- `GET|POST|PUT|DELETE /vehicles` - Vehicle management
- `GET|POST|PUT|DELETE /stocks/holdings` - Stock portfolio
- `GET|POST|PUT|DELETE /crypto/holdings` - Crypto portfolio

### Live Data
- `POST /stocks/refresh-prices` - Update stock prices
- `POST /crypto/refresh-prices` - Update crypto prices
- `GET /banking/accounts` - Get bank account balances

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Secure API key management
- CORS protection
- SQL injection prevention
- Input validation and sanitization

## Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests  
cd frontend
npm test
```

### Database Migrations
The application uses SQLAlchemy with automatic table creation. For production deployments, consider using Alembic for database migrations.

### Adding New Features
1. Backend: Add new models in `backend/app/models/`
2. Create API endpoints in `backend/app/api/`
3. Add services for business logic in `backend/app/services/`
4. Frontend: Create components in `frontend/src/components/`
5. Update services in `frontend/src/services/`

## Production Deployment

### Backend Deployment
- Use Docker containers
- Set up reverse proxy (nginx)
- Configure SSL/TLS certificates
- Use production database (PostgreSQL)
- Set up monitoring and logging

### Frontend Deployment
- Build optimized production bundle: `npm run build`
- Serve static files via CDN
- Configure environment variables

### Environment Variables for Production
```env
# Production settings
DEBUG=False
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/portfolio_prod
SECRET_KEY=production-secret-key-change-this
CORS_ORIGINS=https://yourdomain.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation at `/docs`
- Review the example configuration files

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Investment goal tracking
- [ ] Tax reporting features
- [ ] Advanced analytics and charts
- [ ] Multi-currency support
- [ ] Import from CSV/Excel
- [ ] Automated portfolio rebalancing suggestions
- [ ] Integration with additional brokers and exchanges