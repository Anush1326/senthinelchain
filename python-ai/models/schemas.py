from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str

class AnalysisRequest(BaseModel):
    file_id: str
    options: Optional[Dict[str, Any]] = None

class AnalysisResponse(BaseModel):
    summary: str
    confidence_score: float
    detected_objects: List[str]
    risk_assessment: str
    recommendations: List[str]

class ClassificationRequest(BaseModel):
    content: str
    
class ClassificationResponse(BaseModel):
    type: str
    category: str
    confidence: float

class IntegrityRequest(BaseModel):
    file_id: str

class IntegrityResponse(BaseModel):
    is_intact: bool
    hash_match: bool
    details: Dict[str, Any]

class TamperingDetectionResponse(BaseModel):
    tampered: bool
    signs: List[str]
    risk_level: str

class MetadataResponse(BaseModel):
    file_type: str
    size: int
    creation_date: str
    exif_data: Optional[Dict[str, Any]] = None
