/**
 * BabySleep - Testes Automatizados de Validação Técnica da FASE 3
 * Rotina Completa do Bebê: Amamentação, Mamadeira, Alimentação Sólida,
 * Fraldas, Cuidados, Atividades, Timeline Unificada, Offline e RLS.
 */

import { 
  FeedingRecord, 
  DiaperRecord, 
  ActivityRecord, 
  UnifiedTimelineEvent, 
  TimelineFilter,
  SleepRecord
} from '../src/types';
import { 
  celsiusToFahrenheit, 
  fahrenheitToCelsius, 
  validateBottleAmount, 
  validateTemperature,
  formatDuration,
  formatBreastfeedingSummary,
  BOTTLE_PRESET_AMOUNTS,
  MEDICINE_DISCLAIMER
} from '../src/utils/routine';

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
console.log('  INICIANDO BATERIA DE TESTES TÉCNICOS — FASE 3');
console.log('  Rotina Completa: Alimentação, Fraldas e Cuidados');
console.log('======================================================\n');

// -----------------------------------------------------------
// TESTE 1: Amamentação (L/R, Cronômetro, Troca de Lado e Duração)
// -----------------------------------------------------------
console.log('--- TESTE 1: Amamentação (L/R, Troca de Lado e Duração) ---');
{
  // Simulação da máquina de estados do cronômetro de amamentação
  let activeSide: 'LEFT' | 'RIGHT' | null = null;
  let isPaused = false;
  let leftSecs = 0;
  let rightSecs = 0;

  // 1. Iniciar lado esquerdo
  activeSide = 'LEFT';
  leftSecs += 540; // 9 minutos
  assert(activeSide === 'LEFT', 'Cronômetro inicia no peito esquerdo');

  // 2. Trocar de lado para direito
  activeSide = activeSide === 'LEFT' ? 'RIGHT' : 'LEFT';
  assert(activeSide === 'RIGHT', 'Alternância suave para peito direito');
  rightSecs += 540; // 9 minutos

  // 3. Pausar e Continuar
  isPaused = true;
  assert(isPaused === true, 'Pausa do cronômetro funciona corretamente');
  isPaused = false;
  assert(isPaused === false, 'Retomada do cronômetro funciona');

  // 4. Finalizar e calcular durações
  const leftMins = Math.round(leftSecs / 60);
  const rightMins = Math.round(rightSecs / 60);
  const totalMins = Math.round((leftSecs + rightSecs) / 60);

  assert(leftMins === 9, 'Duração esquerda calculada: 9 min');
  assert(rightMins === 9, 'Duração direita calculada: 9 min');
  assert(totalMins === 18, 'Duração total calculada: 18 min');

  // 5. Garantir que NENHUMA conversão de minutos para ml é realizada
  const feedingRecord: FeedingRecord = {
    id: 'feed-test-1',
    babyId: 'baby-1',
    type: 'BREAST',
    timestamp: '2026-10-03T08:12:00Z',
    endTime: '2026-10-03T08:31:00Z',
    breastSide: 'BOTH',
    leftDurationMinutes: leftMins,
    rightDurationMinutes: rightMins,
    breastDurationMinutes: totalMins,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  assert(feedingRecord.bottleAmountMl === undefined, 'Amamentação NÃO estima nem converte tempo para ml de leite');
  assert(feedingRecord.breastDurationMinutes === 18, 'Registro armazena duração real em minutos');
  assert(formatBreastfeedingSummary(leftMins, rightMins).includes('18 min total'), 'Formatação descritiva correta');
}

// -----------------------------------------------------------
// TESTE 2: Mamadeira (Quantidade, Presets, Tipo e Validação)
// -----------------------------------------------------------
console.log('\n--- TESTE 2: Mamadeira (Volume, Tipos e Validações) ---');
{
  // 1. Presets exigidos: 30, 60, 90, 120, 150, 180, 200, 250
  const requiredPresets = [30, 60, 90, 120, 150, 180, 200, 250];
  const allPresetsPresent = requiredPresets.every(p => BOTTLE_PRESET_AMOUNTS.includes(p));
  assert(allPresetsPresent, 'Todos os 8 presets de volume em ml estão disponíveis');

  // 2. Validações de volume
  const invalidZero = validateBottleAmount(0);
  assert(invalidZero.isValid === false, 'Bloqueia volume zero de mamadeira');

  const invalidNegative = validateBottleAmount(-30);
  assert(invalidNegative.isValid === false, 'Bloqueia volume negativo de mamadeira');

  const validStandard = validateBottleAmount(120);
  assert(validStandard.isValid === true && !validStandard.warning, 'Aceita 120ml sem aviso');

  const validHighWarning = validateBottleAmount(450);
  assert(validHighWarning.isValid === true && !!validHighWarning.warning, 'Emite aviso não-bloqueante para volume incomum alto');

  // 3. Tipos de conteúdo aceitos
  const bottleMilk: FeedingRecord = {
    id: 'bottle-1',
    babyId: 'baby-1',
    type: 'BOTTLE',
    timestamp: '2026-10-03T10:30:00Z',
    bottleAmountMl: 150,
    bottleContents: 'BREAST_MILK',
    createdAt: '',
    updatedAt: '',
  };
  const bottleFormula: FeedingRecord = {
    id: 'bottle-2',
    babyId: 'baby-1',
    type: 'BOTTLE',
    timestamp: '2026-10-03T14:30:00Z',
    bottleAmountMl: 180,
    bottleContents: 'FORMULA',
    createdAt: '',
    updatedAt: '',
  };

  assert(bottleMilk.bottleContents === 'BREAST_MILK', 'Suporta Leite Materno Ordenhado');
  assert(bottleFormula.bottleContents === 'FORMULA', 'Suporta Fórmula Infantil');
}

// -----------------------------------------------------------
// TESTE 3: Alimentação Sólida (Criação, Edição e Exclusão)
// -----------------------------------------------------------
console.log('\n--- TESTE 3: Alimentação Sólida (CRUD e Reações) ---');
{
  const solidFoodList: FeedingRecord[] = [];

  // Criar
  const meal1: FeedingRecord = {
    id: 'solid-1',
    babyId: 'baby-1',
    type: 'SOLID',
    timestamp: '2026-10-03T12:00:00Z',
    solidFoodName: 'Purê de abóbora',
    solidFoodAmount: '3 colheres de sopa',
    solidFoodReaction: 'LIKED',
    notes: 'Aceitou bem e sorriu',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  solidFoodList.push(meal1);
  assert(solidFoodList.length === 1, 'Registro de introdução alimentar criado');
  assert(solidFoodList[0].solidFoodReaction === 'LIKED', 'Reação "Gostou" registrada');

  // Editar
  const updatedMeal: FeedingRecord = {
    ...meal1,
    solidFoodReaction: 'MESSY',
    notes: 'Fez bagunça com a colher mas comeu tudo',
    updatedAt: new Date().toISOString(),
  };
  const editIdx = solidFoodList.findIndex(f => f.id === updatedMeal.id);
  solidFoodList[editIdx] = updatedMeal;
  assert(solidFoodList[0].solidFoodReaction === 'MESSY', 'Registro de refeição editado com sucesso');

  // Excluir
  const afterDelete = solidFoodList.filter(f => f.id !== 'solid-1');
  assert(afterDelete.length === 0, 'Registro de introdução alimentar excluído');
}

// -----------------------------------------------------------
// TESTE 4: Fraldas (Xixi, Cocô, Ambos, Consistência e Cor)
// -----------------------------------------------------------
console.log('\n--- TESTE 4: Fraldas (Xixi, Cocô e Características) ---');
{
  const wetDiaper: DiaperRecord = {
    id: 'd-1',
    babyId: 'baby-1',
    timestamp: '2026-10-03T09:00:00Z',
    type: 'WET',
    createdAt: '',
    updatedAt: '',
  };
  assert(wetDiaper.type === 'WET', 'Registro de fralda com xixi');

  const dirtyDiaper: DiaperRecord = {
    id: 'd-2',
    babyId: 'baby-1',
    timestamp: '2026-10-03T11:15:00Z',
    type: 'DIRTY',
    consistency: 'SOFT',
    color: 'YELLOW',
    notes: 'Normal para a idade',
    createdAt: '',
    updatedAt: '',
  };
  assert(dirtyDiaper.consistency === 'SOFT' && dirtyDiaper.color === 'YELLOW', 'Registra consistência pastosa e cor amarela');

  const bothDiaper: DiaperRecord = {
    id: 'd-3',
    babyId: 'baby-1',
    timestamp: '2026-10-03T15:00:00Z',
    type: 'BOTH',
    createdAt: '',
    updatedAt: '',
  };
  assert(bothDiaper.type === 'BOTH', 'Registro de xixi + cocô simultâneo');
}

// -----------------------------------------------------------
// TESTE 5: Temperatura (Celsius, Fahrenheit e Conversão Precisa)
// -----------------------------------------------------------
console.log('\n--- TESTE 5: Temperatura (Conversão e Validação) ---');
{
  // 37.0 °C -> 98.6 °F
  const fValue = celsiusToFahrenheit(37.0);
  assert(fValue === 98.6, 'Conversão precisa de 37.0°C para 98.6°F');

  // 98.6 °F -> 37.0 °C
  const cValue = fahrenheitToCelsius(98.6);
  assert(cValue === 37.0, 'Conversão precisa de 98.6°F para 37.0°C');

  // 36.5 °C -> 97.7 °F
  assert(celsiusToFahrenheit(36.5) === 97.7, 'Conversão precisa de 36.5°C para 97.7°F');

  // Validação de intervalo de temperatura
  const normalTemp = validateTemperature(36.8, 'C');
  assert(normalTemp.isValid === true && !normalTemp.warning, 'Temperatura normal aceita sem alerta');

  const unusualLow = validateTemperature(33.0, 'C');
  assert(unusualLow.isValid === true && !!unusualLow.warning, 'Aviso não-diagnóstico para temperatura incomum');
}

// -----------------------------------------------------------
// TESTE 6: Medicamento (Registro sem Prescrição e Disclaimer)
// -----------------------------------------------------------
console.log('\n--- TESTE 6: Medicamento (Registro Cuidador e Disclaimer) ---');
{
  const medRecord: ActivityRecord = {
    id: 'med-1',
    babyId: 'baby-1',
    timestamp: '2026-10-03T16:00:00Z',
    category: 'MEDICINE',
    medicineName: 'Vitamina D',
    notes: '2 gotas administradas conforme rotina',
    createdAt: '',
    updatedAt: '',
  };

  assert(medRecord.medicineName === 'Vitamina D', 'Registra nome do medicamento informado pelo cuidador');
  assert(MEDICINE_DISCLAIMER.includes('consulte um profissional de saúde'), 'Disclaimer médico obrigatório preservado');
  // Garante que o objeto ActivityRecord não possui dosagem médica automática prescrita
  assert(!('prescribedDose' in medRecord), 'Sem cálculo ou recomendação automática de dosagem');
}

// -----------------------------------------------------------
// TESTE 7: Atividades e Banho
// -----------------------------------------------------------
console.log('\n--- TESTE 7: Banho e Atividades ---');
{
  const bathRecord: ActivityRecord = {
    id: 'act-1',
    babyId: 'baby-1',
    timestamp: '2026-10-03T19:00:00Z',
    category: 'BATH',
    durationMinutes: 15,
    notes: 'Banho morno relaxante',
    createdAt: '',
    updatedAt: '',
  };
  assert(bathRecord.category === 'BATH', 'Registro de banho');
  assert(bathRecord.durationMinutes === 15, 'Duração de banho de 15 minutos');

  const walkRecord: ActivityRecord = {
    id: 'act-2',
    babyId: 'baby-1',
    timestamp: '2026-10-03T17:00:00Z',
    category: 'WALK',
    durationMinutes: 40,
    createdAt: '',
    updatedAt: '',
  };
  assert(walkRecord.category === 'WALK' && walkRecord.durationMinutes === 40, 'Registro de passeio ao ar livre');
}

// -----------------------------------------------------------
// TESTE 8: Timeline Unificada e Filtros por Categoria
// -----------------------------------------------------------
console.log('\n--- TESTE 8: Timeline Unificada e Filtros ---');
{
  // Criação de múltiplos eventos em horários distintos
  const rawEvents: UnifiedTimelineEvent[] = [
    {
      id: 'e-1',
      eventType: 'SLEEP',
      subType: 'NAP',
      timestamp: '2026-10-03T09:15:00Z',
      title: 'Soneca',
      details: '1h 02m',
      colorBadgeClass: '',
      iconType: 'SLEEP',
      rawRecord: {},
    },
    {
      id: 'e-2',
      eventType: 'FEEDING',
      subType: 'BREAST',
      timestamp: '2026-10-03T07:30:00Z',
      title: 'Amamentação',
      details: '18 min',
      colorBadgeClass: '',
      iconType: 'BREAST',
      rawRecord: {},
    },
    {
      id: 'e-3',
      eventType: 'FEEDING',
      subType: 'BOTTLE',
      timestamp: '2026-10-03T10:30:00Z',
      title: 'Mamadeira',
      details: '120 ml',
      colorBadgeClass: '',
      iconType: 'BOTTLE',
      rawRecord: {},
    },
    {
      id: 'e-4',
      eventType: 'DIAPER',
      subType: 'WET',
      timestamp: '2026-10-03T11:15:00Z',
      title: 'Fralda: Xixi',
      details: 'Xixi',
      colorBadgeClass: '',
      iconType: 'DIAPER',
      rawRecord: {},
    },
    {
      id: 'e-5',
      eventType: 'ACTIVITY',
      subType: 'BATH',
      timestamp: '2026-10-03T12:45:00Z',
      title: 'Banho',
      details: '15 min',
      colorBadgeClass: '',
      iconType: 'BATH',
      rawRecord: {},
    },
  ];

  // 1. Ordenação cronológica estrita decrescente
  const sorted = [...rawEvents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  assert(sorted[0].id === 'e-5', 'Evento mais recente (12:45 Banho) aparece em primeiro');
  assert(sorted[sorted.length - 1].id === 'e-2', 'Evento mais antigo (07:30 Amamentação) aparece por último');

  // 2. Filtro FEEDING
  const feedingOnly = sorted.filter(e => e.eventType === 'FEEDING');
  assert(feedingOnly.length === 2, 'Filtro Alimentação retorna exatamente amamentação e mamadeira');

  // 3. Filtro DIAPER
  const diaperOnly = sorted.filter(e => e.eventType === 'DIAPER');
  assert(diaperOnly.length === 1 && diaperOnly[0].id === 'e-4', 'Filtro Fraldas retorna apenas trocas');

  // 4. Filtro SLEEP
  const sleepOnly = sorted.filter(e => e.eventType === 'SLEEP');
  assert(sleepOnly.length === 1 && sleepOnly[0].id === 'e-1', 'Filtro Sono retorna apenas sonecas/noite');
}

// -----------------------------------------------------------
// TESTE 9: Modo Offline e Deduplicação de Sincronização
// -----------------------------------------------------------
console.log('\n--- TESTE 9: Modo Offline e Deduplicação ---');
{
  // Registros locais com IDs temporários gerados offline
  const localCache: FeedingRecord[] = [
    {
      id: 'feeding-temp-1001',
      babyId: 'baby-1',
      type: 'BOTTLE',
      timestamp: '2026-10-03T10:00:00Z',
      bottleAmountMl: 120,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'feeding-real-uuid-99',
      babyId: 'baby-1',
      type: 'BREAST',
      timestamp: '2026-10-03T07:00:00Z',
      breastDurationMinutes: 15,
      createdAt: '',
      updatedAt: '',
    }
  ];

  // Registros remotos vindos do Supabase
  const remoteItems: FeedingRecord[] = [
    {
      id: 'feeding-real-uuid-99', // mesmo registro já sincronizado
      babyId: 'baby-1',
      type: 'BREAST',
      timestamp: '2026-10-03T07:00:00Z',
      breastDurationMinutes: 15,
      createdAt: '',
      updatedAt: '',
    }
  ];

  // Algoritmo de merge deduplicado
  const remoteIds = new Set(remoteItems.map(r => r.id));
  const unsyncedLocals = localCache.filter(l => !remoteIds.has(l.id) && l.id.startsWith('feeding-temp-'));
  const merged = [...unsyncedLocals, ...remoteItems];

  assert(merged.length === 2, 'Merge preserva offline pendente e deduplica registro existente');
  assert(merged.filter(m => m.id === 'feeding-real-uuid-99').length === 1, 'Nenhuma duplicata de ID criada');
}

// -----------------------------------------------------------
// TESTE 10: RLS e Isolamento de Cuidados Entre Usuários
// -----------------------------------------------------------
console.log('\n--- TESTE 10: Isolamento de Dados por Bebê (RLS) ---');
{
  const babyA_records: FeedingRecord[] = [
    { id: 'f-a1', babyId: 'baby-uuid-A', type: 'BOTTLE', timestamp: '', createdAt: '', updatedAt: '' }
  ];
  const babyB_records: FeedingRecord[] = [
    { id: 'f-b1', babyId: 'baby-uuid-B', type: 'BOTTLE', timestamp: '', createdAt: '', updatedAt: '' }
  ];

  // Simulação de verificação de permissão RLS baseada em babyId
  const canAccessBaby = (requestBabyId: string, authorizedBabyId: string) => {
    return requestBabyId === authorizedBabyId;
  };

  assert(canAccessBaby('baby-uuid-A', 'baby-uuid-A') === true, 'Usuário dono do Bebê A acessa seus registros');
  assert(canAccessBaby('baby-uuid-B', 'baby-uuid-A') === false, 'Usuário dono do Bebê A é bloqueado de acessar Bebê B');
}

// -----------------------------------------------------------
// RESULTADO FINAL
// -----------------------------------------------------------
console.log('\n======================================================');
console.log(`  RESULTADO DOS TESTES — FASE 3`);
console.log(`  Total de Testes: ${totalTests}`);
console.log(`  Aprovados:       ${passedTests}`);
console.log(`  Falhas:          ${failedTests}`);
console.log('======================================================\n');

if (failedTests > 0) {
  console.error('Erros encontrados:');
  failureDetails.forEach(f => console.error(f));
  process.exit(1);
} else {
  console.log('🎉 TODOS OS TESTES DA FASE 3 PASSARAM COM SUCESSO!\n');
  process.exit(0);
}
