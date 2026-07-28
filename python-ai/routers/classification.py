from fastapi import APIRouter, Body
from models.schemas import ClassificationRequest, ClassificationResponse
from services.ai_engine import AIEngine
from pydantic import BaseModel
from typing import List

router = APIRouter()
ai_engine = AIEngine()

class TagRequest(BaseModel):
    content: str
    
class PriorityRequest(BaseModel):
    evidence_data: dict

@router.post("/classify", response_model=ClassificationResponse)
async def classify_evidence(request: ClassificationRequest):
    """
    Classify evidence type and category.
    """
    return await ai_engine.classify_content(request.content)

@router.post("/tag", response_model=List[str])
async def generate_tags(request: TagRequest):
    """
    Auto-generate tags for evidence.
    """
    # Mock tagging
    return ["financial", "document", "transaction", "high-priority"]

@router.post("/priority")
async def assess_priority(request: PriorityRequest):
    """
    Assess evidence priority level.
    """
    # Mock priority assessment
    return {
        "priority_level": "high",
        "score": 0.9,
        "reason": "Contains sensitive financial information."
    }
