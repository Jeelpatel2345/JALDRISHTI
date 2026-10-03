import json
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from ..core.database import get_db
from ..models.models import Watershed, Intervention, FieldEvidence, OutcomeAssessment

router = APIRouter(prefix="/gis", tags=["GIS & Map Engine"])

@router.get("/watersheds/geojson")
def get_watersheds_geojson(db: Session = Depends(get_db)):
    watersheds = db.query(Watershed).all()
    features = []
    for ws in watersheds:
        geom = json.loads(ws.geom_geojson)
        features.append({
            "type": "Feature",
            "id": ws.id,
            "geometry": geom,
            "properties": {
                "id": ws.id,
                "code": ws.code,
                "name": ws.name,
                "district": ws.district,
                "state": ws.state,
                "area_ha": ws.area_ha,
                "health_index": ws.health_index
            }
        })
    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/interventions/geojson")
def get_interventions_geojson(
    watershed_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Intervention)
    if watershed_id:
        query = query.filter(Intervention.watershed_id == watershed_id)
    if status:
        query = query.filter(Intervention.status == status)

    interventions = query.all()
    features = []
    for iv in interventions:
        oa = iv.outcome_assessment
        features.append({
            "type": "Feature",
            "id": iv.id,
            "geometry": {
                "type": "Point",
                "coordinates": [iv.longitude, iv.latitude]
            },
            "properties": {
                "id": iv.id,
                "work_id": iv.work_id,
                "watershed_id": iv.watershed_id,
                "watershed_name": iv.watershed.name if iv.watershed else None,
                "structure_type": iv.structure_type,
                "elevation_m": iv.elevation_m,
                "slope_pct": iv.slope_pct,
                "stream_order": iv.stream_order,
                "status": iv.status,
                "decision_status": oa.decision_status if oa else "INCONCLUSIVE",
                "evidence_readiness_score": oa.evidence_readiness_score if oa else 50.0,
                "evidence_count": len(iv.field_evidence)
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/drainage/geojson")
def get_drainage_geojson(watershed_id: Optional[str] = Query(None)):
    """Synthetic realistic DEM-conditioned stream lines (Strahler order 1 to 3) for the demo watersheds."""
    # Rajkot drainage network lines
    rajkot_streams = [
        # Order 1 tributaries
        {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [[70.760, 22.285], [70.772, 22.270], [70.781, 22.254]]
            },
            "properties": {"order": 1, "name": "Khirasara North Tributary", "watershed_code": "WDC-PMKSY-GJ-RJK-04"}
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [[70.795, 22.235], [70.788, 22.245], [70.781, 22.254]]
            },
            "properties": {"order": 1, "name": "Aji South Branch", "watershed_code": "WDC-PMKSY-GJ-RJK-04"}
        },
        # Order 2 main trunk where Check Dam 014 sits
        {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [[70.781, 22.254], [70.798, 22.258], [70.820, 22.265], [70.840, 22.275]]
            },
            "properties": {"order": 2, "name": "Khirasara Main Nala (Order 2)", "watershed_code": "WDC-PMKSY-GJ-RJK-04"}
        }
    ]

    return {
        "type": "FeatureCollection",
        "features": rajkot_streams
    }
