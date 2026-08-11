from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=schemas.DashboardStats)
def stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    uid = current_user.id

    imaging = db.query(models.ImagingResult).filter(models.ImagingResult.user_id == uid).all()
    symptoms = db.query(models.SymptomCheck).filter(models.SymptomCheck.user_id == uid).all()
    reports = db.query(models.ReportSummary).filter(models.ReportSummary.user_id == uid).all()
    meds = db.query(models.MedicationCheck).filter(models.MedicationCheck.user_id == uid).all()

    activity = []
    for r in imaging:
        activity.append({"type": "imaging", "label": f"X-ray: {r.top_finding}", "date": r.created_at})
    for r in symptoms:
        activity.append({"type": "symptom", "label": f"Symptom check ({r.urgency})", "date": r.created_at})
    for r in reports:
        activity.append({"type": "report", "label": f"Report simplified: {r.filename}", "date": r.created_at})
    for r in meds:
        activity.append({"type": "medication", "label": f"Med check: {r.new_medication}", "date": r.created_at})

    activity.sort(key=lambda x: x["date"], reverse=True)

    alerts = [
        {"type": "symptom", "label": f"Symptom check flagged '{r.urgency}'", "date": r.created_at}
        for r in symptoms if r.urgency == "emergency"
    ] + [
        {"type": "imaging", "label": f"Imaging: {r.top_finding} ({r.severity} severity)", "date": r.created_at}
        for r in imaging if r.severity in ("high", "moderate")
    ] + [
        {"type": "medication", "label": f"High-risk interaction: {r.new_medication}", "date": r.created_at}
        for r in meds if r.risk_level == "high"
    ]
    alerts.sort(key=lambda x: x["date"], reverse=True)

    return schemas.DashboardStats(
        total_imaging_scans=len(imaging),
        total_symptom_checks=len(symptoms),
        total_reports_simplified=len(reports),
        total_medication_checks=len(meds),
        recent_activity=activity[:10],
        urgency_alerts=alerts[:5],
    )
