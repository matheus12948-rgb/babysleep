import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import { PredictionAccuracySummary } from '@/features/sleep-engine/predictionEngine';
import { Sparkles, CheckCircle2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface PredictionAccuracyChartProps {
  stats: PredictionAccuracySummary;
  isDark?: boolean;
}

export const PredictionAccuracyChart: React.FC<PredictionAccuracyChartProps> = ({ stats, isDark = false }) => {
  if (stats.totalEvaluated === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-850 text-center text-xs text-slate-400">
        <Sparkles size={24} className="mx-auto mb-2 text-indigo-400 opacity-60" />
        <p className="font-semibold text-slate-600 dark:text-slate-300">
          Nenhuma previsão avaliada ainda
        </p>
        <p className="mt-1">
          Ao registrar os momentos em que o bebê adormece, o sistema calculará automaticamente a aderência da janela sugerida.
        </p>
      </div>
    );
  }

  const chartData = [
    { name: 'Antecipado', count: stats.earlyCount, percentage: stats.earlyPercentage, color: '#f59e0b' },
    { name: 'Dentro da Janela', count: stats.onTimeCount, percentage: stats.onTimePercentage, color: '#10b981' },
    { name: 'Atrasado', count: stats.lateCount, percentage: stats.latePercentage, color: '#6366f1' },
  ];

  return (
    <div className="space-y-4">
      {/* Indicadores Principais */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 size={13} />
            <span>Na Janela</span>
          </div>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {stats.onTimePercentage}%
          </p>
          <span className="text-[10px] text-emerald-600/70">{stats.onTimeCount} previsões</span>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
            <ArrowDownCircle size={13} />
            <span>Mais Cedo</span>
          </div>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
            {stats.earlyPercentage}%
          </p>
          <span className="text-[10px] text-amber-600/70">{stats.earlyCount} vezes</span>
        </div>

        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
            <ArrowUpCircle size={13} />
            <span>Mais Tarde</span>
          </div>
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
            {stats.latePercentage}%
          </p>
          <span className="text-[10px] text-indigo-600/70">{stats.lateCount} vezes</span>
        </div>
      </div>

      {/* Gráfico de Distribuição */}
      <div className="w-full h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 11 }} 
              axisLine={false} 
              tickLine={false} 
              width={105}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="p-2 rounded-xl bg-slate-900/90 text-white text-xs shadow-lg">
                      <p className="font-bold">{item.name}</p>
                      <p>{item.count} vezes ({item.percentage}%)</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="percentage" radius={[0, 6, 6, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Discrepância média: <strong className="text-slate-800 dark:text-slate-200">{stats.meanAbsoluteErrorMinutes} minutos</strong> de tolerância
        </p>
      </div>
    </div>
  );
};
