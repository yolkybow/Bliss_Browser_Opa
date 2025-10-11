import yfinance as yf
import ccxt
import requests
from typing import Dict, List, Optional
import asyncio
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models import StockHolding, CryptoHolding, PriceHistory
from ..core.config import settings
import logging

logger = logging.getLogger(__name__)

class StockService:
    def __init__(self):
        self.alpha_vantage_key = settings.ALPHA_VANTAGE_API_KEY
    
    def get_stock_price(self, symbol: str) -> Optional[Dict]:
        """Get current stock price using yfinance"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            hist = ticker.history(period="1d")
            
            if hist.empty:
                return None
                
            current_price = hist['Close'].iloc[-1]
            previous_close = info.get('previousClose', current_price)
            
            return {
                'symbol': symbol,
                'current_price': float(current_price),
                'previous_close': float(previous_close),
                'change': float(current_price - previous_close),
                'change_percent': float(((current_price - previous_close) / previous_close) * 100),
                'volume': int(hist['Volume'].iloc[-1]) if 'Volume' in hist else 0,
                'market_cap': info.get('marketCap', 0),
                'company_name': info.get('longName', symbol),
                'sector': info.get('sector', 'Unknown'),
                'dividend_yield': info.get('dividendYield', 0),
                'timestamp': datetime.now()
            }
        except Exception as e:
            logger.error(f"Error fetching stock price for {symbol}: {e}")
            return None
    
    def get_multiple_stock_prices(self, symbols: List[str]) -> Dict[str, Dict]:
        """Get prices for multiple stocks"""
        results = {}
        for symbol in symbols:
            price_data = self.get_stock_price(symbol)
            if price_data:
                results[symbol] = price_data
        return results
    
    def update_stock_holdings_prices(self, db: Session, user_id: str):
        """Update prices for all user's stock holdings"""
        holdings = db.query(StockHolding).filter(StockHolding.owner_id == user_id).all()
        symbols = [holding.symbol for holding in holdings]
        
        if not symbols:
            return
        
        prices = self.get_multiple_stock_prices(symbols)
        
        for holding in holdings:
            if holding.symbol in prices:
                price_data = prices[holding.symbol]
                holding.current_price = price_data['current_price']
                holding.total_value = holding.shares * price_data['current_price']
                holding.company_name = price_data['company_name']
                holding.sector = price_data['sector']
                holding.dividend_yield = price_data['dividend_yield']
                holding.last_price_update = datetime.now()
                
                # Store price history
                price_history = PriceHistory(
                    symbol=holding.symbol,
                    asset_type="stock",
                    price=price_data['current_price'],
                    volume=price_data['volume'],
                    market_cap=price_data['market_cap'],
                    source="yfinance"
                )
                db.add(price_history)
        
        db.commit()

class CryptoService:
    def __init__(self):
        self.cmc_api_key = settings.COINMARKETCAP_API_KEY
        self.exchange = ccxt.binance()  # Free API, no key required for public data
    
    def get_crypto_price(self, symbol: str) -> Optional[Dict]:
        """Get current crypto price using CCXT"""
        try:
            # Normalize symbol (add USDT if not present)
            if not symbol.endswith('USDT') and not symbol.endswith('USD'):
                trading_symbol = f"{symbol}/USDT"
            else:
                trading_symbol = symbol
            
            ticker = self.exchange.fetch_ticker(trading_symbol)
            
            return {
                'symbol': symbol,
                'name': symbol,  # Could be enhanced with full names
                'current_price': float(ticker['last']),
                'change_24h': float(ticker['change']) if ticker['change'] else 0,
                'change_percent_24h': float(ticker['percentage']) if ticker['percentage'] else 0,
                'volume_24h': float(ticker['baseVolume']) if ticker['baseVolume'] else 0,
                'market_cap': 0,  # Would need CMC API for this
                'timestamp': datetime.now()
            }
        except Exception as e:
            logger.error(f"Error fetching crypto price for {symbol}: {e}")
            return None
    
    def get_crypto_price_cmc(self, symbol: str) -> Optional[Dict]:
        """Get crypto price using CoinMarketCap API (requires API key)"""
        if not self.cmc_api_key:
            return None
            
        try:
            url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest"
            headers = {
                'Accepts': 'application/json',
                'X-CMC_PRO_API_KEY': self.cmc_api_key,
            }
            params = {
                'symbol': symbol,
                'convert': 'USD'
            }
            
            response = requests.get(url, headers=headers, params=params)
            data = response.json()
            
            if 'data' in data and symbol in data['data']:
                crypto_data = data['data'][symbol]
                quote = crypto_data['quote']['USD']
                
                return {
                    'symbol': symbol,
                    'name': crypto_data['name'],
                    'current_price': float(quote['price']),
                    'change_24h': float(quote['percent_change_24h']),
                    'change_percent_24h': float(quote['percent_change_24h']),
                    'volume_24h': float(quote['volume_24h']),
                    'market_cap': float(quote['market_cap']),
                    'timestamp': datetime.now()
                }
        except Exception as e:
            logger.error(f"Error fetching CMC price for {symbol}: {e}")
            return None
    
    def get_multiple_crypto_prices(self, symbols: List[str]) -> Dict[str, Dict]:
        """Get prices for multiple cryptocurrencies"""
        results = {}
        for symbol in symbols:
            # Try CMC first if API key available, fallback to CCXT
            price_data = self.get_crypto_price_cmc(symbol) or self.get_crypto_price(symbol)
            if price_data:
                results[symbol] = price_data
        return results
    
    def update_crypto_holdings_prices(self, db: Session, user_id: str):
        """Update prices for all user's crypto holdings"""
        holdings = db.query(CryptoHolding).filter(CryptoHolding.owner_id == user_id).all()
        symbols = [holding.symbol for holding in holdings]
        
        if not symbols:
            return
        
        prices = self.get_multiple_crypto_prices(symbols)
        
        for holding in holdings:
            if holding.symbol in prices:
                price_data = prices[holding.symbol]
                holding.current_price = price_data['current_price']
                holding.total_value = holding.amount * price_data['current_price']
                holding.name = price_data['name']
                holding.last_price_update = datetime.now()
                
                # Store price history
                price_history = PriceHistory(
                    symbol=holding.symbol,
                    asset_type="crypto",
                    price=price_data['current_price'],
                    volume=price_data['volume_24h'],
                    market_cap=price_data['market_cap'],
                    source="ccxt" if not self.cmc_api_key else "coinmarketcap"
                )
                db.add(price_history)
        
        db.commit()

# Initialize services
stock_service = StockService()
crypto_service = CryptoService()