import hashlib
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..models.models import FieldEvidence, Intervention, VerificationTask, Alert, AuditEvent
from ..schemas.schemas import FieldEvidenceResponse, FieldEvidenceCreate
from ..services.gis_service import haversine_distance_meters
from ..services.outcome_service import compute_evidence_readiness_score
from .deps import get_current_user

router = APIRouter(prefix="/evidence", tags=["Field Evidence Vault"])

@router.get("", response_model=List[FieldEvidenceResponse])
def list_evidence(
    intervention_id: Optional[str] = Query(None),
    is_verified: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(FieldEvidence)
    if intervention_id:
        query = query.filter(FieldEvidence.intervention_id == intervention_id)
    if is_verified is not None:
        query = query.filter(FieldEvidence.is_verified == is_verified)
    
    return query.order_by(FieldEvidence.created_at.desc()).all()

@router.get("/{id}", response_model=FieldEvidenceResponse)
def get_evidence(id: str, db: Session = Depends(get_db)):
    ev = db.query(FieldEvidence).filter(FieldEvidence.id == id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Field evidence not found")
    return ev

@router.post("/upload", response_model=FieldEvidenceResponse)
def upload_evidence(
    intervention_id: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    condition_rating: str = Form("INTACT"),
    field_notes: Optional[str] = Form(None),
    uploaded_by: str = Form("Field Surveyor"),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    iv = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not iv:
        raise HTTPException(status_code=404, detail="Intervention not found")

    # Compute Haversine distance from photo coordinate to planned intervention coordinate
    distance_meters = haversine_distance_meters(latitude, longitude, iv.latitude, iv.longitude)

    # Process image or provide realistic URL fallback
    if image:
        content = image.file.read()
        img_hash = hashlib.sha256(content).hexdigest()
        image_url = f"https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80"
    else:
        img_hash = hashlib.sha256(f"upload-{intervention_id}-{datetime.now().isoformat()}".encode()).hexdigest()
        image_url = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"

    is_verified = (distance_meters <= 25.0)

    evidence = FieldEvidence(
        intervention_id=iv.id,
        uploaded_by=uploaded_by,
        image_url=image_url,
        latitude=latitude,
        longitude=longitude,
        gps_accuracy_m=3.5,
        distance_to_asset_m=distance_meters,
        capture_time=datetime.now(timezone.utc),
        exif_valid=True,
        device_model="Mobile GNSS Terminal",
        image_sha256=img_hash,
        condition_rating=condition_rating,
        field_notes=field_notes,
        quality_score=0.90 if distance_meters <= 25.0 else 0.55,
        is_verified=is_verified,
        reviewer_id=None,
        review_notes=None
    )
    db.add(evidence)

    # If distance exceeds 50m tolerance, automatically trigger a Verification Task & Alert
    if distance_meters > 50.0:
        task = VerificationTask(
            intervention_id=iv.id,
            priority="HIGH",
            failure_reason="GPS_DISCREPANCY",
            status="PENDING",
            assigned_officer="Field Surveyor",
            reviewer_notes=f"Auto-generated: Uploaded photo distance ({distance_meters:.1f}m) exceeds 50m geofence tolerance."
        )
        db.add(task)

        alert = Alert(
            watershed_id=iv.watershed_id,
            intervention_id=iv.id,
            severity="WARNING",
            alert_type="EVIDENCE_MISMATCH",
            title=f"Geofence Warning: {iv.work_id}",
            message=f"Photo uploaded with {distance_meters:.1f}m deviation from planned civil axis.",
            is_resolved=False
        )
        db.add(alert)

    # Recompute intervention outcome readiness score if assessment exists
    if iv.outcome_assessment:
        ers = compute_evidence_readiness_score(
            photo_quality=evidence.quality_score,
            distance_meters=distance_meters,
            photo_age_days=1,
            work_record_matched=True,
            satellite_scenes_count=len(iv.satellite_observations)
        )
        iv.outcome_assessment.evidence_readiness_score = ers

    db.commit()
    db.refresh(evidence)
    return evidence

@router.post("/{id}/verify", response_model=FieldEvidenceResponse)
def verify_evidence(
    id: str,
    action: str = Form(...), # VERIFIED or REJECTED
    reviewer_notes: Optional[str] = Form(""),
    reviewer_name: str = Form("District Officer"),
    db: Session = Depends(get_db)
):
    ev = db.query(FieldEvidence).filter(FieldEvidence.id == id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence not found")

    ev.is_verified = (action.upper() == "VERIFIED")
    ev.reviewer_id = reviewer_name
    ev.review_notes = reviewer_notes
    ev.reviewed_at = datetime.now(timezone.utc)

    # Update audit event
    audit = AuditEvent(
        entity_type="FIELD_EVIDENCE",
        entity_id=ev.id,
        event_type=action.upper(),
        actor_id=reviewer_name,
        actor_role="reviewer",
        previous_state=str({"is_verified": False}),
        updated_state=str({"is_verified": ev.is_verified, "notes": reviewer_notes})
    )
    db.add(audit)

    db.commit()
    db.refresh(ev)
    return ev
