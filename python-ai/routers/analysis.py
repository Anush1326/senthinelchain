from fastapi import APIRouter, File, UploadFile, Depends
from models.schemas import AnalysisResponse
from services.ai_engine import AIEngine
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
    Analyze an evidence file using AI.
    """
    # In a real implementation, we would save the file temporarily and pass it to the AI engine
    # Here we simulate the process
    return await ai_engine.analyze_evidence(file.filename)

@router.post("/analyze-text")
async def analyze_text(request: TextAnalysisRequest):
    """
    Analyze text content for evidence relevance.
    """
    # Mock text analysis
    return {
        "relevance_score": 0.85,
        "key_entities": ["John Doe", "Transaction A"],
        "sentiment": "neutral",
        "summary": "Text appears to describe a financial transaction."
    }

@router.post("/summarize")
async def summarize_evidence(request: SummarizeRequest):
    """
    Summarize evidence description.
    """
    return await ai_engine.generate_summary(request.description)
