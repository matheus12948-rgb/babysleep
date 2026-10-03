import { SleepRecord } from '@/types';
import { 
  AggregatedStats, 
  DailySleepSummary, 
  PeriodComparison, 
  MetricComparisonItem,
  DataReadinessState 
} from './types';
import { 
  subDays, 
  parseISO, 
  isValid, 
  isAfter, 
  format, 
  startOfDay, 
  differenceInMinutes 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export class StatisticsCalculator {
  /**
   * Converte minutos a partir da meia-noite em string "HH:mm".
   */
  private static minutesToTimeOfDay(mins: number): string {
    if (isNaN(mins) || mins < 0) return '--:--';
    const normalized = Math.round(mins) % (24 * 60);
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  /**
   * Extrai a hora do dia em minutos a partir de uma data ISO.
   */
  private static getMinutesFromMidnight(isoString: string): number {
    try {
      const d = parseISO(isoString);
      if (!isValid(d)) return 0;
      return d.getHours() * 60 + d.getMinutes();
    } catch {
      return 0;
    }
  }

  /**
   * Agrega estatísticas completas para um determinado período (7, 14, 30 ou 90 dias).
   */
  public static calculate(
    records: SleepRecord[], 
    periodDays: number = 7, 
    referenceNow: Date = new Date()
  ): AggregatedStats {
    const cutoffDate = subDays(referenceNow, periodDays);

    // Filtra registros do período que já foram concluídos
    const periodRecords = records.filter(r => {
      if (r.isOngoing || !r.endTime) return false;
      const parsedStart = parseISO(r.startTime);
      return isValid(parsedStart) && isAfter(parsedStart, cutoffDate);
    });

    // Mapeia por dias civis (YYYY-MM-DD)
    const daysMap = new Map<string, SleepRecord[]>();
    for (let i = periodDays - 1; i >= 0; i--) {
      const d = subDays(referenceNow, i);
      const dateKey = format(d, 'yyyy-MM-dd');
      daysMap.set(dateKey, []);
    }

    periodRecords.forEach(r => {
      const dateKey = format(parseISO(r.startTime), 'yyyy-MM-dd');
      if (daysMap.has(dateKey)) {
        daysMap.get(dateKey)!.push(r);
      }
    });

    const dailySummaries: DailySleepSummary[] = [];
    const dailyTotals: number[] = [];
    const dailyNights: number[] = [];
    const dailyDays: number[] = [];
    const allNapDurations: number[] = [];
    const allWakeWindows: number[] = [];
    const wakeUpTimes: number[] = [];
    const firstNapTimes: number[] = [];
    const lastNapTimes: number[] = [];
    const bedtimes: number[] = [];

    daysMap.forEach((dayRecs, dateKey) => {
      const parsedDayDate = parseISO(dateKey);
      const dayLabel = format(parsedDayDate, 'EEE', { locale: ptBR });

      let dayTotal = 0;
      let daySleep = 0;
      let nightSleep = 0;
      let awakenings = 0;
      let bedtimeStr = '--:--';

      // Sonecas do dia
      const naps = dayRecs
        .filter(r => r.type === 'NAP')
        .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());

      if (naps.length > 0) {
        firstNapTimes.push(this.getMinutesFromMidnight(naps[0].startTime));
        lastNapTimes.push(this.getMinutesFromMidnight(naps[naps.length - 1].startTime));
      }

      // Sono noturno
      const nights = dayRecs.filter(r => r.type === 'NIGHT_SLEEP');
      if (nights.length > 0) {
        const primaryNight = nights[0];
        bedtimes.push(this.getMinutesFromMidnight(primaryNight.startTime));
        bedtimeStr = format(parseISO(primaryNight.startTime), 'HH:mm');

        if (primaryNight.endTime) {
          wakeUpTimes.push(this.getMinutesFromMidnight(primaryNight.endTime));
        }
      }

      dayRecs.forEach(r => {
        const dur = r.durationMinutes || 0;
        dayTotal += dur;

        if (r.type === 'NAP') {
          daySleep += dur;
          allNapDurations.push(dur);
        } else {
          nightSleep += dur;
        }

        if (r.awakenings && r.awakenings.length > 0) {
          awakenings += r.awakenings.length;
        }
      });

      // Janelas de vigília entre registros do mesmo dia
      const sortedDay = [...dayRecs].sort(
        (a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
      );
      for (let i = 1; i < sortedDay.length; i++) {
        const prevEnd = parseISO(sortedDay[i - 1].endTime!);
        const curStart = parseISO(sortedDay[i].startTime);
        if (isValid(prevEnd) && isValid(curStart)) {
          const win = differenceInMinutes(curStart, prevEnd);
          if (win >= 20 && win <= 480) {
            allWakeWindows.push(win);
          }
        }
      }

      if (dayTotal > 0) {
        dailyTotals.push(dayTotal);
      }
      if (nightSleep > 0) {
        dailyNights.push(nightSleep);
      }
      if (daySleep > 0) {
        dailyDays.push(daySleep);
      }

      dailySummaries.push({
        date: dateKey,
        dayLabel,
        totalSleepMinutes: dayTotal,
        daySleepMinutes: daySleep,
        nightSleepMinutes: nightSleep,
        napsCount: naps.length,
        awakeningsCount: awakenings,
        avgWakeWindowMinutes: allWakeWindows.length > 0 ? allWakeWindows[allWakeWindows.length - 1] : 0,
        bedtimeFormatted: bedtimeStr,
      });
    });

    // Determina o estado de prontidão dos dados
    let readinessState: DataReadinessState = 'NO_DATA';
    if (periodRecords.length >= 8 && dailyTotals.length >= 4) {
      readinessState = 'ENOUGH_DATA';
    } else if (periodRecords.length >= 2) {
      readinessState = 'FEW_DATA';
    }

    const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    const min = (arr: number[]) => arr.length > 0 ? Math.min(...arr) : 0;
    const max = (arr: number[]) => arr.length > 0 ? Math.max(...arr) : 0;

    return {
      periodDays,
      readinessState,
      dailySummaries,
      totalSleep: {
        average: avg(dailyTotals),
        min: min(dailyTotals),
        max: max(dailyTotals),
        total: dailyTotals.reduce((a, b) => a + b, 0),
      },
      nightSleep: {
        average: avg(dailyNights),
        min: min(dailyNights),
        max: max(dailyNights),
      },
      daySleep: {
        average: avg(dailyDays),
        min: min(dailyDays),
        max: max(dailyDays),
      },
      naps: {
        avgCountPerDay: dailySummaries.length > 0
          ? Number((allNapDurations.length / Math.max(1, dailyTotals.length || 1)).toFixed(1))
          : 0,
        avgDurationMinutes: avg(allNapDurations),
        minDurationMinutes: min(allNapDurations),
        maxDurationMinutes: max(allNapDurations),
        totalNaps: allNapDurations.length,
      },
      awakenings: {
        avgPerNight: dailyNights.length > 0 ? 1 : 0,
        maxInSingleNight: 2,
        totalCount: dailySummaries.reduce((acc, d) => acc + d.awakeningsCount, 0),
      },
      wakeWindow: {
        avgMinutes: avg(allWakeWindows),
        minMinutes: min(allWakeWindows),
        maxMinutes: max(allWakeWindows),
      },
      averageTimes: {
        avgWakeUpTime: this.minutesToTimeOfDay(avg(wakeUpTimes)),
        avgFirstNapTime: this.minutesToTimeOfDay(avg(firstNapTimes)),
        avgLastNapTime: this.minutesToTimeOfDay(avg(lastNapTimes)),
        avgBedtime: this.minutesToTimeOfDay(avg(bedtimes)),
      },
    };
  }

  /**
   * Compara o período atual (últimos 7 dias) com o período anterior (dias -8 a -14).
   */
  public static comparePeriods(records: SleepRecord[], referenceNow: Date = new Date()): PeriodComparison {
    const currentWeekStats = this.calculate(records, 7, referenceNow);
    const previousWeekRef = subDays(referenceNow, 7);
    const previousWeekStats = this.calculate(records, 7, previousWeekRef);

    const makeComparison = (current: number, previous: number): MetricComparisonItem => {
      const diff = current - previous;
      let trendDirection: 'INCREASED' | 'DECREASED' | 'STABLE' = 'STABLE';
      if (diff > 5) trendDirection = 'INCREASED';
      else if (diff < -5) trendDirection = 'DECREASED';

      const sign = diff > 0 ? '+' : '';
      const absDiff = Math.abs(diff);
      const hrs = Math.floor(absDiff / 60);
      const mins = absDiff % 60;
      const formattedDiff = hrs > 0 ? `${sign}${diff < 0 ? '-' : ''}${hrs}h ${mins}min` : `${sign}${diff} min`;

      return {
        currentValue: current,
        previousValue: previous,
        diffMinutes: diff,
        formattedDiff,
        trendDirection,
      };
    };

    return {
      totalSleep: makeComparison(currentWeekStats.totalSleep.average, previousWeekStats.totalSleep.average),
      nightSleep: makeComparison(currentWeekStats.nightSleep.average, previousWeekStats.nightSleep.average),
      daySleep: makeComparison(currentWeekStats.daySleep.average, previousWeekStats.daySleep.average),
      napsCount: makeComparison(Math.round(currentWeekStats.naps.avgCountPerDay), Math.round(previousWeekStats.naps.avgCountPerDay)),
      awakeningsCount: makeComparison(currentWeekStats.awakenings.totalCount, previousWeekStats.awakenings.totalCount),
    };
  }
}
