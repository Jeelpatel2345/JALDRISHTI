from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from ..core.database import get_db
from ..models.models import Intervention, Watershed, FieldEvidence, OutcomeAssessment, FieldVisit

router = APIRouter(prefix="/reports", tags=["Statutory Dossiers & Reports"])

@router.get("/intervention/{id}")
def generate_intervention_dossier(id: str, db: Session = Depends(get_db)):
    iv = db.query(Intervention).filter(Intervention.id == id).first()
    if not iv:
        raise HTTPException(status_code=404, detail="Intervention not found")

    ws = iv.watershed
    oa = iv.outcome_assessment
    evidence_list = db.query(FieldEvidence).filter(FieldEvidence.intervention_id == iv.id).all()
    visits = db.query(FieldVisit).filter(FieldVisit.intervention_id == iv.id).all()

    return {
        "report_id": f"REP-WDC-{iv.work_id}-{datetime.now().strftime('%Y%m%d')}",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "title": "WDC-PMKSY 2.0 Physical Asset & Outcome Verification Dossier",
        "authority": "Department of Land Resources (DoLR), Ministry of Rural Development",
        "watershed": {
            "name": ws.name if ws else "N/A",
            "code": ws.code if ws else "N/A",
            "district": ws.district if ws else "N/A",
            "state": ws.state if ws else "N/A",
            "health_index": ws.health_index if ws else 70.0
        },
        "intervention": {
            "work_id": iv.work_id,
            "structure_type": iv.structure_type,
            "status": iv.status,
            "coordinates": {"latitude": iv.latitude, "longitude": iv.longitude},
            "elevation_m": iv.elevation_m,
            "slope_pct": iv.slope_pct,
            "stream_order": iv.stream_order,
            "sanctioned_cost_inr": iv.sanctioned_cost_inr,
            "planned_date": iv.planned_date.isoformat(),
            "completion_date": iv.completion_date.isoformat() if iv.completion_date else None
        },
        "outcome_metrics": {
            "baseline_ndvi": oa.baseline_ndvi if oa else 0.0,
            "current_ndvi": oa.current_ndvi if oa else 0.0,
            "ndvi_delta": oa.ndvi_delta if oa else 0.0,
            "baseline_mndwi": oa.baseline_mndwi if oa else 0.0,
            "current_mndwi": oa.current_mndwi if oa else 0.0,
            "mndwi_delta": oa.mndwi_delta if oa else 0.0,
            "evidence_readiness_score": oa.evidence_readiness_score if oa else 50.0,
            "decision_status": oa.decision_status if oa else "INCONCLUSIVE",
            "ai_narrative": oa.ai_summary_narrative if oa else "N/A"
        },
        "field_evidence": [
            {
                "image_url": ev.image_url,
                "capture_time": ev.capture_time.isoformat(),
                "distance_to_asset_m": ev.distance_to_asset_m,
                "sha256": ev.image_sha256,
                "is_verified": ev.is_verified,
                "reviewer_id": ev.reviewer_id
            } for ev in evidence_list
        ],
        "field_inspections": [
            {
                "inspector": fv.inspector_name,
                "date": fv.visit_date.isoformat(),
                "condition": fv.structure_condition,
                "siltation": fv.siltation_level,
                "notes": fv.inspection_notes
            } for fv in visits
        ],
        "statutory_certification": {
            "certified_by": "District Watershed Development Unit (DWDU)",
            "sign_off_status": "AUTHENTICATED" if (oa and oa.evidence_readiness_score >= 70) else "CONDITIONAL_APPROVAL"
        }
    }
