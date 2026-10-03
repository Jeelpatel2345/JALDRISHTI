import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(120), unique=True, index=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="district_officer") # super_admin, district_officer, watershed_officer, field_surveyor, analyst, reviewer, public
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Watershed(Base):
    __tablename__ = "watersheds"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    district = Column(String(100), index=True, nullable=False)
    state = Column(String(100), nullable=False)
    area_ha = Column(Float, nullable=False)
    geom_geojson = Column(Text, nullable=False) # GeoJSON polygon string
    baseline_date = Column(Date, nullable=False)
    health_index = Column(Float, default=70.0) # 0 to 100
    land_use_summary = Column(Text, nullable=True) # JSON string
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    projects = relationship("Project", back_populates="watershed", cascade="all, delete-orphan")
    interventions = relationship("Intervention", back_populates="watershed", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="watershed", cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    watershed_id = Column(String(36), ForeignKey("watersheds.id", ondelete="CASCADE"), nullable=False)
    project_code = Column(String(100), unique=True, nullable=False)
    project_name = Column(String(255), nullable=False)
    sanction_year = Column(Integer, nullable=False)
    status = Column(String(50), default="IN_PROGRESS") # PLANNED, IN_PROGRESS, COMPLETED
    total_budget_inr = Column(Float, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    watershed = relationship("Watershed", back_populates="projects")
    interventions = relationship("Intervention", back_populates="project")

class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    work_id = Column(String(100), unique=True, index=True, nullable=False) # Official WDC-PMKSY Work ID
    watershed_id = Column(String(36), ForeignKey("watersheds.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    structure_type = Column(String(100), nullable=False) # Check Dam, Farm Pond, Gully Plug, Percolation Tank, Plantation, Nala Bund
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_m = Column(Float, nullable=True)
    slope_pct = Column(Float, nullable=True)
    stream_order = Column(Integer, default=1)
    sanctioned_cost_inr = Column(Float, default=0.0)
    planned_date = Column(Date, nullable=False)
    completion_date = Column(Date, nullable=True)
    status = Column(String(50), default="COMPLETED") # PLANNED, IN_PROGRESS, COMPLETED, ABANDONED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    watershed = relationship("Watershed", back_populates="interventions")
    project = relationship("Project", back_populates="interventions")
    field_evidence = relationship("FieldEvidence", back_populates="intervention", cascade="all, delete-orphan")
    field_visits = relationship("FieldVisit", back_populates="intervention", cascade="all, delete-orphan")
    satellite_observations = relationship("SatelliteObservation", back_populates="intervention", cascade="all, delete-orphan")
    outcome_assessment = relationship("OutcomeAssessment", back_populates="intervention", uselist=False, cascade="all, delete-orphan")
    verification_tasks = relationship("VerificationTask", back_populates="intervention", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="intervention", cascade="all, delete-orphan")

class FieldVisit(Base):
    __tablename__ = "field_visits"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    intervention_id = Column(String(36), ForeignKey("interventions.id", ondelete="CASCADE"), nullable=False)
    inspector_name = Column(String(150), nullable=False)
    visit_date = Column(Date, nullable=False)
    inspection_notes = Column(Text, nullable=True)
    structure_condition = Column(String(50), default="FUNCTIONAL") # FUNCTIONAL, SILTED, DAMAGED, DRY
    siltation_level = Column(String(50), default="LOW") # LOW, MODERATE, HIGH
    recommended_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    intervention = relationship("Intervention", back_populates="field_visits")

class FieldEvidence(Base):
    __tablename__ = "field_evidence"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    intervention_id = Column(String(36), ForeignKey("interventions.id", ondelete="CASCADE"), nullable=False)
    uploaded_by = Column(String(150), nullable=False)
    image_url = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    gps_accuracy_m = Column(Float, default=5.0)
    distance_to_asset_m = Column(Float, nullable=False, default=0.0) # Haversine distance to intervention coordinate
    capture_time = Column(DateTime, nullable=False)
    exif_valid = Column(Boolean, default=True)
    device_model = Column(String(100), default="Standard Android GNSS")
    image_sha256 = Column(String(64), nullable=False)
    condition_rating = Column(String(50), default="INTACT") # INTACT, SILTED, DAMAGED, DRY, EXCELLENT
    field_notes = Column(Text, nullable=True)
    quality_score = Column(Float, default=0.85) # 0.0 to 1.0
    is_verified = Column(Boolean, default=False)
    reviewer_id = Column(String(150), nullable=True)
    review_notes = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    intervention = relationship("Intervention", back_populates="field_evidence")

class SatelliteObservation(Base):
    __tablename__ = "satellite_observations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    intervention_id = Column(String(36), ForeignKey("interventions.id", ondelete="CASCADE"), nullable=False)
    observation_date = Column(Date, nullable=False)
    sensor = Column(String(50), default="Sentinel-2 MSI") # Sentinel-2 MSI, Landsat-8/9
    scene_id = Column(String(150), nullable=False)
    cloud_cover_pct = Column(Float, default=5.0)
    ndvi_mean = Column(Float, nullable=False)
    mndwi_mean = Column(Float, nullable=False)
    ndmi_mean = Column(Float, nullable=False)
    lst_celsius = Column(Float, nullable=True)
    is_cloud_free = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    intervention = relationship("Intervention", back_populates="satellite_observations")

class OutcomeAssessment(Base):
    __tablename__ = "outcome_assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    intervention_id = Column(String(36), ForeignKey("interventions.id", ondelete="CASCADE"), unique=True, nullable=False)
    before_window_start = Column(Date, nullable=False)
    before_window_end = Column(Date, nullable=False)
    after_window_start = Column(Date, nullable=False)
    after_window_end = Column(Date, nullable=False)
    baseline_ndvi = Column(Float, nullable=False)
    current_ndvi = Column(Float, nullable=False)
    ndvi_delta = Column(Float, nullable=False)
    baseline_mndwi = Column(Float, nullable=False)
    current_mndwi = Column(Float, nullable=False)
    mndwi_delta = Column(Float, nullable=False)
    baseline_ndmi = Column(Float, nullable=False)
    current_ndmi = Column(Float, nullable=False)
    ndmi_delta = Column(Float, nullable=False)
    evidence_readiness_score = Column(Float, nullable=False) # 0 to 100
    decision_status = Column(String(50), nullable=False) # POSITIVE_SIGNAL, NEGATIVE_SIGNAL, INCONCLUSIVE, NEEDS_VERIFICATION
    ai_summary_narrative = Column(Text, nullable=True)
    evaluated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    intervention = relationship("Intervention", back_populates="outcome_assessment")

class VerificationTask(Base):
    __tablename__ = "verification_tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    intervention_id = Column(String(36), ForeignKey("interventions.id", ondelete="CASCADE"), nullable=False)
    priority = Column(String(20), default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    failure_reason = Column(String(150), nullable=False) # GPS_MISMATCH, NEGATIVE_VEGETATION_TREND, CLOUD_COVER_GAP, EXPIRED_PHOTO
    status = Column(String(50), default="PENDING") # PENDING, IN_PROGRESS, VERIFIED, REJECTED
    assigned_officer = Column(String(150), nullable=True)
    reviewer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime, nullable=True)

    intervention = relationship("Intervention", back_populates="verification_tasks")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    watershed_id = Column(String(36), ForeignKey("watersheds.id", ondelete="CASCADE"), nullable=True)
    intervention_id = Column(String(36), ForeignKey("interventions.id", ondelete="CASCADE"), nullable=True)
    severity = Column(String(20), default="WARNING") # INFO, WARNING, CRITICAL
    alert_type = Column(String(100), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    watershed = relationship("Watershed", back_populates="alerts")
    intervention = relationship("Intervention", back_populates="alerts")

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(36), nullable=False)
    event_type = Column(String(50), nullable=False) # CREATE, UPDATE, VERIFY, REJECT, FLAG
    actor_id = Column(String(150), nullable=False)
    actor_role = Column(String(50), nullable=False)
    previous_state = Column(Text, nullable=True) # JSON
    updated_state = Column(Text, nullable=True) # JSON
    ip_address = Column(String(45), default="127.0.0.1")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
