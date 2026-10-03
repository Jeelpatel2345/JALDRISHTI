import React, { useEffect, useState } from 'react';
import { Layers, Search, Filter, Plus, RefreshCw, Eye, MapPin } from 'lucide-react';
import { api } from '../services/api';
import { Intervention } from '../types';
import { Badge } from '../components/common/Badge';
import { LoadingState } from '../components/common/LoadingState';
import { EvidenceDrawer } from '../components/evidence/EvidenceDrawer';
import { useToast } from '../context/ToastContext';

export const InterventionsPage: React.FC = () => {
  const { error } = useToast();
  const [loading, setLoading] = useState(true);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedIntervention, setSelectedIntervention] = useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getInterventions();
      setInterventions(data);
    } catch (err: any) {
      error('Failed to load interventions', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInspect = async (iv: Intervention) => {
    try {
      const detail = await api.getInterventionDetail(iv.id);
      setSelectedIntervention(detail);
      setDrawerOpen(true);
    } catch (err) {
      setSelectedIntervention(iv);
      setDrawerOpen(true);
    }
  };

  const filtered = interventions.filter((iv) => {
    const matchesSearch = iv.work_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          iv.structure_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || iv.structure_type.toLowerCase().includes(selectedType.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || iv.decision_status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) return <LoadingState message="Loading Interventions Registry..." />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Intervention & Asset Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Civil and vegetative water-harvesting works linked with official WDC-PMKSY Work IDs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Work ID or structure..."
            className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-full bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-900"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800 font-semibold focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Structure Types</option>
            <option value="Check Dam">Check Dams</option>
            <option value="Percolation Tank">Percolation Tanks</option>
            <option value="Farm Pond">Farm Ponds</option>
            <option value="Nala Bund">Nala Bunds</option>
            <option value="Plantation">Plantation Sites</option>
            <option value="Gully">Gully Plugs</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-800 font-semibold focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Outcome Signals</option>
            <option value="POSITIVE_SIGNAL">Observed Positive</option>
            <option value="NEEDS_VERIFICATION">Needs Verification</option>
            <option value="NEGATIVE_SIGNAL">Observed Negative</option>
            <option value="INCONCLUSIVE">Inconclusive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-4">Work ID</th>
              <th className="p-4">Structure</th>
              <th className="p-4">Watershed</th>
              <th className="p-4">Coordinates</th>
              <th className="p-4">Readiness</th>
              <th className="p-4">Signal</th>
              <th className="p-4 text-right">Evidence Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((iv) => (
              <tr key={iv.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="p-4 font-mono font-bold text-slate-900">{iv.work_id}</td>
                <td className="p-4 font-medium text-slate-800">{iv.structure_type}</td>
                <td className="p-4 text-slate-600">{iv.watershed_name || 'Khirasara-Aji'}</td>
                <td className="p-4 font-mono text-[11px] text-slate-500">
                  {iv.latitude.toFixed(4)}°N, {iv.longitude.toFixed(4)}°E
                </td>
                <td className="p-4 font-mono font-bold text-slate-900">
                  {iv.evidence_readiness_score}/100
                </td>
                <td className="p-4">
                  <Badge status={iv.decision_status} />
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleInspect(iv)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-900 text-white font-semibold hover:bg-forest-800 transition-colors shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-over Evidence Drawer */}
      <EvidenceDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        intervention={selectedIntervention}
        onActionComplete={loadData}
      />
    </div>
  );
};
