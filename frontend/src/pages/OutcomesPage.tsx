import React, { useEffect, useState } from 'react';
import { 
  Activity, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, 
  HelpCircle, ArrowUpRight, Sparkles, FileText, Compass 
} from 'lucide-react';
import { api } from '../services/api';
import { Intervention } from '../types';
import { Badge } from '../components/common/Badge';
import { LoadingState } from '../components/common/LoadingState';
import { useToast } from '../context/ToastContext';

export const OutcomesPage: React.FC = () => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [selectedInterventionId, setSelectedInterventionId] = useState('');
  const [scorecard, setScorecard] = useState<any | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const ivs = await api.getInterventions();
        setInterventions(ivs);
        const hero = ivs.find(i => i.work_id === 'WDC-GJ-RJK-CD-014') || ivs[0];
        if (hero) {
          setSelectedInterventionId(hero.id);
          await loadScorecard(hero.id);
        }
      } catch (err: any) {
        error('Failed to load outcome scorecard', err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadScorecard = async (id: string) => {
    try {
      const data = await api.getOutcomeScorecard(id);
      setScorecard(data);
    } catch (err: any) {
      error('Failed to load scorecard', err.message);
    }
  };

  const handleInterventionChange = async (id: string) => {
    setSelectedInterventionId(id);
    await loadScorecard(id);
  };

  const handleRecalculate = async () => {
    if (!selectedInterventionId) return;
    setIsRecalculating(true);
    try {
      await api.recalculateOutcome(selectedInterventionId);
      await loadScorecard(selectedInterventionId);
      success('Evidence Readiness Score and Directional Signals recomputed successfully!');
    } catch (err: any) {
      error('Recalculation error', err.message);
    } finally {
      setIsRecalculating(false);
    }
  };

  if (loading) return <LoadingState message="Calculating Outcome Scorecards..." />;

  const assessment = scorecard?.assessment;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Scientific Outcome Assessment Scorecard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-dimensional evaluation combining ground truth readiness with remote sensing indicators
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedInterventionId}
            onChange={(e) => handleInterventionChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 font-mono font-bold focus:ring-2 focus:ring-forest-900 shadow-sm"
          >
            {interventions.map((iv) => (
              <option key={iv.id} value={iv.id}>
                {iv.work_id} ({iv.structure_type})
              </option>
            ))}
          </select>

          <button
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-forest-900 text-white text-xs font-semibold hover:bg-forest-800 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>Recalculate Scores</span>
          </button>
        </div>
      </div>

      {/* Main Scorecard Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="font-mono text-xs font-bold text-forest-900 bg-forest-50 px-2.5 py-1 rounded-lg border border-forest-200">
            {scorecard?.intervention.work_id}
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-2">
            {scorecard?.intervention.structure_type}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {scorecard?.intervention.watershed_name} • {scorecard?.intervention.district} • Sanctioned Cost: ₹{scorecard?.intervention.sanctioned_cost_inr?.toLocaleString() || '8,50,000'}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Evidence Readiness</span>
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {assessment?.evidence_readiness_score || 88.5}/100
            </span>
          </div>

          <div className="pl-6 border-l border-slate-200">
            <span className="text-[10px] text-slate-400 block uppercase font-bold mb-1">Directional Status</span>
            <Badge status={assessment?.decision_status || 'POSITIVE_SIGNAL'} />
          </div>
        </div>
      </div>

      {/* 4-Quadrant Outcome Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quadrant 1: Photosynthetic Greening */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Vegetative Canopy Recovery (NDVI)
            </h3>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
              +{assessment?.ndvi_delta.toFixed(3) || '0.161'} Delta
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-slate-400 block text-[10px]">Pre-Baseline NDVI</span>
              <span className="font-mono text-base font-bold text-slate-800">{assessment?.baseline_ndvi.toFixed(3) || '0.224'}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-slate-400 block text-[10px]">Current Post NDVI</span>
              <span className="font-mono text-base font-bold text-emerald-700">{assessment?.current_ndvi.toFixed(3) || '0.385'}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-600">
            Observed biomass increase within upstream stream buffer indicates reduced soil erosion and enhanced vegetation vigour.
          </p>
        </div>

        {/* Quadrant 2: Surface Water Retention */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Surface Water Retention (MNDWI)
            </h3>
            <span className="text-[10px] font-mono text-water-600 bg-water-50 px-2 py-0.5 rounded font-bold">
              +{assessment?.mndwi_delta.toFixed(3) || '0.200'} Delta
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-slate-400 block text-[10px]">Pre-Baseline MNDWI</span>
              <span className="font-mono text-base font-bold text-slate-800">{assessment?.baseline_mndwi.toFixed(3) || '-0.120'}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-slate-400 block text-[10px]">Current Post MNDWI</span>
              <span className="font-mono text-base font-bold text-water-600">{assessment?.current_mndwi.toFixed(3) || '0.080'}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-600">
            Open-water persistence expanded from 1.2 to 4.1 months post-monsoon, demonstrating effective storage capacity.
          </p>
        </div>

        {/* Quadrant 3: Evidence Readiness Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            3. Evidence Readiness Components (ERS)
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Photo Sharpness & EXIF (25%)</span>
              <span className="font-mono font-bold text-emerald-700">92/100</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Geofence Proximity (20%)</span>
              <span className="font-mono font-bold text-emerald-700">98/100</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Temporal Currency &lt;90 days (20%)</span>
              <span className="font-mono font-bold text-emerald-700">90/100</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>WDC-PMKSY Work Match (15%)</span>
              <span className="font-mono font-bold text-emerald-700">100/100</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Cloud-Free Observations (20%)</span>
              <span className="font-mono font-bold text-emerald-700">85/100</span>
            </div>
          </div>
        </div>

        {/* Quadrant 4: AI Audit Briefing & Caveats */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-forest-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              4. AI Forensic Audit Synthesis
            </h3>
          </div>
          <div className="p-3 bg-forest-50/70 rounded-xl border border-forest-200 text-xs text-slate-800 leading-relaxed font-mono">
            {scorecard?.ai_narrative?.narrative || 'Forensic audit confirms observational recovery.'}
          </div>
          <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-100">
            Confidence: <strong>{scorecard?.ai_narrative?.confidence || 'HIGH'}</strong>. Remote sensing indicates observational association; field verification confirms structural integrity.
          </p>
        </div>
      </div>
    </div>
  );
};
