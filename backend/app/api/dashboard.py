from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..core.database import get_db
from ..models.models import Watershed, Intervention, FieldEvidence, OutcomeAssessment, VerificationTask, Alert

router = APIRouter(prefix="/dashboard", tags=["Command Center & Dashboard"])

@router.get("/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    total_ws = db.query(Watershed).count()
    total_iv = db.query(Intervention).count()
    total_ev = db.query(FieldEvidence).count()
    verified_iv = (
        db.query(Intervention)
        .join(OutcomeAssessment)
        .filter(OutcomeAssessment.decision_status == "POSITIVE_SIGNAL")
        .count()
    )
    pending_verif = db.query(VerificationTask).filter(VerificationTask.status == "PENDING").count()
    active_alerts = db.query(Alert).filter(Alert.is_resolved == False).count()
    avg_health = db.query(func.avg(Watershed.health_index)).scalar() or 70.0

    coverage_pct = round((verified_iv / max(1, total_iv)) * 100, 1)

    # 12-month composite greening & moisture trajectory
    monthly_trend = [
        {"month": "Oct 22", "ndvi": 0.24, "mndwi": -0.10, "rainfall_mm": 42},
        {"month": "Dec 22", "ndvi": 0.22, "mndwi": -0.14, "rainfall_mm": 5},
        {"month": "Feb 23", "ndvi": 0.19, "mndwi": -0.18, "rainfall_mm": 0},
        {"month": "Apr 23", "ndvi": 0.16, "mndwi": -0.22, "rainfall_mm": 2},
        {"month": "Jun 23", "ndvi": 0.21, "mndwi": -0.05, "rainfall_mm": 95},
        {"month": "Aug 23", "ndvi": 0.35, "mndwi": 0.08, "rainfall_mm": 180},
        {"month": "Oct 23", "ndvi": 0.38, "mndwi": 0.06, "rainfall_mm": 38},
        {"month": "Dec 23", "ndvi": 0.32, "mndwi": -0.02, "rainfall_mm": 0},
        {"month": "Feb 24", "ndvi": 0.27, "mndwi": -0.08, "rainfall_mm": 0},
        {"month": "Apr 24", "ndvi": 0.22, "mndwi": -0.15, "rainfall_mm": 4},
        {"month": "Jun 24", "ndvi": 0.28, "mndwi": 0.02, "rainfall_mm": 110},
        {"month": "Aug 24", "ndvi": 0.41, "mndwi": 0.12, "rainfall_mm": 195}
    ]

    # Priority queue items (interventions needing attention)
    tasks = (
        db.query(VerificationTask)
        .filter(VerificationTask.status == "PENDING")
        .order_by(VerificationTask.created_at.desc())
        .limit(5)
        .all()
    )
    priority_queue = []
    for t in tasks:
        priority_queue.append({
            "task_id": t.id,
            "intervention_id": t.intervention_id,
            "work_id": t.intervention.work_id if t.intervention else "N/A",
            "structure_type": t.intervention.structure_type if t.intervention else "Structure",
            "priority": t.priority,
            "reason": t.failure_reason,
            "created_at": t.created_at.isoformat()
        })

    # Recent field evidence
    recent_ev = db.query(FieldEvidence).order_by(FieldEvidence.created_at.desc()).limit(5).all()

    return {
        "total_watersheds": total_ws,
        "total_interventions": total_iv,
        "total_evidence_photos": total_ev,
        "verified_interventions": verified_iv,
        "pending_verifications": pending_verif,
        "evidence_coverage_pct": coverage_pct,
        "active_alerts": active_alerts,
        "average_health_index": round(avg_health, 1),
        "monthly_trend": monthly_trend,
        "priority_queue": priority_queue,
        "recent_evidence": recent_ev
    }
