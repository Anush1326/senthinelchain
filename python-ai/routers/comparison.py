from fastapi import APIRouter, UploadFile, File, HTTPException
import logging
from services.forensics.comparison_engine import run_forensic_comparison

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/compare-evidence")
async def compare_evidence_images(
    original_file: UploadFile = File(...),
    modified_file: UploadFile = File(...)
):
    """
    Compare original evidence image against suspected modified image using multi-vector AI forensics.
    """
    try:
        orig_bytes = await original_file.read()
        mod_bytes = await modified_file.read()

        if not orig_bytes or not mod_bytes:
            raise HTTPException(status_code=400, detail="Both original_file and modified_file are required")

        results = run_forensic_comparison(orig_bytes, mod_bytes)
        return results
    except Exception as e:
        logger.error(f"Error comparing evidence images: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Forensic comparison failed: {str(e)}")
