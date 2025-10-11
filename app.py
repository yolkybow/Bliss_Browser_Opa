from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import requests
import yfinance as yf
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database setup
engine = create_engine('sqlite:///portfolio.db', echo=False)
Base = declarative_base()
Session = sessionmaker(bind=engine)

# Database Models
class Property(Base):
    __tablename__ = 'properties'
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    property_type = Column(String(100))
    location = Column(String(200))
    purchase_price = Column(Float)
    current_value = Column(Float)
    purchase_date = Column(String(50))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Vehicle(Base):
    __tablename__ = 'vehicles'
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    vehicle_type = Column(String(100))
    make = Column(String(100))
    model = Column(String(100))
    year = Column(Integer)
    purchase_price = Column(Float)
    current_value = Column(Float)
    registration = Column(String(50))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class BankAccount(Base):
    __tablename__ = 'bank_accounts'
    id = Column(Integer, primary_key=True)
    bank_name = Column(String(200), nullable=False)
    account_type = Column(String(100))
    account_number = Column(String(100))
    manual_balance = Column(Float, default=0.0)
    api_key = Column(String(200))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class CryptoHolding(Base):
    __tablename__ = 'crypto_holdings'
    id = Column(Integer, primary_key=True)
    crypto_id = Column(String(50), nullable=False)  # e.g., 'bitcoin', 'ethereum'
    crypto_symbol = Column(String(10))  # e.g., 'BTC', 'ETH'
    amount = Column(Float, nullable=False)
    purchase_price = Column(Float)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class StockHolding(Base):
    __tablename__ = 'stock_holdings'
    id = Column(Integer, primary_key=True)
    ticker = Column(String(10), nullable=False)  # e.g., 'AAPL', 'GOOGL'
    shares = Column(Float, nullable=False)
    purchase_price = Column(Float)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(engine)

# Routes
@app.route('/')
def index():
    return render_template('index.html')

# Property Routes
@app.route('/api/properties', methods=['GET', 'POST'])
def properties():
    session = Session()
    try:
        if request.method == 'POST':
            data = request.json
            property = Property(
                name=data['name'],
                property_type=data.get('property_type'),
                location=data.get('location'),
                purchase_price=data.get('purchase_price'),
                current_value=data.get('current_value'),
                purchase_date=data.get('purchase_date'),
                notes=data.get('notes')
            )
            session.add(property)
            session.commit()
            return jsonify({'success': True, 'id': property.id}), 201
        else:
            properties = session.query(Property).all()
            return jsonify([{
                'id': p.id,
                'name': p.name,
                'property_type': p.property_type,
                'location': p.location,
                'purchase_price': p.purchase_price,
                'current_value': p.current_value,
                'purchase_date': p.purchase_date,
                'notes': p.notes
            } for p in properties])
    finally:
        session.close()

@app.route('/api/properties/<int:id>', methods=['DELETE', 'PUT'])
def property_detail(id):
    session = Session()
    try:
        property = session.query(Property).get(id)
        if not property:
            return jsonify({'error': 'Property not found'}), 404
        
        if request.method == 'DELETE':
            session.delete(property)
            session.commit()
            return jsonify({'success': True})
        elif request.method == 'PUT':
            data = request.json
            for key, value in data.items():
                if hasattr(property, key):
                    setattr(property, key, value)
            session.commit()
            return jsonify({'success': True})
    finally:
        session.close()

# Vehicle Routes
@app.route('/api/vehicles', methods=['GET', 'POST'])
def vehicles():
    session = Session()
    try:
        if request.method == 'POST':
            data = request.json
            vehicle = Vehicle(
                name=data['name'],
                vehicle_type=data.get('vehicle_type'),
                make=data.get('make'),
                model=data.get('model'),
                year=data.get('year'),
                purchase_price=data.get('purchase_price'),
                current_value=data.get('current_value'),
                registration=data.get('registration'),
                notes=data.get('notes')
            )
            session.add(vehicle)
            session.commit()
            return jsonify({'success': True, 'id': vehicle.id}), 201
        else:
            vehicles = session.query(Vehicle).all()
            return jsonify([{
                'id': v.id,
                'name': v.name,
                'vehicle_type': v.vehicle_type,
                'make': v.make,
                'model': v.model,
                'year': v.year,
                'purchase_price': v.purchase_price,
                'current_value': v.current_value,
                'registration': v.registration,
                'notes': v.notes
            } for v in vehicles])
    finally:
        session.close()

@app.route('/api/vehicles/<int:id>', methods=['DELETE', 'PUT'])
def vehicle_detail(id):
    session = Session()
    try:
        vehicle = session.query(Vehicle).get(id)
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404
        
        if request.method == 'DELETE':
            session.delete(vehicle)
            session.commit()
            return jsonify({'success': True})
        elif request.method == 'PUT':
            data = request.json
            for key, value in data.items():
                if hasattr(vehicle, key):
                    setattr(vehicle, key, value)
            session.commit()
            return jsonify({'success': True})
    finally:
        session.close()

# Bank Account Routes
@app.route('/api/bank-accounts', methods=['GET', 'POST'])
def bank_accounts():
    session = Session()
    try:
        if request.method == 'POST':
            data = request.json
            account = BankAccount(
                bank_name=data['bank_name'],
                account_type=data.get('account_type'),
                account_number=data.get('account_number'),
                manual_balance=data.get('manual_balance', 0.0),
                api_key=data.get('api_key'),
                notes=data.get('notes')
            )
            session.add(account)
            session.commit()
            return jsonify({'success': True, 'id': account.id}), 201
        else:
            accounts = session.query(BankAccount).all()
            return jsonify([{
                'id': a.id,
                'bank_name': a.bank_name,
                'account_type': a.account_type,
                'account_number': a.account_number,
                'balance': a.manual_balance,
                'notes': a.notes
            } for a in accounts])
    finally:
        session.close()

@app.route('/api/bank-accounts/<int:id>', methods=['DELETE', 'PUT'])
def bank_account_detail(id):
    session = Session()
    try:
        account = session.query(BankAccount).get(id)
        if not account:
            return jsonify({'error': 'Account not found'}), 404
        
        if request.method == 'DELETE':
            session.delete(account)
            session.commit()
            return jsonify({'success': True})
        elif request.method == 'PUT':
            data = request.json
            for key, value in data.items():
                if hasattr(account, key):
                    setattr(account, key, value)
            session.commit()
            return jsonify({'success': True})
    finally:
        session.close()

# Crypto Routes
@app.route('/api/crypto-holdings', methods=['GET', 'POST'])
def crypto_holdings():
    session = Session()
    try:
        if request.method == 'POST':
            data = request.json
            holding = CryptoHolding(
                crypto_id=data['crypto_id'],
                crypto_symbol=data['crypto_symbol'],
                amount=data['amount'],
                purchase_price=data.get('purchase_price'),
                notes=data.get('notes')
            )
            session.add(holding)
            session.commit()
            return jsonify({'success': True, 'id': holding.id}), 201
        else:
            holdings = session.query(CryptoHolding).all()
            return jsonify([{
                'id': h.id,
                'crypto_id': h.crypto_id,
                'crypto_symbol': h.crypto_symbol,
                'amount': h.amount,
                'purchase_price': h.purchase_price,
                'notes': h.notes
            } for h in holdings])
    finally:
        session.close()

@app.route('/api/crypto-holdings/<int:id>', methods=['DELETE', 'PUT'])
def crypto_holding_detail(id):
    session = Session()
    try:
        holding = session.query(CryptoHolding).get(id)
        if not holding:
            return jsonify({'error': 'Crypto holding not found'}), 404
        
        if request.method == 'DELETE':
            session.delete(holding)
            session.commit()
            return jsonify({'success': True})
        elif request.method == 'PUT':
            data = request.json
            for key, value in data.items():
                if hasattr(holding, key):
                    setattr(holding, key, value)
            session.commit()
            return jsonify({'success': True})
    finally:
        session.close()

# Live Crypto Prices
@app.route('/api/crypto/live-prices')
def crypto_live_prices():
    session = Session()
    try:
        holdings = session.query(CryptoHolding).all()
        if not holdings:
            return jsonify([])
        
        # Get unique crypto IDs
        crypto_ids = ','.join(set([h.crypto_id for h in holdings]))
        
        # Call CoinGecko API
        url = f'https://api.coingecko.com/api/v3/simple/price?ids={crypto_ids}&vs_currencies=usd&include_24hr_change=true'
        response = requests.get(url)
        
        if response.status_code == 200:
            prices = response.json()
            result = []
            for holding in holdings:
                if holding.crypto_id in prices:
                    current_price = prices[holding.crypto_id]['usd']
                    change_24h = prices[holding.crypto_id].get('usd_24h_change', 0)
                    current_value = holding.amount * current_price
                    profit_loss = 0
                    if holding.purchase_price:
                        profit_loss = current_value - (holding.amount * holding.purchase_price)
                    
                    result.append({
                        'id': holding.id,
                        'crypto_id': holding.crypto_id,
                        'crypto_symbol': holding.crypto_symbol.upper(),
                        'amount': holding.amount,
                        'current_price': current_price,
                        'current_value': current_value,
                        'purchase_price': holding.purchase_price,
                        'profit_loss': profit_loss,
                        'change_24h': change_24h,
                        'notes': holding.notes
                    })
            return jsonify(result)
        else:
            return jsonify({'error': 'Failed to fetch crypto prices'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

# Stock Routes
@app.route('/api/stock-holdings', methods=['GET', 'POST'])
def stock_holdings():
    session = Session()
    try:
        if request.method == 'POST':
            data = request.json
            holding = StockHolding(
                ticker=data['ticker'].upper(),
                shares=data['shares'],
                purchase_price=data.get('purchase_price'),
                notes=data.get('notes')
            )
            session.add(holding)
            session.commit()
            return jsonify({'success': True, 'id': holding.id}), 201
        else:
            holdings = session.query(StockHolding).all()
            return jsonify([{
                'id': h.id,
                'ticker': h.ticker,
                'shares': h.shares,
                'purchase_price': h.purchase_price,
                'notes': h.notes
            } for h in holdings])
    finally:
        session.close()

@app.route('/api/stock-holdings/<int:id>', methods=['DELETE', 'PUT'])
def stock_holding_detail(id):
    session = Session()
    try:
        holding = session.query(StockHolding).get(id)
        if not holding:
            return jsonify({'error': 'Stock holding not found'}), 404
        
        if request.method == 'DELETE':
            session.delete(holding)
            session.commit()
            return jsonify({'success': True})
        elif request.method == 'PUT':
            data = request.json
            for key, value in data.items():
                if hasattr(holding, key):
                    setattr(holding, key, value)
            session.commit()
            return jsonify({'success': True})
    finally:
        session.close()

# Live Stock Prices
@app.route('/api/stocks/live-prices')
def stocks_live_prices():
    session = Session()
    try:
        holdings = session.query(StockHolding).all()
        if not holdings:
            return jsonify([])
        
        result = []
        for holding in holdings:
            try:
                stock = yf.Ticker(holding.ticker)
                info = stock.info
                history = stock.history(period='1d')
                
                if not history.empty:
                    current_price = history['Close'].iloc[-1]
                    current_value = holding.shares * current_price
                    profit_loss = 0
                    if holding.purchase_price:
                        profit_loss = current_value - (holding.shares * holding.purchase_price)
                    
                    # Get previous close for change calculation
                    prev_close = info.get('previousClose', current_price)
                    change_percent = ((current_price - prev_close) / prev_close * 100) if prev_close else 0
                    
                    result.append({
                        'id': holding.id,
                        'ticker': holding.ticker,
                        'name': info.get('longName', holding.ticker),
                        'shares': holding.shares,
                        'current_price': round(current_price, 2),
                        'current_value': round(current_value, 2),
                        'purchase_price': holding.purchase_price,
                        'profit_loss': round(profit_loss, 2),
                        'change_percent': round(change_percent, 2),
                        'notes': holding.notes
                    })
            except Exception as e:
                print(f"Error fetching {holding.ticker}: {str(e)}")
                result.append({
                    'id': holding.id,
                    'ticker': holding.ticker,
                    'name': holding.ticker,
                    'shares': holding.shares,
                    'current_price': 0,
                    'current_value': 0,
                    'purchase_price': holding.purchase_price,
                    'profit_loss': 0,
                    'change_percent': 0,
                    'notes': holding.notes,
                    'error': 'Failed to fetch price'
                })
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

# Portfolio Summary
@app.route('/api/portfolio/summary')
def portfolio_summary():
    session = Session()
    try:
        # Get all assets
        properties = session.query(Property).all()
        vehicles = session.query(Vehicle).all()
        bank_accounts = session.query(BankAccount).all()
        
        property_value = sum([p.current_value or 0 for p in properties])
        vehicle_value = sum([v.current_value or 0 for v in vehicles])
        bank_balance = sum([a.manual_balance or 0 for a in bank_accounts])
        
        # Get crypto values
        crypto_value = 0
        crypto_holdings = session.query(CryptoHolding).all()
        if crypto_holdings:
            crypto_ids = ','.join(set([h.crypto_id for h in crypto_holdings]))
            try:
                url = f'https://api.coingecko.com/api/v3/simple/price?ids={crypto_ids}&vs_currencies=usd'
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    prices = response.json()
                    for holding in crypto_holdings:
                        if holding.crypto_id in prices:
                            crypto_value += holding.amount * prices[holding.crypto_id]['usd']
            except:
                pass
        
        # Get stock values
        stock_value = 0
        stock_holdings = session.query(StockHolding).all()
        for holding in stock_holdings:
            try:
                stock = yf.Ticker(holding.ticker)
                history = stock.history(period='1d')
                if not history.empty:
                    current_price = history['Close'].iloc[-1]
                    stock_value += holding.shares * current_price
            except:
                pass
        
        total_value = property_value + vehicle_value + bank_balance + crypto_value + stock_value
        
        return jsonify({
            'total_value': round(total_value, 2),
            'property_value': round(property_value, 2),
            'vehicle_value': round(vehicle_value, 2),
            'bank_balance': round(bank_balance, 2),
            'crypto_value': round(crypto_value, 2),
            'stock_value': round(stock_value, 2),
            'property_count': len(properties),
            'vehicle_count': len(vehicles),
            'bank_account_count': len(bank_accounts),
            'crypto_count': len(crypto_holdings),
            'stock_count': len(stock_holdings)
        })
    finally:
        session.close()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
