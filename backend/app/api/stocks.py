from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from pydantic import BaseModel
from datetime import datetime
from ..db.database import get_db
from ..models import StockHolding
from ..core.auth import get_current_user
from ..services.market_data import stock_service

router = APIRouter(prefix="/stocks", tags=["stocks"])

class StockHoldingCreate(BaseModel):
    symbol: str
    shares: float
    average_cost: float
    broker: str = ""

class StockHoldingUpdate(BaseModel):
    shares: float = None
    average_cost: float = None
    broker: str = None

class StockHoldingResponse(BaseModel):
    id: str
    symbol: str
    company_name: str
    shares: float
    average_cost: float
    current_price: float
    total_value: float
    broker: str
    sector: str
    dividend_yield: float
    last_price_update: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class StockPriceResponse(BaseModel):
    symbol: str
    current_price: float
    previous_close: float
    change: float
    change_percent: float
    volume: int
    market_cap: int
    company_name: str
    sector: str
    dividend_yield: float

@router.post("/holdings", response_model=StockHoldingResponse)
def create_stock_holding(
    holding_data: StockHoldingCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Get current price for the stock
    price_data = stock_service.get_stock_price(holding_data.symbol.upper())
    if not price_data:
        raise HTTPException(status_code=400, detail="Unable to fetch stock price")
    
    db_holding = StockHolding(
        owner_id=current_user.id,
        symbol=holding_data.symbol.upper(),
        company_name=price_data['company_name'],
        shares=holding_data.shares,
        average_cost=holding_data.average_cost,
        current_price=price_data['current_price'],
        total_value=holding_data.shares * price_data['current_price'],
        broker=holding_data.broker,
        sector=price_data['sector'],
        dividend_yield=price_data['dividend_yield'],
        last_price_update=datetime.now()
    )
    
    db.add(db_holding)
    db.commit()
    db.refresh(db_holding)
    return db_holding

@router.get("/holdings", response_model=List[StockHoldingResponse])
def get_stock_holdings(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    holdings = db.query(StockHolding).filter(StockHolding.owner_id == current_user.id).all()
    return holdings

@router.get("/holdings/{holding_id}", response_model=StockHoldingResponse)
def get_stock_holding(
    holding_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    holding = db.query(StockHolding).filter(
        StockHolding.id == holding_id,
        StockHolding.owner_id == current_user.id
    ).first()
    
    if not holding:
        raise HTTPException(status_code=404, detail="Stock holding not found")
    return holding

@router.put("/holdings/{holding_id}", response_model=StockHoldingResponse)
def update_stock_holding(
    holding_id: str,
    holding_data: StockHoldingUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    holding = db.query(StockHolding).filter(
        StockHolding.id == holding_id,
        StockHolding.owner_id == current_user.id
    ).first()
    
    if not holding:
        raise HTTPException(status_code=404, detail="Stock holding not found")
    
    for field, value in holding_data.dict(exclude_unset=True).items():
        setattr(holding, field, value)
    
    # Recalculate total value
    holding.total_value = holding.shares * holding.current_price
    
    db.commit()
    db.refresh(holding)
    return holding

@router.delete("/holdings/{holding_id}")
def delete_stock_holding(
    holding_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    holding = db.query(StockHolding).filter(
        StockHolding.id == holding_id,
        StockHolding.owner_id == current_user.id
    ).first()
    
    if not holding:
        raise HTTPException(status_code=404, detail="Stock holding not found")
    
    db.delete(holding)
    db.commit()
    return {"message": "Stock holding deleted successfully"}

@router.get("/price/{symbol}", response_model=StockPriceResponse)
def get_stock_price(symbol: str):
    price_data = stock_service.get_stock_price(symbol.upper())
    if not price_data:
        raise HTTPException(status_code=404, detail="Stock not found")
    return price_data

@router.post("/refresh-prices")
def refresh_stock_prices(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    stock_service.update_stock_holdings_prices(db, current_user.id)
    return {"message": "Stock prices updated successfully"}