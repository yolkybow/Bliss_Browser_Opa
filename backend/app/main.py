from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .db.database import engine
from .models import Base
from .api import auth, properties, vehicles, banking, stocks, crypto, portfolio

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="A comprehensive portfolio tracker with real-time data"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(vehicles.router)
app.include_router(banking.router)
app.include_router(stocks.router)
app.include_router(crypto.router)
app.include_router(portfolio.router)

@app.get("/")
def root():
    return {
        "message": "Portfolio Tracker API",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}