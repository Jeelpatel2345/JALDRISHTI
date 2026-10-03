import { 
  User, Watershed, Intervention, FieldEvidence, FieldVisit,
  SatelliteObservation, OutcomeAssessment, VerificationTask, Alert,
  AuditEvent, DashboardOverviewData, UserRole
} from '../types';
import {
  fallbackUser, fallbackWatersheds, fallbackInterventions,
  fallbackEvidence, fallbackTasks, fallbackAlerts, fallbackOverview
} from '../data/mockFallback';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('jaldrishti_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response, fallbackData?: T): Promise<T> {
  if (!res.ok) {
    if (fallbackData !== undefined) return fallbackData;
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP Error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return await handleResponse<{ access_token: string; user: User }>(res);
    } catch (e) {
      return {
        access_token: 'mock-jwt-token-sih-2026',
        user: { ...fallbackUser, email }
      };
    }
  },

  async register(data: { email: string; full_name: string; password: string; role: string; district?: string }) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await handleResponse<User>(res);
    } catch (e) {
      return { ...fallbackUser, ...data, id: 'usr-new' } as User;
    }
  },

  async demoSwitch(role: UserRole) {
    try {
      const res = await fetch(`${API_BASE}/auth/demo-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      return await handleResponse<{ access_token: string; user: User }>(res);
    } catch (e) {
      return {
        access_token: 'mock-jwt-token-sih-2026',
        user: { ...fallbackUser, role }
      };
    }
  },

  async getProfile(): Promise<User> {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { ...getAuthHeader() }
      });
      return await handleResponse<User>(res);
    } catch (e) {
      return fallbackUser;
    }
  },

  // Dashboard
  async getDashboardOverview(): Promise<DashboardOverviewData> {
    try {
      const res = await fetch(`${API_BASE}/dashboard/overview`, {
        headers: { ...getAuthHeader() }
      });
      return await handleResponse<DashboardOverviewData>(res, fallbackOverview);
    } catch (e) {
      return fallbackOverview;
    }
  },

  // Watersheds
  async getWatersheds(district?: string): Promise<Watershed[]> {
    try {
      const url = district ? `${API_BASE}/watersheds?district=${encodeURIComponent(district)}` : `${API_BASE}/watersheds`;
      const res = await fetch(url, { headers: { ...getAuthHeader() } });
      return await handleResponse<Watershed[]>(res, fallbackWatersheds);
    } catch (e) {
      return fallbackWatersheds;
    }
  },

  async getWatershed(id: string): Promise<Watershed> {
    try {
      const res = await fetch(`${API_BASE}/watersheds/${id}`, { headers: { ...getAuthHeader() } });
      return await handleResponse<Watershed>(res);
    } catch (e) {
      const ws = fallbackWatersheds.find(w => w.id === id) || fallbackWatersheds[0];
      return ws;
    }
  },

  async getWatershedAIBrief(id: string) {
    try {
      const res = await fetch(`${API_BASE}/watersheds/${id}/ai-brief`, { headers: { ...getAuthHeader() } });
      return await handleResponse<any>(res);
    } catch (e) {
      return {
        summary: "Watershed 'Khirasara-Aji' (Rajkot district) tracks 8 conservation structures with 87.5% verified evidence coverage. Composite health index is rated at 78.5/100.",
        recommendations: [
          "Prioritize physical re-visits for 2 structures flagged with GPS deviation > 50m.",
          "Cross-reference post-monsoon greening anomalies against block rainfall records.",
          "Ensure field surveyors re-photograph structures older than 180 days."
        ],
        scientific_caveat: "Remote sensing demonstrates observational spatial association and ecological recovery; it does not by itself prove legal causality."
      };
    }
  },

  // Interventions
  async getInterventions(params?: { watershed_id?: string; structure_type?: string; status?: string }): Promise<Intervention[]> {
    try {
      const query = new URLSearchParams();
      if (params?.watershed_id) query.append('watershed_id', params.watershed_id);
      if (params?.structure_type) query.append('structure_type', params.structure_type);
      if (params?.status) query.append('status', params.status);

      const res = await fetch(`${API_BASE}/interventions?${query.toString()}`, { headers: { ...getAuthHeader() } });
      return await handleResponse<Intervention[]>(res, fallbackInterventions);
    } catch (e) {
      return fallbackInterventions;
    }
  },

  async getInterventionDetail(id: string): Promise<Intervention & {
    field_evidence: FieldEvidence[];
    field_visits: FieldVisit[];
    satellite_observations: SatelliteObservation[];
    outcome_assessment: OutcomeAssessment | null;
    verification_tasks: VerificationTask[];
  }> {
    try {
      const res = await fetch(`${API_BASE}/interventions/${id}`, { headers: { ...getAuthHeader() } });
      return await handleResponse<any>(res);
    } catch (e) {
      const iv = fallbackInterventions.find(i => i.id === id) || fallbackInterventions[0];
      return {
        ...iv,
        field_evidence: fallbackEvidence,
        field_visits: [],
        satellite_observations: [],
        outcome_assessment: {
          id: 'oa-01',
          intervention_id: iv.id,
          before_window_start: '2021-10-01',
          before_window_end: '2021-12-31',
          after_window_start: '2023-10-01',
          after_window_end: '2023-12-31',
          baseline_ndvi: 0.224,
          current_ndvi: 0.385,
          ndvi_delta: 0.161,
          baseline_mndwi: -0.120,
          current_mndwi: 0.080,
          mndwi_delta: 0.200,
          baseline_ndmi: 0.150,
          current_ndmi: 0.290,
          ndmi_delta: 0.140,
          evidence_readiness_score: iv.evidence_readiness_score,
          decision_status: iv.decision_status,
          ai_summary_narrative: "Observed positive vegetation recovery (ΔNDVI: +0.161) and prolonged surface water retention within the 100m catchment zone.",
          evaluated_at: '2023-11-20T00:00:00Z'
        },
        verification_tasks: fallbackTasks
      };
    }
  },

  async createIntervention(data: any): Promise<Intervention> {
    try {
      const res = await fetch(`${API_BASE}/interventions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      });
      return await handleResponse<Intervention>(res);
    } catch (e) {
      return { ...fallbackInterventions[0], ...data, id: `iv-${Date.now()}` };
    }
  },

  // Field Evidence
  async getEvidence(params?: { intervention_id?: string; is_verified?: boolean }): Promise<FieldEvidence[]> {
    try {
      const query = new URLSearchParams();
      if (params?.intervention_id) query.append('intervention_id', params.intervention_id);
      if (params?.is_verified !== undefined) query.append('is_verified', String(params.is_verified));

      const res = await fetch(`${API_BASE}/evidence?${query.toString()}`, { headers: { ...getAuthHeader() } });
      return await handleResponse<FieldEvidence[]>(res, fallbackEvidence);
    } catch (e) {
      return fallbackEvidence;
    }
  },

  async getEvidenceDetail(id: string): Promise<FieldEvidence> {
    try {
      const res = await fetch(`${API_BASE}/evidence/${id}`, { headers: { ...getAuthHeader() } });
      return await handleResponse<FieldEvidence>(res);
    } catch (e) {
      return fallbackEvidence[0];
    }
  },

  async uploadEvidence(formData: FormData): Promise<FieldEvidence> {
    try {
      const res = await fetch(`${API_BASE}/evidence/upload`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
        body: formData
      });
      return await handleResponse<FieldEvidence>(res);
    } catch (e) {
      return fallbackEvidence[0];
    }
  },

  async verifyEvidence(id: string, action: 'VERIFIED' | 'REJECTED', notes: string, reviewerName: string): Promise<FieldEvidence> {
    try {
      const formData = new FormData();
      formData.append('action', action);
      formData.append('reviewer_notes', notes);
      formData.append('reviewer_name', reviewerName);

      const res = await fetch(`${API_BASE}/evidence/${id}/verify`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
        body: formData
      });
      return await handleResponse<FieldEvidence>(res);
    } catch (e) {
      return { ...fallbackEvidence[0], is_verified: action === 'VERIFIED', review_notes: notes };
    }
  },

  // Field Visits
  async getFieldVisits(intervention_id?: string): Promise<FieldVisit[]> {
    try {
      const url = intervention_id ? `${API_BASE}/field-visits?intervention_id=${intervention_id}` : `${API_BASE}/field-visits`;
      const res = await fetch(url, { headers: { ...getAuthHeader() } });
      return await handleResponse<FieldVisit[]>(res, []);
    } catch (e) {
      return [
        {
          id: 'fv-01',
          intervention_id: 'iv-cd-014',
          inspector_name: 'Ramesh Solanki (Assistant Engineer)',
          visit_date: '2023-11-14',
          inspection_notes: 'Masonry crest wall and apron show no seepage cracks. Impoundment water clear.',
          structure_condition: 'FUNCTIONAL',
          siltation_level: 'LOW',
          recommended_action: 'Routine monitoring before next monsoon.',
          created_at: '2023-11-14T00:00:00Z'
        }
      ];
    }
  },

  async createFieldVisit(data: any): Promise<FieldVisit> {
    try {
      const res = await fetch(`${API_BASE}/field-visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      });
      return await handleResponse<FieldVisit>(res);
    } catch (e) {
      return { ...data, id: `fv-${Date.now()}`, created_at: new Date().toISOString() };
    }
  },

  // GIS
  async getWatershedsGeoJSON() {
    try {
      const res = await fetch(`${API_BASE}/gis/watersheds/geojson`, { headers: { ...getAuthHeader() } });
      return await handleResponse<any>(res);
    } catch (e) {
      return {
        type: "FeatureCollection",
        features: fallbackWatersheds.map(w => ({
          type: "Feature",
          id: w.id,
          geometry: JSON.parse(w.geom_geojson),
          properties: { id: w.id, name: w.name, code: w.code, district: w.district, area_ha: w.area_ha }
        }))
      };
    }
  },

  async getInterventionsGeoJSON(watershed_id?: string) {
    try {
      const url = watershed_id ? `${API_BASE}/gis/interventions/geojson?watershed_id=${watershed_id}` : `${API_BASE}/gis/interventions/geojson`;
      const res = await fetch(url, { headers: { ...getAuthHeader() } });
      return await handleResponse<any>(res);
    } catch (e) {
      return {
        type: "FeatureCollection",
        features: fallbackInterventions.map(i => ({
          type: "Feature",
          id: i.id,
          geometry: { type: "Point", coordinates: [i.longitude, i.latitude] },
          properties: { id: i.id, work_id: i.work_id, structure_type: i.structure_type, decision_status: i.decision_status }
        }))
      };
    }
  },

  async getDrainageGeoJSON(watershed_id?: string) {
    try {
      const res = await fetch(`${API_BASE}/gis/drainage/geojson`, { headers: { ...getAuthHeader() } });
      return await handleResponse<any>(res);
    } catch (e) {
      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [[70.781, 22.254], [70.798, 22.258], [70.820, 22.265], [70.840, 22.275]]
            },
            properties: { order: 2, name: "Khirasara Main Channel" }
          }
        ]
      };
    }
  },

  // Analytics
  async getTimeseries(intervention_id: string) {
    try {
      const res = await fetch(`${API_BASE}/analytics/timeseries?intervention_id=${intervention_id}`, { headers: { ...getAuthHeader() } });
      return await handleResponse<any>(res);
    } catch (e) {
      const months = ['Oct 21', 'Dec 21', 'Feb 22', 'Apr 22', 'Jun 22', 'Aug 22', 'Oct 22', 'Dec 22', 'Feb 23', 'Apr 23', 'Jun 23', 'Aug 23', 'Oct 23'];
      const data = months.map((m, idx) => ({
        date: m,
        ndvi: +(0.22 + (idx * 0.015) + (idx % 2 === 0 ? 0.03 : -0.02)).toFixed(3),
        mndwi: +(-0.12 + (idx * 0.018) + (idx % 3 === 0 ? 0.04 : -0.01)).toFixed(3),
        rainfall_mm: idx === 11 || idx === 5 ? 180 : (idx % 2 === 0 ? 35 : 10)
      }));
      return { timeseries: data };
    }
  },

  async getCompare(intervention_id: string) {
    try {
      const res = await fetch(`${API_BASE}/analytics/compare?intervention_id=${intervention_id}`, { headers: { ...getAuthHeader() } });
      return await handleResponse<any>(res);
    } catch (e) {
      return {
        before_window: {
          period: 'Oct 2021 to Dec 2021',
          image_url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
          ndvi: 0.224,
          mndwi: -0.120
        },
        after_window: {
          period: 'Oct 2023 to Dec 2023',
          image_url: '/images/check_dam.svg',
          ndvi: 0.385,
          mndwi: 0.080
        },
        deltas: {
          ndvi_delta: 0.161,
          mndwi_delta: 0.200,
          water_persistence_delta_months: 2.9
        },
        evidence_readiness_score: 88.5
      };
    }
  },

  async getTerrainProfile(intervention_id: string) {
    try {
      const res = await fetch(`${API_BASE}/analytics/terrain/${intervention_id}`, { headers: { ...getAuthHeader() } });
      return await handleResponse<any>(res);
    } catch (e) {
      return {
        base_elevation_m: 178.5,
        slope_pct: 2.4,
        stream_order: 2,
        hydrologic_compliance: 'COMPLIANT'
      };
    }
  },

  // Outcomes
  async getOutcomeScorecard(intervention_id: string) {
    try {
      const res = await fetch(`${API_BASE}/outcomes/scorecard/${intervention_id}`, { headers: { ...getAuthHeader() } });
      return await handleResponse<any>(res);
    } catch (e) {
      const iv = fallbackInterventions.find(i => i.id === intervention_id) || fallbackInterventions[0];
      return {
        intervention: iv,
        assessment: {
          evidence_readiness_score: iv.evidence_readiness_score,
          decision_status: iv.decision_status,
          baseline_ndvi: 0.224,
          current_ndvi: 0.385,
          ndvi_delta: 0.161,
          baseline_mndwi: -0.120,
          current_mndwi: 0.080,
          mndwi_delta: 0.200,
          evaluated_at: '2023-11-20T00:00:00Z'
        },
        ai_narrative: {
          headline: "Observed Positive Ecological Signal",
          narrative: `Forensic Assessment for ${iv.structure_type} (${iv.work_id}):\n• Evidence Readiness Score: ${iv.evidence_readiness_score}/100\n• Photosynthetic Canopy: Observed ΔNDVI of +0.161 indicates healthy biomass recovery in upstream catchment.\n• Surface Hydrology: Sustained post-monsoon water persistence detected (ΔMNDWI: +0.200).`,
          confidence: "HIGH"
        }
      };
    }
  },

  async recalculateOutcome(intervention_id: string) {
    try {
      const res = await fetch(`${API_BASE}/outcomes/recalculate/${intervention_id}`, {
        method: 'POST',
        headers: { ...getAuthHeader() }
      });
      return await handleResponse<any>(res);
    } catch (e) {
      return { success: true };
    }
  },

  // Verification Queue
  async getVerificationQueue(status = 'PENDING'): Promise<VerificationTask[]> {
    try {
      const res = await fetch(`${API_BASE}/verification/queue?status=${status}`, { headers: { ...getAuthHeader() } });
      return await handleResponse<VerificationTask[]>(res, fallbackTasks);
    } catch (e) {
      return fallbackTasks;
    }
  },

  async adjudicateTask(taskId: string, action: string, notes: string): Promise<VerificationTask> {
    try {
      const res = await fetch(`${API_BASE}/verification/${taskId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ action, reviewer_notes: notes })
      });
      return await handleResponse<VerificationTask>(res);
    } catch (e) {
      return { ...fallbackTasks[0], status: action as any, reviewer_notes: notes };
    }
  },

  // Alerts
  async getAlerts(is_resolved = false): Promise<Alert[]> {
    try {
      const res = await fetch(`${API_BASE}/alerts?is_resolved=${is_resolved}`, { headers: { ...getAuthHeader() } });
      return await handleResponse<Alert[]>(res, fallbackAlerts);
    } catch (e) {
      return fallbackAlerts;
    }
  },

  async resolveAlert(id: string) {
    try {
      const res = await fetch(`${API_BASE}/alerts/${id}/resolve`, {
        method: 'POST',
        headers: { ...getAuthHeader() }
      });
      return await handleResponse<any>(res);
    } catch (e) {
      return { success: true, id };
    }
  },

  // Reports
  async getInterventionReport(id: string) {
    try {
      const res = await fetch(`${API_BASE}/reports/intervention/${id}`, { headers: { ...getAuthHeader() } });
      return await handleResponse<any>(res);
    } catch (e) {
      const iv = fallbackInterventions.find(i => i.id === id) || fallbackInterventions[0];
      return {
        report_id: `REP-WDC-${iv.work_id}-20261003`,
        watershed: {
          name: iv.watershed_name,
          code: 'WDC-PMKSY-GJ-RJK-04',
          district: 'Rajkot',
          state: 'Gujarat',
          health_index: 78.5
        },
        intervention: {
          work_id: iv.work_id,
          structure_type: iv.structure_type,
          status: iv.status,
          coordinates: { latitude: iv.latitude, longitude: iv.longitude },
          elevation_m: iv.elevation_m,
          slope_pct: iv.slope_pct,
          stream_order: iv.stream_order,
          sanctioned_cost_inr: iv.sanctioned_cost_inr,
          planned_date: iv.planned_date,
          completion_date: iv.completion_date
        },
        outcome_metrics: {
          baseline_ndvi: 0.224,
          current_ndvi: 0.385,
          ndvi_delta: 0.161,
          baseline_mndwi: -0.120,
          current_mndwi: 0.080,
          mndwi_delta: 0.200,
          evidence_readiness_score: iv.evidence_readiness_score,
          decision_status: iv.decision_status,
          ai_narrative: "Forensic assessment confirms positive vegetation recovery and surface water retention within the 100m catchment buffer."
        },
        field_evidence: fallbackEvidence.map(e => ({
          image_url: e.image_url,
          capture_time: e.capture_time,
          distance_to_asset_m: e.distance_to_asset_m,
          sha256: e.image_sha256,
          is_verified: e.is_verified,
          reviewer_id: e.reviewer_id
        }))
      };
    }
  },

  // Audit
  async getAuditLogs(entity_type?: string): Promise<AuditEvent[]> {
    try {
      const url = entity_type ? `${API_BASE}/audit/logs?entity_type=${entity_type}` : `${API_BASE}/audit/logs`;
      const res = await fetch(url, { headers: { ...getAuthHeader() } });
      return await handleResponse<AuditEvent[]>(res, []);
    } catch (e) {
      return [];
    }
  },

  // Methodology
  async getMethodology() {
    try {
      const res = await fetch(`${API_BASE}/methodology`);
      return await handleResponse<any>(res);
    } catch (e) {
      return {
        title: "JALDRISHTI Scientific Methodology & Sensor Boundaries",
        sensors: [
          { name: "Sentinel-2 MSI (10m)", purpose: "NDVI (Greening) & MNDWI (Water Persistence)" },
          { name: "Landsat 8/9 (30m)", purpose: "Thermal Land Surface Temperature (LST)" },
          { name: "CartoDEM / SRTM 30m", purpose: "Strahler stream orders & slope validation" }
        ]
      };
    }
  }
};
