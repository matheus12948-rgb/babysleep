/**
 * BabySleep - Definições de Tipos para o Painel Administrativo (Fase 8)
 */

import { SubscriptionPlanType, SubscriptionStatus } from './subscription';
import { Gender } from './index';

export type UserRole = 'USER' | 'ADMIN';

export interface AdminAuditLog {
  id: string;
  adminUserId: string;
  adminEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AdminKPIs {
  totalUsers: number;
  totalBabies: number;
  activePremium: number;
  totalFree: number;
  newUsersToday: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  totalSleepRecords: number;
  totalRoutineEvents: number;
  recentAuditLogs: AdminAuditLog[];
}

export interface AdminUserListItem {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  plan: SubscriptionPlanType;
  subscriptionStatus: SubscriptionStatus;
  babiesCount: number;
  lastActiveAt?: string;
  isBlocked?: boolean;
}

export interface AdminUserDetail extends AdminUserListItem {
  timezone: string;
  babies: {
    id: string;
    name: string;
    birthDate: string;
    gender?: Gender;
    createdAt: string;
  }[];
  subscription?: {
    id: string;
    planType: SubscriptionPlanType;
    status: SubscriptionStatus;
    currentPeriodEnd?: string;
    createdAt: string;
  };
  usageStats: {
    sleepRecordsCount: number;
    feedingRecordsCount: number;
    diaperRecordsCount: number;
    activityRecordsCount: number;
  };
}

export interface AdminBabyListItem {
  id: string;
  name: string;
  birthDate: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  caregiversCount: number;
  createdAt: string;
  lastSleepRecordAt?: string;
  totalSleepRecords: number;
}

export interface AdminSubscriptionListItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planType: SubscriptionPlanType;
  status: SubscriptionStatus;
  isSandbox: boolean;
  createdAt: string;
  currentPeriodEnd?: string;
  updatedAt: string;
}

export interface AdminContentItem {
  id: string;
  type: 'COURSE' | 'LESSON' | 'ARTICLE';
  title: string;
  subtitle?: string;
  categoryOrAgeRange: string;
  status: 'PUBLISHED' | 'DRAFT';
  lessonsCount?: number;
  createdAt: string;
}

export interface AdminSoundItem {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  emoji: string;
  description: string;
  isActive: boolean;
  order: number;
}

export interface AdminSystemSetting {
  key: string;
  value: Record<string, any>;
  description?: string;
  updatedBy?: string;
  updatedAt: string;
}

export interface AdminReportData {
  growthData: { date: string; users: number; babies: number; premium: number }[];
  sleepData: { date: string; napsCount: number; nightSleepMinutes: number; avgNapMinutes: number }[];
  routineData: { date: string; feeding: number; diapers: number; activities: number }[];
  educationData: { courseTitle: string; started: number; completed: number }[];
  planDistribution: { name: string; count: number; value: number }[];
}
