import React from 'react';
import { User as UserIcon, Shield, MapPin, Mail, Award, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, role } = useAuth();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Officer Profile & Jurisdiction
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Government authority credentials and assigned administrative boundary
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-forest-900 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {user?.full_name ? user.full_name.charAt(0) : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.full_name || 'Vikram Mehta'}</h2>
            <p className="text-xs text-slate-500 capitalize">{role.replace('_', ' ')} • DWDU Rajkot</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> WDC-PMKSY 2.0 Authenticated
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-xl space-y-1">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Official Email</span>
            <span className="font-semibold text-slate-900">{user?.email || 'rajkot.officer@jaldrishti.gov.in'}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-1">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Assigned District</span>
            <span className="font-semibold text-slate-900">{user?.district || 'Rajkot'}, {user?.state || 'Gujarat'}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-1">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Operational Role</span>
            <span className="font-semibold text-slate-900 capitalize">{role.replace('_', ' ')}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-1">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Public Key Fingerprint</span>
            <span className="font-mono text-[10px] text-slate-600 block break-all">
              4a8f:c912:77bb:00a1:2026:wdc:pmksy:sec
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
