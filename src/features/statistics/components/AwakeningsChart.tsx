import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { DailySleepSummary } from '../types';

interface AwakeningsChartProps {
  data: DailySleepSummary[];
  isDark?: boolean;
}

export const AwakeningsChart: React.FC<AwakeningsChartProps> = ({ data, isDark = false }) => {
  const chartData = data.map(d => ({
    label: d.dayLabel,
    count: d.awakeningsCount,
  }));

  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey="label" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="p-2.5 rounded-xl bg-slate-900/90 text-white text-xs shadow-lg backdrop-blur-xs">
                    <p className="font-bold">{item.label}</p>
                    <p className="text-rose-300 mt-0.5">{item.count} {item.count === 1 ? 'despertar' : 'despertares'}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
