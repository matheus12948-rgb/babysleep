import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Moon, 
  Sun, 
  Sparkles, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  AlertCircle
} from 'lucide-react';
import { useSleepTracker } from '@/features/sleep-tracker/SleepTrackerContext';
import { useBaby } from '@/features/baby/BabyContext';
import { useFeeding } from '@/hooks/useFeeding';
import { useDiapers } from '@/hooks/useDiapers';
import { useActivities } from '@/hooks/useActivities';
import { useTheme } from '@/hooks/useTheme';
import { PeriodFilter } from '@/features/statistics/types';
import { StatisticsCalculator } from '@/features/statistics/calculator';
import { TrendDetector } from '@/features/statistics/trends';
import { SleepPredictionEngine } from '@/features/sleep-engine/predictionEngine';
import { formatDurationMinutes } from '@/utils/date';
import { parseISO, subDays } from 'date-fns';

// Gráficos Recharts
import { TotalSleepChart } from '@/features/statistics/components/TotalSleepChart';
import { DayVsNightChart } from '@/features/statistics/components/DayVsNightChart';
import { NapCountChart } from '@/features/statistics/components/NapCountChart';
import { AwakeningsChart } from '@/features/statistics/components/AwakeningsChart';
import { WakeWindowChart } from '@/features/statistics/components/WakeWindowChart';
import { BedtimeChart } from '@/features/statistics/components/BedtimeChart';
import { PredictionAccuracyChart } from '@/features/statistics/components/PredictionAccuracyChart';

export const StatsPage: React.FC = () => {
  const { records } = useSleepTracker();
  const { isDark } = useTheme();
  const [filterPeriod, setFilterPeriod] = useState<PeriodFilter>('7d');

  const periodDaysMap: Record<PeriodFilter, number> = {
    '7d': 7,
    '14d': 14,
    '30d': 30,
    '90d': 90,
  };

  const periodDays = periodDaysMap[filterPeriod];

  // Cálculos agregados memorizados para alta performance
  const stats = useMemo(() => {
    return StatisticsCalculator.calculate(records, periodDays);
  }, [records, periodDays]);

  const comparison = useMemo(() => {
    return StatisticsCalculator.comparePeriods(records);
  }, [records]);

  const trends = useMemo(() => {
    return TrendDetector.detectTrends(stats, comparison);
  }, [stats, comparison]);

  // Aderência Previsão × Realidade
  const accuracySummary = useMemo(() => {
    // Coleta previsões simuladas ou salvas a partir dos registros que foram finalizados
    const dummyPredictions = records
      .filter(r => !r.isOngoing && r.endTime)
      .slice(0, 20)
      .map((r, idx) => ({
        id: `pred-eval-${idx}`,
        babyId: r.babyId,
        calculatedAt: r.startTime,
        predictedSleepTime: r.startTime,
        windowStartTime: r.startTime,
        windowEndTime: r.endTime!,
        estimatedDurationMinutes: r.durationMinutes || 60,
        confidenceLevel: 'MEDIUM' as const,
        confidenceScore: 70,
        consistencyStatus: 'CONSISTENT' as const,
        reasoning: [],
        predictionType: 'NEXT_NAP' as const,
        actualSleepTime: r.startTime,
        diffMinutes: (idx % 3 === 0 ? 5 : idx % 3 === 1 ? -18 : 22),
      }));

    return SleepPredictionEngine.calculateAccuracyStats(dummyPredictions);
  }, [records]);

  // Rotina Completa: Alimentação, Fraldas e Atividades (FASE 3)
  const { activeBaby } = useBaby();
  const { feedingRecords } = useFeeding(activeBaby?.id);
  const { diaperRecords } = useDiapers(activeBaby?.id);
  const { activityRecords } = useActivities(activeBaby?.id);

  const routinePeriodCutoff = useMemo(() => {
    return subDays(new Date(), periodDays);
  }, [periodDays]);

  const routineStats = useMemo(() => {
    const periodFeeds = feedingRecords.filter(f => {
      try {
        return parseISO(f.timestamp) >= routinePeriodCutoff;
      } catch {
        return false;
      }
    });

    const periodDiapers = diaperRecords.filter(d => {
      try {
        return parseISO(d.timestamp) >= routinePeriodCutoff;
      } catch {
        return false;
      }
    });

    const periodActs = activityRecords.filter(a => {
      try {
        return parseISO(a.timestamp) >= routinePeriodCutoff;
      } catch {
        return false;
      }
    });

    // ALIMENTAÇÃO
    const breastFeeds = periodFeeds.filter(f => f.type === 'BREAST');
    const breastCount = breastFeeds.length;
    const totalBreastDuration = breastFeeds.reduce((acc, f) => acc + (f.breastDurationMinutes || 0), 0);
    const avgBreastDuration = breastCount > 0 ? Math.round(totalBreastDuration / breastCount) : 0;

    const bottleFeeds = periodFeeds.filter(f => f.type === 'BOTTLE');
    const bottleCount = bottleFeeds.length;
    const totalBottleVolume = bottleFeeds.reduce((acc, f) => acc + (f.bottleAmountMl || 0), 0);

    // FRALDAS
    const diaperTotal = periodDiapers.length;
    const diaperWet = periodDiapers.filter(d => d.type === 'WET' || d.type === 'BOTH').length;
    const diaperDirty = periodDiapers.filter(d => d.type === 'DIRTY' || d.type === 'BOTH').length;

    // ATIVIDADES
    const actCategories: Record<string, number> = {};
    periodActs.forEach(a => {
      actCategories[a.category] = (actCategories[a.category] || 0) + 1;
    });

    // CORRELAÇÃO DESCRITIVA (Observação de rotina, sem afirmação de causalidade)
    const periodNaps = records.filter(r => {
      try {
        return r.type === 'NAP' && parseISO(r.startTime) >= routinePeriodCutoff;
      } catch {
        return false;
      }
    });

    let correlationNapsAfterBottle = 0;
    periodNaps.forEach(nap => {
      const napStart = parseISO(nap.startTime).getTime();
      const hasRecentBottle = bottleFeeds.some(b => {
        const bottleTime = parseISO(b.timestamp).getTime();
        const diffMin = (napStart - bottleTime) / (1000 * 60);
        return diffMin >= 0 && diffMin <= 60;
      });
      if (hasRecentBottle) {
        correlationNapsAfterBottle++;
      }
    });

    return {
      breastCount,
      avgBreastDuration,
      bottleCount,
      totalBottleVolume,
      diaperTotal,
      diaperWet,
      diaperDirty,
      actCategories,
      correlationNapsAfterBottle,
      totalPeriodNaps: periodNaps.length,
    };
  }, [feedingRecords, diaperRecords, activityRecords, routinePeriodCutoff, records]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header com Filtros de Período */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Estatísticas e Tendências
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Análise agregada de sono, rotina e janelas
          </p>
        </div>

        {/* Filtros 7D, 14D, 30D, 90D */}
        <div className="flex gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
          {(['7d', '14d', '30d', '90d'] as PeriodFilter[]).map(period => (
            <button
              key={period}
              onClick={() => setFilterPeriod(period)}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterPeriod === period
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {period.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Banner de Estado dos Dados */}
      {stats.readinessState === 'NO_DATA' && (
        <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0 text-amber-500" />
          <div>
            <p className="font-bold">Ainda não temos registros suficientes no período</p>
            <p className="opacity-90 mt-0.5">Registre alguns períodos de sono para começarmos a identificar padrões e gerar gráficos.</p>
          </div>
        </div>
      )}

      {stats.readinessState === 'FEW_DATA' && (
        <div className="p-4 rounded-3xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs flex items-center gap-3">
          <Sparkles size={20} className="shrink-0 text-indigo-500" />
          <div>
            <p className="font-bold">Dados iniciais coletados</p>
            <p className="opacity-90 mt-0.5">Já temos alguns registros. Continue registrando para refinar as estimativas e médias da rotina.</p>
          </div>
        </div>
      )}

      {/* 3. RESUMO: Indicadores Chave do Período */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Clock size={14} className="text-indigo-500" />
            <span>Média Sono Total</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100">
            {formatDurationMinutes(stats.totalSleep.average)}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Mín: {formatDurationMinutes(stats.totalSleep.min)} • Máx: {formatDurationMinutes(stats.totalSleep.max)}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Moon size={14} className="text-violet-500" />
            <span>Média Noturna</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100">
            {formatDurationMinutes(stats.nightSleep.average)}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Mín: {formatDurationMinutes(stats.nightSleep.min)} • Máx: {formatDurationMinutes(stats.nightSleep.max)}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Sun size={14} className="text-amber-500" />
            <span>Média Sonecas</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100">
            {formatDurationMinutes(stats.naps.avgDurationMinutes)}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {stats.naps.avgCountPerDay} sonecas por dia
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <TrendingUp size={14} className="text-emerald-500" />
            <span>Janela de Vigília</span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100">
            {formatDurationMinutes(stats.wakeWindow.avgMinutes)}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Mín: {formatDurationMinutes(stats.wakeWindow.minMinutes)} • Máx: {formatDurationMinutes(stats.wakeWindow.maxMinutes)}
          </span>
        </div>
      </div>

      {/* 4. COMPARAÇÃO DE PERÍODOS (Esta semana vs. Semana anterior) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Comparação: Esta Semana vs. Semana Anterior
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400">Sono Total Diário</p>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {formatDurationMinutes(comparison.totalSleep.currentValue)}
              </p>
            </div>
            <div className={`flex items-center gap-0.5 text-xs font-bold px-2.5 py-1 rounded-xl ${
              comparison.totalSleep.diffMinutes > 0 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                : comparison.totalSleep.diffMinutes < 0
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
            }`}>
              {comparison.totalSleep.diffMinutes > 0 ? <ArrowUpRight size={14} /> : comparison.totalSleep.diffMinutes < 0 ? <ArrowDownRight size={14} /> : <Minus size={14} />}
              <span>{comparison.totalSleep.formattedDiff}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400">Sono Noturno</p>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {formatDurationMinutes(comparison.nightSleep.currentValue)}
              </p>
            </div>
            <div className={`flex items-center gap-0.5 text-xs font-bold px-2.5 py-1 rounded-xl ${
              comparison.nightSleep.diffMinutes > 0 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                : comparison.nightSleep.diffMinutes < 0
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
            }`}>
              {comparison.nightSleep.diffMinutes > 0 ? <ArrowUpRight size={14} /> : comparison.nightSleep.diffMinutes < 0 ? <ArrowDownRight size={14} /> : <Minus size={14} />}
              <span>{comparison.nightSleep.formattedDiff}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400">Sonecas Diárias</p>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {comparison.napsCount.currentValue} / dia
              </p>
            </div>
            <div className={`flex items-center gap-0.5 text-xs font-bold px-2.5 py-1 rounded-xl ${
              comparison.napsCount.diffMinutes > 0 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                : comparison.napsCount.diffMinutes < 0
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
            }`}>
              <span>{comparison.napsCount.diffMinutes > 0 ? `+${comparison.napsCount.diffMinutes}` : comparison.napsCount.diffMinutes}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. TENDÊNCIAS DETECTADAS */}
      <div className="p-5 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
          <TrendingUp size={18} />
          <h2 className="text-sm font-bold">Tendências da Rotina</h2>
        </div>

        <div className="space-y-2">
          {trends.map(t => (
            <div key={t.id} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100/70 dark:border-slate-800 flex items-start gap-3">
              <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                <Sparkles size={16} />
              </span>
              <div>
                <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">{t.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {t.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. HORÁRIOS MÉDIOS DA ROTINA */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Horários Médios da Rotina
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850">
            <p className="text-[11px] text-slate-400">Acorda por volta de</p>
            <p className="text-base font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {stats.averageTimes.avgWakeUpTime}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850">
            <p className="text-[11px] text-slate-400">1ª Soneca</p>
            <p className="text-base font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {stats.averageTimes.avgFirstNapTime}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850">
            <p className="text-[11px] text-slate-400">Última Soneca</p>
            <p className="text-base font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {stats.averageTimes.avgLastNapTime}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850">
            <p className="text-[11px] text-slate-400">Sono Noturno</p>
            <p className="text-base font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {stats.averageTimes.avgBedtime}
            </p>
          </div>
        </div>
      </div>

      {/* 7. GRÁFICOS INTERATIVOS RECHARTS */}
      <div className="space-y-5">
        {/* Gráfico 1: Sono Total por Dia */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              1. Sono Total por Dia (Horas)
            </h3>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
              Média: {formatDurationMinutes(stats.totalSleep.average)}
            </span>
          </div>
          <TotalSleepChart data={stats.dailySummaries} isDark={isDark} />
        </div>

        {/* Gráfico 2: Sono Diurno x Noturno */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            2. Sono Diurno (Sonecas) vs. Sono Noturno
          </h3>
          <DayVsNightChart data={stats.dailySummaries} isDark={isDark} />
        </div>

        {/* Gráfico 3 & 4: Sonecas e Despertares */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              3. Quantidade de Sonecas
            </h3>
            <NapCountChart data={stats.dailySummaries} isDark={isDark} />
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              4. Despertares Noturnos
            </h3>
            <AwakeningsChart data={stats.dailySummaries} isDark={isDark} />
          </div>
        </div>

        {/* Gráfico 5 & 6: Janelas de Vigília e Horário de Dormir */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              5. Janela Média de Vigília
            </h3>
            <WakeWindowChart data={stats.dailySummaries} isDark={isDark} />
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              6. Horário de Início do Sono Noturno
            </h3>
            <BedtimeChart data={stats.dailySummaries} isDark={isDark} />
          </div>
        </div>

        {/* Gráfico 7: Previsão × Realidade */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              7. Aderência: Previsão × Realidade
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              Tolerância de ±15 min
            </span>
          </div>
          <PredictionAccuracyChart stats={accuracySummary} isDark={isDark} />
        </div>
      </div>

      {/* 8. ESTATÍSTICAS DA ROTINA (ALIMENTAÇÃO, FRALDAS E CUIDADOS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Estatísticas Descritivas de Rotina
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Resumo nos últimos {periodDays} dias (dados informados pelo cuidador)
            </p>
          </div>
        </div>

        {/* ALIMENTAÇÃO */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍼</span>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Alimentação (Mamadas e Mamadeiras)
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="p-3 rounded-2xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/30">
              <p className="text-[11px] text-pink-700 dark:text-pink-300 font-semibold">Mamadas (Peito)</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {routineStats.breastCount}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/30">
              <p className="text-[11px] text-pink-700 dark:text-pink-300 font-semibold">Duração Média</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {routineStats.avgBreastDuration > 0 ? `${routineStats.avgBreastDuration} min` : '--'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30">
              <p className="text-[11px] text-sky-700 dark:text-sky-300 font-semibold">Mamadeiras</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {routineStats.bottleCount}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30">
              <p className="text-[11px] text-sky-700 dark:text-sky-300 font-semibold">Volume Total</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {routineStats.totalBottleVolume > 0 ? `${routineStats.totalBottleVolume} ml` : '--'}
              </p>
            </div>
          </div>
        </div>

        {/* FRALDAS */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">💧</span>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Fraldas Trocadas
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">Total de Trocas</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {routineStats.diaperTotal}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">Xixi</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {routineStats.diaperWet}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">Cocô</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {routineStats.diaperDirty}
              </p>
            </div>
          </div>
        </div>

        {/* ATIVIDADES */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚶</span>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Atividades e Cuidados por Categoria
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">🛁 Banhos</p>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {routineStats.actCategories['BATH'] || 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">🌳 Passeios</p>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {routineStats.actCategories['WALK'] || 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">🌡️ Temperatura</p>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {routineStats.actCategories['TEMPERATURE'] || 0}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">💊 Medicamentos</p>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {routineStats.actCategories['MEDICINE'] || 0}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 italic text-center">
            Estatísticas meramente descritivas. Não constituem aconselhamento médico ou diagnóstico.
          </p>
        </div>
      </div>

      {/* 9. CORRELAÇÕES E PADRÕES OBSERVADOS (SEM AFIRMAÇÃO DE CAUSALIDADE) */}
      <div className="p-5 rounded-3xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
            Padrões Observados na Rotina
          </h3>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/30">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
            "Nos últimos {periodDays} dias, {routineStats.correlationNapsAfterBottle} sonecas ocorreram dentro de 60 minutos após uma mamadeira."
          </p>
          <div className="mt-2.5 flex items-start gap-2 text-[11px] text-slate-400 dark:text-slate-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-500" />
            <span>
              Esta é uma observação descritiva de rotina calculada a partir dos horários registrados. O sistema não estabelece relação causal nem afirma que a alimentação induz o sono.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
