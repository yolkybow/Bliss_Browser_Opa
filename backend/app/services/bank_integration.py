from plaid.api import plaid_api
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.country_code import CountryCode
from plaid.model.products import Products
from plaid.configuration import Configuration
from plaid.api_client import ApiClient
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from ..models import BankAccount
from ..core.config import settings
import logging

logger = logging.getLogger(__name__)

class BankService:
    def __init__(self):
        configuration = Configuration(
            host=getattr(plaid_api.Environment, settings.PLAID_ENV, plaid_api.Environment.sandbox),
            api_key={
                'clientId': settings.PLAID_CLIENT_ID,
                'secret': settings.PLAID_SECRET,
            }
        )
        api_client = ApiClient(configuration)
        self.client = plaid_api.PlaidApi(api_client)
    
    def create_link_token(self, user_id: str) -> Optional[str]:
        """Create a link token for Plaid Link"""
        try:
            request = LinkTokenCreateRequest(
                products=[Products('transactions'), Products('accounts')],
                client_name="Portfolio Tracker",
                country_codes=[CountryCode('US')],
                language='en',
                user=LinkTokenCreateRequestUser(client_user_id=user_id)
            )
            response = self.client.link_token_create(request)
            return response['link_token']
        except Exception as e:
            logger.error(f"Error creating link token: {e}")
            return None
    
    def exchange_public_token(self, public_token: str) -> Optional[str]:
        """Exchange public token for access token"""
        try:
            request = ItemPublicTokenExchangeRequest(public_token=public_token)
            response = self.client.item_public_token_exchange(request)
            return response['access_token']
        except Exception as e:
            logger.error(f"Error exchanging public token: {e}")
            return None
    
    def get_accounts(self, access_token: str) -> Optional[List[Dict]]:
        """Get account information"""
        try:
            request = AccountsGetRequest(access_token=access_token)
            response = self.client.accounts_get(request)
            
            accounts = []
            for account in response['accounts']:
                accounts.append({
                    'account_id': account['account_id'],
                    'name': account['name'],
                    'type': account['type'],
                    'subtype': account['subtype'],
                    'balance': {
                        'current': account['balances']['current'],
                        'available': account['balances']['available'],
                        'limit': account['balances']['limit'],
                        'iso_currency_code': account['balances']['iso_currency_code']
                    },
                    'mask': account['mask']
                })
            return accounts
        except Exception as e:
            logger.error(f"Error fetching accounts: {e}")
            return None
    
    def get_transactions(self, access_token: str, start_date: datetime, end_date: datetime) -> Optional[List[Dict]]:
        """Get transactions for date range"""
        try:
            request = TransactionsGetRequest(
                access_token=access_token,
                start_date=start_date.date(),
                end_date=end_date.date()
            )
            response = self.client.transactions_get(request)
            
            transactions = []
            for transaction in response['transactions']:
                transactions.append({
                    'transaction_id': transaction['transaction_id'],
                    'account_id': transaction['account_id'],
                    'amount': transaction['amount'],
                    'date': transaction['date'],
                    'name': transaction['name'],
                    'category': transaction['category'],
                    'subcategory': transaction['subcategory'] if 'subcategory' in transaction else None,
                })
            return transactions
        except Exception as e:
            logger.error(f"Error fetching transactions: {e}")
            return None
    
    def update_bank_account_balances(self, db: Session, user_id: str, access_token: str):
        """Update bank account balances for a user"""
        accounts_data = self.get_accounts(access_token)
        if not accounts_data:
            return
        
        for account_data in accounts_data:
            # Find existing account or create new one
            account = db.query(BankAccount).filter(
                BankAccount.owner_id == user_id,
                BankAccount.plaid_account_id == account_data['account_id']
            ).first()
            
            if not account:
                account = BankAccount(
                    owner_id=user_id,
                    plaid_account_id=account_data['account_id'],
                    bank_name="Connected Bank",  # Could be enhanced with institution info
                    account_type=account_data['subtype'],
                    account_number_masked=account_data['mask']
                )
                db.add(account)
            
            # Update balance information
            account.balance = account_data['balance']['current']
            account.available_balance = account_data['balance']['available']
            account.currency = account_data['balance']['iso_currency_code'] or 'USD'
            account.last_updated = datetime.now()
        
        db.commit()

# Initialize service
bank_service = BankService()