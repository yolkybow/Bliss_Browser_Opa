from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Any
from ..db.database import get_db
from ..core.auth import get_current_user
from ..services.portfolio import portfolio_service

router = APIRouter(prefix="/portfolio", tags=["portfolio"])

class PortfolioSummaryResponse(BaseModel):
    net_worth: float
    total_assets: float
    total_liabilities: float
    breakdown: Dict[str, float]
    last_updated: datetime

class PortfolioPerformanceResponse(BaseModel):
    cost_basis: float
    current_value: float
    gain_loss: float
    gain_loss_percent: float
    stock_performance: Dict[str, float]
    crypto_performance: Dict[str, float]

@router.get("/summary", response_model=PortfolioSummaryResponse)
def get_portfolio_summary(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    summary = portfolio_service.calculate_portfolio_value(db, current_user.id)
    return summary

@router.get("/performance", response_model=PortfolioPerformanceResponse)
def get_portfolio_performance(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    performance = portfolio_service.get_portfolio_performance(db, current_user.id, days)
    return performance

@router.post("/refresh")
def refresh_portfolio_data(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Refresh all live data (stock prices, crypto prices, bank balances)"""
    updated_portfolio = portfolio_service.update_all_prices(db, current_user.id)
    
    if updated_portfolio:
        return {
            "message": "Portfolio data refreshed successfully",
            "summary": updated_portfolio
        }
    else:
        return {"message": "Portfolio refresh completed with some errors"}