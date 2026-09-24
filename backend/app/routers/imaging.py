import json
import os
import uuid

from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app import models, schemas, auth
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/api/imaging", tags=["imaging"])


MAX_IMAGE_FILE_SIZE = 25 * 1024 * 1024  # 25 MB

@router.post("/analyze", response_model=schemas.ImagingResponse)
async def analyze_xray(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    from fastapi import HTTPException, status
    ext = os.path.splitext(file.filename)[1].lower() or ".png"
    allowed_extensions = {".png", ".jpg", ".jpeg", ".webp", ".dcm"}
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Only PNG, JPG, JPEG, WEBP, and DICOM images are allowed."
        )

    contents = await file.read()
    if len(contents) > MAX_IMAGE_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds limit. Maximum allowed scan file size is 25 MB."
        )
    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    saved_name = f"{uuid.uuid4().hex}{ext}"
    saved_path = os.path.join(settings.upload_dir, saved_name)
    with open(saved_path, "wb") as f:
        f.write(contents)

    result = orchestrator.imaging.run(saved_path)

    record = models.ImagingResult(
        user_id=current_user.id,
        filename=file.filename,
        findings=json.dumps(result["findings"]),
        top_finding=result["top_finding"],
        confidence=result["confidence"],
        severity=result["severity"],
        summary=result["summary"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    orchestrator.index_for_rag(
        user_id=current_user.id,
        record_type="imaging_scan",
        record_id=str(record.id),
        text=(f"Chest X-ray scan '{file.filename}': top finding {result['top_finding']} "
              f"(confidence {result['confidence']:.0%}, severity {result['severity']}). "
              f"{result['summary']}"),
    )

    return schemas.ImagingResponse(
        top_finding=result.get("top_finding", "Medical Scan Finding"),
        top_finding_hi=result.get("top_finding_hi", result.get("top_finding", "")),
        body_part=result.get("body_part", "Medical Scan"),
        body_part_hi=result.get("body_part_hi", result.get("body_part", "")),
        confidence=result.get("confidence", 0.85),
        findings=result.get("findings", {}),
        severity=result.get("severity", "moderate"),
        key_observations=result.get("key_observations", []),
        key_observations_hi=result.get("key_observations_hi", []),
        recommendations=result.get("recommendations", []),
        recommendations_hi=result.get("recommendations_hi", []),
        summary=result.get("summary", ""),
        summary_hi=result.get("summary_hi", ""),
        disclaimer="This is an AI screening aid, not a formal diagnosis. A certified radiologist must review and confirm all clinical findings.",
    )


@router.get("/history")
def imaging_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    records = (
        db.query(models.ImagingResult)
        .filter(models.ImagingResult.user_id == current_user.id)
        .order_by(models.ImagingResult.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "top_finding": r.top_finding,
            "confidence": r.confidence,
            "severity": r.severity,
            "created_at": r.created_at,
        }
        for r in records
    ]
