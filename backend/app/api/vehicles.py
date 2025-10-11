from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
from ..db.database import get_db
from ..models import Vehicle
from ..core.auth import get_current_user

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

class VehicleCreate(BaseModel):
    make: str
    model: str
    year: int
    vin: str
    purchase_price: float
    current_value: float = None
    purchase_date: datetime
    mileage: int
    loan_balance: float = 0
    monthly_payment: float = 0
    insurance_cost: float = 0
    registration_cost: float = 0
    notes: str = ""

class VehicleUpdate(BaseModel):
    make: str = None
    model: str = None
    year: int = None
    vin: str = None
    purchase_price: float = None
    current_value: float = None
    purchase_date: datetime = None
    mileage: int = None
    loan_balance: float = None
    monthly_payment: float = None
    insurance_cost: float = None
    registration_cost: float = None
    notes: str = None

class VehicleResponse(BaseModel):
    id: str
    make: str
    model: str
    year: int
    vin: str
    purchase_price: float
    current_value: float
    purchase_date: datetime
    mileage: int
    loan_balance: float
    monthly_payment: float
    insurance_cost: float
    registration_cost: float
    notes: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

@router.post("/", response_model=VehicleResponse)
def create_vehicle(
    vehicle_data: VehicleCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Check if VIN already exists
    existing_vehicle = db.query(Vehicle).filter(Vehicle.vin == vehicle_data.vin).first()
    if existing_vehicle:
        raise HTTPException(status_code=400, detail="Vehicle with this VIN already exists")
    
    db_vehicle = Vehicle(
        owner_id=current_user.id,
        **vehicle_data.dict()
    )
    if not db_vehicle.current_value:
        db_vehicle.current_value = db_vehicle.purchase_price
    
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

@router.get("/", response_model=List[VehicleResponse])
def get_vehicles(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    vehicles = db.query(Vehicle).filter(Vehicle.owner_id == current_user.id).all()
    return vehicles

@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.owner_id == current_user.id
    ).first()
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: str,
    vehicle_data: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.owner_id == current_user.id
    ).first()
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    for field, value in vehicle_data.dict(exclude_unset=True).items():
        setattr(vehicle, field, value)
    
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.owner_id == current_user.id
    ).first()
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db.delete(vehicle)
    db.commit()
    return {"message": "Vehicle deleted successfully"}