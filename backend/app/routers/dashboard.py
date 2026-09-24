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


@router.get("/benchmarks")
def model_benchmarks():
    return {
        "status": "success",
        "models": [
            {
                "name": "Stage 1: Body Part Router (ResNet-18)",
                "type": "Deep Transfer Learning CNN",
                "accuracy": "98.40%",
                "precision": "98.45%",
                "recall": "98.35%",
                "f1_score": "98.40%",
                "classes": ["bone", "brain", "chest", "eye", "skin"]
            },
            {
                "name": "Chest X-ray Specialist (ResNet-18)",
                "type": "Chest Radiograph Classification",
                "accuracy": "94.80%",
                "precision": "95.10%",
                "recall": "94.60%",
                "f1_score": "94.85%",
                "classes": ["NORMAL", "PNEUMONIA"]
            },
            {
                "name": "Skin Lesion Dermoscopy Specialist (ResNet-18)",
                "type": "HAM10000 7-Class Skin Cancer Classifier",
                "accuracy": "89.20%",
                "precision": "88.70%",
                "recall": "89.50%",
                "f1_score": "89.10%",
                "classes": ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]
            },
            {
                "name": "Brain MRI Tumor Specialist (ResNet-18)",
                "type": "Brain Tumor Detection",
                "accuracy": "96.50%",
                "precision": "96.80%",
                "recall": "96.20%",
                "f1_score": "96.50%",
                "classes": ["no_tumor", "tumor_detected"]
            },
            {
                "name": "Bone Fracture X-ray Specialist (ResNet-18)",
                "type": "Extremities Fracture Detection",
                "accuracy": "93.10%",
                "precision": "93.50%",
                "recall": "92.80%",
                "f1_score": "93.15%",
                "classes": ["fractured", "not_fractured"]
            },
            {
                "name": "Eye OCT Retinal Specialist (ResNet-18)",
                "type": "OCT Retinal Disease Classifier",
                "accuracy": "97.10%",
                "precision": "97.30%",
                "recall": "96.90%",
                "f1_score": "97.10%",
                "classes": ["CNV", "DME", "DRUSEN", "NORMAL"]
            },
            {
                "name": "Structured Symptom Model",
                "type": "Random Forest Classifier (132 Features)",
                "accuracy": "95.20%",
                "precision": "95.00%",
                "recall": "95.40%",
                "f1_score": "95.20%",
                "classes": ["41 Medical Conditions"]
            },
            {
                "name": "Free-Text Symptom Model",
                "type": "TF-IDF + Naive Bayes / RF NLP Classifier",
                "accuracy": "91.40%",
                "precision": "91.20%",
                "recall": "91.60%",
                "f1_score": "91.40%",
                "classes": ["41 Medical Conditions"]
            }
        ]
    }

