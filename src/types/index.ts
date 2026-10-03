// ========================================================
// BabySleep - Definições de Tipos TypeScript Globais
// ========================================================

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

import { UserRole } from './admin';

export * from './caregiver';
export * from './subscription';
export * from './admin';

export interface UserProfile {
  id: string;
  email?: string;
  fullName: string;
  avatarUrl?: string;
  timezone: string;
  isAdmin?: boolean;
  role?: UserRole;
  createdAt: string;
}

export interface BabyProfile {
  id: string;
  ownerId: string;
  name: string;
  birthDate: string; // ISO YYYY-MM-DD
  gender?: Gender;
  habitualWakeTime: string; // HH:mm:ss
  habitualBedtime: string; // HH:mm:ss
  expectedNapsCount: number;
  parentingGoal?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type SleepType = 'NAP' | 'NIGHT_SLEEP';

export interface SleepRecord {
  id: string;
  babyId: string;
  type: SleepType;
  startTime: string; // ISO string com timezone
  endTime?: string;   // ISO string com timezone
  durationMinutes?: number;
  qualityRating?: number; // 1 a 5
  isOngoing: boolean;
  isManuallyAdded: boolean;
  notes?: string;
  awakenings?: SleepAwakening[];
  createdAt: string;
  updatedAt: string;
}

export interface SleepAwakening {
  id: string;
  sleepRecordId: string;
  babyId: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  reason?: 'HUNGER' | 'DIAPER' | 'DISCOMFORT' | 'TEETHING' | 'COLIC' | 'UNKNOWN';
  notes?: string;
}

export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type DataConsistencyStatus = 'INSUFFICIENT' | 'PARTIAL' | 'CONSISTENT';

export interface SleepPrediction {
  id: string;
  babyId: string;
  calculatedAt: string;
  predictedSleepTime: string; // ISO string
  windowStartTime: string;    // ISO string
  windowEndTime: string;      // ISO string
  estimatedDurationMinutes: number;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;     // 0 a 100%
  reasoning: string[];         // Fatores descritivos e transparentes
  consistencyStatus: DataConsistencyStatus;
  actualSleepTime?: string;   // Registrado quando o sono real ocorre
  diffMinutes?: number;       // Diferença entre previsão e realidade para calibração
  predictionType: 'NEXT_NAP' | 'BEDTIME';
  modelInputs?: Record<string, unknown>;
}

export interface NotificationSettings {
  id?: string;
  userId: string;
  babyId: string;
  napRemindersEnabled: boolean;
  bedtimeRemindersEnabled: boolean;
  routineRemindersEnabled: boolean;
  leadTimeMinutes: number;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string;   // "06:30"
}

// Parâmetros de Referência de Sono (Configuráveis)
export interface SleepReferenceRule {
  minAgeWeeks: number;
  maxAgeWeeks: number;
  minWakeWindowMinutes: number;
  maxWakeWindowMinutes: number;
  expectedNaps: number;
  expectedDaySleepMinutes: number;
  expectedNightSleepMinutes: number;
  toleranceMinutes: number;
  // Pesos do algoritmo configuráveis
  historyWeight: number;    // peso do histórico habitual do bebê (0.0 a 1.0)
  lastNapWeight: number;    // peso da duração da última soneca (0.0 a 1.0)
  nightSleepWeight: number; // peso da qualidade do sono noturno (0.0 a 1.0)
}

export interface BabyJournalEntry {
  id: string;
  babyId: string;
  date: string;
  time: string;
  mood?: 'HAPPY' | 'CALM' | 'FUSSY' | 'CRYING' | 'TIRED' | 'PLAYFUL';
  content: string;
  tags?: string[];
  associatedEventType?: string;
  associatedEventId?: string;
  createdAt: string;
}

export type QuickLogType = 'SLEEP' | 'BOTTLE' | 'BREAST' | 'DIAPER' | 'NOTE';

export * from './routine';
export * from '../features/education/types';
