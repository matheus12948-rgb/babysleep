import { 
  SleepRecord, 
  SleepPrediction, 
  ConfidenceLevel, 
  DataConsistencyStatus 
} from '@/types';
import { calculateBabyAge, formatDurationMinutes } from '@/utils/date';
import { getReferenceRuleForAge } from './referenceRules';
import { 
  addMinutes, 
  parseISO, 
  isValid, 
  differenceInMinutes, 
  subHours, 
  isAfter, 
  startOfDay, 
  isSameDay 
} from 'date-fns';

export interface PredictionInput {
  babyId: string;
  birthDate: string;
  lastSleepRecord?: SleepRecord | null;
  recentSleepRecords?: SleepRecord[];
  now?: Date;
}

export interface History72hAnalysis {
  windowRecordsCount: number;
  distinctDaysCount: number;
  avgNapDurationMinutes: number;
  avgWakeWindowMinutes: number;
  avgNightSleepMinutes: number;
  totalNightSleepsFound: number;
  hasConsistentNightSleep: boolean;
  consistencyStatus: DataConsistencyStatus;
  consistencyScore: number; // 0 a 100
}

export interface PredictionAccuracySummary {
  totalEvaluated: number;
  onTimeCount: number;
  earlyCount: number;
  lateCount: number;
  onTimePercentage: number;
  earlyPercentage: number;
  latePercentage: number;
  meanAbsoluteErrorMinutes: number;
}

/**
 * SleepPredictionEngine (FASE 2 - Determinístico, Transparente e com Histórico 72h)
 */
export class SleepPredictionEngine {
  /**
   * Analisa a janela móvel de registros das últimas 72 horas.
   */
  public static analyze72hHistory(records: SleepRecord[], referenceNow: Date = new Date()): History72hAnalysis {
    const cutoff72h = subHours(referenceNow, 72);

    // Filtra registros concluídos dentro dos últimos 3 dias
    const valid72h = records.filter(r => {
      if (r.isOngoing || !r.endTime) return false;
      const parsedEnd = parseISO(r.endTime);
      return isValid(parsedEnd) && isAfter(parsedEnd, cutoff72h);
    });

    if (valid72h.length === 0) {
      return {
        windowRecordsCount: 0,
        distinctDaysCount: 0,
        avgNapDurationMinutes: 0,
        avgWakeWindowMinutes: 0,
        avgNightSleepMinutes: 0,
        totalNightSleepsFound: 0,
        hasConsistentNightSleep: false,
        consistencyStatus: 'INSUFFICIENT',
        consistencyScore: 20,
      };
    }

    // Dias distintos com registros
    const uniqueDays = new Set<string>();
    valid72h.forEach(r => {
      uniqueDays.add(startOfDay(parseISO(r.startTime)).toISOString());
    });
    const distinctDaysCount = uniqueDays.size;

    // Sonecas nas 72h
    const naps = valid72h.filter(r => r.type === 'NAP' && r.durationMinutes && r.durationMinutes > 0);
    const avgNapDurationMinutes = naps.length > 0
      ? Math.round(naps.reduce((acc, r) => acc + (r.durationMinutes || 0), 0) / naps.length)
      : 0;

    // Sono noturno nas 72h
    const nights = valid72h.filter(r => r.type === 'NIGHT_SLEEP' && r.durationMinutes && r.durationMinutes > 0);
    const avgNightSleepMinutes = nights.length > 0
      ? Math.round(nights.reduce((acc, r) => acc + (r.durationMinutes || 0), 0) / nights.length)
      : 0;

    // Cálculo das janelas de vigília históricas entre sonos consecutivos
    const sorted = [...valid72h].sort(
      (a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
    );

    const wakeWindows: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const prevEnd = parseISO(sorted[i - 1].endTime!);
      const currentStart = parseISO(sorted[i].startTime);
      if (isValid(prevEnd) && isValid(currentStart)) {
        const diff = differenceInMinutes(currentStart, prevEnd);
        // Janelas plausíveis entre 25min e 480min
        if (diff >= 25 && diff <= 480) {
          wakeWindows.push(diff);
        }
      }
    }

    const avgWakeWindowMinutes = wakeWindows.length > 0
      ? Math.round(wakeWindows.reduce((acc, w) => acc + w, 0) / wakeWindows.length)
      : 0;

    // Pontuação de Consistência dos Dados (dataConsistencyScore)
    let consistencyPoints = 20;
    if (valid72h.length >= 8) consistencyPoints += 35;
    else if (valid72h.length >= 4) consistencyPoints += 25;
    else if (valid72h.length >= 2) consistencyPoints += 15;

    if (distinctDaysCount >= 3) consistencyPoints += 25;
    else if (distinctDaysCount >= 2) consistencyPoints += 15;

    if (nights.length >= 1) consistencyPoints += 25;

    let consistencyStatus: DataConsistencyStatus = 'INSUFFICIENT';
    if (consistencyPoints >= 70) {
      consistencyStatus = 'CONSISTENT';
    } else if (consistencyPoints >= 45) {
      consistencyStatus = 'PARTIAL';
    }

    return {
      windowRecordsCount: valid72h.length,
      distinctDaysCount,
      avgNapDurationMinutes,
      avgWakeWindowMinutes,
      avgNightSleepMinutes,
      totalNightSleepsFound: nights.length,
      hasConsistentNightSleep: nights.length >= 1,
      consistencyStatus,
      consistencyScore: Math.min(100, consistencyPoints),
    };
  }

  /**
   * Calcula a estimativa da próxima janela de sono com ponderação determinística.
   */
  public static calculateNextSleep(input: PredictionInput): SleepPrediction {
    const { babyId, birthDate, lastSleepRecord, recentSleepRecords = [], now = new Date() } = input;
    const age = calculateBabyAge(birthDate);
    const rule = getReferenceRuleForAge(age.weeks);
    const history = this.analyze72hHistory(recentSleepRecords, now);

    const reasoning: string[] = [];

    // 1. Determina o horário de despertar de referência
    let wakeTime: Date = now;
    if (lastSleepRecord && lastSleepRecord.endTime) {
      const parsedEnd = parseISO(lastSleepRecord.endTime);
      if (isValid(parsedEnd)) {
        wakeTime = parsedEnd;
        const minsAgo = Math.max(0, differenceInMinutes(now, wakeTime));
        reasoning.push(`Bebê acordou há ${formatDurationMinutes(minsAgo)}.`);
      }
    } else {
      reasoning.push(`Sem registro de despertar recente — considerando o horário atual.`);
    }

    // 2. Janela Base de Referência Populacional
    const populationWindow = Math.round((rule.minWakeWindowMinutes + rule.maxWakeWindowMinutes) / 2);
    let targetWindow = populationWindow;

    // 3. Ponderação do Histórico de 72h conforme consistência
    if (history.consistencyStatus === 'CONSISTENT' && history.avgWakeWindowMinutes > 0) {
      // 5+ dias / dados consistentes: peso 0.65 individual, 0.35 populacional
      targetWindow = Math.round(history.avgWakeWindowMinutes * 0.65 + populationWindow * 0.35);
      reasoning.push(`Histórico consistente de 72h com vigília média de ${formatDurationMinutes(history.avgWakeWindowMinutes)}.`);
    } else if (history.consistencyStatus === 'PARTIAL' && history.avgWakeWindowMinutes > 0) {
      // 2-3 dias / dados parciais: peso 0.40 individual, 0.60 populacional
      targetWindow = Math.round(history.avgWakeWindowMinutes * 0.40 + populationWindow * 0.60);
      reasoning.push(`Histórico parcial com vigília média recente de ${formatDurationMinutes(history.avgWakeWindowMinutes)}.`);
    } else {
      reasoning.push(`Estimativa inicial orientada por parâmetros de referência para ${age.weeks} semanas.`);
    }

    // 4. Ajuste por duração da última soneca
    if (lastSleepRecord && lastSleepRecord.type === 'NAP' && lastSleepRecord.durationMinutes) {
      if (lastSleepRecord.durationMinutes < 35) {
        // Soneca curta: reduz a próxima janela
        const reduction = Math.round(rule.toleranceMinutes * rule.lastNapWeight);
        targetWindow = Math.max(rule.minWakeWindowMinutes, targetWindow - reduction);
        reasoning.push(`Última soneca foi curta (${lastSleepRecord.durationMinutes} min) — janela seguinte ligeiramente reduzida.`);
      } else if (lastSleepRecord.durationMinutes > 90) {
        // Soneca restauradora longa: janela completa
        reasoning.push(`Última soneca foi ampla e restauradora (${lastSleepRecord.durationMinutes} min).`);
      }
    }

    // 5. Ajuste por quantidade de sonecas e sono acumulado do dia
    const todayRecords = recentSleepRecords.filter(r => {
      const start = parseISO(r.startTime);
      return isValid(start) && isSameDay(start, now);
    });
    const todayNaps = todayRecords.filter(r => r.type === 'NAP');
    if (todayNaps.length >= rule.expectedNaps) {
      reasoning.push(`O bebê já realizou ${todayNaps.length} sonecas hoje — aproximação do horário de sono noturno.`);
    }

    // 6. Delimitação estrita aos limites seguros da regra etária
    targetWindow = Math.max(rule.minWakeWindowMinutes, Math.min(rule.maxWakeWindowMinutes + 30, targetWindow));

    // 7. Horário Previsto e Janela Sugerida
    const predictedDate = addMinutes(wakeTime, targetWindow);
    const windowStart = addMinutes(predictedDate, -rule.toleranceMinutes);
    const windowEnd = addMinutes(predictedDate, rule.toleranceMinutes);

    // 8. Nível e Pontuação de Confiança (0 a 100%)
    let confidenceScore = history.consistencyScore;
    let confidenceLevel: ConfidenceLevel = 'LOW';

    if (history.consistencyStatus === 'CONSISTENT') {
      confidenceScore = Math.min(94, 75 + Math.min(19, history.windowRecordsCount * 2));
      confidenceLevel = 'HIGH';
    } else if (history.consistencyStatus === 'PARTIAL') {
      confidenceScore = Math.min(74, 50 + history.windowRecordsCount * 3);
      confidenceLevel = 'MEDIUM';
    } else {
      confidenceScore = Math.min(48, 30 + history.windowRecordsCount * 3);
      confidenceLevel = 'LOW';
    }

    // Duração estimada da soneca
    const estimatedDuration = history.avgNapDurationMinutes > 0
      ? Math.round(history.avgNapDurationMinutes * 0.7 + (rule.expectedDaySleepMinutes / Math.max(1, rule.expectedNaps)) * 0.3)
      : Math.round(rule.expectedDaySleepMinutes / Math.max(1, rule.expectedNaps));

    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `pred-${Date.now()}`,
      babyId,
      calculatedAt: now.toISOString(),
      predictedSleepTime: predictedDate.toISOString(),
      windowStartTime: windowStart.toISOString(),
      windowEndTime: windowEnd.toISOString(),
      estimatedDurationMinutes: estimatedDuration,
      confidenceLevel,
      confidenceScore,
      consistencyStatus: history.consistencyStatus,
      reasoning,
      predictionType: 'NEXT_NAP',
      modelInputs: {
        ageWeeks: age.weeks,
        populationWindowMinutes: populationWindow,
        targetWindowMinutes: targetWindow,
        history72hCount: history.windowRecordsCount,
        avgNap72h: history.avgNapDurationMinutes,
        avgWake72h: history.avgWakeWindowMinutes,
      },
    };
  }

  /**
   * Avalia a discrepância entre a estimativa e o evento real de sono.
   */
  public static comparePredictionWithReality(
    prediction: SleepPrediction, 
    actualSleepTimeIso: string,
    toleranceMinutes: number = 15
  ): { diffMinutes: number; accuracyCategory: 'ON_TIME' | 'EARLY' | 'LATE' } {
    const predicted = parseISO(prediction.predictedSleepTime);
    const actual = parseISO(actualSleepTimeIso);

    const diffMinutes = differenceInMinutes(actual, predicted);
    
    let accuracyCategory: 'ON_TIME' | 'EARLY' | 'LATE' = 'ON_TIME';
    if (diffMinutes < -toleranceMinutes) {
      accuracyCategory = 'EARLY';
    } else if (diffMinutes > toleranceMinutes) {
      accuracyCategory = 'LATE';
    }

    return { diffMinutes, accuracyCategory };
  }

  /**
   * Calcula estatísticas agregadas de aderência Previsão × Realidade.
   */
  public static calculateAccuracyStats(predictions: SleepPrediction[]): PredictionAccuracySummary {
    const evaluated = predictions.filter(
      p => p.actualSleepTime && typeof p.diffMinutes === 'number'
    );

    if (evaluated.length === 0) {
      return {
        totalEvaluated: 0,
        onTimeCount: 0,
        earlyCount: 0,
        lateCount: 0,
        onTimePercentage: 0,
        earlyPercentage: 0,
        latePercentage: 0,
        meanAbsoluteErrorMinutes: 0,
      };
    }

    let onTime = 0;
    let early = 0;
    let late = 0;
    let totalAbsError = 0;

    evaluated.forEach(p => {
      const diff = p.diffMinutes || 0;
      totalAbsError += Math.abs(diff);

      if (diff < -15) {
        early++;
      } else if (diff > 15) {
        late++;
      } else {
        onTime++;
      }
    });

    const total = evaluated.length;
    return {
      totalEvaluated: total,
      onTimeCount: onTime,
      earlyCount: early,
      lateCount: late,
      onTimePercentage: Math.round((onTime / total) * 100),
      earlyPercentage: Math.round((early / total) * 100),
      latePercentage: Math.round((late / total) * 100),
      meanAbsoluteErrorMinutes: Math.round(totalAbsError / total),
    };
  }
}
