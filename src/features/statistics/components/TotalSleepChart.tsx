import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { DailySleepSummary } from '../types';
import { formatDurationMinutes } from '@/utils/date';

interface TotalSleepChartProps {
  data: DailySleepSummary[];
  isDark?: boolean;
}

export const TotalSleepChart: React.FC<TotalSleepChartProps> = ({ data, isDark = false }) => {
  const chartData = data.map(d => ({
    label: d.dayLabel,
    date: d.date,
    hours: Number((d.totalSleepMinutes / 60).toFixed(1)),
    minutes: d.totalSleepMinutes,
  }));

  const strokeColor = '#6366f1'; // Indigo 500
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="totalSleepGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis 
            dataKey="label" 
            tick={{ fill: textColor, fontSize: 11 }} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            tick={{ fill: textColor, fontSize: 11 }} 
            axisLine={false} 
            tickLine={false} 
            unit="h"
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="p-2.5 rounded-xl bg-slate-900/90 text-white text-xs shadow-lg backdrop-blur-xs">
                    <p className="font-bold">{item.label} ({item.date})</p>
                    <p className="text-indigo-300 mt-0.5">
                      Total: {formatDurationMinutes(item.minutes)} ({item.hours}h)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="hours" 
            stroke={strokeColor} 
            strokeWidth={2.5} 
            fillOpacity={1} 
            fill="url(#totalSleepGrad)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
