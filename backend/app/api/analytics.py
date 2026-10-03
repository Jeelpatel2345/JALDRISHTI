from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from ..core.database import get_db
from ..models.models import Intervention, SatelliteObservation, OutcomeAssessment

router = APIRouter(prefix="/analytics", tags=["Earth Observation & Analytics"])

@router.get("/timeseries")
def get_satellite_timeseries(
    intervention_id: str = Query(...),
    db: Session = Depends(get_db)
):
    iv = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not iv:
        raise HTTPException(status_code=404, detail="Intervention not found")

    observations = (
        db.query(SatelliteObservation)
        .filter(SatelliteObservation.intervention_id == intervention_id)
        .order_by(SatelliteObservation.observation_date.asc())
        .all()
    )

    data = []
    for obs in observations:
        data.append({
            "date": obs.observation_date.strftime("%Y-%m"),
            "full_date": obs.observation_date.isoformat(),
            "sensor": obs.sensor,
            "scene_id": obs.scene_id,
            "cloud_cover_pct": obs.cloud_cover_pct,
            "ndvi": obs.ndvi_mean,
            "mndwi": obs.mndwi_mean,
            "ndmi": obs.ndmi_mean,
            "lst_celsius": obs.lst_celsius,
            "is_cloud_free": obs.is_cloud_free
        })

    return {
        "intervention_id": iv.id,
        "work_id": iv.work_id,
        "structure_type": iv.structure_type,
        "observations_count": len(data),
        "timeseries": data
    }

@router.get("/compare")
def get_before_after_comparison(
    intervention_id: str = Query(...),
    db: Session = Depends(get_db)
):
    iv = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not iv:
        raise HTTPException(status_code=404, detail="Intervention not found")

    oa = iv.outcome_assessment
    if not oa:
        raise HTTPException(status_code=400, detail="Outcome assessment not yet computed for this intervention")

    return {
        "intervention_id": iv.id,
        "work_id": iv.work_id,
        "structure_type": iv.structure_type,
        "before_window": {
            "period": f"{oa.before_window_start} to {oa.before_window_end}",
            "label": "Pre-Intervention Baseline (Oct 2021)",
            "ndvi": oa.baseline_ndvi,
            "mndwi": oa.baseline_mndwi,
            "ndmi": oa.baseline_ndmi,
            "water_persistence_months": 1.2,
            "image_url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
        },
        "after_window": {
            "period": f"{oa.after_window_start} to {oa.after_window_end}",
            "label": "Post-Intervention Outcome (Oct 2023)",
            "ndvi": oa.current_ndvi,
            "mndwi": oa.current_mndwi,
            "ndmi": oa.current_ndmi,
            "water_persistence_months": 4.1,
            "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80"
        },
        "deltas": {
            "ndvi_delta": oa.ndvi_delta,
            "mndwi_delta": oa.mndwi_delta,
            "ndmi_delta": oa.ndmi_delta,
            "water_persistence_delta_months": 2.9
        },
        "decision_status": oa.decision_status,
        "evidence_readiness_score": oa.evidence_readiness_score
    }

@router.get("/terrain/{intervention_id}")
def get_terrain_profile(
    intervention_id: str,
    db: Session = Depends(get_db)
):
    iv = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not iv:
        raise HTTPException(status_code=404, detail="Intervention not found")

    # Generate synthetic realistic 2D elevation cross-section along stream axis (200m upstream to 200m downstream)
    base_elev = iv.elevation_m or 180.0
    slope = iv.slope_pct or 2.5

    elevation_profile = []
    for distance in range(-200, 220, 20):
        # elevation increases upstream (negative distance)
        elev = base_elev - (distance * (slope / 100.0))
        # add structure crest barrier at distance=0
        if -10 <= distance <= 10:
            elev += 2.8 # 2.8m check dam masonry weir
        elevation_profile.append({
            "distance_m": distance,
            "elevation_m": round(elev, 2),
            "label": "Upstream Catchment" if distance < 0 else ("Structure Axis" if distance == 0 else "Downstream Apron")
        })

    return {
        "intervention_id": iv.id,
        "work_id": iv.work_id,
        "base_elevation_m": base_elev,
        "slope_pct": slope,
        "stream_order": iv.stream_order,
        "hydrologic_compliance": "COMPLIANT" if slope <= 5.0 and iv.stream_order in [1, 2] else "CHECK_REQUIRED",
        "cross_section": elevation_profile
    }
