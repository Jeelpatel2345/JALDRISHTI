import { 
  Watershed, Intervention, FieldEvidence, FieldVisit,
  SatelliteObservation, OutcomeAssessment, VerificationTask, Alert,
  DashboardOverviewData, User
} from '../types';

export const fallbackUser: User = {
  id: 'usr-default',
  email: 'rajkot.officer@jaldrishti.gov.in',
  full_name: 'Vikram Mehta',
  role: 'district_officer',
  district: 'Rajkot',
  state: 'Gujarat'
};

const rajkotPoly = {
  type: "Polygon",
  coordinates: [[
    [70.745, 22.220], [70.825, 22.210], [70.860, 22.260],
    [70.835, 22.310], [70.750, 22.290], [70.745, 22.220]
  ]]
};

const dharwadPoly = {
  type: "Polygon",
  coordinates: [[
    [74.950, 15.410], [75.040, 15.400], [75.070, 15.470],
    [75.020, 15.510], [74.940, 15.480], [74.950, 15.410]
  ]]
};

const ananthapurPoly = {
  type: "Polygon",
  coordinates: [[
    [77.540, 14.620], [77.650, 14.610], [77.680, 14.710],
    [77.610, 14.740], [77.530, 14.700], [77.540, 14.620]
  ]]
};

export const fallbackWatersheds: Watershed[] = [
  {
    id: 'ws-rajkot-01',
    code: 'WDC-PMKSY-GJ-RJK-04',
    name: 'Khirasara-Aji Sub-Watershed',
    district: 'Rajkot',
    state: 'Gujarat',
    area_ha: 4850.0,
    baseline_date: '2021-06-15',
    health_index: 78.5,
    geom_geojson: JSON.stringify(rajkotPoly),
    land_use_summary: JSON.stringify({"Agriculture": 58, "Scrub/Wasteland": 22, "Water Body": 8, "Built-up": 12}),
    intervention_count: 8,
    verified_count: 6,
    created_at: '2021-06-15T00:00:00Z'
  },
  {
    id: 'ws-dharwad-02',
    code: 'WDC-PMKSY-KA-DHW-09',
    name: 'Kelageri-Malaprabha Micro-Catchment',
    district: 'Dharwad',
    state: 'Karnataka',
    area_ha: 6120.0,
    baseline_date: '2021-08-20',
    health_index: 64.2,
    geom_geojson: JSON.stringify(dharwadPoly),
    land_use_summary: JSON.stringify({"Dry Deciduous Forest": 35, "Rainfed Agriculture": 45, "Water Body": 6, "Fallow": 14}),
    intervention_count: 4,
    verified_count: 2,
    created_at: '2021-08-20T00:00:00Z'
  },
  {
    id: 'ws-atp-03',
    code: 'WDC-PMKSY-AP-ATP-18',
    name: 'Penna Rain-Shadow Ridge Basin',
    district: 'Ananthapuramu',
    state: 'Andhra Pradesh',
    area_ha: 7400.0,
    baseline_date: '2021-05-10',
    health_index: 58.7,
    geom_geojson: JSON.stringify(ananthapurPoly),
    land_use_summary: JSON.stringify({"Arid Scrubland": 48, "Millet Agriculture": 36, "Rocky Outcrops": 12, "Water Storage": 4}),
    intervention_count: 4,
    verified_count: 3,
    created_at: '2021-05-10T00:00:00Z'
  }
];

export const fallbackInterventions: Intervention[] = [
  {
    id: 'iv-cd-014',
    work_id: 'WDC-GJ-RJK-CD-014',
    watershed_id: 'ws-rajkot-01',
    watershed_name: 'Khirasara-Aji Sub-Watershed',
    structure_type: 'Masonry Check Dam',
    latitude: 22.2541,
    longitude: 70.7812,
    elevation_m: 178.5,
    slope_pct: 2.4,
    stream_order: 2,
    sanctioned_cost_inr: 850000.0,
    planned_date: '2022-03-10',
    completion_date: '2022-10-15',
    status: 'COMPLETED',
    evidence_count: 2,
    decision_status: 'POSITIVE_SIGNAL',
    evidence_readiness_score: 88.5,
    created_at: '2022-03-10T00:00:00Z',
    updated_at: '2023-11-20T00:00:00Z'
  },
  {
    id: 'iv-pt-008',
    work_id: 'WDC-GJ-RJK-PT-008',
    watershed_id: 'ws-rajkot-01',
    watershed_name: 'Khirasara-Aji Sub-Watershed',
    structure_type: 'Percolation Tank',
    latitude: 22.2680,
    longitude: 70.8015,
    elevation_m: 182.0,
    slope_pct: 1.8,
    stream_order: 1,
    sanctioned_cost_inr: 1200000.0,
    planned_date: '2022-04-01',
    completion_date: '2022-11-20',
    status: 'COMPLETED',
    evidence_count: 1,
    decision_status: 'POSITIVE_SIGNAL',
    evidence_readiness_score: 82.0,
    created_at: '2022-04-01T00:00:00Z',
    updated_at: '2023-11-20T00:00:00Z'
  },
  {
    id: 'iv-fp-082',
    work_id: 'WDC-KA-DHW-FP-082',
    watershed_id: 'ws-dharwad-02',
    watershed_name: 'Kelageri-Malaprabha Micro-Catchment',
    structure_type: 'Farm Pond',
    latitude: 15.4610,
    longitude: 75.0120,
    elevation_m: 690.0,
    slope_pct: 2.8,
    stream_order: 1,
    sanctioned_cost_inr: 310000.0,
    planned_date: '2022-02-15',
    completion_date: '2022-08-25',
    status: 'COMPLETED',
    evidence_count: 1,
    decision_status: 'POSITIVE_SIGNAL',
    evidence_readiness_score: 86.0,
    created_at: '2022-02-15T00:00:00Z',
    updated_at: '2023-11-20T00:00:00Z'
  },
  {
    id: 'iv-gc-003',
    work_id: 'WDC-AP-ATP-GC-003',
    watershed_id: 'ws-atp-03',
    watershed_name: 'Penna Rain-Shadow Ridge Basin',
    structure_type: 'Gully Control Structure',
    latitude: 14.6620,
    longitude: 77.6250,
    elevation_m: 345.0,
    slope_pct: 4.8,
    stream_order: 1,
    sanctioned_cost_inr: 210000.0,
    planned_date: '2022-02-10',
    completion_date: '2022-09-15',
    status: 'COMPLETED',
    evidence_count: 1,
    decision_status: 'NEEDS_VERIFICATION',
    evidence_readiness_score: 42.0,
    created_at: '2022-02-10T00:00:00Z',
    updated_at: '2023-11-20T00:00:00Z'
  },
  {
    id: 'iv-nb-003',
    work_id: 'WDC-GJ-RJK-NB-003',
    watershed_id: 'ws-rajkot-01',
    watershed_name: 'Khirasara-Aji Sub-Watershed',
    structure_type: 'Earthen Nala Bund',
    latitude: 22.2810,
    longitude: 70.8220,
    elevation_m: 195.0,
    slope_pct: 4.2,
    stream_order: 2,
    sanctioned_cost_inr: 650000.0,
    planned_date: '2022-06-01',
    completion_date: '2023-01-15',
    status: 'COMPLETED',
    evidence_count: 1,
    decision_status: 'NEEDS_VERIFICATION',
    evidence_readiness_score: 45.0,
    created_at: '2022-06-01T00:00:00Z',
    updated_at: '2023-11-20T00:00:00Z'
  }
];

export const fallbackEvidence: FieldEvidence[] = [
  {
    id: 'ev-01',
    intervention_id: 'iv-cd-014',
    uploaded_by: 'Ramesh Solanki (Field Surveyor)',
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
    latitude: 22.25415,
    longitude: 70.78124,
    gps_accuracy_m: 3.8,
    distance_to_asset_m: 6.2,
    capture_time: '2023-11-14T11:24:00Z',
    exif_valid: true,
    device_model: 'Samsung Galaxy M33 GNSS (L1+L5)',
    image_sha256: 'a948e71b563d4e78a63f20d6f9bb2701e6992d9d150247657ad60d1396a4a159',
    condition_rating: 'INTACT',
    field_notes: 'Post-monsoon inspection of Check Dam. Structure intact with full impoundment storage.',
    quality_score: 0.92,
    is_verified: true,
    reviewer_id: 'Vikram Mehta (District Officer)',
    review_notes: 'EXIF confirmed and coordinate matches planned nala axis within 7 meters.',
    reviewed_at: '2023-11-20T15:30:00Z',
    created_at: '2023-11-14T11:25:00Z'
  },
  {
    id: 'ev-02',
    intervention_id: 'iv-gc-003',
    uploaded_by: 'Ramesh Solanki (Field Surveyor)',
    image_url: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80',
    latitude: 22.2552,
    longitude: 70.7820,
    gps_accuracy_m: 4.2,
    distance_to_asset_m: 142.5,
    capture_time: '2023-11-14T12:10:00Z',
    exif_valid: true,
    device_model: 'Samsung Galaxy M33 GNSS (L1+L5)',
    image_sha256: '5d41402abc4b2a76b9719d911017c592',
    condition_rating: 'SILTED',
    field_notes: 'Photo captured at upstream access road rather than structure axis.',
    quality_score: 0.55,
    is_verified: false,
    created_at: '2023-11-14T12:12:00Z'
  }
];

export const fallbackTasks: VerificationTask[] = [
  {
    id: 'vt-01',
    intervention_id: 'iv-gc-003',
    priority: 'HIGH',
    failure_reason: 'GPS_DISCREPANCY',
    status: 'PENDING',
    assigned_officer: 'Ramesh Solanki (Field Surveyor)',
    reviewer_notes: 'Flagged automatically: Photo coordinate deviation (142.5m) exceeds 50m geofence tolerance.',
    created_at: '2023-11-14T12:15:00Z',
    intervention_work_id: 'WDC-AP-ATP-GC-003',
    intervention_type: 'Gully Control Structure'
  },
  {
    id: 'vt-02',
    intervention_id: 'iv-nb-003',
    priority: 'MEDIUM',
    failure_reason: 'GPS_DISCREPANCY',
    status: 'PENDING',
    assigned_officer: 'Ramesh Solanki (Field Surveyor)',
    reviewer_notes: 'Deviation of 88.0m detected from civil work boundary. Ground confirmation requested.',
    created_at: '2023-11-14T12:20:00Z',
    intervention_work_id: 'WDC-GJ-RJK-NB-003',
    intervention_type: 'Earthen Nala Bund'
  }
];

export const fallbackAlerts: Alert[] = [
  {
    id: 'alt-01',
    watershed_id: 'ws-rajkot-01',
    intervention_id: 'iv-gc-003',
    severity: 'CRITICAL',
    alert_type: 'EVIDENCE_MISMATCH',
    title: 'Evidence Geofence Exception on WDC-AP-ATP-GC-003',
    message: 'Photo captured 142m from planned civil axis for Gully Control Structure. Requires field re-verification.',
    is_resolved: false,
    created_at: '2023-11-14T12:15:00Z'
  },
  {
    id: 'alt-02',
    watershed_id: 'ws-rajkot-01',
    intervention_id: 'iv-nb-003',
    severity: 'WARNING',
    alert_type: 'EVIDENCE_MISMATCH',
    title: 'Geofence Warning: WDC-GJ-RJK-NB-003',
    message: 'Photo uploaded with 88m deviation from planned civil axis.',
    is_resolved: false,
    created_at: '2023-11-14T12:20:00Z'
  }
];

export const fallbackOverview: DashboardOverviewData = {
  total_watersheds: 3,
  total_interventions: 16,
  total_evidence_photos: 16,
  verified_interventions: 12,
  pending_verifications: 2,
  evidence_coverage_pct: 87.5,
  active_alerts: 2,
  average_health_index: 67.1,
  monthly_trend: [
    { month: "Oct 22", ndvi: 0.24, mndwi: -0.10, rainfall_mm: 42 },
    { month: "Dec 22", ndvi: 0.22, mndwi: -0.14, rainfall_mm: 5 },
    { month: "Feb 23", ndvi: 0.19, mndwi: -0.18, rainfall_mm: 0 },
    { month: "Apr 23", ndvi: 0.16, mndwi: -0.22, rainfall_mm: 2 },
    { month: "Jun 23", ndvi: 0.21, mndwi: -0.05, rainfall_mm: 95 },
    { month: "Aug 23", ndvi: 0.35, mndwi: 0.08, rainfall_mm: 180 },
    { month: "Oct 23", ndvi: 0.38, mndwi: 0.06, rainfall_mm: 38 },
    { month: "Dec 23", ndvi: 0.32, mndwi: -0.02, rainfall_mm: 0 },
    { month: "Feb 24", ndvi: 0.27, mndwi: -0.08, rainfall_mm: 0 },
    { month: "Apr 24", ndvi: 0.22, mndwi: -0.15, rainfall_mm: 4 },
    { month: "Jun 24", ndvi: 0.28, mndwi: 0.02, rainfall_mm: 110 },
    { month: "Aug 24", ndvi: 0.41, mndwi: 0.12, rainfall_mm: 195 }
  ],
  priority_queue: [
    {
      task_id: "vt-01",
      intervention_id: "iv-gc-003",
      work_id: "WDC-AP-ATP-GC-003",
      structure_type: "Gully Control Structure",
      priority: "HIGH",
      reason: "GPS DISCREPANCY (142m deviation)",
      created_at: "2023-11-14T12:15:00Z"
    },
    {
      task_id: "vt-02",
      intervention_id: "iv-nb-003",
      work_id: "WDC-GJ-RJK-NB-003",
      structure_type: "Earthen Nala Bund",
      priority: "MEDIUM",
      reason: "GPS DISCREPANCY (88m deviation)",
      created_at: "2023-11-14T12:20:00Z"
    }
  ],
  recent_evidence: fallbackEvidence
};
