from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
from ..db.database import get_db
from ..models import Property
from ..core.auth import get_current_user

router = APIRouter(prefix="/properties", tags=["properties"])

class PropertyCreate(BaseModel):
    property_type: str
    address: str
    purchase_price: float
    current_value: float = None
    purchase_date: datetime
    mortgage_balance: float = 0
    monthly_payment: float = 0
    rental_income: float = 0
    property_taxes: float = 0
    insurance_cost: float = 0
    notes: str = ""

class PropertyUpdate(BaseModel):
    property_type: str = None
    address: str = None
    purchase_price: float = None
    current_value: float = None
    purchase_date: datetime = None
    mortgage_balance: float = None
    monthly_payment: float = None
    rental_income: float = None
    property_taxes: float = None
    insurance_cost: float = None
    notes: str = None

class PropertyResponse(BaseModel):
    id: str
    property_type: str
    address: str
    purchase_price: float
    current_value: float
    purchase_date: datetime
    mortgage_balance: float
    monthly_payment: float
    rental_income: float
    property_taxes: float
    insurance_cost: float
    notes: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

@router.post("/", response_model=PropertyResponse)
def create_property(
    property_data: PropertyCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_property = Property(
        owner_id=current_user.id,
        **property_data.dict()
    )
    if not db_property.current_value:
        db_property.current_value = db_property.purchase_price
    
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property

@router.get("/", response_model=List[PropertyResponse])
def get_properties(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    properties = db.query(Property).filter(Property.owner_id == current_user.id).all()
    return properties

@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(
    property_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    property_obj = db.query(Property).filter(
        Property.id == property_id,
        Property.owner_id == current_user.id
    ).first()
    
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    return property_obj

@router.put("/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: str,
    property_data: PropertyUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    property_obj = db.query(Property).filter(
        Property.id == property_id,
        Property.owner_id == current_user.id
    ).first()
    
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    for field, value in property_data.dict(exclude_unset=True).items():
        setattr(property_obj, field, value)
    
    db.commit()
    db.refresh(property_obj)
    return property_obj

@router.delete("/{property_id}")
def delete_property(
    property_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    property_obj = db.query(Property).filter(
        Property.id == property_id,
        Property.owner_id == current_user.id
    ).first()
    
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    db.delete(property_obj)
    db.commit()
    return {"message": "Property deleted successfully"}