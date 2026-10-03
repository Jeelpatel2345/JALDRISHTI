from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional
from ..core.database import get_db
from ..models.models import VerificationTask, Intervention, FieldEvidence, AuditEvent
from ..schemas.schemas import VerificationTaskResponse, TaskActionRequest
from .deps import get_current_user

router = APIRouter(prefix="/verification", tags=["Verification Queue & Triage"])

@router.get("/queue", response_model=List[VerificationTaskResponse])
def get_verification_queue(
    status: Optional[str] = "PENDING",
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(VerificationTask)
    if status:
        query = query.filter(VerificationTask.status == status)
    if priority:
        query = query.filter(VerificationTask.priority == priority)

    tasks = query.order_by(VerificationTask.created_at.desc()).all()
    results = []
    for t in tasks:
        results.append({
            "id": t.id,
            "intervention_id": t.intervention_id,
            "priority": t.priority,
            "failure_reason": t.failure_reason,
            "status": t.status,
            "assigned_officer": t.assigned_officer,
            "reviewer_notes": t.reviewer_notes,
            "created_at": t.created_at,
            "resolved_at": t.resolved_at,
            "intervention_work_id": t.intervention.work_id if t.intervention else None,
            "intervention_type": t.intervention.structure_type if t.intervention else None
        })
    return results

@router.post("/{task_id}/action", response_model=VerificationTaskResponse)
def adjudicate_task(
    task_id: str,
    action_data: TaskActionRequest,
    reviewer_name: str = "District Officer",
    db: Session = Depends(get_db)
):
    task = db.query(VerificationTask).filter(VerificationTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Verification task not found")

    task.status = action_data.action # VERIFIED, REJECTED, RE_INSPECT
    task.reviewer_notes = action_data.reviewer_notes
    task.resolved_at = datetime.now(timezone.utc)

    # Log to audit trail
    audit = AuditEvent(
        entity_type="VERIFICATION_TASK",
        entity_id=task.id,
        event_type=action_data.action,
        actor_id=reviewer_name,
        actor_role="reviewer",
        previous_state=str({"status": "PENDING"}),
        updated_state=str({"status": action_data.action, "notes": action_data.reviewer_notes})
    )
    db.add(audit)

    db.commit()
    db.refresh(task)

    return {
        "id": task.id,
        "intervention_id": task.intervention_id,
        "priority": task.priority,
        "failure_reason": task.failure_reason,
        "status": task.status,
        "assigned_officer": task.assigned_officer,
        "reviewer_notes": task.reviewer_notes,
        "created_at": task.created_at,
        "resolved_at": task.resolved_at,
        "intervention_work_id": task.intervention.work_id if task.intervention else None,
        "intervention_type": task.intervention.structure_type if task.intervention else None
    }
