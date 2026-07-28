from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

from config import settings
from routers import analysis, classification, integrity
from models.schemas import HealthResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SentinelChain AI Service",
    description="AI Powered Blockchain Evidence Chain Service",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analysis.router, prefix="/api/ai", tags=["analysis"])
app.include_router(classification.router, prefix="/api/ai", tags=["classification"])
app.include_router(integrity.router, prefix="/api/ai", tags=["integrity"])

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting SentinelChain AI Service on port {settings.SERVICE_PORT}")

@app.get("/", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        service="SentinelChain AI Service",
        version="1.0.0"
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.SERVICE_PORT, reload=settings.DEBUG)
