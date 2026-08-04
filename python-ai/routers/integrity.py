from fastapi import APIRouter, File, UploadFile
from models.schemas import IntegrityResponse, TamperingDetectionResponse, MetadataResponse
from services.ai_engine import AIEngine
from services.forensics.forensic_engine import MasterForensicEngine
from services.forensics.metadata_extractor import MetadataExtractor
from PIL import Image
import io

router = APIRouter()
ai_engine = AIEngine()

@router.post("/integrity-check", response_model=IntegrityResponse)
async def check_integrity(file: UploadFile = File(...), original_hash: str = ""):
    contents = await file.read()
    res = MasterForensicEngine.run_full_forensic_analysis(contents, file.filename or "")
    return IntegrityResponse(
        is_intact=not res["tampered"],
        hash_match=not res["tampered"],
        details=res["vector_scores"]
    )

@router.post("/detect-tampering", response_model=TamperingDetectionResponse)
@router.post("/tampering-detection", response_model=TamperingDetectionResponse)
async def detect_tampering(file: UploadFile = File(...)):
    """
    Accepts uploaded image file, performs multi-vector forensic evaluation (ELA, Noise, Copy-Move, Deepfake, EXIF),
    and returns confidence score, risk level, suspicious regions, and vector scores.
    """
    contents = await file.read()
    res = MasterForensicEngine.run_full_forensic_analysis(contents, file.filename or "")
    return TamperingDetectionResponse(
        tampered=res["tampered"],
        confidence_score=res["confidence_score"],
        risk_level=res["risk_level"],
        explanation=res["summary"],
        signs=res["forensic_report"].get("key_findings", []),
        ela_metrics=res["vector_scores"],
        suspicious_regions=res["suspicious_regions"],
        annotated_image_base64=res["annotated_image_base64"],
        ela_heatmap_base64=res["ela_heatmap_base64"],
        vector_scores=res["vector_scores"]
    )

@router.post("/metadata-extract", response_model=MetadataResponse)
async def extract_metadata(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents))
        res = MetadataExtractor.analyze(image, file.filename or "", contents)
        return MetadataResponse(
            file_type=file.content_type or "image/jpeg",
            size=len(contents),
            creation_date=res["exif_metadata"].get("DateTimeOriginal", "Unknown"),
            exif_data=res["exif_metadata"],
            is_metadata_modified=res["is_metadata_modified"],
            consistency_score=res["consistency_score"],
            suspicious_tags=res["suspicious_tags"]
        )
    except Exception:
        return MetadataResponse(
            file_type=file.content_type or "application/octet-stream",
            size=len(contents),
            creation_date="Unknown",
            exif_data={},
            is_metadata_modified=False,
            consistency_score=100.0,
            suspicious_tags=[]
        )
