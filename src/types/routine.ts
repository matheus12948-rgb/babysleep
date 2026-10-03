// ========================================================
// BabySleep - Tipos do Módulo de Rotina Completa (FASE 3)
// ========================================================

export type FeedingType = 'BREAST' | 'BOTTLE' | 'SOLID';

export type BreastSide = 'LEFT' | 'RIGHT' | 'BOTH';

export type BottleContentType = 'BREAST_MILK' | 'FORMULA' | 'WATER' | 'OTHER';

export type FoodReaction = 'LIKED' | 'DISLIKED' | 'NEUTRAL' | 'MESSY' | 'OTHER';

export interface FeedingRecord {
  id: string;
  babyId: string;
  type: FeedingType;
  timestamp: string; // ISO string
  endTime?: string;
  // Amamentação
  breastSide?: BreastSide;
  breastDurationMinutes?: number;
  leftDurationMinutes?: number;
  rightDurationMinutes?: number;
  // Mamadeira
  bottleAmountMl?: number;
  bottleContents?: BottleContentType;
  // Introdução Alimentar
  solidFoodName?: string;
  solidFoodAmount?: string;
  solidFoodReaction?: FoodReaction;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type DiaperType = 'WET' | 'DIRTY' | 'BOTH';

export type StoolConsistency = 'LIQUID' | 'SOFT' | 'HARD' | 'NORMAL';

export type StoolColor = 'YELLOW' | 'BROWN' | 'GREEN' | 'BLACK' | 'RED' | 'OTHER';

export interface DiaperRecord {
  id: string;
  babyId: string;
  timestamp: string; // ISO string
  type: DiaperType;
  consistency?: StoolConsistency;
  color?: StoolColor;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityCategory = 
  | 'BATH' 
  | 'TEMPERATURE' 
  | 'MEDICINE' 
  | 'WALK' 
  | 'TUMMY_TIME' 
  | 'PLAY' 
  | 'NOTE' 
  | 'OTHER';

export interface ActivityRecord {
  id: string;
  babyId: string;
  timestamp: string; // ISO string
  category: ActivityCategory;
  valueNumeric?: number; // ex: temperatura
  unit?: 'C' | 'F' | 'min';
  measurementMethod?: 'AXILLARY' | 'RECTAL' | 'EAR' | 'FOREHEAD';
  medicineName?: string; // Registrado pelo cuidador (sem prescrição médica)
  durationMinutes?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TimelineFilter = 
  | 'ALL' 
  | 'SLEEP' 
  | 'FEEDING' 
  | 'DIAPER' 
  | 'CARE' 
  | 'ACTIVITY' 
  | 'JOURNAL';

export interface UnifiedTimelineEvent {
  id: string;
  eventType: 'SLEEP' | 'FEEDING' | 'DIAPER' | 'ACTIVITY' | 'JOURNAL';
  subType?: string;
  timestamp: string;
  title: string;
  details: string;
  notes?: string;
  colorBadgeClass: string;
  iconType: string;
  rawRecord: any;
}
