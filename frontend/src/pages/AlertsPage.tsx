import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, Check, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { Alert } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { useToast } from '../context/ToastContext';

export const AlertsPage: React.FC = () => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getAlerts(false);
      setAlerts(data);
    } catch (err: any) {
      error('Failed to load alerts', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await api.resolveAlert(id);
      success('Alert resolved!');
      loadAlerts();
    } catch (err: any) {
      error('Failed to resolve alert', err.message);
    }
  };

  if (loading) return <LoadingState message="Checking system anomaly alerts..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Anomalies & Operational Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated sensor quality flags, geofence breaches, and post-monsoon ecological stress warnings
          </p>
        </div>

        <button
          onClick={loadAlerts}
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            No active alerts detected. All spatial buffers and telemetry quality gates are passing.
          </div>
        ) : (
          alerts.map((alt) => (
            <div
              key={alt.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${
                  alt.severity === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-200' :
                  alt.severity === 'WARNING' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  'bg-sky-50 text-sky-600 border-sky-200'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900">{alt.title}</h3>
                    <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase ${
                      alt.severity === 'CRITICAL' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {alt.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{alt.message}</p>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Logged: {new Date(alt.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleResolve(alt.id)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 text-slate-600 text-xs font-semibold transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Resolved</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
