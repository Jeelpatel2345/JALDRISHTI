import React from 'react';
import { BookOpen, ShieldCheck, AlertCircle, Satellite, Compass, Layers, CheckCircle } from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-900 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
          <span>Scientific Rigor & Governance Standard</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Scientific Methodology & Sensor Boundaries
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Detailed formulation of multi-spectral indicators, evidence readiness scoring, and operational caveats for WDC-PMKSY 2.0
        </p>
      </div>

      {/* Prominent Scientific Honesty Banner */}
      <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-700" />
          <h2 className="text-sm font-bold uppercase tracking-wider">
            What JALDRISHTI Does NOT Claim (Scientific Honesty Policy)
          </h2>
        </div>
        <p className="text-xs leading-relaxed text-amber-900">
          Remote sensing observes surface reflectance changes; it does <strong>not</strong> independently prove legal causality. An increase in NDVI or MNDWI demonstrates an <em>observational spatial-temporal association</em>, not that a check dam single-handedly recharged a deep confined aquifer. Ground-truth field verification and local rainfall normalization remain mandatory prior to statutory fund sign-offs.
        </p>
      </div>

      {/* Core Remote Sensing Indicators */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Satellite className="w-4 h-4 text-forest-800" />
          <span>1. Earth Observation Multi-Spectral Indices</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm">Normalized Difference Vegetation Index (NDVI)</h3>
            <div className="font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-emerald-800 font-bold">
              NDVI = (NIR - Red) / (NIR + Red)
            </div>
            <p className="text-slate-600">
              <strong>Source:</strong> Sentinel-2 Band 8 (NIR, 10m) & Band 4 (Red, 10m).
            </p>
            <p className="text-slate-600">
              <strong>Operational Use:</strong> Quantifies photosynthetic biomass vigour in upstream micro-catchments. Screened against seasonal rainfall to identify vegetative recovery post-construction.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm">Modified Normalized Difference Water Index (MNDWI)</h3>
            <div className="font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-water-700 font-bold">
              MNDWI = (Green - SWIR) / (Green + SWIR)
            </div>
            <p className="text-slate-600">
              <strong>Source:</strong> Sentinel-2 Band 3 (Green, 10m) & Band 11 (SWIR, 20m resampled).
            </p>
            <p className="text-slate-600">
              <strong>Operational Use:</strong> Suppresses soil noise to measure open surface water impoundment and track the duration of post-monsoon storage persistence.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm">Normalized Difference Moisture Index (NDMI)</h3>
            <div className="font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-sky-800 font-bold">
              NDMI = (NIR - SWIR) / (NIR + SWIR)
            </div>
            <p className="text-slate-600">
              <strong>Operational Use:</strong> Serves as a proxy for canopy liquid water content and root-zone soil moisture retention.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm">CartoDEM Topographic Elevation & Slope</h3>
            <div className="font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 font-bold">
              Slope % = tan(θ) * 100
            </div>
            <p className="text-slate-600">
              <strong>Operational Use:</strong> Verifies hydrologic compliance: check dams must be placed on Strahler 1st/2nd-order channels with longitudinal slopes &lt; 3% to prevent bank scouring.
            </p>
          </div>
        </div>
      </div>

      {/* Evidence Readiness Scoring Formula */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Compass className="w-4 h-4 text-forest-800" />
          <span>2. Evidence Readiness Score (ERS) Mathematical Formulation</span>
        </h2>

        <p className="text-xs text-slate-600 leading-relaxed">
          To prevent arbitrary human bias, JALDRISHTI computes an objective readiness index (0–100) based on forensic completeness:
        </p>

        <div className="font-mono bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-900 leading-loose">
          <strong>Evidence_Readiness</strong> = 100 × [<br/>
          &nbsp;&nbsp;0.25 × Photo_Quality +<br/>
          &nbsp;&nbsp;0.20 × Geofence_Proximity_Score +<br/>
          &nbsp;&nbsp;0.20 × Temporal_Currency_Score +<br/>
          &nbsp;&nbsp;0.15 × WDC_PMKSY_Work_ID_Match +<br/>
          &nbsp;&nbsp;0.20 × Satellite_Scene_Completeness<br/>
          ]
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <strong>Geofence Tolerance Rule:</strong> Photographs captured within 25m receive a score of 1.0; scores decay linearly to 0 at 100m. Distances &gt;50m automatically create a high-priority review task.
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <strong>Quality Screening Gate:</strong> Satellite scenes with &gt;20% cloud cover in the AOI are automatically masked and flagged as quality-penalized.
          </div>
        </div>
      </div>
    </div>
  );
};
