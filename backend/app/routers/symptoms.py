import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/api/symptoms", tags=["symptoms"])


@router.post("/check", response_model=schemas.SymptomResponse)
def check_symptoms(
    payload: schemas.SymptomRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    result = orchestrator.symptom.run(payload.symptoms_text, payload.previous_answers)

    record = None
    if payload.check_id:
        record = db.query(models.SymptomCheck).filter(
            models.SymptomCheck.id == payload.check_id,
            models.SymptomCheck.user_id == current_user.id
        ).first()

    if record:
        # Update existing check row rather than creating a duplicate
        record.symptoms_text = payload.symptoms_text
        record.follow_up_qa = json.dumps(payload.previous_answers or {})
        record.possible_conditions = json.dumps(result["possible_conditions"])
        record.urgency = result["urgency"]
        db.commit()
        db.refresh(record)
    else:
        record = models.SymptomCheck(
            user_id=current_user.id,
            symptoms_text=payload.symptoms_text,
            follow_up_qa=json.dumps(payload.previous_answers or {}),
            possible_conditions=json.dumps(result["possible_conditions"]),
            urgency=result["urgency"],
        )
        db.add(record)
        db.commit()
        db.refresh(record)

    conditions_str = ", ".join(c.get("condition", "") for c in result["possible_conditions"])
    orchestrator.index_for_rag(
        user_id=current_user.id,
        record_type="symptom_check",
        record_id=str(record.id),
        text=(f"Symptom check: '{payload.symptoms_text}'. Possible conditions considered: "
              f"{conditions_str}. Urgency assessed as {result['urgency']}."),
    )

    return schemas.SymptomResponse(
        check_id=record.id,
        follow_up_questions=result["follow_up_questions"],
        possible_conditions=result["possible_conditions"],
        urgency=result["urgency"],
        disclaimer=result["disclaimer"],
    )


@router.get("/history")
def symptom_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    records = (
        db.query(models.SymptomCheck)
        .filter(models.SymptomCheck.user_id == current_user.id)
        .order_by(models.SymptomCheck.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "symptoms_text": r.symptoms_text,
            "urgency": r.urgency,
            "possible_conditions": json.loads(r.possible_conditions or "[]"),
            "created_at": r.created_at,
        }
        for r in records
    ]
