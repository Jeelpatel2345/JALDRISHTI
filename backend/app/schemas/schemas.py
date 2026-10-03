from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str
    role: str = "district_officer"
    district: Optional[str] = "Rajkot"
    state: Optional[str] = "Gujarat"

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    district: Optional[str] = None
    state: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DemoSwitchRequest(BaseModel):
    role: str # district_officer, field_surveyor, analyst, reviewer, super_admin

# --- Field Evidence Schemas ---
class FieldEvidenceCreate(BaseModel):
    intervention_id: str
    uploaded_by: str
    image_url: str
    latitude: float
    longitude: float
    gps_accuracy_m: float = 4.5
    capture_time: datetime
    exif_valid: bool = True
    device_model: Optional[str] = "Mobile GNSS Logger"
    image_sha256: str
    condition_rating: str = "INTACT"
    field_notes: Optional[str] = None

class FieldEvidenceResponse(BaseModel):
    id: str
    intervention_id: str
    uploaded_by: str
    image_url: str
    latitude: float
    longitude: float
    gps_accuracy_m: float
    distance_to_asset_m: float
    capture_time: datetime
    exif_valid: bool
    device_model: Optional[str]
    image_sha256: str
    condition_rating: str
    field_notes: Optional[str]
    quality_score: float
    is_verified: bool
    reviewer_id: Optional[str]
    review_notes: Optional[str]
    reviewed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

# --- Field Visit Schemas ---
class FieldVisitCreate(BaseModel):
    intervention_id: str
    inspector_name: str
    visit_date: date
    inspection_notes: Optional[str] = None
    structure_condition: str = "FUNCTIONAL"
    siltation_level: str = "LOW"
    recommended_action: Optional[str] = None

class FieldVisitResponse(BaseModel):
    id: str
    intervention_id: str
    inspector_name: str
    visit_date: date
    inspection_notes: Optional[str]
    structure_condition: str
    siltation_level: str
    recommended_action: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# --- Satellite Observation Schemas ---
class SatelliteObservationResponse(BaseModel):
    id: str
    intervention_id: str
    observation_date: date
    sensor: str
    scene_id: str
    cloud_cover_pct: float
    ndvi_mean: float
    mndwi_mean: float
    ndmi_mean: float
    lst_celsius: Optional[float]
    is_cloud_free: bool

    class Config:
        from_attributes = True

# --- Outcome Assessment Schemas ---
class OutcomeAssessmentResponse(BaseModel):
    id: str
    intervention_id: str
    before_window_start: date
    before_window_end: date
    after_window_start: date
    after_window_end: date
    baseline_ndvi: float
    current_ndvi: float
    ndvi_delta: float
    baseline_mndwi: float
    current_mndwi: float
    mndwi_delta: float
    baseline_ndmi: float
    current_ndmi: float
    ndmi_delta: float
    evidence_readiness_score: float
    decision_status: str
    ai_summary_narrative: Optional[str]
    evaluated_at: datetime

    class Config:
        from_attributes = True

# --- Verification Task Schemas ---
class VerificationTaskResponse(BaseModel):
    id: str
    intervention_id: str
    priority: str
    failure_reason: str
    status: str
    assigned_officer: Optional[str]
    reviewer_notes: Optional[str]
    created_at: datetime
    resolved_at: Optional[datetime]
    intervention_work_id: Optional[str] = None
    intervention_type: Optional[str] = None

    class Config:
        from_attributes = True

class TaskActionRequest(BaseModel):
    action: str # VERIFY, REJECT, RE_INSPECT
    reviewer_notes: Optional[str] = ""

# --- Intervention Schemas ---
class InterventionBase(BaseModel):
    work_id: str
    watershed_id: str
    project_id: Optional[str] = None
    structure_type: str
    latitude: float
    longitude: float
    elevation_m: Optional[float] = 180.0
    slope_pct: Optional[float] = 2.5
    stream_order: Optional[int] = 1
    sanctioned_cost_inr: Optional[float] = 450000.0
    planned_date: date
    completion_date: Optional[date] = None
    status: str = "COMPLETED"

class InterventionCreate(InterventionBase):
    pass

class InterventionResponse(InterventionBase):
    id: str
    watershed_name: Optional[str] = None
    evidence_count: int = 0
    decision_status: Optional[str] = "INCONCLUSIVE"
    evidence_readiness_score: Optional[float] = 50.0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class InterventionDetailResponse(InterventionResponse):
    field_evidence: List[FieldEvidenceResponse] = []
    field_visits: List[FieldVisitResponse] = []
    satellite_observations: List[SatelliteObservationResponse] = []
    outcome_assessment: Optional[OutcomeAssessmentResponse] = None
    verification_tasks: List[VerificationTaskResponse] = []

# --- Watershed Schemas ---
class WatershedBase(BaseModel):
    code: str
    name: str
    district: str
    state: str
    area_ha: float
    baseline_date: date
    health_index: float = 75.0

class WatershedCreate(WatershedBase):
    geom_geojson: str

class WatershedResponse(WatershedBase):
    id: str
    geom_geojson: str
    land_use_summary: Optional[str] = None
    intervention_count: int = 0
    verified_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

# --- Alert Schemas ---
class AlertResponse(BaseModel):
    id: str
    watershed_id: Optional[str]
    intervention_id: Optional[str]
    severity: str
    alert_type: str
    title: str
    message: str
    is_resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Audit Event Schemas ---
class AuditEventResponse(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    event_type: str
    actor_id: str
    actor_role: str
    previous_state: Optional[str]
    updated_state: Optional[str]
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# --- Dashboard & Analytics Schemas ---
class DashboardOverview(BaseModel):
    total_watersheds: int
    total_interventions: int
    total_evidence_photos: int
    verified_interventions: int
    pending_verifications: int
    evidence_coverage_pct: float
    active_alerts: int
    average_health_index: float
    monthly_trend: List[Dict[str, Any]]
    priority_queue: List[Dict[str, Any]]
    recent_evidence: List[FieldEvidenceResponse]
