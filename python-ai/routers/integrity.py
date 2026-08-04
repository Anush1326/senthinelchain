from fastapi import APIRouter, File, UploadFile
from models.schemas import IntegrityResponse, TamperingDetectionResponse, MetadataResponse
from services.ai_engine import AIEngine
from services.tampering_detector import ImageTamperingDetector

router = APIRouter()
ai_engine = AIEngine()

@router.post("/integrity-check", response_model=IntegrityResponse)
async def check_integrity(file: UploadFile = File(...), original_hash: str = ""):
    contents = await file.read()
    res = ImageTamperingDetector.analyze_image_bytes(contents, file.filename or "")
    return IntegrityResponse(
        is_intact=not res["tampered"],
        hash_match=not res["tampered"],
        details=res["ela_metrics"]
    )

@router.post("/detect-tampering", response_model=TamperingDetectionResponse)
@router.post("/tampering-detection", response_model=TamperingDetectionResponse)
async def detect_tampering(file: UploadFile = File(...)):
    """
    Accepts uploaded image file, performs Error Level Analysis (ELA), and returns:
      - Confidence Score
      - Risk Level
      - Explanation
      - ELA Metrics
    """
    contents = await file.read()
    res = ImageTamperingDetector.analyze_image_bytes(contents, file.filename or "")
    return TamperingDetectionResponse(
        tampered=res["tampered"],
        confidence_score=res["confidence_score"],
        risk_level=res["risk_level"],
        explanation=res["explanation"],
        signs=["Non-uniform ELA compression variance"] if res["tampered"] else [],
        ela_metrics=res["ela_metrics"]
    )

@router.post("/metadata-extract", response_model=MetadataResponse)
async def extract_metadata(file: UploadFile = File(...)):
    return await ai_engine.extract_metadata(file.filename or "")
