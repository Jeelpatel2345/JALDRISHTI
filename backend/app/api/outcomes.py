from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from ..core.database import get_db
from ..models.models import Intervention, OutcomeAssessment, FieldEvidence
from ..schemas.schemas import OutcomeAssessmentResponse
from ..services.outcome_service import compute_evidence_readiness_score, evaluate_directional_outcome
from ..services.ai_insight_service import generate_ai_intervention_narrative

router = APIRouter(prefix="/outcomes", tags=["Outcome Assessment Scorecard"])

@router.get("/scorecard/{intervention_id}")
def get_outcome_scorecard(intervention_id: str, db: Session = Depends(get_db)):
    iv = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not iv:
        raise HTTPException(status_code=404, detail="Intervention not found")

    oa = iv.outcome_assessment
    if not oa:
        raise HTTPException(status_code=404, detail="Outcome assessment record not found")

    latest_ev = db.query(FieldEvidence).filter(FieldEvidence.intervention_id == iv.id).order_by(FieldEvidence.created_at.desc()).first()
    dist = latest_ev.distance_to_asset_m if latest_ev else 0.0

    ai_narrative = generate_ai_intervention_narrative(
        work_id=iv.work_id,
        structure_type=iv.structure_type,
        watershed_name=iv.watershed.name if iv.watershed else "Watershed",
        ndvi_delta=oa.ndvi_delta,
        mndwi_delta=oa.mndwi_delta,
        ers_score=oa.evidence_readiness_score,
        decision_status=oa.decision_status,
        distance_meters=dist
    )

    return {
        "intervention": {
            "id": iv.id,
            "work_id": iv.work_id,
            "structure_type": iv.structure_type,
            "watershed_name": iv.watershed.name if iv.watershed else None,
            "district": iv.watershed.district if iv.watershed else None,
            "status": iv.status,
            "sanctioned_cost_inr": iv.sanctioned_cost_inr
        },
        "assessment": {
            "evidence_readiness_score": oa.evidence_readiness_score,
            "decision_status": oa.decision_status,
            "baseline_ndvi": oa.baseline_ndvi,
            "current_ndvi": oa.current_ndvi,
            "ndvi_delta": oa.ndvi_delta,
            "baseline_mndwi": oa.baseline_mndwi,
            "current_mndwi": oa.current_mndwi,
            "mndwi_delta": oa.mndwi_delta,
            "baseline_ndmi": oa.baseline_ndmi,
            "current_ndmi": oa.current_ndmi,
            "ndmi_delta": oa.ndmi_delta,
            "evaluated_at": oa.evaluated_at
        },
        "score_components": {
            "photo_quality_weight": "25%",
            "geo_validity_weight": "20%",
            "temporal_currency_weight": "20%",
            "work_record_match_weight": "15%",
            "satellite_coverage_weight": "20%"
        },
        "ai_narrative": ai_narrative
    }

@router.post("/recalculate/{intervention_id}")
def recalculate_outcome(intervention_id: str, db: Session = Depends(get_db)):
    iv = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not iv:
        raise HTTPException(status_code=404, detail="Intervention not found")

    oa = iv.outcome_assessment
    if not oa:
        raise HTTPException(status_code=404, detail="Outcome assessment record not found")

    latest_ev = db.query(FieldEvidence).filter(FieldEvidence.intervention_id == iv.id).order_by(FieldEvidence.created_at.desc()).first()
    dist = latest_ev.distance_to_asset_m if latest_ev else 0.0
    quality = latest_ev.quality_score if latest_ev else 0.5

    ers = compute_evidence_readiness_score(
        photo_quality=quality,
        distance_meters=dist,
        photo_age_days=15,
        work_record_matched=True,
        satellite_scenes_count=len(iv.satellite_observations)
    )

    decision_status, reasoning = evaluate_directional_outcome(
        ndvi_delta=oa.ndvi_delta,
        mndwi_delta=oa.mndwi_delta,
        readiness_score=ers,
        distance_meters=dist
    )

    oa.evidence_readiness_score = ers
    oa.decision_status = decision_status
    oa.evaluated_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "intervention_id": iv.id,
        "evidence_readiness_score": ers,
        "decision_status": decision_status,
        "reasoning": reasoning
    }
