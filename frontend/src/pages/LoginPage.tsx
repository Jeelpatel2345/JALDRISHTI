import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, switchRole } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('rajkot.officer@jaldrishti.gov.in');
  const [password, setPassword] = useState('Jaldrishti@2026');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const personas: { role: UserRole; title: string; subtitle: string; email: string }[] = [
    {
      role: 'district_officer',
      title: 'District Project Director',
      subtitle: 'Rajkot DWDU • Full approval & sign-off authority',
      email: 'rajkot.officer@jaldrishti.gov.in'
    },
    {
      role: 'field_surveyor',
      title: 'Field Surveyor / Mitra',
      subtitle: 'On-ground mobile GNSS capture & EXIF validation',
      email: 'field.surveyor@jaldrishti.gov.in'
    },
    {
      role: 'analyst',
      title: 'Remote Sensing Analyst',
      subtitle: 'SRSAC Scientist • Multi-spectral index calibration',
      email: 'analyst@jaldrishti.gov.in'
    },
    {
      role: 'reviewer',
      title: 'Independent Quality Auditor',
      subtitle: 'Third-party M&E • Triage exception queue',
      email: 'auditor@jaldrishti.gov.in'
    }
  ];

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      error('Login failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateRole = async (role: UserRole) => {
    await switchRole(role);
    success(`Simulating as ${role.replace('_', ' ')}!`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <img
          src="/logo.png"
          alt="JALDRISHTI Emblem"
          className="w-20 h-20 object-contain mx-auto drop-shadow-md"
        />
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-1">
            <span className="text-[#0265D2]">JAL</span>
            <span className="text-[#0E8A42]">DRISHTI</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            WDC-PMKSY 2.0 AI + GIS Watershed Intelligence Platform
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl space-y-6">
        {/* 1-Click Persona Simulator Grid (Flagship feature for hackathon evaluators) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#0265D2]" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1-Click Evaluation Persona Simulator (SIH 2026)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Select any operational role below to enter the platform instantly with appropriate permissions:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {personas.map((p) => (
              <button
                key={p.role}
                onClick={() => handleSimulateRole(p.role)}
                className="text-left p-3.5 rounded-xl border border-slate-200 hover:border-[#0265D2] hover:bg-sky-50/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <span className="font-bold text-xs text-slate-900 group-hover:text-[#0265D2] block">
                    {p.title}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                    {p.subtitle}
                  </span>
                </div>
                <span className="text-[10px] text-[#0265D2] font-semibold flex items-center gap-1 mt-3">
                  <span>Enter as {p.role.split('_')[0]}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Credentials Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Standard Credential Authentication
          </h3>

          <form onSubmit={handleStandardLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#0265D2] text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In with Credentials'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
