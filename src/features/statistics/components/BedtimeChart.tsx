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

interface BedtimeChartProps {
  data: DailySleepSummary[];
  isDark?: boolean;
}

export const BedtimeChart: React.FC<BedtimeChartProps> = ({ data, isDark = false }) => {
  const chartData = data
    .filter(d => d.bedtimeFormatted !== '--:--')
    .map(d => {
      const parts = d.bedtimeFormatted.split(':');
      const hourDec = parseInt(parts[0]) + parseInt(parts[1]) / 60;
      return {
        label: d.dayLabel,
        timeStr: d.bedtimeFormatted,
        hourDec: Number(hourDec.toFixed(2)),
      };
    });

  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey="label" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis 
            tick={{ fill: textColor, fontSize: 11 }} 
            axisLine={false} 
            tickLine={false} 
            domain={[18, 22]} 
            tickFormatter={(val) => `${Math.floor(val)}h`}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="p-2.5 rounded-xl bg-slate-900/90 text-white text-xs shadow-lg backdrop-blur-xs">
                    <p className="font-bold">{item.label}</p>
                    <p className="text-violet-300 mt-0.5">Dormiu às {item.timeStr}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line 
            type="monotone" 
            dataKey="hourDec" 
            stroke="#a855f7" 
            strokeWidth={2.5} 
            dot={{ r: 4, fill: '#a855f7' }} 
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
