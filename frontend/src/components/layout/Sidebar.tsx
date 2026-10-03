import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Map, Layers, Camera, CheckSquare, 
  BarChart3, FileText, Bell, BookOpen, Settings,
  Activity, Compass, ShieldAlert, Cpu, ClipboardCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { role } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Command Center', badge: 'Live' },
    { to: '/watersheds', icon: Compass, label: 'Watershed Explorer' },
    { to: '/interventions', icon: Layers, label: 'Asset Registry' },
    { to: '/evidence', icon: Camera, label: 'Evidence Vault', badge: 'EXIF' },
    { to: '/field-visits', icon: ClipboardCheck, label: 'Field Inspections' },
    { to: '/analytics', icon: BarChart3, label: 'Earth Observation' },
    { to: '/outcomes', icon: Activity, label: 'Outcome Scorecards' },
    { to: '/verification', icon: CheckSquare, label: 'Verification Queue', badge: 'Triage' },
    { to: '/alerts', icon: ShieldAlert, label: 'Anomalies & Alerts' },
    { to: '/reports', icon: FileText, label: 'Statutory Reports' },
    { to: '/methodology', icon: BookOpen, label: 'Scientific Method' },
    { to: '/settings', icon: Settings, label: 'System Settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none">
      {/* Navigation Group */}
      <div className="p-3 flex-1 overflow-y-auto space-y-1">
        <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Operational Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-forest-900 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-forest-800 text-emerald-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Program Summary Pill at Sidebar Bottom */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Telemetry Status</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Sentinel-2 MSI & Landsat 8/9 ingestion active. 24 observations cached.
          </p>
        </div>
      </div>
    </aside>
  );
};
