from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
from ..db.database import get_db
from ..models import BankAccount
from ..core.auth import get_current_user
from ..services.bank_integration import bank_service

router = APIRouter(prefix="/banking", tags=["banking"])

class BankAccountResponse(BaseModel):
    id: str
    bank_name: str
    account_type: str
    account_number_masked: str
    balance: float
    available_balance: float
    currency: str
    last_updated: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class LinkTokenResponse(BaseModel):
    link_token: str

class ExchangeTokenRequest(BaseModel):
    public_token: str

@router.get("/accounts", response_model=List[BankAccountResponse])
def get_bank_accounts(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    accounts = db.query(BankAccount).filter(
        BankAccount.owner_id == current_user.id,
        BankAccount.is_active == True
    ).all()
    return accounts

@router.post("/link-token", response_model=LinkTokenResponse)
def create_link_token(
    current_user = Depends(get_current_user)
):
    link_token = bank_service.create_link_token(current_user.id)
    if not link_token:
        raise HTTPException(status_code=400, detail="Failed to create link token")
    return {"link_token": link_token}

@router.post("/exchange-token")
def exchange_public_token(
    token_data: ExchangeTokenRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    access_token = bank_service.exchange_public_token(token_data.public_token)
    if not access_token:
        raise HTTPException(status_code=400, detail="Failed to exchange token")
    
    # Update account balances with the new access token
    bank_service.update_bank_account_balances(db, current_user.id, access_token)
    
    return {"message": "Bank accounts linked successfully"}

@router.post("/refresh-balances")
def refresh_account_balances(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # In a real implementation, you'd store access tokens securely
    # For now, this is a placeholder that would need proper token management
    return {"message": "Balance refresh initiated"}

@router.put("/accounts/{account_id}/deactivate")
def deactivate_account(
    account_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    account = db.query(BankAccount).filter(
        BankAccount.id == account_id,
        BankAccount.owner_id == current_user.id
    ).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    account.is_active = False
    db.commit()
    
    return {"message": "Account deactivated successfully"}