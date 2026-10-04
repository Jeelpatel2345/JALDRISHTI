import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, Bell, User as UserIcon, ChevronDown, 
  MapPin, LogOut, CheckCircle, RefreshCw, Menu, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  mobileOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, mobileOpen = false }) => {
  const { user, role, switchRole, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const roles: { id: UserRole; label: string; desc: string }[] = [
    { id: 'district_officer', label: 'District Project Director', desc: 'Full watershed decision and sign-off authority' },
    { id: 'field_surveyor', label: 'Field Surveyor / Mitra', desc: 'On-ground mobile EXIF evidence capture' },
    { id: 'analyst', label: 'Remote Sensing Analyst', desc: 'Multi-spectral sensor analysis and calibration' },
    { id: 'reviewer', label: 'Quality Auditor / Reviewer', desc: 'Independent adjudication and compliance' },
    { id: 'super_admin', label: 'National Administrator', desc: 'Ministry of Rural Development control' }
  ];

  const handleRoleChange = async (newRole: UserRole) => {
    await switchRole(newRole);
    setRoleMenuOpen(false);
    success(`Switched role to ${roles.find(r => r.id === newRole)?.label}`);
  };

  const handleLogout = async () => {
    await logout();
    success('Session Terminated', 'You have been safely signed out of the National Geospatial Grid.');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Official Logo & Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hamburger toggle button for Mobile and Tablet (< lg) */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
          </button>

          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <img
              src="/logo.png"
              alt="JALDRISHTI Emblem"
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-sm group-hover:scale-105 transition-transform flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight flex items-center">
                  <span className="text-[#0265D2]">JAL</span>
                  <span className="text-[#0E8A42]">DRISHTI</span>
                </span>
                <span className="hidden xs:inline-block text-[9px] sm:text-[10px] uppercase font-bold tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                  WDC-PMKSY 2.0
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-slate-500 font-medium leading-none">
                AI + GIS Watershed Intelligence Platform
              </p>
            </div>
          </Link>

          {/* Department Tag */}
          <div className="hidden xl:flex items-center pl-4 border-l border-slate-200 text-xs text-slate-600 font-medium">
            <span>Department of Land Resources (DoLR) • WDC-PMKSY 2.0</span>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-3">
          {/* Active Jurisdiction Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-forest-700" />
            <span>Jurisdiction: <strong>{user?.district || 'Rajkot'}, {user?.state || 'Gujarat'}</strong></span>
          </div>

          {/* Quick Demo Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-900 text-xs font-semibold hover:bg-sky-100 transition-colors"
              title="Click to simulate any operational user persona"
            >
              <Shield className="w-3.5 h-3.5 text-sky-700" />
              <span className="capitalize hidden sm:inline">{role.replace('_', ' ')}</span>
              <span className="capitalize sm:hidden text-[11px]">Role</span>
              <ChevronDown className="w-3 h-3 text-sky-600" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 sm:w-72 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Operational Clearance Role
                </div>
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleRoleChange(r.id)}
                    className={`w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 hover:bg-slate-50 transition-colors ${
                      role === r.id ? 'bg-sky-50/70 border-l-2 border-sky-600 font-semibold' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-900">
                      <span>{r.label}</span>
                      {role === r.id && <CheckCircle className="w-3.5 h-3.5 text-sky-600" />}
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal">{r.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Alerts Link */}
          <Link
            to="/alerts"
            className="relative p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="System Alerts"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
          </Link>

          {/* User Profile & Sign Out */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200">
              <Link to="/profile" className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-xs">
                  {user?.full_name ? user.full_name.charAt(0) : 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">{user?.full_name || 'Officer'}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{role.replace('_', ' ')}</div>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors border border-red-100"
                title="Sign Out of Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 bg-[#0265D2] hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
