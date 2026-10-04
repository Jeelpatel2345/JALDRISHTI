import React, { useEffect, useState } from 'react';
import { 
  Compass, Layers, Camera, CheckSquare, ShieldAlert, 
  Activity, ArrowRight, RefreshCw, AlertTriangle, ChevronRight,
  CloudRain, Thermometer, Droplets, Wind, Radio
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { MapContainer } from '../components/gis/MapContainer';
import { TimeSeriesChart } from '../components/analytics/TimeSeriesChart';
import { EvidenceDrawer } from '../components/evidence/EvidenceDrawer';
import { LoadingState } from '../components/common/LoadingState';
import { api } from '../services/api';
import { DashboardOverviewData, Watershed, Intervention } from '../types';
import { useToast } from '../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const { error, info } = useToast();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardOverviewData | null>(null);
  const [watersheds, setWatersheds] = useState<Watershed[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [selectedIntervention, setSelectedIntervention] = useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [liveWeather, setLiveWeather] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ovData, wsData, ivData, weatherData] = await Promise.all([
        api.getDashboardOverview(),
        api.getWatersheds(),
        api.getInterventions(),
        api.getLiveMeteorology(22.2541, 70.7812)
      ]);
      setOverview(ovData);
      setWatersheds(wsData);
      setInterventions(ivData);
      setLiveWeather(weatherData);
    } catch (err: any) {
      error('Failed to load dashboard overview', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const handlePriorityItemClick = async (interventionId: string) => {
    try {
      const detail = await api.getInterventionDetail(interventionId);
      setSelectedIntervention(detail);
      setDrawerOpen(true);
    } catch (err) {
      info('Loading intervention details...');
    }
  };

  if (loading) return <LoadingState message="Loading Command Center telemetry..." />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Watershed Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational Situation Room • Real-time field telemetry and remote sensing intelligence
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Sync Telemetry</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitored Watersheds"
          value={overview?.total_watersheds || watersheds.length || 3}
          subtitle="4,850 ha area active"
          icon={Compass}
          colorScheme="teal"
        />
        <StatCard
          title="Interventions Tracked"
          value={overview?.total_interventions || interventions.length || 24}
          subtitle="Check dams, ponds, bunds"
          icon={Layers}
          colorScheme="blue"
        />
        <StatCard
          title="Evidence Coverage"
          value={`${overview?.evidence_coverage_pct || 87.5}%`}
          subtitle="Photos EXIF verified"
          icon={Camera}
          trend={{ value: '+12.4%', positive: true }}
          colorScheme="emerald"
        />
        <StatCard
          title="Verification Queue"
          value={overview?.pending_verifications || 3}
          subtitle="Exceptions requiring audit"
          icon={CheckSquare}
          trend={{ value: '3 flagged', positive: false }}
          colorScheme="amber"
        />
      </div>

      {/* Real-World Live Meteorological Telemetry Strip */}
      {liveWeather && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white rounded-2xl p-4 shadow-md border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Live Meteorological Feed
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Real-time Ground Truth
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Active Benchmark: Khirasara Basin (22.25°N, 70.78°E) • Station telemetry linked
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2.5">
              <Thermometer className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Ambient Temp</span>
                <span className="font-mono font-bold text-white text-sm">{liveWeather.temperature_c}°C</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2.5">
              <Droplets className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Humidity</span>
                <span className="font-mono font-bold text-white text-sm">{liveWeather.humidity_pct}%</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2.5">
              <CloudRain className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Current Rain</span>
                <span className="font-mono font-bold text-white text-sm">{liveWeather.precipitation_mm} mm</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2.5">
              <Wind className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Wind Speed</span>
                <span className="font-mono font-bold text-white text-sm">{liveWeather.wind_speed_kmh} km/h</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Center Grid: Map & Priority Triage Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Central Map (2 Columns) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Spatial Operations View
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">
              Click any asset pin to inspect full forensic bundle
            </span>
          </div>

          <MapContainer
            watersheds={watersheds}
            interventions={interventions}
            selectedInterventionId={selectedIntervention?.id}
            onSelectIntervention={handleSelectIntervention}
            height="460px"
          />
        </div>

        {/* Right Panel: Priority Evidence Queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Priority Action Queue</span>
            </h2>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {overview?.priority_queue.length || 3} items
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2.5 shadow-sm">
            {overview?.priority_queue.map((item) => (
              <div
                key={item.task_id}
                onClick={() => handlePriorityItemClick(item.intervention_id)}
                className="p-3 rounded-xl border border-slate-100 hover:border-forest-600 hover:bg-slate-50/70 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-forest-900">
                    {item.work_id}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    item.priority === 'HIGH' ? 'bg-red-50 text-red-700 border border-red-200' :
                    'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {item.priority}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 font-medium">
                  {item.structure_type}
                </p>
                <p className="text-[10px] text-amber-800 mt-1 flex items-center gap-1 font-mono">
                  <span>Reason: {item.reason.replace('_', ' ')}</span>
                </p>
              </div>
            ))}

            <div className="pt-2 text-center">
              <span className="text-[11px] text-slate-400">
                Automated triage based on GPS geofence & NDVI gates
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Chart: 12-Month Multi-Spectral Greening Trend */}
      <TimeSeriesChart
        data={overview?.monthly_trend || []}
        title="Composite Sub-Basin Vegetative Vigour & Surface Water Trajectory (24-Months)"
        height={260}
      />

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
