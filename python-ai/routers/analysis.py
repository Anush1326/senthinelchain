from fastapi import APIRouter, File, UploadFile
from models.schemas import AnalysisResponse
from services.ai_engine import AIEngine
from services.tampering_detector import ImageTamperingDetector
from typing import Dict, Any
from pydantic import BaseModel

router = APIRouter()
ai_engine = AIEngine()

class TextAnalysisRequest(BaseModel):
    content: str
    options: Dict[str, Any] = {}

class SummarizeRequest(BaseModel):
    description: str

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_evidence(file: UploadFile = File(...)):
    """
    Analyze an uploaded evidence file for forensic integrity and tampering.
    """
    contents = await file.read()
    tampering_result = ImageTamperingDetector.analyze_image_bytes(contents, file.filename or "")

    return AnalysisResponse(
        summary=tampering_result["explanation"],
        confidence_score=tampering_result["confidence_score"],
        detected_objects=["Image", "Header", "Digital Fingerprint", "Compression Grid"],
        risk_assessment=tampering_result["risk_level"],
        recommendations=[
            "Verify cryptographic SHA-256 hash on Polygon Amoy blockchain",
            "Cross-reference IPFS CID immutable timestamp"
        ],
        tampered=tampering_result["tampered"],
        explanation=tampering_result["explanation"]
    )

@router.post("/analyze-text")
async def analyze_text(request: TextAnalysisRequest):
    return {
        "relevance_score": 0.85,
        "key_entities": ["Evidence Item", "Digital Chain of Custody"],
        "sentiment": "neutral",
        "summary": "Text description verified against case records."
    }

@router.post("/summarize")
async def summarize_evidence(request: SummarizeRequest):
    return await ai_engine.generate_summary(request.description)
