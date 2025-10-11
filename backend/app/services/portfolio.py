from sqlalchemy.orm import Session
from ..models import Portfolio, User, BankAccount, StockHolding, CryptoHolding, Property, Vehicle
from ..services.market_data import stock_service, crypto_service
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class PortfolioService:
    def calculate_portfolio_value(self, db: Session, user_id: str) -> dict:
        """Calculate total portfolio value and breakdown"""
        
        # Get or create portfolio record
        portfolio = db.query(Portfolio).filter(Portfolio.owner_id == user_id).first()
        if not portfolio:
            portfolio = Portfolio(owner_id=user_id)
            db.add(portfolio)
        
        # Calculate cash balance from bank accounts
        bank_accounts = db.query(BankAccount).filter(BankAccount.owner_id == user_id).all()
        cash_balance = sum(account.balance or 0 for account in bank_accounts)
        
        # Calculate stock portfolio value
        stock_holdings = db.query(StockHolding).filter(StockHolding.owner_id == user_id).all()
        stock_value = sum(holding.total_value or 0 for holding in stock_holdings)
        
        # Calculate crypto portfolio value
        crypto_holdings = db.query(CryptoHolding).filter(CryptoHolding.owner_id == user_id).all()
        crypto_value = sum(holding.total_value or 0 for holding in crypto_holdings)
        
        # Calculate property value
        properties = db.query(Property).filter(Property.owner_id == user_id).all()
        property_value = sum((prop.current_value or prop.purchase_price or 0) for prop in properties)
        property_debt = sum(prop.mortgage_balance or 0 for prop in properties)
        
        # Calculate vehicle value
        vehicles = db.query(Vehicle).filter(Vehicle.owner_id == user_id).all()
        vehicle_value = sum((vehicle.current_value or vehicle.purchase_price or 0) for vehicle in vehicles)
        vehicle_debt = sum(vehicle.loan_balance or 0 for vehicle in vehicles)
        
        # Calculate totals
        total_assets = cash_balance + stock_value + crypto_value + property_value + vehicle_value
        total_liabilities = property_debt + vehicle_debt
        net_worth = total_assets - total_liabilities
        
        # Update portfolio record
        portfolio.total_net_worth = net_worth
        portfolio.total_assets = total_assets
        portfolio.total_liabilities = total_liabilities
        portfolio.cash_balance = cash_balance
        portfolio.investment_balance = stock_value + crypto_value
        portfolio.property_value = property_value
        portfolio.vehicle_value = vehicle_value
        portfolio.crypto_value = crypto_value
        portfolio.stock_value = stock_value
        portfolio.last_calculated = datetime.now()
        
        db.commit()
        
        return {
            'net_worth': net_worth,
            'total_assets': total_assets,
            'total_liabilities': total_liabilities,
            'breakdown': {
                'cash': cash_balance,
                'stocks': stock_value,
                'crypto': crypto_value,
                'property': property_value,
                'vehicles': vehicle_value,
                'property_debt': property_debt,
                'vehicle_debt': vehicle_debt
            },
            'last_updated': datetime.now()
        }
    
    def update_all_prices(self, db: Session, user_id: str):
        """Update all market prices for user's holdings"""
        try:
            # Update stock prices
            stock_service.update_stock_holdings_prices(db, user_id)
            
            # Update crypto prices
            crypto_service.update_crypto_holdings_prices(db, user_id)
            
            # Recalculate portfolio after price updates
            return self.calculate_portfolio_value(db, user_id)
            
        except Exception as e:
            logger.error(f"Error updating prices for user {user_id}: {e}")
            return None
    
    def get_portfolio_performance(self, db: Session, user_id: str, days: int = 30) -> dict:
        """Get portfolio performance over time"""
        
        # This would require historical portfolio values
        # For now, return current vs cost basis
        
        stock_holdings = db.query(StockHolding).filter(StockHolding.owner_id == user_id).all()
        crypto_holdings = db.query(CryptoHolding).filter(CryptoHolding.owner_id == user_id).all()
        
        stock_cost_basis = sum(holding.shares * holding.average_cost for holding in stock_holdings)
        stock_current_value = sum(holding.total_value or 0 for holding in stock_holdings)
        
        crypto_cost_basis = sum(holding.amount * holding.average_cost for holding in crypto_holdings)
        crypto_current_value = sum(holding.total_value or 0 for holding in crypto_holdings)
        
        total_cost_basis = stock_cost_basis + crypto_cost_basis
        total_current_value = stock_current_value + crypto_current_value
        
        gain_loss = total_current_value - total_cost_basis
        gain_loss_percent = (gain_loss / total_cost_basis * 100) if total_cost_basis > 0 else 0
        
        return {
            'cost_basis': total_cost_basis,
            'current_value': total_current_value,
            'gain_loss': gain_loss,
            'gain_loss_percent': gain_loss_percent,
            'stock_performance': {
                'cost_basis': stock_cost_basis,
                'current_value': stock_current_value,
                'gain_loss': stock_current_value - stock_cost_basis,
                'gain_loss_percent': ((stock_current_value - stock_cost_basis) / stock_cost_basis * 100) if stock_cost_basis > 0 else 0
            },
            'crypto_performance': {
                'cost_basis': crypto_cost_basis,
                'current_value': crypto_current_value,
                'gain_loss': crypto_current_value - crypto_cost_basis,
                'gain_loss_percent': ((crypto_current_value - crypto_cost_basis) / crypto_cost_basis * 100) if crypto_cost_basis > 0 else 0
            }
        }

portfolio_service = PortfolioService()