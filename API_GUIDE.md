# API Integration Guide

## Live Tracking APIs

### 1. CoinGecko API (Cryptocurrency) - ✅ INTEGRATED

**Status**: Fully integrated and working
**Cost**: FREE (no API key required)
**Rate Limit**: 10-50 calls/minute

**Supported Cryptocurrencies**: 10,000+ coins

**Usage in App**:
- Real-time crypto prices
- 24-hour price changes
- Automatic profit/loss calculations

**Example Crypto IDs**:
```
bitcoin, ethereum, binancecoin, cardano, solana, polkadot, 
dogecoin, ripple, litecoin, chainlink, uniswap, avalanche-2,
polygon, stellar, cosmos, algorand, tron, shiba-inu
```

**API Endpoint Used**:
```
GET https://api.coingecko.com/api/v3/simple/price
?ids={crypto_ids}&vs_currencies=usd&include_24hr_change=true
```

---

### 2. Yahoo Finance API (Stocks) - ✅ INTEGRATED

**Status**: Fully integrated and working
**Cost**: FREE (no API key required)
**Library**: yfinance Python package

**Supported Markets**: 
- US Stocks (NYSE, NASDAQ)
- International Stocks
- ETFs, Mutual Funds
- Indices

**Usage in App**:
- Real-time stock prices
- Company information
- Daily price changes
- Profit/loss calculations

**Popular Stock Tickers**:
```
AAPL (Apple), GOOGL (Alphabet), MSFT (Microsoft), 
AMZN (Amazon), TSLA (Tesla), META (Meta), 
NVDA (NVIDIA), JPM (JPMorgan), V (Visa),
WMT (Walmart), JNJ (Johnson & Johnson)
```

---

### 3. Bank Balance APIs - 🔧 READY FOR INTEGRATION

**Status**: Infrastructure ready, needs API credentials

#### Option A: Plaid (Recommended)

**Website**: https://plaid.com
**Cost**: Free sandbox, $0.39/user/month production
**Coverage**: 11,000+ financial institutions (US, Canada, Europe)

**Setup Steps**:
1. Sign up at https://dashboard.plaid.com/signup
2. Get Client ID and Secret
3. Add to `.env` file:
   ```
   PLAID_CLIENT_ID=your_client_id
   PLAID_SECRET=your_secret
   PLAID_ENV=sandbox  # or 'development' or 'production'
   ```

**Integration Code** (add to `app.py`):
```python
import plaid
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest

# Initialize Plaid client
configuration = plaid.Configuration(
    host=plaid.Environment.Sandbox,  # or Development/Production
    api_key={
        'clientId': os.getenv('PLAID_CLIENT_ID'),
        'secret': os.getenv('PLAID_SECRET'),
    }
)
api_client = plaid.ApiClient(configuration)
client = plaid_api.PlaidApi(api_client)

# Create link token for user authentication
@app.route('/api/plaid/create-link-token')
def create_link_token():
    request = LinkTokenCreateRequest(
        user={'client_user_id': 'user-id'},
        client_name='Finance Portfolio Tracker',
        products=['auth', 'transactions'],
        country_codes=['US'],
        language='en'
    )
    response = client.link_token_create(request)
    return jsonify({'link_token': response['link_token']})

# Get account balances
@app.route('/api/plaid/get-balance')
def get_balance():
    # Exchange public token for access token
    # Then fetch balance
    pass
```

#### Option B: Yodlee

**Website**: https://www.yodlee.com
**Cost**: Enterprise pricing
**Coverage**: 17,000+ institutions worldwide

#### Option C: TrueLayer (Europe)

**Website**: https://truelayer.com
**Cost**: Pay-as-you-go
**Coverage**: European banks

#### Option D: Finicity (Mastercard)

**Website**: https://www.finicity.com
**Cost**: Custom pricing
**Coverage**: US financial institutions

---

## Current Implementation

### Automatic Refresh
- Frontend auto-refreshes every 30 seconds
- Manual refresh button available
- Last update timestamp shown

### Data Flow
```
User Interface (React-style vanilla JS)
    ↓
Flask REST API
    ↓
├─→ SQLite Database (user data)
├─→ CoinGecko API (crypto prices)
├─→ Yahoo Finance API (stock prices)
└─→ Bank APIs (future integration)
```

### API Endpoints

**Properties**:
- GET/POST `/api/properties`
- PUT/DELETE `/api/properties/<id>`

**Vehicles**:
- GET/POST `/api/vehicles`
- PUT/DELETE `/api/vehicles/<id>`

**Bank Accounts**:
- GET/POST `/api/bank-accounts`
- PUT/DELETE `/api/bank-accounts/<id>`

**Crypto Holdings**:
- GET/POST `/api/crypto-holdings`
- PUT/DELETE `/api/crypto-holdings/<id>`
- GET `/api/crypto/live-prices` (with real-time data)

**Stock Holdings**:
- GET/POST `/api/stock-holdings`
- PUT/DELETE `/api/stock-holdings/<id>`
- GET `/api/stocks/live-prices` (with real-time data)

**Portfolio**:
- GET `/api/portfolio/summary` (aggregated data)

---

## Testing the APIs

### Test Crypto API
```bash
curl "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true"
```

### Test Stock API (Python)
```python
import yfinance as yf
stock = yf.Ticker("AAPL")
print(stock.info)
print(stock.history(period='1d'))
```

---

## Rate Limits & Best Practices

### CoinGecko
- Free tier: 10-50 calls/minute
- Current app: Makes 1 call every 30 seconds per refresh
- Batches all crypto IDs in single request (efficient)

### Yahoo Finance
- No strict published limits
- Current app: Individual calls per stock (could be optimized)
- Recommendation: Don't refresh more than once per minute

### Bank APIs
- Plaid: Generous limits on paid tier
- Recommendation: Refresh every 5-10 minutes, not every 30 seconds

---

## Error Handling

The app includes error handling for:
- API connection failures
- Rate limit exceeded
- Invalid ticker symbols
- Network timeouts

All errors are logged and gracefully handled in the UI.

---

## Future Enhancements

1. **Cache Layer**: Redis for API response caching
2. **Webhooks**: Real-time updates via WebSocket
3. **Historical Data**: Chart price history over time
4. **Alerts**: Price alerts for stocks/crypto
5. **Forex**: Multi-currency support with live exchange rates
