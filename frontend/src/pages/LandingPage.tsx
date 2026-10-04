import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle2, ChevronRight, Eye, Sparkles,
  Satellite, Compass, Droplet, ShieldCheck, MapPin
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // Handled silently if autoplay restricted
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-[#0E8A42] selection:text-white">
      {/* Top Government Navigation */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src="/logo.png"
              alt="JALDRISHTI Emblem"
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-sm flex-shrink-0"
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
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/methodology" className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              <span className="hidden md:inline">Methodology & Boundaries</span>
              <span className="md:hidden">Method</span>
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-[#0265D2] text-white text-xs font-semibold hover:bg-sky-700 transition-all shadow-sm"
            >
              <span className="hidden xs:inline">Open Command Center</span>
              <span className="xs:hidden">Enter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Cinematic Dam & Water Background Video */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 overflow-hidden border-b border-slate-800 bg-slate-950 text-white">
        {/* Cinematic Water & Dam Video Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster="/images/real/sardar_sarovar_dam.jpg"
            className="w-full h-full object-cover opacity-65 filter brightness-105 contrast-115 scale-105 transition-opacity duration-1000"
          >
            <source src="/videos/dam_water.mp4" type="video/mp4" />
            <source src="/videos/dam_water.webm" type="video/webm" />
          </video>
          {/* High-Contrast Gradient Overlays crafted for maximum video visibility + text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/85" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-4 sm:mb-6 backdrop-blur-md shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="line-clamp-1">Smart India Hackathon 2026 • Ministry of Rural Development</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                From geo-tagged proof to <span className="text-emerald-400">measurable watershed outcomes</span>.
              </h1>

              <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed font-normal">
                Connect field photographs, Sentinel-2 multi-spectral time series, and CartoDEM terrain context into one auditable, evidence-backed workflow for WDC-PMKSY 2.0.
              </p>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-[#0265D2] text-white text-sm font-semibold hover:bg-sky-500 transition-all shadow-lg hover:shadow-sky-500/25"
                >
                  <span>Launch Live Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/analytics"
                  className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-all backdrop-blur-md shadow-sm"
                >
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Inspect Before vs After Analysis</span>
                </Link>
              </div>
            </div>

            {/* Emblem Feature Spotlight */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative p-3 rounded-3xl bg-slate-900/60 border border-white/20 shadow-2xl backdrop-blur-xl group hover:scale-[1.02] transition-transform max-w-full">
                <img
                  src="/logo.png"
                  alt="JALDRISHTI Project Logo"
                  className="w-56 h-56 xs:w-64 xs:h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                />
                <div className="absolute -bottom-3 inset-x-4 sm:inset-x-8 bg-slate-900/90 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-white/20 shadow-lg text-center">
                  <span className="text-xs font-bold text-white block">JALDRISHTI Emblem</span>
                  <span className="text-[10px] text-slate-300 block line-clamp-1">Satellite Telemetry • Micro-Catchments • Water Infiltration</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3-Step Evidence Chain Interactive Banner */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/70 p-6 shadow-xl relative group hover:border-[#0265D2] transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center font-bold text-sm mb-4">
                01
              </div>
              <h3 className="text-sm font-bold text-white">Ground Evidence & EXIF Hash</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Field photos captured on site with client-verified GNSS coordinates, timestamp, camera model, and cryptographic SHA-256 digest to prevent spoofing.
              </p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/70 p-6 shadow-xl relative group hover:border-emerald-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center font-bold text-sm mb-4">
                02
              </div>
              <h3 className="text-sm font-bold text-white">Earth Observation & Terrain</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                24-month Sentinel-2 Level-2A surface reflectance (NDVI, MNDWI, NDMI) and CartoDEM slope analysis isolate genuine ecological recovery from seasonal rainfall.
              </p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/70 p-6 shadow-xl relative group hover:border-[#0265D2] transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center font-bold text-sm mb-4">
                03
              </div>
              <h3 className="text-sm font-bold text-white">Triage & Statutory Dossier</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Transparent Evidence Readiness Score (0-100) and directional signals convert telemetry into decisive reviewer approvals and MoRD compliance dossiers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Operational Differentiator Section */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Why JALDRISHTI is Not Just Another GIS Map</h2>
            <p className="text-xs text-slate-500 mt-2">
              Addressing the critical operational challenge: turning 1.5 million compliance photographs into verifiable outcome intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0E8A42] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Real Esri Satellite Imagery + DEM Integration</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Toggle between high-resolution true-color aerial satellite photography, topographic contours, and clean carto views with 100m catchment buffer circles.
                  </p>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0E8A42] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Curated Before vs After Multi-Spectral Scenarios</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Analyze side-by-side or draggable split-screen views showing dry baseline riverbeds versus saturated water storage and biomass recovery.
                  </p>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0E8A42] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Automated Exception Triage</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Photographs captured &gt;50 meters from planned coordinates are automatically flagged into the Verification Queue for officer re-inspection.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden">
              <div className="text-xs font-mono text-sky-400 uppercase tracking-wider mb-2">Live Demonstration Evidence Chain</div>
              <h3 className="text-base sm:text-lg font-bold">Masonry Check Dam (WDC-GJ-RJK-CD-014)</h3>
              <p className="text-xs text-slate-300 mt-1">Khirasara Stream • Rajkot District, Gujarat</p>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 my-4 sm:my-5 text-xs">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Photo EXIF Proximity</span>
                  <span className="text-emerald-400 font-bold font-mono">6.2 meters (Valid)</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Canopy Recovery (ΔNDVI)</span>
                  <span className="text-emerald-400 font-bold font-mono">+0.161 Greening</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Water Storage (ΔMNDWI)</span>
                  <span className="text-sky-400 font-bold font-mono">+0.200 Extended</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Readiness Score</span>
                  <span className="text-white font-bold font-mono">88.5 / 100</span>
                </div>
              </div>

              <Link
                to="/interventions"
                className="w-full py-2.5 bg-[#0E8A42] hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <span>View Full Evidence Bundle in Registry</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
            <span className="text-white font-bold tracking-tight">JALDRISHTI</span>
            <span>•</span>
            <span>National Watershed Monitoring & Outcome Assessment Grid</span>
          </div>
          <div>
            Department of Land Resources (DoLR), Ministry of Rural Development, Govt. of India
          </div>
        </div>
      </footer>
    </div>
  );
};
