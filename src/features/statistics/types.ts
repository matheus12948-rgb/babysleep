// ========================================================
// BabySleep - Tipos do Módulo de Estatísticas (FASE 2)
// ========================================================

export type PeriodFilter = '7d' | '14d' | '30d' | '90d';

export type DataReadinessState = 'NO_DATA' | 'FEW_DATA' | 'ENOUGH_DATA';

export interface DailySleepSummary {
  date: string; // YYYY-MM-DD
  dayLabel: string; // "Seg", "Ter", etc.
  totalSleepMinutes: number;
  daySleepMinutes: number;
  nightSleepMinutes: number;
  napsCount: number;
  awakeningsCount: number;
  avgWakeWindowMinutes: number;
  bedtimeFormatted: string;
}

export interface MetricSummary {
  average: number;
  min: number;
  max: number;
  total?: number;
}

export interface AverageTimeSummary {
  avgWakeUpTime: string;      // HH:mm
  avgFirstNapTime: string;    // HH:mm
  avgLastNapTime: string;     // HH:mm
  avgBedtime: string;         // HH:mm
}

export interface AggregatedStats {
  periodDays: number;
  readinessState: DataReadinessState;
  dailySummaries: DailySleepSummary[];

  // 1. Sono Total
  totalSleep: MetricSummary;

  // 2. Sono Noturno
  nightSleep: MetricSummary;

  // 3. Sono Diurno
  daySleep: MetricSummary;

  // 4. Sonecas
  naps: {
    avgCountPerDay: number;
    avgDurationMinutes: number;
    minDurationMinutes: number;
    maxDurationMinutes: number;
    totalNaps: number;
  };

  // 5. Despertares
  awakenings: {
    avgPerNight: number;
    maxInSingleNight: number;
    totalCount: number;
  };

  // 6. Janela de Vigília
  wakeWindow: {
    avgMinutes: number;
    minMinutes: number;
    maxMinutes: number;
  };

  // 7. Horários Médios
  averageTimes: AverageTimeSummary;
}

export interface MetricComparisonItem {
  currentValue: number;
  previousValue: number;
  diffMinutes: number;
  formattedDiff: string;
  trendDirection: 'INCREASED' | 'DECREASED' | 'STABLE';
}

export interface PeriodComparison {
  totalSleep: MetricComparisonItem;
  nightSleep: MetricComparisonItem;
  daySleep: MetricComparisonItem;
  napsCount: MetricComparisonItem;
  awakeningsCount: MetricComparisonItem;
}

export interface TrendInsight {
  id: string;
  category: 'SLEEP' | 'NAPS' | 'BEDTIME' | 'WAKE_WINDOW';
  title: string;
  description: string;
  direction: 'UP' | 'DOWN' | 'NEUTRAL';
}
