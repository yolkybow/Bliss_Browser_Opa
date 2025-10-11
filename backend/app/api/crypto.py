from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
from ..db.database import get_db
from ..models import CryptoHolding
from ..core.auth import get_current_user
from ..services.market_data import crypto_service

router = APIRouter(prefix="/crypto", tags=["crypto"])

class CryptoHoldingCreate(BaseModel):
    symbol: str
    amount: float
    average_cost: float
    exchange: str = ""
    wallet_address: str = ""

class CryptoHoldingUpdate(BaseModel):
    amount: float = None
    average_cost: float = None
    exchange: str = None
    wallet_address: str = None

class CryptoHoldingResponse(BaseModel):
    id: str
    symbol: str
    name: str
    amount: float
    average_cost: float
    current_price: float
    total_value: float
    exchange: str
    wallet_address: str
    last_price_update: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class CryptoPriceResponse(BaseModel):
    symbol: str
    name: str
    current_price: float
    change_24h: float
    change_percent_24h: float
    volume_24h: float
    market_cap: float

@router.post("/holdings", response_model=CryptoHoldingResponse)
def create_crypto_holding(
    holding_data: CryptoHoldingCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Get current price for the cryptocurrency
    price_data = crypto_service.get_crypto_price(holding_data.symbol.upper())
    if not price_data:
        raise HTTPException(status_code=400, detail="Unable to fetch cryptocurrency price")
    
    db_holding = CryptoHolding(
        owner_id=current_user.id,
        symbol=holding_data.symbol.upper(),
        name=price_data['name'],
        amount=holding_data.amount,
        average_cost=holding_data.average_cost,
        current_price=price_data['current_price'],
        total_value=holding_data.amount * price_data['current_price'],
        exchange=holding_data.exchange,
        wallet_address=holding_data.wallet_address,
        last_price_update=datetime.now()
    )
    
    db.add(db_holding)
    db.commit()
    db.refresh(db_holding)
    return db_holding

@router.get("/holdings", response_model=List[CryptoHoldingResponse])
def get_crypto_holdings(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    holdings = db.query(CryptoHolding).filter(CryptoHolding.owner_id == current_user.id).all()
    return holdings

@router.get("/holdings/{holding_id}", response_model=CryptoHoldingResponse)
def get_crypto_holding(
    holding_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    holding = db.query(CryptoHolding).filter(
        CryptoHolding.id == holding_id,
        CryptoHolding.owner_id == current_user.id
    ).first()
    
    if not holding:
        raise HTTPException(status_code=404, detail="Crypto holding not found")
    return holding

@router.put("/holdings/{holding_id}", response_model=CryptoHoldingResponse)
def update_crypto_holding(
    holding_id: str,
    holding_data: CryptoHoldingUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    holding = db.query(CryptoHolding).filter(
        CryptoHolding.id == holding_id,
        CryptoHolding.owner_id == current_user.id
    ).first()
    
    if not holding:
        raise HTTPException(status_code=404, detail="Crypto holding not found")
    
    for field, value in holding_data.dict(exclude_unset=True).items():
        setattr(holding, field, value)
    
    # Recalculate total value
    holding.total_value = holding.amount * holding.current_price
    
    db.commit()
    db.refresh(holding)
    return holding

@router.delete("/holdings/{holding_id}")
def delete_crypto_holding(
    holding_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    holding = db.query(CryptoHolding).filter(
        CryptoHolding.id == holding_id,
        CryptoHolding.owner_id == current_user.id
    ).first()
    
    if not holding:
        raise HTTPException(status_code=404, detail="Crypto holding not found")
    
    db.delete(holding)
    db.commit()
    return {"message": "Crypto holding deleted successfully"}

@router.get("/price/{symbol}", response_model=CryptoPriceResponse)
def get_crypto_price(symbol: str):
    price_data = crypto_service.get_crypto_price(symbol.upper())
    if not price_data:
        raise HTTPException(status_code=404, detail="Cryptocurrency not found")
    return price_data

@router.post("/refresh-prices")
def refresh_crypto_prices(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    crypto_service.update_crypto_holdings_prices(db, current_user.id)
    return {"message": "Crypto prices updated successfully"}