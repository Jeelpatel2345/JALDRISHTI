from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..models.models import Watershed, Intervention, OutcomeAssessment
from ..schemas.schemas import WatershedResponse, WatershedCreate
from ..services.ai_insight_service import generate_ai_watershed_narrative
from .deps import get_current_user, require_role

router = APIRouter(prefix="/watersheds", tags=["Watershed Explorer"])

@router.get("", response_model=List[WatershedResponse])
def list_watersheds(
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Watershed)
    if district:
        query = query.filter(Watershed.district.ilike(f"%{district}%"))
    watersheds = query.all()

    results = []
    for ws in watersheds:
        int_count = db.query(Intervention).filter(Intervention.watershed_id == ws.id).count()
        # Count verified
        verified_count = (
            db.query(Intervention)
            .join(OutcomeAssessment)
            .filter(
                Intervention.watershed_id == ws.id,
                OutcomeAssessment.decision_status == "POSITIVE_SIGNAL"
            ).count()
        )
        ws_dict = {
            "id": ws.id,
            "code": ws.code,
            "name": ws.name,
            "district": ws.district,
            "state": ws.state,
            "area_ha": ws.area_ha,
            "baseline_date": ws.baseline_date,
            "health_index": ws.health_index,
            "geom_geojson": ws.geom_geojson,
            "land_use_summary": ws.land_use_summary,
            "intervention_count": int_count,
            "verified_count": verified_count,
            "created_at": ws.created_at
        }
        results.append(ws_dict)

    return results

@router.get("/{id}", response_model=WatershedResponse)
def get_watershed(id: str, db: Session = Depends(get_db)):
    ws = db.query(Watershed).filter(Watershed.id == id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Watershed not found")

    int_count = db.query(Intervention).filter(Intervention.watershed_id == ws.id).count()
    verified_count = (
        db.query(Intervention)
        .join(OutcomeAssessment)
        .filter(
            Intervention.watershed_id == ws.id,
            OutcomeAssessment.decision_status == "POSITIVE_SIGNAL"
        ).count()
    )

    return {
        "id": ws.id,
        "code": ws.code,
        "name": ws.name,
        "district": ws.district,
        "state": ws.state,
        "area_ha": ws.area_ha,
        "baseline_date": ws.baseline_date,
        "health_index": ws.health_index,
        "geom_geojson": ws.geom_geojson,
        "land_use_summary": ws.land_use_summary,
        "intervention_count": int_count,
        "verified_count": verified_count,
        "created_at": ws.created_at
    }

@router.get("/{id}/ai-brief")
def get_watershed_ai_brief(id: str, db: Session = Depends(get_db)):
    ws = db.query(Watershed).filter(Watershed.id == id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Watershed not found")

    interventions = db.query(Intervention).filter(Intervention.watershed_id == ws.id).all()
    total = len(interventions)
    positives = 0
    negatives = 0
    verified = 0

    for iv in interventions:
        if iv.outcome_assessment:
            if iv.outcome_assessment.decision_status == "POSITIVE_SIGNAL":
                positives += 1
                verified += 1
            elif iv.outcome_assessment.decision_status == "NEGATIVE_SIGNAL":
                negatives += 1

    ai_data = generate_ai_watershed_narrative(
        watershed_name=ws.name,
        district=ws.district,
        total_interventions=total,
        verified_interventions=verified,
        avg_health_index=ws.health_index,
        positive_signals_count=positives,
        negative_signals_count=negatives
    )
    return ai_data
