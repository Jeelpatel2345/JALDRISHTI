import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

interface TimeSeriesChartProps {
  data: Array<{
    date?: string;
    month?: string;
    ndvi: number;
    mndwi: number;
    rainfall_mm?: number;
  }>;
  height?: number;
  title?: string;
  showRainfall?: boolean;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  height = 300,
  title = '24-Month Multi-Spectral Index & Rainfall Trajectory',
  showRainfall = true
}) => {
  const chartData = (data || []).map((d) => ({
    ...d,
    date: d.date || d.month || ''
  }));

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
        <span className="text-[11px] font-mono text-slate-500">Sentinel-2 Level-2A (10m)</span>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: '#64748b' }} 
              stroke="#cbd5e1"
            />
            <YAxis 
              yAxisId="left" 
              domain={[-0.3, 0.6]} 
              tick={{ fontSize: 10, fill: '#64748b' }}
              stroke="#cbd5e1"
            />
            {showRainfall && (
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                domain={[0, 250]} 
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                stroke="#cbd5e1"
              />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '0.75rem',
                fontSize: '11px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <ReferenceLine yAxisId="left" y={0} stroke="#94a3b8" strokeDasharray="2 2" />
            
            {showRainfall && (
              <Bar 
                yAxisId="right" 
                dataKey="rainfall_mm" 
                name="Rainfall (mm)" 
                fill="#e0f2fe" 
                radius={[4, 4, 0, 0]}
              />
            )}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ndvi"
              name="NDVI (Vegetation)"
              stroke="#16a34a"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#16a34a' }}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="mndwi"
              name="MNDWI (Water)"
              stroke="#0284c7"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#0284c7' }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Green curve = Vegetative Biomass (NDVI)</span>
        <span>Blue curve = Surface Moisture Persistence (MNDWI)</span>
        <span>Shaded bars = Monthly Precipitation</span>
      </div>
    </div>
  );
};
