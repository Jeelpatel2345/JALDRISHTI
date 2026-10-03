import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ChevronRight, Home } from 'lucide-react';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {/* Breadcrumb Header */}
          {location.pathname !== '/' && (
            <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5 capitalize">
                <Link to="/dashboard" className="hover:text-slate-900 flex items-center gap-1">
                  <Home className="w-3.5 h-3.5" />
                  <span>Home</span>
                </Link>
                {pathnames.map((value, index) => {
                  const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                  const isLast = index === pathnames.length - 1;
                  return (
                    <React.Fragment key={to}>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      {isLast ? (
                        <span className="font-semibold text-slate-900">{value.replace('-', ' ')}</span>
                      ) : (
                        <Link to={to} className="hover:text-slate-900">{value.replace('-', ' ')}</Link>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                <span>WDC-PMKSY 2.0 Spatial Intelligence Workbench</span>
                <span>•</span>
                <span>National Geospatial Monitoring Grid</span>
              </div>
            </div>
          )}

          {/* Page Body */}
          <div className="p-6 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
