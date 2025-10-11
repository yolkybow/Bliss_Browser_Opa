#!/usr/bin/env python3
"""
Demo data populator for Finance Portfolio Tracker
Run this script to populate the database with sample data
"""

import requests
import json

API_BASE = 'http://localhost:5000'

def add_sample_data():
    print("🎯 Adding sample data to Finance Portfolio Tracker...\n")
    
    # Add Properties
    print("🏠 Adding sample properties...")
    properties = [
        {
            "name": "Main Residence",
            "property_type": "House",
            "location": "San Francisco, CA",
            "purchase_price": 850000,
            "current_value": 1200000,
            "purchase_date": "2018-06-15",
            "notes": "3 bed, 2 bath home in downtown"
        },
        {
            "name": "Vacation Condo",
            "property_type": "Condo",
            "location": "Miami, FL",
            "purchase_price": 320000,
            "current_value": 380000,
            "purchase_date": "2020-03-10",
            "notes": "Beach-front property"
        }
    ]
    
    for prop in properties:
        try:
            response = requests.post(f'{API_BASE}/api/properties', json=prop)
            if response.status_code == 201:
                print(f"  ✓ Added property: {prop['name']}")
        except Exception as e:
            print(f"  ✗ Error adding property: {e}")
    
    # Add Vehicles
    print("\n🚗 Adding sample vehicles...")
    vehicles = [
        {
            "name": "Tesla Model 3",
            "vehicle_type": "Electric Car",
            "make": "Tesla",
            "model": "Model 3",
            "year": 2022,
            "purchase_price": 48000,
            "current_value": 42000,
            "registration": "ABC123",
            "notes": "Long Range AWD"
        },
        {
            "name": "Harley Davidson",
            "vehicle_type": "Motorcycle",
            "make": "Harley Davidson",
            "model": "Street 750",
            "year": 2021,
            "purchase_price": 7500,
            "current_value": 6500,
            "registration": "XYZ789",
            "notes": "Weekend ride"
        }
    ]
    
    for vehicle in vehicles:
        try:
            response = requests.post(f'{API_BASE}/api/vehicles', json=vehicle)
            if response.status_code == 201:
                print(f"  ✓ Added vehicle: {vehicle['name']}")
        except Exception as e:
            print(f"  ✗ Error adding vehicle: {e}")
    
    # Add Bank Accounts
    print("\n🏦 Adding sample bank accounts...")
    bank_accounts = [
        {
            "bank_name": "Chase Bank",
            "account_type": "Checking",
            "account_number": "4567",
            "manual_balance": 25000,
            "notes": "Main checking account"
        },
        {
            "bank_name": "Bank of America",
            "account_type": "Savings",
            "account_number": "8901",
            "manual_balance": 75000,
            "notes": "Emergency fund"
        },
        {
            "bank_name": "Wells Fargo",
            "account_type": "Investment Account",
            "account_number": "2345",
            "manual_balance": 150000,
            "notes": "Retirement savings"
        }
    ]
    
    for account in bank_accounts:
        try:
            response = requests.post(f'{API_BASE}/api/bank-accounts', json=account)
            if response.status_code == 201:
                print(f"  ✓ Added account: {account['bank_name']} - {account['account_type']}")
        except Exception as e:
            print(f"  ✗ Error adding bank account: {e}")
    
    # Add Crypto Holdings
    print("\n₿ Adding sample crypto holdings...")
    crypto_holdings = [
        {
            "crypto_id": "bitcoin",
            "crypto_symbol": "BTC",
            "amount": 0.5,
            "purchase_price": 30000,
            "notes": "Long-term hold"
        },
        {
            "crypto_id": "ethereum",
            "crypto_symbol": "ETH",
            "amount": 5.0,
            "purchase_price": 2000,
            "notes": "DeFi portfolio"
        },
        {
            "crypto_id": "cardano",
            "crypto_symbol": "ADA",
            "amount": 10000,
            "purchase_price": 0.45,
            "notes": "Staking rewards"
        }
    ]
    
    for crypto in crypto_holdings:
        try:
            response = requests.post(f'{API_BASE}/api/crypto-holdings', json=crypto)
            if response.status_code == 201:
                print(f"  ✓ Added crypto: {crypto['crypto_symbol']} - {crypto['amount']} coins")
        except Exception as e:
            print(f"  ✗ Error adding crypto: {e}")
    
    # Add Stock Holdings
    print("\n📈 Adding sample stock holdings...")
    stock_holdings = [
        {
            "ticker": "AAPL",
            "shares": 100,
            "purchase_price": 150,
            "notes": "Apple Inc."
        },
        {
            "ticker": "GOOGL",
            "shares": 50,
            "purchase_price": 2500,
            "notes": "Alphabet Inc."
        },
        {
            "ticker": "MSFT",
            "shares": 75,
            "purchase_price": 300,
            "notes": "Microsoft Corporation"
        },
        {
            "ticker": "TSLA",
            "shares": 25,
            "purchase_price": 200,
            "notes": "Tesla Inc."
        }
    ]
    
    for stock in stock_holdings:
        try:
            response = requests.post(f'{API_BASE}/api/stock-holdings', json=stock)
            if response.status_code == 201:
                print(f"  ✓ Added stock: {stock['ticker']} - {stock['shares']} shares")
        except Exception as e:
            print(f"  ✗ Error adding stock: {e}")
    
    print("\n✅ Sample data added successfully!")
    print("🌐 Open http://localhost:5000 to view your portfolio\n")

if __name__ == "__main__":
    print("=" * 60)
    print("Finance Portfolio Tracker - Demo Data Setup")
    print("=" * 60)
    print("\n⚠️  Make sure the Flask app is running on port 5000")
    print("   Run: python app.py (in another terminal)\n")
    
    input("Press Enter to continue or Ctrl+C to cancel...")
    
    try:
        add_sample_data()
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to the application!")
        print("   Make sure the Flask app is running: python app.py")
    except KeyboardInterrupt:
        print("\n\n👋 Demo setup cancelled.")
