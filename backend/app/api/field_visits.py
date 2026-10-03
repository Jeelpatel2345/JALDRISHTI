from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..models.models import FieldVisit, Intervention
from ..schemas.schemas import FieldVisitResponse, FieldVisitCreate

router = APIRouter(prefix="/field-visits", tags=["Field Inspection Management"])

@router.get("", response_model=List[FieldVisitResponse])
def list_field_visits(
    intervention_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(FieldVisit)
    if intervention_id:
        query = query.filter(FieldVisit.intervention_id == intervention_id)
    return query.order_by(FieldVisit.visit_date.desc()).all()

@router.post("", response_model=FieldVisitResponse)
def create_field_visit(data: FieldVisitCreate, db: Session = Depends(get_db)):
    iv = db.query(Intervention).filter(Intervention.id == data.intervention_id).first()
    if not iv:
        raise HTTPException(status_code=404, detail="Intervention not found")

    visit = FieldVisit(
        intervention_id=data.intervention_id,
        inspector_name=data.inspector_name,
        visit_date=data.visit_date,
        inspection_notes=data.inspection_notes,
        structure_condition=data.structure_condition,
        siltation_level=data.siltation_level,
        recommended_action=data.recommended_action
    )
    db.add(visit)
    db.commit()
    db.refresh(visit)
    return visit
