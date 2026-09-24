import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/api/medications", tags=["medications"])


@router.post("/check", response_model=schemas.MedicationResponse)
def check_medication(
    payload: schemas.MedicationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    result = orchestrator.medication.run(payload.current_medications, payload.new_medication)

    record = models.MedicationCheck(
        user_id=current_user.id,
        current_medications=json.dumps(payload.current_medications),
        new_medication=payload.new_medication,
        interactions_found=json.dumps(result["interactions_found"]),
        risk_level=result["risk_level"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    try:
        orchestrator.index_for_rag(
            user_id=current_user.id,
            record_type="medication_check",
            record_id=str(record.id),
            text=(f"Medication check: considering '{payload.new_medication}' alongside "
                  f"{', '.join(payload.current_medications) or 'no other medications'}. "
                  f"Risk level: {result['risk_level']}. Advice: {result['advice']}"),
        )
    except Exception as rag_err:
        print(f"[RAG Index Warning] Could not index medication record for RAG: {rag_err}")

    return schemas.MedicationResponse(
        interactions_found=result["interactions_found"],
        risk_level=result["risk_level"],
        advice=result["advice"],
        disclaimer=result["disclaimer"],
    )


@router.get("/history")
def medication_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    records = (
        db.query(models.MedicationCheck)
        .filter(models.MedicationCheck.user_id == current_user.id)
        .order_by(models.MedicationCheck.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "current_medications": json.loads(r.current_medications or "[]"),
            "new_medication": r.new_medication,
            "risk_level": r.risk_level,
            "interactions_found": json.loads(r.interactions_found or "[]"),
            "created_at": r.created_at,
        }
        for r in records
    ]
