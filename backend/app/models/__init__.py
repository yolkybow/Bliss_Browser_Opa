from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    properties = relationship("Property", back_populates="owner")
    vehicles = relationship("Vehicle", back_populates="owner")
    bank_accounts = relationship("BankAccount", back_populates="owner")
    crypto_holdings = relationship("CryptoHolding", back_populates="owner")
    stock_holdings = relationship("StockHolding", back_populates="owner")

class Property(Base):
    __tablename__ = "properties"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, ForeignKey("users.id"))
    property_type = Column(String)  # residential, commercial, land, etc.
    address = Column(Text)
    purchase_price = Column(Float)
    current_value = Column(Float)
    purchase_date = Column(DateTime)
    mortgage_balance = Column(Float, default=0)
    monthly_payment = Column(Float, default=0)
    rental_income = Column(Float, default=0)
    property_taxes = Column(Float, default=0)
    insurance_cost = Column(Float, default=0)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    owner = relationship("User", back_populates="properties")

class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, ForeignKey("users.id"))
    make = Column(String)
    model = Column(String)
    year = Column(Integer)
    vin = Column(String, unique=True)
    purchase_price = Column(Float)
    current_value = Column(Float)
    purchase_date = Column(DateTime)
    mileage = Column(Integer)
    loan_balance = Column(Float, default=0)
    monthly_payment = Column(Float, default=0)
    insurance_cost = Column(Float, default=0)
    registration_cost = Column(Float, default=0)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    owner = relationship("User", back_populates="vehicles")

class BankAccount(Base):
    __tablename__ = "bank_accounts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, ForeignKey("users.id"))
    bank_name = Column(String)
    account_type = Column(String)  # checking, savings, money_market, etc.
    account_number_masked = Column(String)
    plaid_account_id = Column(String, unique=True)
    balance = Column(Float)
    available_balance = Column(Float)
    currency = Column(String, default="USD")
    last_updated = Column(DateTime, default=func.now())
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    owner = relationship("User", back_populates="bank_accounts")

class CryptoHolding(Base):
    __tablename__ = "crypto_holdings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, ForeignKey("users.id"))
    symbol = Column(String)  # BTC, ETH, etc.
    name = Column(String)
    amount = Column(Float)
    average_cost = Column(Float)
    current_price = Column(Float)
    total_value = Column(Float)
    last_price_update = Column(DateTime, default=func.now())
    exchange = Column(String)  # binance, coinbase, etc.
    wallet_address = Column(String)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    owner = relationship("User", back_populates="crypto_holdings")

class StockHolding(Base):
    __tablename__ = "stock_holdings"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, ForeignKey("users.id"))
    symbol = Column(String)  # AAPL, GOOGL, etc.
    company_name = Column(String)
    shares = Column(Float)
    average_cost = Column(Float)
    current_price = Column(Float)
    total_value = Column(Float)
    last_price_update = Column(DateTime, default=func.now())
    broker = Column(String)  # robinhood, fidelity, etc.
    sector = Column(String)
    dividend_yield = Column(Float, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    owner = relationship("User", back_populates="stock_holdings")

class Portfolio(Base):
    __tablename__ = "portfolios"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, ForeignKey("users.id"))
    total_net_worth = Column(Float, default=0)
    total_assets = Column(Float, default=0)
    total_liabilities = Column(Float, default=0)
    cash_balance = Column(Float, default=0)
    investment_balance = Column(Float, default=0)
    property_value = Column(Float, default=0)
    vehicle_value = Column(Float, default=0)
    crypto_value = Column(Float, default=0)
    stock_value = Column(Float, default=0)
    last_calculated = Column(DateTime, default=func.now())
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class PriceHistory(Base):
    __tablename__ = "price_history"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    symbol = Column(String, index=True)
    asset_type = Column(String)  # crypto, stock
    price = Column(Float)
    timestamp = Column(DateTime, default=func.now())
    volume = Column(Float)
    market_cap = Column(Float)
    source = Column(String)  # api source