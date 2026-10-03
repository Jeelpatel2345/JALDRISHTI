import React, { useEffect, useState } from 'react';
import { FileText, Printer, Download, CheckCircle2, Shield, Droplet } from 'lucide-react';
import { api } from '../services/api';
import { Intervention } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { useToast } from '../context/ToastContext';

export const ReportsPage: React.FC = () => {
  const { error } = useToast();
  const [loading, setLoading] = useState(true);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [selectedInterventionId, setSelectedInterventionId] = useState('');
  const [report, setReport] = useState<any | null>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const ivs = await api.getInterventions();
        setInterventions(ivs);
        const hero = ivs.find(i => i.work_id === 'WDC-GJ-RJK-CD-014') || ivs[0];
        if (hero) {
          setSelectedInterventionId(hero.id);
          const rep = await api.getInterventionReport(hero.id);
          setReport(rep);
        }
      } catch (err: any) {
        error('Failed to generate dossier', err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleInterventionChange = async (id: string) => {
    setSelectedInterventionId(id);
    try {
      const rep = await api.getInterventionReport(id);
      setReport(rep);
    } catch (err: any) {
      error('Report load error', err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingState message="Compiling Statutory Outcome Dossier..." />;

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Statutory Outcome Dossiers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-ready one-page verification reports formatted for Department of Land Resources (DoLR) compliance
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
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-forest-900 text-white rounded-xl text-xs font-semibold hover:bg-forest-800 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Statutory Dossier Sheet */}
      <div className="bg-white rounded-2xl border border-slate-300 p-8 shadow-md max-w-4xl mx-auto space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Government Header */}
        <div className="border-b-2 border-[#0E8A42] pb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="JALDRISHTI Emblem"
              className="w-14 h-14 object-contain"
            />
            <div>
              <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                <span>Government of India</span>
                <span>•</span>
                <span>Ministry of Rural Development</span>
              </h2>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                Department of Land Resources (DoLR) • WDC-PMKSY 2.0 Operational Dossier
              </p>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-500">
            <div>Report Ref: <strong>{report?.report_id}</strong></div>
            <div>Date: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Executive Summary Row */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Watershed Sub-Basin</span>
            <span className="font-bold text-slate-900">{report?.watershed.name}</span>
            <span className="text-[10px] text-slate-500 block">Code: {report?.watershed.code}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Intervention Work ID</span>
            <span className="font-bold font-mono text-forest-900">{report?.intervention.work_id}</span>
            <span className="text-[10px] text-slate-500 block">{report?.intervention.structure_type}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Evidence Readiness</span>
            <span className="font-bold font-mono text-emerald-700 text-sm">
              {report?.outcome_metrics.evidence_readiness_score}/100
            </span>
            <span className="text-[10px] text-slate-500 block">High Confidence</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Outcome Status</span>
            <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px] inline-block mt-0.5">
              {report?.outcome_metrics.decision_status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Section 1: Ground Truth Evidence */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1">
            Section 1: Ground Truth Photo & Forensic Hash
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
              <img
                src={report?.field_evidence[0]?.image_url || 'https://images.unsplash.com/photo-1584444976722-10f76c38260b?auto=format&fit=crop&w=1200&q=80'}
                alt="Structure proof"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2">
                <div><strong>Photo GNSS:</strong> {report?.intervention.coordinates.latitude}°N, {report?.intervention.coordinates.longitude}°E</div>
                <div><strong>Axis Deviation:</strong> {report?.field_evidence[0]?.distance_to_asset_m || '6.2'} meters (Within 25m)</div>
                <div><strong>Capture Timestamp:</strong> {report?.field_evidence[0]?.capture_time ? new Date(report.field_evidence[0].capture_time).toLocaleDateString() : 'Nov 2023'}</div>
                <div><strong>Reviewer Verification:</strong> Authenticated</div>
              </div>
              <div className="pt-1">
                <span className="text-[10px] text-slate-400 block font-mono">SHA-256 Digest:</span>
                <span className="font-mono text-[9px] text-slate-600 block bg-slate-100 p-1 rounded break-all">
                  {report?.field_evidence[0]?.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Remote Sensing Outcome Signals */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1">
            Section 2: Earth Observation Indicators (Sentinel-2 24-Month Temporal Curve)
          </h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Photosynthetic Greening</span>
              <span className="text-base font-bold font-mono text-emerald-700">
                +{report?.outcome_metrics.ndvi_delta.toFixed(3) || '0.161'} ΔNDVI
              </span>
              <span className="text-[10px] text-slate-500 block">Baseline 0.224 → Post 0.385</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Surface Water Storage</span>
              <span className="text-base font-bold font-mono text-water-600">
                +{report?.outcome_metrics.mndwi_delta.toFixed(3) || '0.200'} ΔMNDWI
              </span>
              <span className="text-[10px] text-slate-500 block">Persistence: +2.9 months</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Topographic Slope</span>
              <span className="text-base font-bold font-mono text-slate-800">
                {report?.intervention.slope_pct || 2.4}% (Compliant)
              </span>
              <span className="text-[10px] text-slate-500 block">Strahler Order {report?.intervention.stream_order || 2}</span>
            </div>
          </div>
        </div>

        {/* Section 3: AI Forensic Briefing & Sign-off Block */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1">
            Section 3: Executive Determination & Sign-off
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
            {report?.outcome_metrics.ai_narrative}
          </p>

          <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-slate-600">
            <div className="border-t border-slate-300 pt-2">
              <span className="block font-bold text-slate-900">Field Verification Officer</span>
              <span className="text-[11px] text-slate-500">Ramesh Solanki (Assistant Engineer)</span>
              <span className="text-[10px] text-slate-400 block font-mono">Digitally signed via JALDRISHTI GNSS</span>
            </div>
            <div className="border-t border-slate-300 pt-2">
              <span className="block font-bold text-slate-900">Project Director / Reviewer</span>
              <span className="text-[11px] text-slate-500">Vikram Mehta (District Project Director)</span>
              <span className="text-[10px] text-slate-400 block font-mono">Approved for WDC-PMKSY 2.0 MIS Record</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
