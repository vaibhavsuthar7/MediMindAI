from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/ask", response_model=schemas.ChatResponse)
def ask(
    payload: schemas.ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    result = orchestrator.rag.run(current_user.id, payload.message)

    db.add(models.ChatMessage(user_id=current_user.id, role="user", content=payload.message))
    db.add(models.ChatMessage(user_id=current_user.id, role="assistant", content=result["reply"]))
    db.commit()

    return schemas.ChatResponse(reply=result["reply"], sources_used=result["sources_used"])


@router.get("/history")
def chat_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    records = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.user_id == current_user.id)
        .order_by(models.ChatMessage.created_at.asc())
        .all()
    )
    return [{"role": r.role, "content": r.content, "created_at": r.created_at} for r in records]
