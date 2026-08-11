import json
import os
import uuid

from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app import models, schemas, auth
from app.agents.orchestrator import orchestrator
from app.utils.pdf_utils import extract_text_from_pdf

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.post("/simplify", response_model=schemas.ReportSummaryResponse)
async def simplify_report(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext != ".pdf":
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF files are supported for report simplification."
        )

    saved_path = os.path.join(settings.upload_dir, f"{uuid.uuid4().hex}.pdf")
    with open(saved_path, "wb") as f:
        f.write(await file.read())

    report_text = extract_text_from_pdf(saved_path)
    result = orchestrator.report.run(report_text)

    record = models.ReportSummary(
        user_id=current_user.id,
        filename=file.filename,
        original_text_excerpt=report_text[:500],
        simplified_summary=result["simplified_summary"],
        key_terms=json.dumps(result["key_terms"]),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    orchestrator.index_for_rag(
        user_id=current_user.id,
        record_type="report_summary",
        record_id=str(record.id),
        text=f"Report '{file.filename}' simplified: {result['simplified_summary']}",
    )

    return schemas.ReportSummaryResponse(
        simplified_summary=result["simplified_summary"],
        key_terms=result["key_terms"],
        disclaimer=result["disclaimer"],
    )


@router.get("/history")
def report_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    records = (
        db.query(models.ReportSummary)
        .filter(models.ReportSummary.user_id == current_user.id)
        .order_by(models.ReportSummary.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "simplified_summary": r.simplified_summary,
            "key_terms": json.loads(r.key_terms or "{}"),
            "created_at": r.created_at,
        }
        for r in records
    ]
