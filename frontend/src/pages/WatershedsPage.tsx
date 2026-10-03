import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Search, Filter, ArrowRight, Layers, CheckCircle2, MapPin } from 'lucide-react';
import { api } from '../services/api';
import { Watershed } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { useToast } from '../context/ToastContext';

export const WatershedsPage: React.FC = () => {
  const { error } = useToast();
  const [loading, setLoading] = useState(true);
  const [watersheds, setWatersheds] = useState<Watershed[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');

  useEffect(() => {
    const fetchWatersheds = async () => {
      try {
        const data = await api.getWatersheds();
        setWatersheds(data);
      } catch (err: any) {
        error('Failed to load watersheds', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWatersheds();
  }, []);

  const filteredWatersheds = watersheds.filter((ws) => {
    const matchesSearch = ws.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ws.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = selectedDistrict === 'ALL' || ws.district.toLowerCase() === selectedDistrict.toLowerCase();
    return matchesSearch && matchesDistrict;
  });

  if (loading) return <LoadingState message="Loading Watershed Registry..." />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Watershed Explorer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Directory of micro-watersheds and sub-basins monitored under WDC-PMKSY 2.0
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search code or name..."
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-900 w-48 sm:w-64"
            />
          </div>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-forest-900 font-semibold"
          >
            <option value="ALL">All Districts</option>
            <option value="Rajkot">Rajkot (Gujarat)</option>
            <option value="Dharwad">Dharwad (Karnataka)</option>
            <option value="Ananthapuramu">Ananthapuramu (AP)</option>
          </select>
        </div>
      </div>

      {/* Watershed Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWatersheds.map((ws) => (
          <div
            key={ws.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-forest-600 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-forest-900 bg-forest-50 px-2.5 py-1 rounded-lg border border-forest-200">
                  {ws.code}
                </span>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-forest-700" />
                  {ws.district}, {ws.state}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{ws.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Baseline established: {new Date(ws.baseline_date).toLocaleDateString()}
                </p>
              </div>

              {/* Health Gauge & Stats */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Watershed Health Index</span>
                  <span className="font-mono font-bold text-forest-900">{ws.health_index}/100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-forest-800 h-full rounded-full"
                    style={{ width: `${ws.health_index}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Area</span>
                  <span className="font-bold text-slate-800">{ws.area_ha.toLocaleString()} ha</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Structures</span>
                  <span className="font-bold text-slate-800">{ws.intervention_count}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Verified</span>
                  <span className="font-bold text-emerald-700">{ws.verified_count}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <Link
                to={`/watersheds/${ws.id}`}
                className="w-full py-2 bg-slate-50 hover:bg-forest-900 hover:text-white text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-200"
              >
                <span>View Complete Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
