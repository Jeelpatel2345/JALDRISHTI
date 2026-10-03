from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..models.models import Intervention, Watershed, OutcomeAssessment, FieldEvidence
from ..schemas.schemas import InterventionResponse, InterventionDetailResponse, InterventionCreate
from .deps import get_current_user, require_role

router = APIRouter(prefix="/interventions", tags=["Interventions & Assets"])

@router.get("", response_model=List[InterventionResponse])
def list_interventions(
    watershed_id: Optional[str] = Query(None),
    structure_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Intervention)
    if watershed_id:
        query = query.filter(Intervention.watershed_id == watershed_id)
    if structure_type:
        query = query.filter(Intervention.structure_type.ilike(f"%{structure_type}%"))
    if status:
        query = query.filter(Intervention.status == status)

    interventions = query.all()
    results = []
    for iv in interventions:
        ev_count = db.query(FieldEvidence).filter(FieldEvidence.intervention_id == iv.id).count()
        oa = iv.outcome_assessment
        results.append({
            "id": iv.id,
            "work_id": iv.work_id,
            "watershed_id": iv.watershed_id,
            "project_id": iv.project_id,
            "structure_type": iv.structure_type,
            "latitude": iv.latitude,
            "longitude": iv.longitude,
            "elevation_m": iv.elevation_m,
            "slope_pct": iv.slope_pct,
            "stream_order": iv.stream_order,
            "sanctioned_cost_inr": iv.sanctioned_cost_inr,
            "planned_date": iv.planned_date,
            "completion_date": iv.completion_date,
            "status": iv.status,
            "watershed_name": iv.watershed.name if iv.watershed else None,
            "evidence_count": ev_count,
            "decision_status": oa.decision_status if oa else "INCONCLUSIVE",
            "evidence_readiness_score": oa.evidence_readiness_score if oa else 50.0,
            "created_at": iv.created_at,
            "updated_at": iv.updated_at
        })
    return results

@router.get("/{id}", response_model=InterventionDetailResponse)
def get_intervention_detail(id: str, db: Session = Depends(get_db)):
    iv = db.query(Intervention).filter(Intervention.id == id).first()
    if not iv:
        raise HTTPException(status_code=404, detail="Intervention not found")

    ev_count = len(iv.field_evidence)
    oa = iv.outcome_assessment

    return {
        "id": iv.id,
        "work_id": iv.work_id,
        "watershed_id": iv.watershed_id,
        "project_id": iv.project_id,
        "structure_type": iv.structure_type,
        "latitude": iv.latitude,
        "longitude": iv.longitude,
        "elevation_m": iv.elevation_m,
        "slope_pct": iv.slope_pct,
        "stream_order": iv.stream_order,
        "sanctioned_cost_inr": iv.sanctioned_cost_inr,
        "planned_date": iv.planned_date,
        "completion_date": iv.completion_date,
        "status": iv.status,
        "watershed_name": iv.watershed.name if iv.watershed else None,
        "evidence_count": ev_count,
        "decision_status": oa.decision_status if oa else "INCONCLUSIVE",
        "evidence_readiness_score": oa.evidence_readiness_score if oa else 50.0,
        "created_at": iv.created_at,
        "updated_at": iv.updated_at,
        "field_evidence": iv.field_evidence,
        "field_visits": iv.field_visits,
        "satellite_observations": sorted(iv.satellite_observations, key=lambda x: x.observation_date),
        "outcome_assessment": oa,
        "verification_tasks": iv.verification_tasks
    }

@router.post("", response_model=InterventionResponse)
def create_intervention(
    data: InterventionCreate,
    db: Session = Depends(get_db)
):
    ws = db.query(Watershed).filter(Watershed.id == data.watershed_id).first()
    if not ws:
        raise HTTPException(status_code=400, detail="Referenced watershed does not exist")

    existing = db.query(Intervention).filter(Intervention.work_id == data.work_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Work ID '{data.work_id}' already registered")

    new_iv = Intervention(
        work_id=data.work_id,
        watershed_id=data.watershed_id,
        project_id=data.project_id,
        structure_type=data.structure_type,
        latitude=data.latitude,
        longitude=data.longitude,
        elevation_m=data.elevation_m,
        slope_pct=data.slope_pct,
        stream_order=data.stream_order,
        sanctioned_cost_inr=data.sanctioned_cost_inr,
        planned_date=data.planned_date,
        completion_date=data.completion_date,
        status=data.status
    )
    db.add(new_iv)
    db.commit()
    db.refresh(new_iv)

    return {
        "id": new_iv.id,
        "work_id": new_iv.work_id,
        "watershed_id": new_iv.watershed_id,
        "project_id": new_iv.project_id,
        "structure_type": new_iv.structure_type,
        "latitude": new_iv.latitude,
        "longitude": new_iv.longitude,
        "elevation_m": new_iv.elevation_m,
        "slope_pct": new_iv.slope_pct,
        "stream_order": new_iv.stream_order,
        "sanctioned_cost_inr": new_iv.sanctioned_cost_inr,
        "planned_date": new_iv.planned_date,
        "completion_date": new_iv.completion_date,
        "status": new_iv.status,
        "watershed_name": ws.name,
        "evidence_count": 0,
        "decision_status": "NEEDS_VERIFICATION",
        "evidence_readiness_score": 30.0,
        "created_at": new_iv.created_at,
        "updated_at": new_iv.updated_at
    }
