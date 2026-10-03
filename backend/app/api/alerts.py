from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..models.models import Alert
from ..schemas.schemas import AlertResponse

router = APIRouter(prefix="/alerts", tags=["Alerts & Anomalies"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    is_resolved: Optional[bool] = False,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if is_resolved is not None:
        query = query.filter(Alert.is_resolved == is_resolved)
    if severity:
        query = query.filter(Alert.severity == severity)

    return query.order_by(Alert.created_at.desc()).all()

@router.post("/{id}/resolve")
def resolve_alert(id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_resolved = True
    db.commit()
    return {"message": "Alert marked as resolved", "id": alert.id}
