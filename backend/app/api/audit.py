from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..models.models import AuditEvent
from ..schemas.schemas import AuditEventResponse

router = APIRouter(prefix="/audit", tags=["Audit & Provenance Ledger"])

@router.get("/logs", response_model=List[AuditEventResponse])
def get_audit_logs(
    entity_type: Optional[str] = Query(None),
    limit: int = Query(50),
    db: Session = Depends(get_db)
):
    query = db.query(AuditEvent)
    if entity_type:
        query = query.filter(AuditEvent.entity_type == entity_type)
    return query.order_by(AuditEvent.created_at.desc()).limit(limit).all()
