import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading geospatial intelligence...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-800 animate-pulse">
        <Loader2 className="w-6 h-6 animate-spin text-forest-900" />
      </div>
      <p className="text-sm font-medium text-slate-700 mt-4">{message}</p>
      <p className="text-xs text-slate-400 mt-1">Connecting to PostGIS and Sentinel-2 telemetry</p>
    </div>
  );
};
