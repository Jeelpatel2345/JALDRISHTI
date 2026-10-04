import React, { useState } from 'react';
import { Outlet, useLocation, Link, NavLink } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { 
  ChevronRight, Home, LayoutDashboard, Compass, Layers, Camera, Menu
} from 'lucide-react';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const bottomNavItems = [
    { to: '/dashboard', label: 'Command', icon: LayoutDashboard },
    { to: '/watersheds', label: 'Watersheds', icon: Compass },
    { to: '/interventions', label: 'Assets', icon: Layers },
    { to: '/evidence', label: 'Evidence', icon: Camera },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar 
        onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)} 
        mobileOpen={mobileMenuOpen} 
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          mobileOpen={mobileMenuOpen} 
          onCloseMobile={() => setMobileMenuOpen(false)} 
        />

        <main className="flex-1 overflow-y-auto">
          {/* Breadcrumb Header */}
          {location.pathname !== '/' && (
            <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between text-xs text-slate-500 overflow-x-auto">
              <div className="flex items-center gap-1.5 capitalize whitespace-nowrap">
                <Link to="/dashboard" className="hover:text-slate-900 flex items-center gap-1">
                  <Home className="w-3.5 h-3.5" />
                  <span>Home</span>
                </Link>
                {pathnames.map((value, index) => {
                  const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                  const isLast = index === pathnames.length - 1;
                  return (
                    <React.Fragment key={to}>
                      <ChevronRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      {isLast ? (
                        <span className="font-semibold text-slate-900">{value.replace('-', ' ')}</span>
                      ) : (
                        <Link to={to} className="hover:text-slate-900">{value.replace('-', ' ')}</Link>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 font-medium whitespace-nowrap pl-4">
                <span>WDC-PMKSY 2.0 Spatial Intelligence Workbench</span>
                <span>•</span>
                <span>National Geospatial Monitoring Grid</span>
              </div>
            </div>
          )}

          {/* Page Body with responsive padding (and extra bottom padding on mobile for thumb navigation) */}
          <div className="p-3 sm:p-5 lg:p-6 pb-20 sm:pb-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* 
        Native Mobile Bottom Navigation Bar (Shown only on small screens < md)
        Enables 1-thumb immediate navigation for surveyors and field officers on phones
      */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1 shadow-lg flex items-center justify-around">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-[#0265D2] font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#0265D2]' : 'text-slate-400'}`} />
              <span className="text-[10px] mt-0.5 leading-none">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 hover:text-slate-900 transition-all"
        >
          <Menu className="w-5 h-5 text-slate-400" />
          <span className="text-[10px] mt-0.5 leading-none">More</span>
        </button>
      </nav>
    </div>
  );
};
