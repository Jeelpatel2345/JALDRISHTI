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

const raleganPoly = {
  type: "Polygon",
  coordinates: [[
    [74.450, 19.000], [74.520, 18.990], [74.550, 19.050],
    [74.500, 19.090], [74.430, 19.060], [74.450, 19.000]
  ]]
};

const alwarPoly = {
  type: "Polygon",
  coordinates: [[
    [76.220, 27.280], [76.310, 27.270], [76.340, 27.350],
    [76.280, 27.390], [76.200, 27.360], [76.220, 27.280]
  ]]
};

const jhabuaPoly = {
  type: "Polygon",
  coordinates: [[
    [74.520, 22.710], [74.610, 22.700], [74.640, 22.780],
    [74.580, 22.820], [74.500, 22.790], [74.520, 22.710]
  ]]
};

const shirapurPoly = {
  type: "Polygon",
  coordinates: [[
    [75.830, 17.580], [75.920, 17.570], [75.950, 17.650],
    [75.890, 17.690], [75.810, 17.660], [75.830, 17.580]
  ]]
};

const ananthapurPoly = {
  type: "Polygon",
  coordinates: [[
    [77.540, 14.620], [77.650, 14.610], [77.680, 14.710],
    [77.610, 14.740], [77.530, 14.700], [77.540, 14.620]
  ]]
};

const tehriPoly = {
  type: "Polygon",
  coordinates: [[
    [78.430, 30.340], [78.510, 30.330], [78.530, 30.410],
    [78.470, 30.440], [78.410, 30.400], [78.430, 30.340]
  ]]
};

export const fallbackWatersheds: Watershed[] = [
  {
    id: 'ws-ralegan-01',
    code: 'WDC-PMKSY-MH-AHM-01',
    name: 'Ralegan Siddhi Sub-Basin',
    district: 'Ahmednagar',
    state: 'Maharashtra',
    area_ha: 5240.0,
    baseline_date: '2021-04-10',
    health_index: 89.4,
    geom_geojson: JSON.stringify(raleganPoly),
    land_use_summary: JSON.stringify({"Perennial Horticulture": 42, "Cereal Crops": 36, "Percolation Tanks": 10, "Homesteads": 12}),
    intervention_count: 6,
    verified_count: 6,
    created_at: '2021-04-10T00:00:00Z'
  },
  {
    id: 'ws-alwar-02',
    code: 'WDC-PMKSY-RJ-ALW-05',
    name: 'Arvari River Catchment (Laporiya-Bhanwata)',
    district: 'Alwar',
    state: 'Rajasthan',
    area_ha: 6850.0,
    baseline_date: '2021-06-01',
    health_index: 82.7,
    geom_geojson: JSON.stringify(alwarPoly),
    land_use_summary: JSON.stringify({"Johad Water Recharge": 24, "Pastureland Chauka": 38, "Mustard/Wheat": 28, "Rocky Ravines": 10}),
    intervention_count: 5,
    verified_count: 5,
    created_at: '2021-06-01T00:00:00Z'
  },
  {
    id: 'ws-jhabua-03',
    code: 'WDC-PMKSY-MP-JHB-11',
    name: 'Jhabua Bheel Tribal Catchment',
    district: 'Jhabua',
    state: 'Madhya Pradesh',
    area_ha: 4910.0,
    baseline_date: '2021-07-15',
    health_index: 75.2,
    geom_geojson: JSON.stringify(jhabuaPoly),
    land_use_summary: JSON.stringify({"Agroforestry": 34, "Contour Bunding": 41, "Seasonal Streams": 15, "Settlements": 10}),
    intervention_count: 5,
    verified_count: 4,
    created_at: '2021-07-15T00:00:00Z'
  },
  {
    id: 'ws-shirapur-04',
    code: 'WDC-PMKSY-MH-SOL-08',
    name: 'Shirapur Semi-Arid Ridge Watershed',
    district: 'Solapur',
    state: 'Maharashtra',
    area_ha: 5890.0,
    baseline_date: '2021-09-10',
    health_index: 71.8,
    geom_geojson: JSON.stringify(shirapurPoly),
    land_use_summary: JSON.stringify({"Rainfed Jowar": 48, "Continuous Contour Trenches": 28, "Farm Ponds": 14, "Fallow Scrub": 10}),
    intervention_count: 4,
    verified_count: 4,
    created_at: '2021-09-10T00:00:00Z'
  },
  {
    id: 'ws-atp-05',
    code: 'WDC-PMKSY-AP-ATP-18',
    name: 'Penna Rain-Shadow Catchment',
    district: 'Ananthapuramu',
    state: 'Andhra Pradesh',
    area_ha: 7400.0,
    baseline_date: '2021-05-10',
    health_index: 67.4,
    geom_geojson: JSON.stringify(ananthapurPoly),
    land_use_summary: JSON.stringify({"Groundnut/Millet": 40, "Farm Pond Network": 18, "Arid Wasteland": 32, "Horticulture": 10}),
    intervention_count: 4,
    verified_count: 3,
    created_at: '2021-05-10T00:00:00Z'
  },
  {
    id: 'ws-tehri-06',
    code: 'WDC-PMKSY-UK-TEH-03',
    name: 'Bhagirathi Upper Springshed Complex',
    district: 'Tehri Garhwal',
    state: 'Uttarakhand',
    area_ha: 3820.0,
    baseline_date: '2021-10-05',
    health_index: 84.6,
    geom_geojson: JSON.stringify(tehriPoly),
    land_use_summary: JSON.stringify({"Sub-Himalayan Pine Forest": 52, "Terrace Cultivation": 28, "Spring Catchment": 12, "Villages": 8}),
    intervention_count: 4,
    verified_count: 4,
    created_at: '2021-10-05T00:00:00Z'
  },
  {
    id: 'ws-rajkot-07',
    code: 'WDC-PMKSY-GJ-RJK-04',
    name: 'Khirasara-Aji Sub-Watershed',
    district: 'Rajkot',
    state: 'Gujarat',
    area_ha: 4850.0,
    baseline_date: '2021-06-15',
    health_index: 78.5,
    geom_geojson: JSON.stringify(rajkotPoly),
    land_use_summary: JSON.stringify({"Cotton/Groundnut": 58, "Scrub/Wasteland": 22, "Check Dam Water Bodies": 12, "Built-up": 8}),
    intervention_count: 8,
    verified_count: 6,
    created_at: '2021-06-15T00:00:00Z'
  }
];

export const fallbackInterventions: Intervention[] = [
  // Ralegan Siddhi, Ahmednagar, Maharashtra
  {
    id: 'iv-ralegan-01',
    work_id: 'WDC-MH-AHM-PT-001',
    watershed_id: 'ws-ralegan-01',
    watershed_name: 'Ralegan Siddhi Sub-Basin',
    structure_type: 'Percolation Tank with Silt Trap',
    latitude: 19.0425,
    longitude: 74.4981,
    elevation_m: 642.0,
    slope_pct: 1.8,
    stream_order: 3,
    sanctioned_cost_inr: 1420000.0,
    planned_date: '2022-01-10',
    completion_date: '2022-08-20',
    status: 'COMPLETED',
    evidence_count: 3,
    decision_status: 'POSITIVE_SIGNAL',
    evidence_readiness_score: 94.2,
    created_at: '2022-01-10T00:00:00Z',
    updated_at: '2023-11-20T00:00:00Z'
  },
  {
    id: 'iv-ralegan-02',
    work_id: 'WDC-MH-AHM-CCT-002',
    watershed_id: 'ws-ralegan-01',
    watershed_name: 'Ralegan Siddhi Sub-Basin',
    structure_type: 'Continuous Contour Trenches (Ridge)',
    latitude: 19.0610,
    longitude: 74.4820,
    elevation_m: 680.0,
    slope_pct: 6.2,
    stream_order: 1,
    sanctioned_cost_inr: 650000.0,
    planned_date: '2022-02-15',
    completion_date: '2022-07-30',
    status: 'COMPLETED',
    evidence_count: 2,
    decision_status: 'POSITIVE_SIGNAL',
    evidence_readiness_score: 91.0,
    created_at: '2022-02-15T00:00:00Z',
    updated_at: '2023-11-20T00:00:00Z'
  },

  // Arvari River, Alwar, Rajasthan
  {
    id: 'iv-alwar-01',
    work_id: 'WDC-RJ-ALW-JD-001',
    watershed_id: 'ws-alwar-02',
    watershed_name: 'Arvari River Catchment (Laporiya-Bhanwata)',
    structure_type: 'Traditional Earthen Johad Bund',
    latitude: 27.3210,
    longitude: 76.2750,
    elevation_m: 290.0,
    slope_pct: 1.5,
    stream_order: 2,
    sanctioned_cost_inr: 920000.0,
    planned_date: '2022-03-01',
    completion_date: '2022-09-15',
    status: 'COMPLETED',
    evidence_count: 3,
    decision_status: 'POSITIVE_SIGNAL',
    evidence_readiness_score: 89.5,
    created_at: '2022-03-01T00:00:00Z',
    updated_at: '2023-11-20T00:00:00Z'
  },
  {
    id: 'iv-alwar-02',
    work_id: 'WDC-RJ-ALW-CHK-002',
    watershed_id: 'ws-alwar-02',
    watershed_name: 'Arvari River Catchment (Laporiya-Bhanwata)',
    structure_type: 'Chauka Grassland Moisture System',
    latitude: 27.3450,
    longitude: 76.2910,
    elevation_m: 310.0,
    slope_pct: 2.1,
    stream_order: 1,
    sanctioned_cost_inr: 580000.0,
    planned_date: '2022-04-10',
    completion_date: '2022-10-05',
    status: 'COMPLETED',
    evidence_count: 2,
    decision_status: 'POSITIVE_SIGNAL',
    evidence_readiness_score: 86.8,
    created_at: '2022-04-10T00:00:00Z',
    updated_at: '2023-11-20T00:00:00Z'
  },

  // Jhabua, MP
  {
    id: 'iv-jhabua-01',
    work_id: 'WDC-MP-JHB-LBC-001',
    watershed_id: 'ws-jhabua-03',
    watershed_name: 'Jhabua Bheel Tribal Catchment',
    structure_type: 'Loose Boulder Check Dam Series',
    latitude: 22.7540,
    longitude: 74.5680,
    elevation_m: 370.0,
    slope_pct: 4.8,
    stream_order: 2,
    sanctioned_cost_inr: 450000.0,
    planned_date: '2022-05-01',
    completion_date: '2022-11-10',
    status: 'COMPLETED',
    evidence_count: 2,
    decision_status: 'POSITIVE_SIGNAL',
    evidence_readiness_score: 85.0,
    created_at: '2022-05-01T00:00:00Z',
    updated_at: '2023-11-20T00:00:00Z'
  },

  // Solapur, MH
  {
    id: 'iv-shirapur-01',
    work_id: 'WDC-MH-SOL-CCT-001',
    watershed_id: 'ws-shirapur-04',
    watershed_name: 'Shirapur Semi-Arid Ridge Watershed',
    structure_type: 'Continuous Contour Trenches',
    latitude: 17.6250,
    longitude: 75.8820,
    elevation_m: 460.0,
    slope_pct: 3.5,
    stream_order: 1,
    sanctioned_cost_inr: 720000.0,
    planned_date: '2022-03-15',
    completion_date: '2022-10-18',
    status: 'COMPLETED',
    evidence_count: 2,
    decision_status: 'POSITIVE_SIGNAL',
    evidence_readiness_score: 87.2,
    created_at: '2022-03-15T00:00:00Z',
    updated_at: '2023-11-20T00:00:00Z'
  },

  // Anantapur, AP
  {
    id: 'iv-atp-01',
    work_id: 'WDC-AP-ATP-FP-001',
    watershed_id: 'ws-atp-05',
    watershed_name: 'Penna Rain-Shadow Catchment',
    structure_type: 'Farm Pond with Inflow Silt Basin',
    latitude: 14.6720,
    longitude: 77.6120,
    elevation_m: 345.0,
    slope_pct: 1.6,
    stream_order: 1,
    sanctioned_cost_inr: 390000.0,
    planned_date: '2022-02-01',
    completion_date: '2022-08-14',
    status: 'COMPLETED',
    evidence_count: 2,
    decision_status: 'POSITIVE_SIGNAL',
    evidence_readiness_score: 83.4,
    created_at: '2022-02-01T00:00:00Z',
    updated_at: '2023-11-20T00:00:00Z'
  },

  // Tehri Garhwal, UK
  {
    id: 'iv-tehri-01',
    work_id: 'WDC-UK-TEH-SPR-001',
    watershed_id: 'ws-tehri-06',
    watershed_name: 'Bhagirathi Upper Springshed Complex',
    structure_type: 'Spring Chamber & Recharge Pit',
    latitude: 30.3720,
    longitude: 78.4650,
    elevation_m: 1420.0,
    slope_pct: 14.5,
    stream_order: 1,
    sanctioned_cost_inr: 380000.0,
    planned_date: '2022-04-01',
    completion_date: '2022-10-25',
    status: 'COMPLETED',
    evidence_count: 2,
    decision_status: 'POSITIVE_SIGNAL',
    evidence_readiness_score: 92.5,
    created_at: '2022-04-01T00:00:00Z',
    updated_at: '2023-11-20T00:00:00Z'
  },

  // Rajkot, GJ
  {
    id: 'iv-cd-014',
    work_id: 'WDC-GJ-RJK-CD-014',
    watershed_id: 'ws-rajkot-07',
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
    id: 'iv-fp-089',
    work_id: 'WDC-GJ-RJK-FP-089',
    watershed_id: 'ws-rajkot-07',
    watershed_name: 'Khirasara-Aji Sub-Watershed',
    structure_type: 'Community Farm Pond',
    latitude: 22.2715,
    longitude: 70.8124,
    elevation_m: 185.0,
    slope_pct: 1.2,
    stream_order: 1,
    sanctioned_cost_inr: 420000.0,
    planned_date: '2022-04-01',
    completion_date: '2022-11-20',
    status: 'COMPLETED',
    evidence_count: 1,
    decision_status: 'POSITIVE_SIGNAL',
    evidence_readiness_score: 82.0,
    created_at: '2022-04-01T00:00:00Z',
    updated_at: '2023-11-20T00:00:00Z'
  }
];

export const fallbackEvidence: FieldEvidence[] = [
  {
    id: 'ev-01',
    intervention_id: 'iv-cd-014',
    uploaded_by: 'Ramesh Solanki (Field Surveyor)',
    image_url: 'https://images.unsplash.com/photo-1584444976722-10f76c38260b?auto=format&fit=crop&w=1200&q=80',
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
    intervention_id: 'iv-ralegan-01',
    uploaded_by: 'Ashok Chavan (Field Surveyor)',
    image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1200&q=80',
    latitude: 19.0426,
    longitude: 74.4980,
    gps_accuracy_m: 2.8,
    distance_to_asset_m: 11.4,
    capture_time: '2023-11-14T12:10:00Z',
    exif_valid: true,
    device_model: 'Samsung Galaxy Tab Active Pro',
    image_sha256: '5d41402abc4b2a76b9719d911017c592',
    condition_rating: 'INTACT',
    field_notes: 'Ralegan Siddhi percolation tank full impoundment verified.',
    quality_score: 0.95,
    is_verified: true,
    reviewer_id: 'Dr. Ramesh Sharma (National Admin)',
    review_notes: 'Verified against ridge-to-valley recharge plan.',
    reviewed_at: '2023-11-18T10:00:00Z',
    created_at: '2023-11-14T12:12:00Z'
  }
];

export const fallbackTasks: VerificationTask[] = [
  {
    id: 'vt-01',
    intervention_id: 'iv-alwar-01',
    priority: 'HIGH',
    failure_reason: 'GPS_DISCREPANCY',
    status: 'PENDING',
    assigned_officer: 'Rajesh Meena (Surveyor)',
    reviewer_notes: 'Flagged automatically: Photo coordinate deviation (62.5m) exceeds 50m geofence tolerance.',
    created_at: '2023-11-14T12:15:00Z',
    intervention_work_id: 'WDC-RJ-ALW-JD-001',
    intervention_type: 'Traditional Earthen Johad Bund'
  },
  {
    id: 'vt-02',
    intervention_id: 'iv-cd-014',
    priority: 'MEDIUM',
    failure_reason: 'GPS_DISCREPANCY',
    status: 'VERIFIED',
    assigned_officer: 'Ramesh Solanki (Field Surveyor)',
    reviewer_notes: 'Deviation of 6.2m confirmed within 50m tolerance. Verified on satellite ground truth.',
    created_at: '2023-11-14T12:20:00Z',
    intervention_work_id: 'WDC-GJ-RJK-CD-014',
    intervention_type: 'Masonry Check Dam'
  }
];

export const fallbackAlerts: Alert[] = [
  {
    id: 'alt-01',
    watershed_id: 'ws-ralegan-01',
    intervention_id: 'iv-ralegan-01',
    severity: 'INFO',
    alert_type: 'AQUIFER_RECHARGE',
    title: 'Optimal Aquifer Recharge Reached in Ralegan Siddhi',
    message: 'Post-monsoon water table elevated by 3.8m across Ralegan ridge network.',
    is_resolved: true,
    created_at: '2023-10-15T08:30:00Z'
  },
  {
    id: 'alt-02',
    watershed_id: 'ws-alwar-02',
    intervention_id: 'iv-alwar-01',
    severity: 'WARNING',
    alert_type: 'EVIDENCE_MISMATCH',
    title: 'Geofence Exception: WDC-RJ-ALW-JD-001 (Alwar)',
    message: 'Johad photo uploaded with 62m deviation from planned civil axis.',
    is_resolved: false,
    created_at: '2023-11-14T12:20:00Z'
  }
];

export const fallbackOverview: DashboardOverviewData = {
  total_watersheds: 7,
  total_interventions: 34,
  total_evidence_photos: 28,
  verified_interventions: 30,
  pending_verifications: 2,
  evidence_coverage_pct: 91.5,
  active_alerts: 1,
  average_health_index: 78.5,
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
      intervention_id: "iv-alwar-01",
      work_id: "WDC-RJ-ALW-JD-001",
      structure_type: "Traditional Earthen Johad Bund",
      priority: "HIGH",
      reason: "GPS DISCREPANCY (62m deviation)",
      created_at: "2023-11-14T12:15:00Z"
    }
  ],
  recent_evidence: [
    {
      id: 'ev-01',
      intervention_id: 'iv-cd-014',
      uploaded_by: 'Ramesh Solanki (Field Surveyor)',
      image_url: 'https://images.unsplash.com/photo-1584444976722-10f76c38260b?auto=format&fit=crop&w=1200&q=80',
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
    }
  ]
};
