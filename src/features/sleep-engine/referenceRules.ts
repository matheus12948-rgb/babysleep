import { SleepReferenceRule } from '@/types';

/**
 * PARÂMETROS DE REFERÊNCIA DE SONO (CONFIGURAÇÃO CENTRALIZADA)
 * 
 * AVISO IMPORTANTE:
 * Estes parâmetros são estimativas baseadas em faixas etárias populacionais
 * e servem apenas como modelo de referência para o motor preditivo.
 * NÃO constituem recomendação médica, regra biológica obrigatória ou diagnóstico clínico.
 */
export const DEFAULT_SLEEP_REFERENCE_RULES: SleepReferenceRule[] = [
  {
    minAgeWeeks: 0,
    maxAgeWeeks: 8, // 0 a 2 meses
    minWakeWindowMinutes: 45,
    maxWakeWindowMinutes: 90,
    expectedNaps: 5,
    expectedDaySleepMinutes: 420,
    expectedNightSleepMinutes: 510,
    toleranceMinutes: 20,
    historyWeight: 0.3,
    lastNapWeight: 0.4,
    nightSleepWeight: 0.3,
  },
  {
    minAgeWeeks: 9,
    maxAgeWeeks: 16, // 2 a 4 meses
    minWakeWindowMinutes: 75,
    maxWakeWindowMinutes: 120,
    expectedNaps: 4,
    expectedDaySleepMinutes: 300,
    expectedNightSleepMinutes: 600,
    toleranceMinutes: 20,
    historyWeight: 0.4,
    lastNapWeight: 0.35,
    nightSleepWeight: 0.25,
  },
  {
    minAgeWeeks: 17,
    maxAgeWeeks: 26, // 4 a 6 meses
    minWakeWindowMinutes: 90,
    maxWakeWindowMinutes: 150,
    expectedNaps: 3,
    expectedDaySleepMinutes: 210,
    expectedNightSleepMinutes: 660,
    toleranceMinutes: 25,
    historyWeight: 0.45,
    lastNapWeight: 0.3,
    nightSleepWeight: 0.25,
  },
  {
    minAgeWeeks: 27,
    maxAgeWeeks: 39, // 6 a 9 meses
    minWakeWindowMinutes: 135,
    maxWakeWindowMinutes: 195,
    expectedNaps: 3,
    expectedDaySleepMinutes: 180,
    expectedNightSleepMinutes: 690,
    toleranceMinutes: 25,
    historyWeight: 0.5,
    lastNapWeight: 0.3,
    nightSleepWeight: 0.2,
  },
  {
    minAgeWeeks: 40,
    maxAgeWeeks: 52, // 9 a 12 meses
    minWakeWindowMinutes: 165,
    maxWakeWindowMinutes: 225,
    expectedNaps: 2,
    expectedDaySleepMinutes: 150,
    expectedNightSleepMinutes: 720,
    toleranceMinutes: 30,
    historyWeight: 0.55,
    lastNapWeight: 0.25,
    nightSleepWeight: 0.2,
  },
  {
    minAgeWeeks: 53,
    maxAgeWeeks: 78, // 12 a 18 meses
    minWakeWindowMinutes: 195,
    maxWakeWindowMinutes: 270,
    expectedNaps: 1,
    expectedDaySleepMinutes: 120,
    expectedNightSleepMinutes: 720,
    toleranceMinutes: 30,
    historyWeight: 0.6,
    lastNapWeight: 0.25,
    nightSleepWeight: 0.15,
  },
  {
    minAgeWeeks: 79,
    maxAgeWeeks: 200, // 18 meses em diante
    minWakeWindowMinutes: 240,
    maxWakeWindowMinutes: 330,
    expectedNaps: 1,
    expectedDaySleepMinutes: 90,
    expectedNightSleepMinutes: 720,
    toleranceMinutes: 35,
    historyWeight: 0.65,
    lastNapWeight: 0.2,
    nightSleepWeight: 0.15,
  },
];

/**
 * Busca a regra de referência adequada para a idade em semanas do bebê.
 */
export function getReferenceRuleForAge(ageWeeks: number): SleepReferenceRule {
  const matched = DEFAULT_SLEEP_REFERENCE_RULES.find(
    rule => ageWeeks >= rule.minAgeWeeks && ageWeeks <= rule.maxAgeWeeks
  );
  return matched || DEFAULT_SLEEP_REFERENCE_RULES[DEFAULT_SLEEP_REFERENCE_RULES.length - 1];
}
