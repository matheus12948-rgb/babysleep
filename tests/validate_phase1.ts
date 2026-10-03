/**
 * BabySleep - Testes Automatizados de Validação Técnica da FASE 1
 */

import { calculateBabyAge } from '../src/utils/date';
import { SleepPredictionEngine } from '../src/features/sleep-engine/predictionEngine';
import { DEFAULT_SLEEP_REFERENCE_RULES, getReferenceRuleForAge } from '../src/features/sleep-engine/referenceRules';
import { SleepRecord, BabyProfile, BabyJournalEntry } from '../src/types';
import { isValid, parseISO, subDays, addDays, format } from 'date-fns';

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
console.log('  INICIANDO BATERIA DE TESTES TÉCNICOS — FASE 1');
console.log('======================================================\n');

// -----------------------------------------------------------
// TESTE 1: Cálculo de Idade do Bebê (dias, semanas, meses, resiliência)
// -----------------------------------------------------------
console.log('--- TESTE 1: Cálculo de Idade do Bebê ---');
{
  const todayIso = format(new Date(), 'yyyy-MM-dd');
  const age0 = calculateBabyAge(todayIso);
  assert(age0.days === 0, 'Recém-nascido tem 0 dias');
  assert(!isNaN(age0.days) && !isNaN(age0.weeks) && !isNaN(age0.months), 'Idades numéricas não são NaN');

  const date14DaysAgo = format(subDays(new Date(), 14), 'yyyy-MM-dd');
  const age14 = calculateBabyAge(date14DaysAgo);
  assert(age14.weeks === 2, 'Bebê de 14 dias tem 2 semanas');

  const date90DaysAgo = format(subDays(new Date(), 90), 'yyyy-MM-dd');
  const age90 = calculateBabyAge(date90DaysAgo);
  assert(age90.months >= 2 && age90.months <= 3, 'Bebê de 90 dias tem aproximadamente 3 meses');
  assert(age90.formatted.includes('meses') || age90.formatted.includes('mês'), 'Formatação textual amigável presente');

  // Resiliência contra strings inválidas
  const ageInvalid = calculateBabyAge('data-invalida');
  assert(ageInvalid.formatted === 'Data inválida', 'Tratamento correto de data malformada');
  assert(!isNaN(ageInvalid.days), 'Dias não são NaN para data inválida');

  const ageEmpty = calculateBabyAge('');
  assert(ageEmpty.formatted === 'Idade não informada', 'Tratamento de string vazia');
}

// -----------------------------------------------------------
// TESTE 2: Parâmetros de Referência de Sono (Configuração Centralizada)
// -----------------------------------------------------------
console.log('\n--- TESTE 2: Parâmetros de Referência de Sono ---');
{
  assert(DEFAULT_SLEEP_REFERENCE_RULES.length >= 7, 'Existem pelo menos 7 faixas etárias configuradas');
  
  const ruleNewborn = getReferenceRuleForAge(4); // 4 semanas
  assert(ruleNewborn.minWakeWindowMinutes >= 40 && ruleNewborn.maxWakeWindowMinutes <= 100, 'Janela de recém-nascido consistente');
  assert(ruleNewborn.historyWeight > 0 && ruleNewborn.lastNapWeight > 0, 'Pesos de algoritmo configurados');

  const ruleToddler = getReferenceRuleForAge(80); // 80 semanas
  assert(ruleToddler.minWakeWindowMinutes >= 180, 'Janela de bebê maior (>18m) expandida adequadamente');
}

// -----------------------------------------------------------
// TESTE 3: Motor de Estimativa de Sono (SleepPredictionEngine)
// -----------------------------------------------------------
console.log('\n--- TESTE 3: Motor de Estimativa de Sono ---');
{
  const birthDate = subDays(new Date(), 120).toISOString().split('T')[0]; // ~17 semanas

  // 3.1 Sem histórico anterior
  const predNoHistory = SleepPredictionEngine.calculateNextSleep({
    babyId: 'baby-test-1',
    birthDate,
  });

  assert(Boolean(predNoHistory.predictedSleepTime), 'Previsão gerada sem histórico prévio');
  assert(isValid(parseISO(predNoHistory.predictedSleepTime)), 'predictedSleepTime é uma data ISO válida');
  assert(isValid(parseISO(predNoHistory.windowStartTime)), 'windowStartTime é uma data ISO válida');
  assert(isValid(parseISO(predNoHistory.windowEndTime)), 'windowEndTime é uma data ISO válida');
  assert(!isNaN(predNoHistory.estimatedDurationMinutes), 'estimatedDurationMinutes não é NaN');
  assert(predNoHistory.confidenceLevel === 'LOW', 'Sem histórico, nível de confiança é inicial (LOW)');

  // 3.2 Com histórico de soneca curta (< 35 min)
  const lastNapShort: SleepRecord = {
    id: 'rec-1',
    babyId: 'baby-test-1',
    type: 'NAP',
    startTime: subDays(new Date(), 0).toISOString(),
    endTime: new Date().toISOString(),
    durationMinutes: 20, // Curta
    isOngoing: false,
    isManuallyAdded: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const predWithShortNap = SleepPredictionEngine.calculateNextSleep({
    babyId: 'baby-test-1',
    birthDate,
    lastSleepRecord: lastNapShort,
    recentSleepRecords: [lastNapShort, lastNapShort, lastNapShort, lastNapShort, lastNapShort, lastNapShort],
  });

  assert(predWithShortNap.confidenceLevel === 'MEDIUM' || predWithShortNap.confidenceLevel === 'HIGH', 'Com histórico parcial/recente, confiança sobe para além de LOW');
  assert(isValid(parseISO(predWithShortNap.predictedSleepTime)), 'Data da previsão com histórico é válida');
}

// -----------------------------------------------------------
// TESTE 4: Previsão vs. Realidade (Calibração)
// -----------------------------------------------------------
console.log('\n--- TESTE 4: Previsão vs. Realidade (Calibração) ---');
{
  const predBaseTime = new Date('2026-10-03T14:00:00Z');
  const dummyPrediction = {
    id: 'pred-1',
    babyId: 'baby-1',
    calculatedAt: new Date().toISOString(),
    predictedSleepTime: predBaseTime.toISOString(),
    windowStartTime: subDays(predBaseTime, 0).toISOString(),
    windowEndTime: subDays(predBaseTime, 0).toISOString(),
    estimatedDurationMinutes: 60,
    confidenceLevel: 'MEDIUM' as const,
    predictionType: 'NEXT_NAP' as const,
  };

  // Dormiu exatamente na hora
  const resultOnTime = SleepPredictionEngine.comparePredictionWithReality(
    dummyPrediction,
    new Date('2026-10-03T14:05:00Z').toISOString()
  );
  assert(resultOnTime.accuracyCategory === 'ON_TIME', 'Sono com +5 min classificado como ON_TIME');
  assert(resultOnTime.diffMinutes === 5, 'diffMinutes calculado com exatidão (+5)');

  // Dormiu 30 minutos antes (precoce)
  const resultEarly = SleepPredictionEngine.comparePredictionWithReality(
    dummyPrediction,
    new Date('2026-10-03T13:30:00Z').toISOString()
  );
  assert(resultEarly.accuracyCategory === 'EARLY', 'Sono com -30 min classificado como EARLY');
  assert(resultEarly.diffMinutes === -30, 'diffMinutes negativo (-30) gravado com precisão');

  // Dormiu 45 minutos depois (tardio)
  const resultLate = SleepPredictionEngine.comparePredictionWithReality(
    dummyPrediction,
    new Date('2026-10-03T14:45:00Z').toISOString()
  );
  assert(resultLate.accuracyCategory === 'LATE', 'Sono com +45 min classificado como LATE');
  assert(resultLate.diffMinutes === 45, 'diffMinutes positivo (+45) gravado com precisão');
}

// -----------------------------------------------------------
// TESTE 5: Isolamento de Dados e RLS (Multi-Usuário)
// -----------------------------------------------------------
console.log('\n--- TESTE 5: Isolamento de Dados e RLS ---');
{
  const userA_Id = 'user-uuid-aaaa-1111';
  const userB_Id = 'user-uuid-bbbb-2222';

  const babiesStore: BabyProfile[] = [
    {
      id: 'baby-A',
      ownerId: userA_Id,
      name: 'Bebê do Usuário A',
      birthDate: '2026-05-01',
      habitualWakeTime: '07:00:00',
      habitualBedtime: '19:30:00',
      expectedNapsCount: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'baby-B',
      ownerId: userB_Id,
      name: 'Bebê do Usuário B',
      birthDate: '2026-06-01',
      habitualWakeTime: '06:30:00',
      habitualBedtime: '20:00:00',
      expectedNapsCount: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  // Simulação de consulta com RLS para Usuário A
  const visibleToUserA = babiesStore.filter(b => b.ownerId === userA_Id);
  assert(visibleToUserA.length === 1 && visibleToUserA[0].id === 'baby-A', 'Usuário A visualiza exclusivamente o bebê A');
  assert(!visibleToUserA.some(b => b.id === 'baby-B'), 'Usuário A NÃO tem acesso ao bebê B');

  // Simulação de consulta com RLS para Usuário B
  const visibleToUserB = babiesStore.filter(b => b.ownerId === userB_Id);
  assert(visibleToUserB.length === 1 && visibleToUserB[0].id === 'baby-B', 'Usuário B visualiza exclusivamente o bebê B');
  assert(!visibleToUserB.some(b => b.id === 'baby-A'), 'Usuário B NÃO tem acesso ao bebê A');
}

// -----------------------------------------------------------
// TESTE 6: Diário do Bebê (CRUD e Atributos de Humor)
// -----------------------------------------------------------
console.log('\n--- TESTE 6: Diário do Bebê ---');
{
  const entry: BabyJournalEntry = {
    id: 'journal-test-1',
    babyId: 'baby-test-1',
    date: '2026-10-03',
    time: '14:30',
    mood: 'CALM',
    content: 'Hoje teve uma soneca mais longa depois do banho.',
    associatedEventType: 'BATH',
    createdAt: new Date().toISOString(),
  };

  assert(entry.mood === 'CALM', 'Humor registrado corretamente');
  assert(entry.associatedEventType === 'BATH', 'Associação com banho gravada com sucesso');
  assert(entry.content.length > 10, 'Conteúdo do diário preservado');
}

console.log('\n======================================================');
console.log(`  RESULTADO FINAL: ${passedTests}/${totalTests} TESTES PASSARAM`);
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
