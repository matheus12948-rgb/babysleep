/**
 * BabySleep - Testes Automatizados de Validação Técnica da FASE 2
 */

import { SleepPredictionEngine } from '../src/features/sleep-engine/predictionEngine';
import { StatisticsCalculator } from '../src/features/statistics/calculator';
import { TrendDetector } from '../src/features/statistics/trends';
import { NotificationSettingsService } from '../src/features/notifications/notificationSettings';
import { SleepRecord, SleepPrediction } from '../src/types';
import { subDays, subHours, addMinutes, parseISO, isValid, format } from 'date-fns';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails: string[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    const msg = `  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`;
    console.error(msg);
    failureDetails.push(msg);
  }
}

console.log('\n======================================================');
console.log('  INICIANDO BATERIA DE TESTES TÉCNICOS — FASE 2');
console.log('======================================================\n');

// -----------------------------------------------------------
// TESTE 1: Histórico 72h e Pontuação de Consistência
// -----------------------------------------------------------
console.log('--- TESTE 1: Histórico 72h e Consistência de Dados ---');
{
  const refNow = new Date('2026-10-03T15:00:00Z');

  // Cenário 1: Zero registros
  const emptyAnalysis = SleepPredictionEngine.analyze72hHistory([], refNow);
  assert(emptyAnalysis.windowRecordsCount === 0, 'Zero registros detectados em histórico vazio');
  assert(emptyAnalysis.consistencyStatus === 'INSUFFICIENT', 'Status INSUFFICIENT para histórico vazio');
  assert(emptyAnalysis.consistencyScore <= 30, 'Score baixo para sem dados');

  // Cenário 2: Histórico robusto de 72h (8 registros em 3 dias com sono noturno)
  const mock72hRecords: SleepRecord[] = [
    // Dia 1 (anteontem)
    { id: '1', babyId: 'b1', type: 'NIGHT_SLEEP', startTime: '2026-10-01T20:00:00Z', endTime: '2026-10-02T06:30:00Z', durationMinutes: 630, isOngoing: false, isManuallyAdded: false, createdAt: '', updatedAt: '' },
    { id: '2', babyId: 'b1', type: 'NAP', startTime: '2026-10-02T08:30:00Z', endTime: '2026-10-02T09:30:00Z', durationMinutes: 60, isOngoing: false, isManuallyAdded: false, createdAt: '', updatedAt: '' },
    { id: '3', babyId: 'b1', type: 'NAP', startTime: '2026-10-02T12:00:00Z', endTime: '2026-10-02T13:15:00Z', durationMinutes: 75, isOngoing: false, isManuallyAdded: false, createdAt: '', updatedAt: '' },
    // Dia 2 (ontem)
    { id: '4', babyId: 'b1', type: 'NIGHT_SLEEP', startTime: '2026-10-02T20:00:00Z', endTime: '2026-10-03T06:30:00Z', durationMinutes: 630, isOngoing: false, isManuallyAdded: false, createdAt: '', updatedAt: '' },
    { id: '5', babyId: 'b1', type: 'NAP', startTime: '2026-10-03T08:45:00Z', endTime: '2026-10-03T09:45:00Z', durationMinutes: 60, isOngoing: false, isManuallyAdded: false, createdAt: '', updatedAt: '' },
    { id: '6', babyId: 'b1', type: 'NAP', startTime: '2026-10-03T12:15:00Z', endTime: '2026-10-03T13:30:00Z', durationMinutes: 75, isOngoing: false, isManuallyAdded: false, createdAt: '', updatedAt: '' },
  ];

  const robustAnalysis = SleepPredictionEngine.analyze72hHistory(mock72hRecords, refNow);
  assert(robustAnalysis.windowRecordsCount === 6, 'Detectou os 6 registros dentro de 72h');
  assert(robustAnalysis.distinctDaysCount >= 2, 'Detectou múltiplos dias com dados');
  assert(robustAnalysis.avgNapDurationMinutes > 0, 'Calculou média de duração de soneca');
  assert(robustAnalysis.avgWakeWindowMinutes > 0, 'Calculou média de janelas de vigília históricas');
  assert(robustAnalysis.hasConsistentNightSleep === true, 'Identificou registro de sono noturno');
  assert(robustAnalysis.consistencyStatus === 'CONSISTENT' || robustAnalysis.consistencyStatus === 'PARTIAL', 'Status de consistência elevado');
}

// -----------------------------------------------------------
// TESTE 2: SleepPredictionEngine Ponderado e Reasoning
// -----------------------------------------------------------
console.log('\n--- TESTE 2: SleepPredictionEngine (Ponderação e Reasoning) ---');
{
  const birthDate = format(subDays(new Date(), 100), 'yyyy-MM-dd'); // ~14 semanas (3-4 meses)

  // 2.1 Bebê sem histórico
  const predNoHistory = SleepPredictionEngine.calculateNextSleep({
    babyId: 'baby-0',
    birthDate,
  });

  assert(Boolean(predNoHistory.predictedSleepTime), 'Previsão gerada para recém-cadastrado');
  assert(predNoHistory.confidenceLevel === 'LOW', 'Confiança LOW para recém-cadastrado');
  assert(predNoHistory.confidenceScore < 50, 'ConfidenceScore proporcionalmente baixo');
  assert(predNoHistory.reasoning.length > 0, 'Possui justificativas descritivas (reasoning)');
  assert(!isNaN(predNoHistory.estimatedDurationMinutes), 'estimatedDurationMinutes não é NaN');

  // 2.2 Soneca curta (<35 min) reduz janela subsequente
  const lastShortNap: SleepRecord = {
    id: 'snap-1',
    babyId: 'baby-0',
    type: 'NAP',
    startTime: '2026-10-03T11:00:00Z',
    endTime: '2026-10-03T11:20:00Z',
    durationMinutes: 20, // Curta
    isOngoing: false,
    isManuallyAdded: false,
    createdAt: '',
    updatedAt: '',
  };

  const predAfterShort = SleepPredictionEngine.calculateNextSleep({
    babyId: 'baby-0',
    birthDate,
    lastSleepRecord: lastShortNap,
    now: new Date('2026-10-03T11:30:00Z'),
  });

  assert(
    predAfterShort.reasoning.some(r => r.includes('curta') || r.includes('reduzida')),
    'Reasoning registra adequadamente a compensação por soneca curta'
  );

  // 2.3 Horários limítrofes (23:50 e 00:10 / virada de data em GMT-3)
  const midnightSleep: SleepRecord = {
    id: 'mid-1',
    babyId: 'baby-0',
    type: 'NAP',
    startTime: '2026-10-02T23:50:00-03:00',
    endTime: '2026-10-03T00:35:00-03:00',
    durationMinutes: 45,
    isOngoing: false,
    isManuallyAdded: false,
    createdAt: '',
    updatedAt: '',
  };

  const predMidnight = SleepPredictionEngine.calculateNextSleep({
    babyId: 'baby-0',
    birthDate,
    lastSleepRecord: midnightSleep,
    now: parseISO('2026-10-03T00:40:00-03:00'),
  });

  assert(isValid(parseISO(predMidnight.predictedSleepTime)), 'Previsão após 00:00 é data válida');
  assert(!isNaN(predMidnight.estimatedDurationMinutes), 'Minutos válidos na virada de data');
}

// -----------------------------------------------------------
// TESTE 3: Estatísticas de Aderência Previsão × Realidade
// -----------------------------------------------------------
console.log('\n--- TESTE 3: Aderência Previsão × Realidade ---');
{
  const mockPredictions: SleepPrediction[] = [
    {
      id: 'p1', babyId: 'b1', calculatedAt: '', predictedSleepTime: '2026-10-03T14:00:00Z',
      windowStartTime: '', windowEndTime: '', estimatedDurationMinutes: 60, confidenceLevel: 'HIGH',
      confidenceScore: 85, consistencyStatus: 'CONSISTENT', reasoning: [], predictionType: 'NEXT_NAP',
      actualSleepTime: '2026-10-03T14:08:00Z', diffMinutes: 8,
    },
    {
      id: 'p2', babyId: 'b1', calculatedAt: '', predictedSleepTime: '2026-10-03T17:00:00Z',
      windowStartTime: '', windowEndTime: '', estimatedDurationMinutes: 60, confidenceLevel: 'HIGH',
      confidenceScore: 85, consistencyStatus: 'CONSISTENT', reasoning: [], predictionType: 'NEXT_NAP',
      actualSleepTime: '2026-10-03T16:30:00Z', diffMinutes: -30,
    },
    {
      id: 'p3', babyId: 'b1', calculatedAt: '', predictedSleepTime: '2026-10-03T19:30:00Z',
      windowStartTime: '', windowEndTime: '', estimatedDurationMinutes: 600, confidenceLevel: 'HIGH',
      confidenceScore: 85, consistencyStatus: 'CONSISTENT', reasoning: [], predictionType: 'BEDTIME',
      actualSleepTime: '2026-10-03T20:10:00Z', diffMinutes: 40,
    },
  ];

  const accuracy = SleepPredictionEngine.calculateAccuracyStats(mockPredictions);
  assert(accuracy.totalEvaluated === 3, 'Total avaliado: 3 previsões');
  assert(accuracy.onTimeCount === 1, '1 previsão classificada como ON_TIME');
  assert(accuracy.earlyCount === 1, '1 previsão classificada como EARLY');
  assert(accuracy.lateCount === 1, '1 previsão classificada como LATE');
  assert(accuracy.onTimePercentage === 33, '33% de aderência na janela');
  assert(accuracy.meanAbsoluteErrorMinutes === 26, 'Erro médio absoluto calculado corretamente (26 min)');
}

// -----------------------------------------------------------
// TESTE 4: StatisticsCalculator (7D, 14D, 30D, 90D e Comparação)
// -----------------------------------------------------------
console.log('\n--- TESTE 4: StatisticsCalculator e Agregações ---');
{
  const refNow = new Date('2026-10-03T12:00:00Z');
  const dummyHistory: SleepRecord[] = [];

  // Gera 14 dias de dados consistentes
  for (let i = 0; i < 14; i++) {
    const dayDate = subDays(refNow, i);
    const dayStr = format(dayDate, 'yyyy-MM-dd');

    // Noite
    dummyHistory.push({
      id: `night-${i}`,
      babyId: 'b1',
      type: 'NIGHT_SLEEP',
      startTime: `${dayStr}T20:00:00`,
      endTime: `${dayStr}T06:00:00`,
      durationMinutes: 600,
      isOngoing: false,
      isManuallyAdded: false,
      createdAt: '',
      updatedAt: '',
    });

    // Soneca 1
    dummyHistory.push({
      id: `nap1-${i}`,
      babyId: 'b1',
      type: 'NAP',
      startTime: `${dayStr}T09:00:00`,
      endTime: `${dayStr}T10:15:00`,
      durationMinutes: 75,
      isOngoing: false,
      isManuallyAdded: false,
      createdAt: '',
      updatedAt: '',
    });

    // Soneca 2
    dummyHistory.push({
      id: `nap2-${i}`,
      babyId: 'b1',
      type: 'NAP',
      startTime: `${dayStr}T13:30:00`,
      endTime: `${dayStr}T14:30:00`,
      durationMinutes: 60,
      isOngoing: false,
      isManuallyAdded: false,
      createdAt: '',
      updatedAt: '',
    });
  }

  // 4.1 Cálculo para 7 dias
  const stats7d = StatisticsCalculator.calculate(dummyHistory, 7, refNow);
  assert(stats7d.periodDays === 7, 'Período de 7 dias configurado');
  assert(stats7d.readinessState === 'ENOUGH_DATA', 'Status ENOUGH_DATA com 14 dias de registros');
  assert(stats7d.totalSleep.average > 600, 'Média de sono total calculada e razoável (>10h)');
  assert(stats7d.naps.avgDurationMinutes >= 60, 'Média de soneca calculada');
  assert(stats7d.averageTimes.avgBedtime === '20:00', 'Horário médio de dormir: 20:00');
  assert(stats7d.averageTimes.avgFirstNapTime === '09:00', 'Horário médio da 1ª soneca: 09:00');

  // 4.2 Cálculo para 14 dias
  const stats14d = StatisticsCalculator.calculate(dummyHistory, 14, refNow);
  assert(stats14d.dailySummaries.length === 14, '14 resumos diários retornados');

  // 4.3 Comparação de períodos
  const comp = StatisticsCalculator.comparePeriods(dummyHistory, refNow);
  assert(comp.totalSleep.trendDirection === 'STABLE', 'Rotina idêntica entre semanas classificada como STABLE');
}

// -----------------------------------------------------------
// TESTE 5: TrendDetector (Insights Descritivos e Não-Causais)
// -----------------------------------------------------------
console.log('\n--- TESTE 5: TrendDetector ---');
{
  const dummyStats = StatisticsCalculator.calculate([], 7);
  const dummyComp = StatisticsCalculator.comparePeriods([]);
  const insights = TrendDetector.detectTrends(dummyStats, dummyComp);

  assert(insights.length >= 1, 'Gera insight inicial mesmo sem dados');
  assert(!insights[0].description.includes('precisa'), 'Não utiliza termos impositivos como "precisa"');
  assert(!insights[0].description.includes('deve'), 'Não utiliza termos impositivos como "deve"');
}

// -----------------------------------------------------------
// TESTE 6: Configurações de Notificações
// -----------------------------------------------------------
console.log('\n--- TESTE 6: NotificationSettingsService ---');
{
  const settings = NotificationSettingsService.getSettings('user-1', 'baby-1');
  assert(settings.napRemindersEnabled === true, 'Lembretes de soneca ativados por padrão');
  assert(settings.leadTimeMinutes === 15, 'Antecedência padrão de 15 minutos');
  assert(settings.quietHoursStart === '22:00', 'Horário silencioso configurado');
}

console.log('\n======================================================');
console.log(`  RESULTADO FASE 2: ${passedTests}/${totalTests} TESTES PASSARAM`);
if (failedTests > 0) {
  console.log(`  ALERTA: ${failedTests} TESTE(S) FALHARAM`);
  failureDetails.forEach(f => console.log(f));
}
console.log('======================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
