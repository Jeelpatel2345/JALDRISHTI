import React, { useState } from 'react';
import { SlidersHorizontal, ArrowLeftRight, Eye, Layers } from 'lucide-react';

interface SplitMapSwipeProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  height?: string;
  beforeTag?: string;
  afterTag?: string;
}

export const SplitMapSwipe: React.FC<SplitMapSwipeProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Pre-Intervention Baseline (October 2021)',
  afterLabel = 'Post-Intervention Outcome (October 2023)',
  height = '460px',
  beforeTag = 'BASELINE (OCT 2021)',
  afterTag = 'OUTCOME (OCT 2023)'
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number, currentTarget: HTMLElement) => {
    const rect = currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  return (
    <div className="space-y-3 select-none">
      {/* Top Labels */}
      <div className="flex items-center justify-between text-xs text-slate-700 px-1 font-semibold">
        <span className="flex items-center gap-1.5 text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-600" />
          <span>{beforeLabel}</span>
        </span>

        <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-normal">
          <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400 animate-pulse" /> Drag slider to analyze watershed change
        </span>

        <span className="flex items-center gap-1.5 text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span>{afterLabel}</span>
        </span>
      </div>

      {/* Interactive Swipe Canvas */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-slate-300 shadow-lg cursor-ew-resize group"
        style={{ height }}
        onMouseMove={(e) => handleMove(e.clientX, e.currentTarget)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX, e.currentTarget)}
      >
        {/* AFTER Image (Full background) */}
        <img
          src={afterImage}
          alt="Post intervention outcome"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* BEFORE Image (Clipped by slider position) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={beforeImage}
            alt="Pre intervention baseline"
            className="absolute inset-0 w-full h-full object-cover filter brightness-95"
            style={{ width: '100%', minWidth: '100%' }}
          />
        </div>

        {/* High-Contrast Divider Line with Handle */}
        <div
          className="absolute inset-y-0 w-1 bg-white shadow-2xl pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#0265D2] text-white flex items-center justify-center shadow-2xl border-2 border-white ring-4 ring-black/10">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
        </div>

        {/* Floating Corner Badges */}
        <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[11px] font-mono font-bold tracking-wider pointer-events-none shadow-md border border-white/20">
          BEFORE: {beforeTag}
        </div>
        <div className="absolute top-4 right-4 bg-[#0E8A42]/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[11px] font-mono font-bold tracking-wider pointer-events-none shadow-md border border-white/20">
          AFTER: {afterTag}
        </div>

        <div className="absolute bottom-4 inset-x-4 flex justify-between pointer-events-none text-[10px] text-white/90">
          <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg">Dry Stream Bed • Zero Storage</span>
          <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg">Check Dam Weir • Saturated Water Storage</span>
        </div>
      </div>
    </div>
  );
};
