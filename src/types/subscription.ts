// ========================================================
// BabySleep - Tipos para Planos, Assinaturas e Relatórios
// ========================================================

export type SubscriptionPlanType = 'FREE' | 'PREMIUM_MONTHLY' | 'PREMIUM_YEARLY';

export type SubscriptionStatus = 'ACTIVE' | 'TRIALING' | 'CANCELED' | 'PAST_DUE' | 'EXPIRED';

export interface UserSubscription {
  id: string;
  userId: string;
  planType: SubscriptionPlanType;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlanBenefit {
  id: string;
  title: string;
  description: string;
  isPremiumOnly: boolean;
}

export const PLAN_BENEFITS: PlanBenefit[] = [
  {
    id: 'naps_prediction',
    title: 'Previsões de Sono com IA Calibrável',
    description: 'Estimativa de janelas de vigília baseadas em parâmetros pediátricos e no histórico real.',
    isPremiumOnly: false, // Básico no free, avançado com pesos no pro
  },
  {
    id: 'unlimited_babies',
    title: 'Múltiplos Bebês Ilimitados',
    description: 'Acompanhe gêmeos, trigêmeos ou irmãos simultaneamente em perfis independentes.',
    isPremiumOnly: true,
  },
  {
    id: 'unlimited_caregivers',
    title: 'Multi-Cuidador Ilimitado com Papéis',
    description: 'Convide parceiro(a), babá, avós e pediatra com controle de escrita e visualização.',
    isPremiumOnly: true,
  },
  {
    id: 'realtime_sync',
    title: 'Sincronização em Tempo Real',
    description: 'Atualizações instantâneas entre todos os celulares da família sem precisar recarregar.',
    isPremiumOnly: true,
  },
  {
    id: 'full_sound_library',
    title: 'Player Acústico Completo (12 Faixas)',
    description: 'Acesso a todos os ruídos, sons da natureza, ventre materno e fade-out suave personalizável.',
    isPremiumOnly: true,
  },
  {
    id: 'pediatric_reports',
    title: 'Relatório Clínico para o Pediatra',
    description: 'Exportação consolidada em PDF e texto formatado com médias de sono, mamadas e fraldas.',
    isPremiumOnly: true,
  },
  {
    id: 'academy_courses',
    title: 'Academia BabySleep Completa',
    description: 'Acesso a todos os 4 cursos por marcos etários e artigos especializados sem restrições.',
    isPremiumOnly: true,
  }
];

export interface PediatricReportData {
  babyName: string;
  babyAgeFormatted: string;
  periodDays: number;
  startDate: string;
  endDate: string;
  generatedAt: string;
  caregiverName: string;
  // Métricas
  totalSleepHours: number;
  averageSleepHoursPerDay: number;
  averageNapsPerDay: number;
  averageNapDurationMinutes: number;
  averageNightSleepDurationHours: number;
  nightAwakeningsAverage: number;
  // Alimentação
  totalFeedings: number;
  feedingsPerDayAverage: number;
  breastfeedingTotalMinutes: number;
  bottleTotalMl: number;
  solidMealsCount: number;
  // Fraldas
  wetDiapersPerDayAverage: number;
  dirtyDiapersPerDayAverage: number;
  // Resumo
  caregiverNotesSummary: string[];
}
