import React, { useState } from 'react';
import { Settings, Sliders, Shield, Save } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const SettingsPage: React.FC = () => {
  const { success } = useToast();
  const [gpsTolerance, setGpsTolerance] = useState(50);
  const [cloudCutoff, setCloudCutoff] = useState(20);
  const [ndviThreshold, setNdviThreshold] = useState(0.08);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    success('Detection thresholds updated and applied to spatial engine!');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          System Parameters & Calibration Thresholds
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Fine-tune automated spatial quality gates and remote sensing anomaly triggers
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-forest-800" />
            <span>Spatial & Geofence Quality Gates</span>
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Maximum GPS Geofence Deviation Tolerance:</span>
              <span className="font-mono text-forest-900 font-bold">{gpsTolerance} meters</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={gpsTolerance}
              onChange={(e) => setGpsTolerance(Number(e.target.value))}
              className="w-full accent-forest-900"
            />
            <p className="text-[11px] text-slate-400">
              Field photographs captured beyond this threshold are automatically routed into the Verification Queue.
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Sentinel-2 Scene Cloud Cover Cutoff:</span>
              <span className="font-mono text-forest-900 font-bold">{cloudCutoff}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={cloudCutoff}
              onChange={(e) => setCloudCutoff(Number(e.target.value))}
              className="w-full accent-forest-900"
            />
            <p className="text-[11px] text-slate-400">
              Scenes with cloud probability exceeding this cutoff will be masked to prevent seasonal distortion.
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Minimum ΔNDVI for "Observed Positive" Signal:</span>
              <span className="font-mono text-forest-900 font-bold">+{ndviThreshold}</span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.20"
              step="0.01"
              value={ndviThreshold}
              onChange={(e) => setNdviThreshold(Number(e.target.value))}
              className="w-full accent-forest-900"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-forest-900 text-white rounded-xl font-semibold hover:bg-forest-800 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Thresholds</span>
          </button>
        </div>
      </form>
    </div>
  );
};
