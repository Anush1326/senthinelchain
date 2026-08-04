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
    tampered: Optional[bool] = False
    explanation: Optional[str] = ""
    risk_score: Optional[float] = 10.0
    forensic_report: Optional[Dict[str, Any]] = None
    suspicious_regions: Optional[List[Dict[str, Any]]] = []
    annotated_image_base64: Optional[str] = ""
    ela_heatmap_base64: Optional[str] = ""
    ocr_extracted_text: Optional[str] = ""
    extracted_entities: Optional[Dict[str, Any]] = {}
    vector_scores: Optional[Dict[str, Any]] = {}

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
    confidence_score: float
    risk_level: str
    explanation: str
    signs: Optional[List[str]] = []
    ela_metrics: Optional[Dict[str, Any]] = None
    suspicious_regions: Optional[List[Dict[str, Any]]] = []
    annotated_image_base64: Optional[str] = ""
    ela_heatmap_base64: Optional[str] = ""
    vector_scores: Optional[Dict[str, Any]] = {}

class MetadataResponse(BaseModel):
    file_type: str
    size: int
    creation_date: str
    exif_data: Optional[Dict[str, Any]] = None
    is_metadata_modified: Optional[bool] = False
    consistency_score: Optional[float] = 100.0
    suspicious_tags: Optional[List[str]] = []

class FullForensicResponse(BaseModel):
    tampered: bool
    risk_score: float
    risk_level: str
    confidence_score: float
    summary: str
    forensic_report: Dict[str, Any]
    suspicious_regions: List[Dict[str, Any]]
    annotated_image_base64: str
    ela_heatmap_base64: str
    ocr_extracted_text: str
    detected_objects: List[str]
    extracted_entities: Dict[str, Any]
    vector_scores: Dict[str, Any]
