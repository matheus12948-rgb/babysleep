import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { DailySleepSummary } from '../types';
import { formatDurationMinutes } from '@/utils/date';

interface DayVsNightChartProps {
  data: DailySleepSummary[];
  isDark?: boolean;
}

export const DayVsNightChart: React.FC<DayVsNightChartProps> = ({ data, isDark = false }) => {
  const chartData = data.map(d => ({
    label: d.dayLabel,
    nightHours: Number((d.nightSleepMinutes / 60).toFixed(1)),
    dayHours: Number((d.daySleepMinutes / 60).toFixed(1)),
    nightMinutes: d.nightSleepMinutes,
    dayMinutes: d.daySleepMinutes,
  }));

  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <div className="p-2.5 rounded-xl bg-slate-900/90 text-white text-xs shadow-lg backdrop-blur-xs space-y-1">
                    <p className="font-bold">{item.label}</p>
                    <p className="text-violet-300">
                      🌙 Noturno: {formatDurationMinutes(item.nightMinutes)}
                    </p>
                    <p className="text-amber-300">
                      ☀️ Diurno: {formatDurationMinutes(item.dayMinutes)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
            formatter={(val) => val === 'nightHours' ? 'Sono Noturno' : 'Sonecas (Dia)'}
          />
          <Bar dataKey="nightHours" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} />
          <Bar dataKey="dayHours" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
