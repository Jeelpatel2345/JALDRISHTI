import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Compass, MapPin, Calendar, Layers, Activity, FileText, 
  CheckCircle, ArrowLeft, ArrowUpRight, ShieldCheck, Sparkles 
} from 'lucide-react';
import { api } from '../services/api';
import { Watershed, Intervention } from '../types';
import { MapContainer } from '../components/gis/MapContainer';
import { Badge } from '../components/common/Badge';
import { LoadingState } from '../components/common/LoadingState';
import { EvidenceDrawer } from '../components/evidence/EvidenceDrawer';
import { useToast } from '../context/ToastContext';

export const WatershedDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { error } = useToast();
  const [loading, setLoading] = useState(true);
  const [watershed, setWatershed] = useState<Watershed | null>(null);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [aiBrief, setAiBrief] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'interventions' | 'ai'>('map');
  const [selectedIntervention, setSelectedIntervention] = useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadDetails = async () => {
      setLoading(true);
      try {
        const [ws, ivs, brief] = await Promise.all([
          api.getWatershed(id),
          api.getInterventions({ watershed_id: id }),
          api.getWatershedAIBrief(id)
        ]);
        setWatershed(ws);
        setInterventions(ivs);
        setAiBrief(brief);
      } catch (err: any) {
        error('Failed to load watershed details', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  const handleSelectIntervention = async (iv: Intervention) => {
    try {
      const detail = await api.getInterventionDetail(iv.id);
      setSelectedIntervention(detail);
      setDrawerOpen(true);
    } catch (err) {
      setSelectedIntervention(iv);
      setDrawerOpen(true);
    }
  };

  if (loading || !watershed) return <LoadingState message="Loading Watershed Dossier..." />;

  const landUse = watershed.land_use_summary ? JSON.parse(watershed.land_use_summary) : null;

  return (
    <div className="space-y-6">
      {/* Back button & Title banner */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/watersheds" className="hover:text-slate-900 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Watersheds
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-forest-900 bg-forest-50 px-2.5 py-1 rounded-lg border border-forest-200">
              {watershed.code}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-forest-700" />
              {watershed.district}, {watershed.state}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">{watershed.name}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Baseline Survey: {new Date(watershed.baseline_date).toLocaleDateString()} • Area: {watershed.area_ha.toLocaleString()} Hectares
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 block uppercase font-bold">Health Rating</span>
            <span className="text-2xl font-bold font-mono text-forest-900">{watershed.health_index}/100</span>
          </div>
          <Link
            to="/reports"
            className="px-4 py-2.5 rounded-xl bg-forest-900 text-white text-xs font-semibold hover:bg-forest-800 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Statutory PDF</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-4">
        <button
          onClick={() => setActiveTab('map')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'map' ? 'border-forest-900 text-forest-900' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Spatial Overview & Map</span>
        </button>

        <button
          onClick={() => setActiveTab('interventions')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'interventions' ? 'border-forest-900 text-forest-900' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Interventions Registry ({interventions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'ai' ? 'border-forest-900 text-forest-900' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-forest-700" />
          <span>AI Executive Briefing</span>
        </button>
      </div>

      {/* Tab 1: Map View */}
      {activeTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <MapContainer
              watersheds={[watershed]}
              interventions={interventions}
              onSelectIntervention={handleSelectIntervention}
              height="500px"
            />
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Land Use & Land Cover (LULC)
              </h3>
              {landUse && (
                <div className="space-y-2 pt-1 text-xs">
                  {Object.entries(landUse).map(([key, val]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-slate-600">
                        <span>{key}</span>
                        <span className="font-mono font-bold">{val as number}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-forest-800 h-full rounded-full"
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Catchment Hydrology
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Interventions sit on Order-1 and Order-2 streams draining towards the Khirasara main reservoir trunk.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Interventions Registry */}
      {activeTab === 'interventions' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Work ID</th>
                <th className="p-4">Structure Type</th>
                <th className="p-4">Stream Order</th>
                <th className="p-4">Readiness Score</th>
                <th className="p-4">Outcome Signal</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {interventions.map((iv) => (
                <tr key={iv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900">{iv.work_id}</td>
                  <td className="p-4 text-slate-700 font-medium">{iv.structure_type}</td>
                  <td className="p-4 text-slate-600">Order {iv.stream_order || 1}</td>
                  <td className="p-4 font-mono font-bold text-slate-900">
                    {iv.evidence_readiness_score}/100
                  </td>
                  <td className="p-4">
                    <Badge status={iv.decision_status} />
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleSelectIntervention(iv)}
                      className="px-3 py-1.5 rounded-lg bg-forest-900 text-white font-semibold hover:bg-forest-800 transition-colors shadow-sm"
                    >
                      Inspect Drawer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: AI Briefing */}
      {activeTab === 'ai' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-900">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Executive Watershed Briefing</h3>
              <p className="text-xs text-slate-500">Automated synthesis of multi-spectral deltas and ground truth evidence</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed">
            {aiBrief?.summary || 'Generating automated synthesis...'}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Strategic Recommendations for Program Officer
            </h4>
            <ul className="space-y-2 text-xs text-slate-700">
              {aiBrief?.recommendations?.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-[11px] text-amber-900 italic">
            <strong>Scientific Boundary Note:</strong> {aiBrief?.scientific_caveat}
          </div>
        </div>
      )}

      {/* Slide-over Evidence Drawer */}
      <EvidenceDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        intervention={selectedIntervention}
      />
    </div>
  );
};
