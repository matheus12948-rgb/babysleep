import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { DailySleepSummary } from '../types';
import { formatDurationMinutes } from '@/utils/date';

interface WakeWindowChartProps {
  data: DailySleepSummary[];
  isDark?: boolean;
}

export const WakeWindowChart: React.FC<WakeWindowChartProps> = ({ data, isDark = false }) => {
  const chartData = data.map(d => ({
    label: d.dayLabel,
    minutes: d.avgWakeWindowMinutes,
    hours: Number((d.avgWakeWindowMinutes / 60).toFixed(1)),
  }));

  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey="label" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} unit="h" />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="p-2.5 rounded-xl bg-slate-900/90 text-white text-xs shadow-lg backdrop-blur-xs">
                    <p className="font-bold">{item.label}</p>
                    <p className="text-amber-300 mt-0.5">
                      Janela média: {formatDurationMinutes(item.minutes)} ({item.hours}h)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line 
            type="monotone" 
            dataKey="hours" 
            stroke="#f59e0b" 
            strokeWidth={2.5} 
            dot={{ r: 4, fill: '#f59e0b' }} 
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
