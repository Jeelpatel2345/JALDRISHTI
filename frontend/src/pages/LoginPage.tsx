import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Shield, ArrowRight, Lock, Mail, User as UserIcon, MapPin, 
  Eye, EyeOff, Database, CheckCircle, AlertTriangle, KeyRound, Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, register, switchRole, isSupabaseLive } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const [activeTab, setActiveTab] = useState<'signin' | 'register' | 'personas'>('signin');

  // Sign In Form States
  const [email, setEmail] = useState('rajkot.officer@jaldrishti.gov.in');
  const [password, setPassword] = useState('Jaldrishti@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration Form States
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('district_officer');
  const [regState, setRegState] = useState('Maharashtra');
  const [regDistrict, setRegDistrict] = useState('Ahmednagar');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const personas: { role: UserRole; title: string; subtitle: string; email: string; location: string }[] = [
    {
      role: 'district_officer',
      title: 'District Project Director',
      subtitle: 'Rajkot DWDU • Full approval & statutory sign-off authority',
      email: 'rajkot.officer@jaldrishti.gov.in',
      location: 'Rajkot, Gujarat'
    },
    {
      role: 'field_surveyor',
      title: 'Field Surveyor / Mitra',
      subtitle: 'On-ground mobile GNSS capture & EXIF photo validation',
      email: 'field.surveyor@jaldrishti.gov.in',
      location: 'Ahmednagar, Maharashtra'
    },
    {
      role: 'analyst',
      title: 'Remote Sensing Analyst',
      subtitle: 'SRSAC Scientist • Multi-spectral Sentinel-2 index calibration',
      email: 'analyst@jaldrishti.gov.in',
      location: 'ISRO / State Remote Sensing'
    },
    {
      role: 'reviewer',
      title: 'Independent Quality Auditor',
      subtitle: 'Third-party M&E • Geospatial exception triage queue',
      email: 'auditor@jaldrishti.gov.in',
      location: 'National M&E Cell'
    }
  ];

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      success('Access Granted', 'Terminal authenticated successfully. Redirecting to workspace...');
      navigate(from, { replace: true });
    } catch (err: any) {
      error('Access Denied', err.message || 'Invalid credentials or expired session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      error('Password Mismatch', 'Password and confirmation do not match.');
      return;
    }
    if (regPassword.length < 6) {
      error('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        fullName: regFullName,
        email: regEmail,
        role: regRole,
        district: regDistrict,
        state: regState,
        password: regPassword
      });
      success('Officer Registered', 'Account created and cleared for geospatial access.');
      navigate(from, { replace: true });
    } catch (err: any) {
      error('Registration Failed', err.message || 'Unable to register user profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateRole = async (role: UserRole) => {
    await switchRole(role);
    success('Session Initialized', `Authenticated with ${role.replace('_', ' ').toUpperCase()} clearance.`);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-900/95 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand & Emblem Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="relative inline-block">
          <img
            src="/logo.png"
            alt="JALDRISHTI Emblem"
            className="w-20 h-20 object-contain mx-auto drop-shadow-[0_10px_20px_rgba(2,101,210,0.3)] animate-fade-in"
          />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
            <span className="text-[#38bdf8]">JAL</span>
            <span className="text-[#4ade80]">DRISHTI</span>
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Department of Land Resources (DoLR) • WDC-PMKSY 2.0
          </p>
          <p className="text-[11px] text-slate-400">
            National Geospatial Watershed Intelligence & Evidence Grid
          </p>
        </div>

        {/* Database Status Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
          <Database className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>Storage Engine:</span>
          {isSupabaseLive ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Supabase Cloud (Live)
            </span>
          ) : (
            <span className="text-sky-300 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Local Encrypted Terminal
            </span>
          )}
        </div>
      </div>

      {/* Main Container Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-3.5 text-center transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'signin'
                  ? 'bg-white text-[#0265D2] border-b-2 border-[#0265D2]'
                  : 'hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Officer Sign In</span>
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3.5 text-center transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-white text-[#0265D2] border-b-2 border-[#0265D2]'
                  : 'hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Register Clearance</span>
            </button>
            <button
              onClick={() => setActiveTab('personas')}
              className={`flex-1 py-3.5 text-center transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'personas'
                  ? 'bg-white text-[#0265D2] border-b-2 border-[#0265D2]'
                  : 'hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Fast Access</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* TAB 1: STANDARD SIGN IN */}
            {activeTab === 'signin' && (
              <form onSubmit={handleStandardLogin} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Official Gov / Department Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer.name@jaldrishti.gov.in"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0265D2] transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700">Password</label>
                    <span className="text-[11px] text-[#0265D2] font-semibold cursor-pointer hover:underline">
                      NIC Single Sign-On
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0265D2] transition-colors font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberTerminal}
                      onChange={(e) => setRememberTerminal(e.target.checked)}
                      className="rounded text-[#0265D2] focus:ring-[#0265D2]"
                    />
                    <span>Remember terminal authentication</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 bg-[#0265D2] hover:bg-sky-700 text-white rounded-xl font-bold transition-all shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 text-sm disabled:opacity-70"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isSubmitting ? 'Authenticating Terminal...' : 'Sign In to Protected Portal'}</span>
                </button>
              </form>
            )}

            {/* TAB 2: OFFICER REGISTRATION */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegistration} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Official Name</label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="officer@jaldrishti.gov.in"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assigned Role</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                    >
                      <option value="district_officer">District Project Director</option>
                      <option value="field_surveyor">Field Surveyor / Mitra</option>
                      <option value="analyst">Remote Sensing Analyst</option>
                      <option value="reviewer">Independent Auditor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">State & District</label>
                    <input
                      type="text"
                      value={`${regDistrict}, ${regState}`}
                      onChange={(e) => {
                        const parts = e.target.value.split(',');
                        setRegDistrict(parts[0]?.trim() || '');
                        if (parts[1]) setRegState(parts[1]?.trim());
                      }}
                      placeholder="Ahmednagar, Maharashtra"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Create Password</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 bg-[#0E8A42] hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 text-sm disabled:opacity-70"
                >
                  <Building2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registering...' : 'Create Secured Account'}</span>
                </button>
              </form>
            )}

            {/* TAB 3: FAST EVALUATOR ACCESS */}
            {activeTab === 'personas' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Select any pre-authorized operational persona below to immediately access the workspace:
                </p>

                <div className="space-y-2.5">
                  {personas.map((p) => (
                    <button
                      key={p.role}
                      type="button"
                      onClick={() => handleSimulateRole(p.role)}
                      className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-[#0265D2] hover:bg-sky-50/50 transition-all group flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-xs text-slate-900 group-hover:text-[#0265D2] block">
                          {p.title}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {p.subtitle}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#0E8A42]" />
                          <span>{p.location}</span>
                        </span>
                      </div>
                      <span className="p-2 rounded-xl bg-slate-100 group-hover:bg-[#0265D2] group-hover:text-white text-slate-600 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Security Advisory Warning Footer */}
          <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 text-[10px] text-slate-500 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>
              <strong>Restricted Access:</strong> All sessions, coordinates, and tamper audits are encrypted and monitored under Government IT security compliance standards.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
