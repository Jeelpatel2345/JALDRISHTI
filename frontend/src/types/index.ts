export type UserRole = 
  | 'district_officer' 
  | 'field_surveyor' 
  | 'analyst' 
  | 'reviewer' 
  | 'super_admin' 
  | 'public';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  district?: string;
  state?: string;
}

export interface Watershed {
  id: string;
  code: string;
  name: string;
  district: string;
  state: string;
  area_ha: number;
  baseline_date: string;
  health_index: number;
  geom_geojson: string;
  land_use_summary?: string;
  intervention_count: number;
  verified_count: number;
  created_at: string;
}

export type DecisionStatus = 
  | 'POSITIVE_SIGNAL' 
  | 'NEGATIVE_SIGNAL' 
  | 'INCONCLUSIVE' 
  | 'NEEDS_VERIFICATION';

export interface Intervention {
  id: string;
  work_id: string;
  watershed_id: string;
  watershed_name?: string;
  project_id?: string;
  structure_type: string;
  latitude: number;
  longitude: number;
  elevation_m?: number;
  slope_pct?: number;
  stream_order?: number;
  sanctioned_cost_inr?: number;
  planned_date: string;
  completion_date?: string;
  status: string;
  evidence_count: number;
  decision_status: DecisionStatus;
  evidence_readiness_score: number;
  created_at: string;
  updated_at: string;
}

export interface FieldEvidence {
  id: string;
  intervention_id: string;
  uploaded_by: string;
  image_url: string;
  latitude: number;
  longitude: number;
  gps_accuracy_m: number;
  distance_to_asset_m: number;
  capture_time: string;
  exif_valid: boolean;
  device_model?: string;
  image_sha256: string;
  condition_rating: string;
  field_notes?: string;
  quality_score: number;
  is_verified: boolean;
  reviewer_id?: string;
  review_notes?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface FieldVisit {
  id: string;
  intervention_id: string;
  inspector_name: string;
  visit_date: string;
  inspection_notes?: string;
  structure_condition: string;
  siltation_level: string;
  recommended_action?: string;
  created_at: string;
}

export interface SatelliteObservation {
  id: string;
  intervention_id: string;
  observation_date: string;
  date?: string;
  sensor: string;
  scene_id: string;
  cloud_cover_pct: number;
  ndvi_mean: number;
  ndvi?: number;
  mndwi_mean: number;
  mndwi?: number;
  ndmi_mean: number;
  ndmi?: number;
  lst_celsius?: number;
  is_cloud_free: boolean;
}

export interface OutcomeAssessment {
  id: string;
  intervention_id: string;
  before_window_start: string;
  before_window_end: string;
  after_window_start: string;
  after_window_end: string;
  baseline_ndvi: number;
  current_ndvi: number;
  ndvi_delta: number;
  baseline_mndwi: number;
  current_mndwi: number;
  mndwi_delta: number;
  baseline_ndmi: number;
  current_ndmi: number;
  ndmi_delta: number;
  evidence_readiness_score: number;
  decision_status: DecisionStatus;
  ai_summary_narrative?: string;
  evaluated_at: string;
}

export interface VerificationTask {
  id: string;
  intervention_id: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  failure_reason: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED';
  assigned_officer?: string;
  reviewer_notes?: string;
  created_at: string;
  resolved_at?: string;
  intervention_work_id?: string;
  intervention_type?: string;
}

export interface Alert {
  id: string;
  watershed_id?: string;
  intervention_id?: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  alert_type: string;
  title: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
}

export interface AuditEvent {
  id: string;
  entity_type: string;
  entity_id: string;
  event_type: string;
  actor_id: string;
  actor_role: string;
  previous_state?: string;
  updated_state?: string;
  ip_address?: string;
  created_at: string;
}

export interface DashboardOverviewData {
  total_watersheds: number;
  total_interventions: number;
  total_evidence_photos: number;
  verified_interventions: number;
  pending_verifications: number;
  evidence_coverage_pct: number;
  active_alerts: number;
  average_health_index: number;
  monthly_trend: Array<{
    month: string;
    ndvi: number;
    mndwi: number;
    rainfall_mm: number;
  }>;
  priority_queue: Array<{
    task_id: string;
    intervention_id: string;
    work_id: string;
    structure_type: string;
    priority: string;
    reason: string;
    created_at: string;
  }>;
  recent_evidence: FieldEvidence[];
}
