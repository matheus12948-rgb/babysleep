import { 
  BabyProfile, 
  SleepRecord, 
  SleepPrediction, 
  BabyJournalEntry, 
  UserProfile,
  FeedingRecord,
  DiaperRecord,
  ActivityRecord,
  UserEducationProgress,
  Caregiver,
  CaregiverInvitation,
  CaregiverRole,
  UserSubscription,
  SubscriptionPlanType,
  SubscriptionStatus,
  PediatricReportData
} from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  PROFILE: 'babysleep_user_profile',
  BABIES: 'babysleep_babies_list',
  ACTIVE_BABY_ID: 'babysleep_active_baby_id',
  SLEEP_RECORDS: 'babysleep_records',
  PREDICTIONS: 'babysleep_predictions',
  JOURNAL: 'babysleep_journal',
  AUTH_SESSION: 'babysleep_mock_session',
  OFFLINE_QUEUE: 'babysleep_sync_queue',
  FEEDING_RECORDS: 'babysleep_feeding_records',
  DIAPER_RECORDS: 'babysleep_diaper_records',
  ACTIVITY_RECORDS: 'babysleep_activity_records',
  EDUCATION_PROGRESS: 'babysleep_education_progress',
  CAREGIVERS: 'babysleep_caregivers',
  CAREGIVER_INVITATIONS: 'babysleep_caregiver_invitations',
  USER_SUBSCRIPTIONS: 'babysleep_user_subscriptions',
};

export class DataService {
  // ----------------------------------------------------
  // AUTENTICAÇÃO E PERFIL
  // ----------------------------------------------------
  public static async getUserProfile(): Promise<UserProfile | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          return {
            id: data.id,
            email: user.email,
            fullName: data.full_name || 'Cuidador',
            avatarUrl: data.avatar_url,
            timezone: data.timezone || 'America/Sao_Paulo',
            isAdmin: data.is_admin,
            createdAt: data.created_at,
          };
        }
      } catch (err) {
        console.warn('Supabase profile query failed, using local fallback:', err);
      }
    }

    const localProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return localProfile ? JSON.parse(localProfile) : null;
  }

  public static async saveUserProfile(profile: UserProfile): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').upsert({
          id: profile.id,
          full_name: profile.fullName,
          avatar_url: profile.avatarUrl,
          timezone: profile.timezone,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Failed to upsert profile in Supabase:', err);
      }
    }
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  // ----------------------------------------------------
  // BEBÊS (CRUD COMPLETO COM SUPORTE MULTI-BEBÊ)
  // ----------------------------------------------------
  public static async getBabies(userId: string): Promise<BabyProfile[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('babies')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data) {
          const remoteList: BabyProfile[] = data.map(b => ({
            id: b.id,
            ownerId: b.owner_id,
            name: b.name,
            birthDate: b.birth_date,
            gender: b.gender,
            habitualWakeTime: b.habitual_wake_time || '07:00:00',
            habitualBedtime: b.habitual_bedtime || '19:30:00',
            expectedNapsCount: b.expected_naps_count || 3,
            parentingGoal: b.parenting_goal,
            avatarUrl: b.avatar_url,
            createdAt: b.created_at,
            updatedAt: b.updated_at,
          }));

          // Atualiza cache local
          localStorage.setItem(STORAGE_KEYS.BABIES, JSON.stringify(remoteList));
          return remoteList;
        }
      } catch (err) {
        console.warn('Failed to fetch babies from Supabase:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.BABIES);
    if (!local) return [];
    const list: BabyProfile[] = JSON.parse(local);
    return list.filter(b => b.ownerId === userId);
  }

  public static async saveBaby(baby: BabyProfile): Promise<BabyProfile> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('babies')
          .upsert({
            id: baby.id.startsWith('baby-') ? undefined : baby.id,
            owner_id: baby.ownerId,
            name: baby.name,
            birth_date: baby.birthDate,
            gender: baby.gender,
            habitual_wake_time: baby.habitualWakeTime,
            habitual_bedtime: baby.habitualBedtime,
            expected_naps_count: baby.expectedNapsCount,
            parenting_goal: baby.parentingGoal,
            avatar_url: baby.avatarUrl,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!error && data) {
          baby.id = data.id;
        }
      } catch (err) {
        console.warn('Failed to save baby to Supabase:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.BABIES);
    const list: BabyProfile[] = local ? JSON.parse(local) : [];
    const index = list.findIndex(b => b.id === baby.id);

    if (index >= 0) {
      list[index] = baby;
    } else {
      list.push(baby);
    }

    localStorage.setItem(STORAGE_KEYS.BABIES, JSON.stringify(list));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BABY_ID, baby.id);
    return baby;
  }

  public static async deleteBaby(babyId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('babies').delete().eq('id', babyId);
      } catch (err) {
        console.warn('Failed to delete baby from Supabase:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.BABIES);
    if (local) {
      const list: BabyProfile[] = JSON.parse(local);
      const filtered = list.filter(b => b.id !== babyId);
      localStorage.setItem(STORAGE_KEYS.BABIES, JSON.stringify(filtered));

      const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_BABY_ID);
      if (activeId === babyId) {
        const nextActive = filtered.length > 0 ? filtered[0].id : '';
        if (nextActive) {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_BABY_ID, nextActive);
        } else {
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_BABY_ID);
        }
      }
    }
  }

  public static getActiveBabyId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_BABY_ID);
  }

  public static setActiveBabyId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BABY_ID, id);
  }

  public static async getBabyProfile(babyId: string): Promise<BabyProfile | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('babies')
          .select('*')
          .eq('id', babyId)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            ownerId: data.owner_id,
            name: data.name,
            birthDate: data.birth_date,
            gender: data.gender,
            habitualWakeTime: data.habitual_wake_time || '07:00:00',
            habitualBedtime: data.habitual_bedtime || '19:30:00',
            expectedNapsCount: data.expected_naps_count || 3,
            parentingGoal: data.parenting_goal,
            avatarUrl: data.avatar_url,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (err) {
        console.warn('Failed to query baby profile from Supabase:', err);
      }
    }

    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(STORAGE_KEYS.BABIES);
      if (local) {
        const list: BabyProfile[] = JSON.parse(local);
        return list.find(b => b.id === babyId) || null;
      }
    }

    return null;
  }

  public static async saveBabyProfile(baby: BabyProfile): Promise<BabyProfile> {
    return this.saveBaby(baby);
  }

  // ----------------------------------------------------
  // REGISTROS DE SONO (CRUD COMPLETO COM DESDUPLICAÇÃO)
  // ----------------------------------------------------
  public static async getSleepRecords(babyId: string): Promise<SleepRecord[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('sleep_records')
          .select('*, awakenings:sleep_awakenings(*)')
          .eq('baby_id', babyId)
          .order('start_time', { ascending: false });

        if (!error && data) {
          const records: SleepRecord[] = data.map(r => ({
            id: r.id,
            babyId: r.baby_id,
            type: r.type,
            startTime: r.start_time,
            endTime: r.end_time,
            durationMinutes: r.duration_minutes,
            qualityRating: r.quality_rating,
            isOngoing: r.is_ongoing,
            isManuallyAdded: r.is_manually_added,
            notes: r.notes,
            awakenings: r.awakenings || [],
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }));

          // Atualiza cache local mesclando sem duplicar
          this.mergeLocalRecords(babyId, records);
          return records;
        }
      } catch (err) {
        console.warn('Failed to fetch sleep records from Supabase:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.SLEEP_RECORDS);
    if (!local) return [];
    const list: SleepRecord[] = JSON.parse(local);
    return list
      .filter(r => r.babyId === babyId)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  private static mergeLocalRecords(babyId: string, remoteRecords: SleepRecord[]): void {
    const local = localStorage.getItem(STORAGE_KEYS.SLEEP_RECORDS);
    const existing: SleepRecord[] = local ? JSON.parse(local) : [];
    const otherBabies = existing.filter(r => r.babyId !== babyId);

    // Dicionário por id para evitar qualquer duplicação
    const recordMap = new Map<string, SleepRecord>();
    remoteRecords.forEach(r => recordMap.set(r.id, r));
    
    // Preserva apenas locais que ainda não subiram
    existing.filter(r => r.babyId === babyId).forEach(r => {
      if (!recordMap.has(r.id)) {
        recordMap.set(r.id, r);
      }
    });

    const merged = [...otherBabies, ...Array.from(recordMap.values())];
    localStorage.setItem(STORAGE_KEYS.SLEEP_RECORDS, JSON.stringify(merged));
  }

  public static async saveSleepRecord(record: SleepRecord): Promise<SleepRecord> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('sleep_records')
          .upsert({
            id: record.id.startsWith('sleep-') || record.id.startsWith('manual-') || record.id.startsWith('rec-') ? undefined : record.id,
            baby_id: record.babyId,
            type: record.type,
            start_time: record.startTime,
            end_time: record.endTime,
            duration_minutes: record.durationMinutes,
            quality_rating: record.qualityRating,
            is_ongoing: record.isOngoing,
            is_manually_added: record.isManuallyAdded,
            notes: record.notes,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!error && data) {
          record.id = data.id;
        }
      } catch (err) {
        console.warn('Failed to save sleep record in Supabase:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.SLEEP_RECORDS);
    const list: SleepRecord[] = local ? JSON.parse(local) : [];
    const index = list.findIndex(r => r.id === record.id);

    if (index >= 0) {
      list[index] = record;
    } else {
      list.unshift(record);
    }

    localStorage.setItem(STORAGE_KEYS.SLEEP_RECORDS, JSON.stringify(list));
    return record;
  }

  public static async deleteSleepRecord(recordId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('sleep_records').delete().eq('id', recordId);
      } catch (err) {
        console.warn('Failed to delete sleep record in Supabase:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.SLEEP_RECORDS);
    if (local) {
      const list: SleepRecord[] = JSON.parse(local);
      const filtered = list.filter(r => r.id !== recordId);
      localStorage.setItem(STORAGE_KEYS.SLEEP_RECORDS, JSON.stringify(filtered));
    }
  }

  // ----------------------------------------------------
  // PREVISÕES DE SONO E HISTÓRICO DE CALIBRAÇÃO
  // ----------------------------------------------------
  public static async savePrediction(prediction: SleepPrediction): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('sleep_predictions').insert({
          baby_id: prediction.babyId,
          calculated_at: prediction.calculatedAt,
          predicted_sleep_time: prediction.predictedSleepTime,
          window_start_time: prediction.windowStartTime,
          window_end_time: prediction.windowEndTime,
          estimated_duration_minutes: prediction.estimatedDurationMinutes,
          confidence_level: prediction.confidenceLevel,
          actual_sleep_time: prediction.actualSleepTime,
          diff_minutes: prediction.diffMinutes,
          prediction_type: prediction.predictionType,
          model_inputs: prediction.modelInputs,
        });
      } catch (err) {
        console.warn('Failed to save sleep prediction to Supabase:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.PREDICTIONS);
    const list: SleepPrediction[] = local ? JSON.parse(local) : [];
    list.unshift(prediction);
    // Preserva histórico para calibração futura sem sobrescrever
    localStorage.setItem(STORAGE_KEYS.PREDICTIONS, JSON.stringify(list.slice(0, 100)));
  }

  public static async getLatestPrediction(babyId: string): Promise<SleepPrediction | null> {
    const local = localStorage.getItem(STORAGE_KEYS.PREDICTIONS);
    if (!local) return null;
    const list: SleepPrediction[] = JSON.parse(local);
    return list.find(p => p.babyId === babyId) || null;
  }

  // ----------------------------------------------------
  // DIÁRIO DO BEBÊ (CRUD COMPLETO)
  // ----------------------------------------------------
  public static async getJournalEntries(babyId: string): Promise<BabyJournalEntry[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('baby_journal')
          .select('*')
          .eq('baby_id', babyId)
          .order('date', { ascending: false });

        if (!error && data) {
          const entries: BabyJournalEntry[] = data.map(j => ({
            id: j.id,
            babyId: j.baby_id,
            date: j.date,
            time: j.time,
            mood: j.mood,
            content: j.content,
            tags: j.tags,
            associatedEventType: j.associated_event_type,
            associatedEventId: j.associated_event_id,
            createdAt: j.created_at,
          }));

          localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(entries));
          return entries;
        }
      } catch (err) {
        console.warn('Failed to fetch journal entries from Supabase:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.JOURNAL);
    if (!local) return [];
    const list: BabyJournalEntry[] = JSON.parse(local);
    return list.filter(j => j.babyId === babyId);
  }

  public static async saveJournalEntry(entry: BabyJournalEntry): Promise<BabyJournalEntry> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('baby_journal')
          .upsert({
            id: entry.id.startsWith('journal-') ? undefined : entry.id,
            baby_id: entry.babyId,
            date: entry.date,
            time: entry.time,
            mood: entry.mood,
            content: entry.content,
            tags: entry.tags,
            associated_event_type: entry.associatedEventType,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!error && data) {
          entry.id = data.id;
        }
      } catch (err) {
        console.warn('Failed to upsert journal entry in Supabase:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.JOURNAL);
    const list: BabyJournalEntry[] = local ? JSON.parse(local) : [];
    const index = list.findIndex(j => j.id === entry.id);

    if (index >= 0) {
      list[index] = entry;
    } else {
      list.unshift(entry);
    }

    localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(list));
    return entry;
  }

  public static async deleteJournalEntry(entryId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('baby_journal').delete().eq('id', entryId);
      } catch (err) {
        console.warn('Failed to delete journal entry in Supabase:', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.JOURNAL);
    if (local) {
      const list: BabyJournalEntry[] = JSON.parse(local);
      const filtered = list.filter(j => j.id !== entryId);
      localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(filtered));
    }
  }

  // ----------------------------------------------------
  // ALIMENTAÇÃO (AMAMENTAÇÃO, MAMADEIRA, INTRODUÇÃO ALIMENTAR)
  // ----------------------------------------------------
  public static async getFeedingRecords(babyId: string): Promise<FeedingRecord[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('feeding_records')
          .select('*')
          .eq('baby_id', babyId)
          .order('timestamp', { ascending: false });

        if (!error && data) {
          const remotes: FeedingRecord[] = data.map(f => ({
            id: f.id,
            babyId: f.baby_id,
            type: f.type,
            timestamp: f.timestamp,
            endTime: f.end_time || undefined,
            breastSide: f.breast_side || undefined,
            breastDurationMinutes: f.breast_duration_minutes != null ? Number(f.breast_duration_minutes) : undefined,
            leftDurationMinutes: f.left_duration_minutes != null ? Number(f.left_duration_minutes) : 0,
            rightDurationMinutes: f.right_duration_minutes != null ? Number(f.right_duration_minutes) : 0,
            bottleAmountMl: f.bottle_amount_ml != null ? Number(f.bottle_amount_ml) : undefined,
            bottleContents: f.bottle_contents || undefined,
            solidFoodName: f.solid_food_name || undefined,
            solidFoodReaction: f.solid_food_reaction || undefined,
            notes: f.notes || undefined,
            createdAt: f.created_at,
            updatedAt: f.updated_at || f.created_at,
          }));

          // Merge com local deduplicado
          const localStr = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.FEEDING_RECORDS) : null;
          const localList: FeedingRecord[] = localStr ? JSON.parse(localStr) : [];
          const remoteIds = new Set(remotes.map(r => r.id));
          const unsynced = localList.filter(l => l.babyId === babyId && !remoteIds.has(l.id) && l.id.startsWith('feeding-temp-'));
          const merged = [...unsynced, ...remotes].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

          if (typeof localStorage !== 'undefined') {
            const allLocal = localList.filter(l => l.babyId !== babyId).concat(merged);
            localStorage.setItem(STORAGE_KEYS.FEEDING_RECORDS, JSON.stringify(allLocal));
          }
          return merged;
        }
      } catch (err) {
        console.warn('Failed to fetch feeding records from Supabase:', err);
      }
    }

    if (typeof localStorage === 'undefined') return [];
    const local = localStorage.getItem(STORAGE_KEYS.FEEDING_RECORDS);
    if (!local) return [];
    const list: FeedingRecord[] = JSON.parse(local);
    return list.filter(f => f.babyId === babyId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public static async saveFeedingRecord(record: FeedingRecord): Promise<FeedingRecord> {
    const isTempId = record.id.startsWith('feeding-temp-');

    if (isSupabaseConfigured && supabase) {
      try {
        const payload: Record<string, unknown> = {
          baby_id: record.babyId,
          type: record.type,
          timestamp: record.timestamp,
          end_time: record.endTime || null,
          breast_side: record.breastSide || null,
          breast_duration_minutes: record.breastDurationMinutes ?? null,
          left_duration_minutes: record.leftDurationMinutes ?? 0,
          right_duration_minutes: record.rightDurationMinutes ?? 0,
          bottle_amount_ml: record.bottleAmountMl ?? null,
          bottle_contents: record.bottleContents || null,
          solid_food_name: record.solidFoodName || null,
          solid_food_reaction: record.solidFoodReaction || null,
          notes: record.notes || null,
          updated_at: new Date().toISOString(),
        };

        if (!isTempId) {
          payload.id = record.id;
        }

        const { data, error } = await supabase
          .from('feeding_records')
          .upsert(payload)
          .select()
          .single();

        if (!error && data) {
          record.id = data.id;
        }
      } catch (err) {
        console.warn('Failed to upsert feeding record in Supabase:', err);
      }
    }

    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(STORAGE_KEYS.FEEDING_RECORDS);
      const list: FeedingRecord[] = local ? JSON.parse(local) : [];
      const index = list.findIndex(f => f.id === record.id);
      if (index >= 0) {
        list[index] = record;
      } else {
        list.unshift(record);
      }
      localStorage.setItem(STORAGE_KEYS.FEEDING_RECORDS, JSON.stringify(list));
    }

    return record;
  }

  public static async deleteFeedingRecord(recordId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('feeding_records').delete().eq('id', recordId);
      } catch (err) {
        console.warn('Failed to delete feeding record in Supabase:', err);
      }
    }

    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(STORAGE_KEYS.FEEDING_RECORDS);
      if (local) {
        const list: FeedingRecord[] = JSON.parse(local);
        const filtered = list.filter(f => f.id !== recordId);
        localStorage.setItem(STORAGE_KEYS.FEEDING_RECORDS, JSON.stringify(filtered));
      }
    }
  }

  // ----------------------------------------------------
  // FRALDAS (XIXI, COCÔ, AMBOS)
  // ----------------------------------------------------
  public static async getDiaperRecords(babyId: string): Promise<DiaperRecord[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('diaper_records')
          .select('*')
          .eq('baby_id', babyId)
          .order('timestamp', { ascending: false });

        if (!error && data) {
          const remotes: DiaperRecord[] = data.map(d => ({
            id: d.id,
            babyId: d.baby_id,
            timestamp: d.timestamp,
            type: d.type,
            consistency: d.consistency || undefined,
            color: d.color || undefined,
            notes: d.notes || undefined,
            createdAt: d.created_at,
            updatedAt: d.updated_at || d.created_at,
          }));

          const localStr = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.DIAPER_RECORDS) : null;
          const localList: DiaperRecord[] = localStr ? JSON.parse(localStr) : [];
          const remoteIds = new Set(remotes.map(r => r.id));
          const unsynced = localList.filter(l => l.babyId === babyId && !remoteIds.has(l.id) && l.id.startsWith('diaper-temp-'));
          const merged = [...unsynced, ...remotes].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

          if (typeof localStorage !== 'undefined') {
            const allLocal = localList.filter(l => l.babyId !== babyId).concat(merged);
            localStorage.setItem(STORAGE_KEYS.DIAPER_RECORDS, JSON.stringify(allLocal));
          }
          return merged;
        }
      } catch (err) {
        console.warn('Failed to fetch diaper records from Supabase:', err);
      }
    }

    if (typeof localStorage === 'undefined') return [];
    const local = localStorage.getItem(STORAGE_KEYS.DIAPER_RECORDS);
    if (!local) return [];
    const list: DiaperRecord[] = JSON.parse(local);
    return list.filter(d => d.babyId === babyId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public static async saveDiaperRecord(record: DiaperRecord): Promise<DiaperRecord> {
    const isTempId = record.id.startsWith('diaper-temp-');

    if (isSupabaseConfigured && supabase) {
      try {
        const payload: Record<string, unknown> = {
          baby_id: record.babyId,
          timestamp: record.timestamp,
          type: record.type,
          consistency: record.consistency || null,
          color: record.color || null,
          notes: record.notes || null,
          updated_at: new Date().toISOString(),
        };

        if (!isTempId) {
          payload.id = record.id;
        }

        const { data, error } = await supabase
          .from('diaper_records')
          .upsert(payload)
          .select()
          .single();

        if (!error && data) {
          record.id = data.id;
        }
      } catch (err) {
        console.warn('Failed to upsert diaper record in Supabase:', err);
      }
    }

    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(STORAGE_KEYS.DIAPER_RECORDS);
      const list: DiaperRecord[] = local ? JSON.parse(local) : [];
      const index = list.findIndex(d => d.id === record.id);
      if (index >= 0) {
        list[index] = record;
      } else {
        list.unshift(record);
      }
      localStorage.setItem(STORAGE_KEYS.DIAPER_RECORDS, JSON.stringify(list));
    }

    return record;
  }

  public static async deleteDiaperRecord(recordId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('diaper_records').delete().eq('id', recordId);
      } catch (err) {
        console.warn('Failed to delete diaper record in Supabase:', err);
      }
    }

    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(STORAGE_KEYS.DIAPER_RECORDS);
      if (local) {
        const list: DiaperRecord[] = JSON.parse(local);
        const filtered = list.filter(d => d.id !== recordId);
        localStorage.setItem(STORAGE_KEYS.DIAPER_RECORDS, JSON.stringify(filtered));
      }
    }
  }

  // ----------------------------------------------------
  // ATIVIDADES E CUIDADOS (BANHO, TEMPERATURA, MEDICAMENTO, PASSEIO)
  // ----------------------------------------------------
  public static async getActivityRecords(babyId: string): Promise<ActivityRecord[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('activity_records')
          .select('*')
          .eq('baby_id', babyId)
          .order('timestamp', { ascending: false });

        if (!error && data) {
          const remotes: ActivityRecord[] = data.map(a => ({
            id: a.id,
            babyId: a.baby_id,
            timestamp: a.timestamp,
            category: a.category,
            valueNumeric: a.value_numeric != null ? Number(a.value_numeric) : undefined,
            unit: a.unit || undefined,
            measurementMethod: a.measurement_method || undefined,
            medicineName: a.medicine_name || undefined,
            durationMinutes: a.duration_minutes != null ? Number(a.duration_minutes) : undefined,
            notes: a.notes || undefined,
            createdAt: a.created_at,
            updatedAt: a.updated_at || a.created_at,
          }));

          const localStr = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ACTIVITY_RECORDS) : null;
          const localList: ActivityRecord[] = localStr ? JSON.parse(localStr) : [];
          const remoteIds = new Set(remotes.map(r => r.id));
          const unsynced = localList.filter(l => l.babyId === babyId && !remoteIds.has(l.id) && l.id.startsWith('act-temp-'));
          const merged = [...unsynced, ...remotes].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

          if (typeof localStorage !== 'undefined') {
            const allLocal = localList.filter(l => l.babyId !== babyId).concat(merged);
            localStorage.setItem(STORAGE_KEYS.ACTIVITY_RECORDS, JSON.stringify(allLocal));
          }
          return merged;
        }
      } catch (err) {
        console.warn('Failed to fetch activity records from Supabase:', err);
      }
    }

    if (typeof localStorage === 'undefined') return [];
    const local = localStorage.getItem(STORAGE_KEYS.ACTIVITY_RECORDS);
    if (!local) return [];
    const list: ActivityRecord[] = JSON.parse(local);
    return list.filter(a => a.babyId === babyId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public static async saveActivityRecord(record: ActivityRecord): Promise<ActivityRecord> {
    const isTempId = record.id.startsWith('act-temp-');

    if (isSupabaseConfigured && supabase) {
      try {
        const payload: Record<string, unknown> = {
          baby_id: record.babyId,
          timestamp: record.timestamp,
          category: record.category,
          value_numeric: record.valueNumeric ?? null,
          unit: record.unit || null,
          measurement_method: record.measurementMethod || null,
          medicine_name: record.medicineName || null,
          duration_minutes: record.durationMinutes ?? null,
          notes: record.notes || null,
          updated_at: new Date().toISOString(),
        };

        if (!isTempId) {
          payload.id = record.id;
        }

        const { data, error } = await supabase
          .from('activity_records')
          .upsert(payload)
          .select()
          .single();

        if (!error && data) {
          record.id = data.id;
        }
      } catch (err) {
        console.warn('Failed to upsert activity record in Supabase:', err);
      }
    }

    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(STORAGE_KEYS.ACTIVITY_RECORDS);
      const list: ActivityRecord[] = local ? JSON.parse(local) : [];
      const index = list.findIndex(a => a.id === record.id);
      if (index >= 0) {
        list[index] = record;
      } else {
        list.unshift(record);
      }
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_RECORDS, JSON.stringify(list));
    }

    return record;
  }

  public static async deleteActivityRecord(recordId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('activity_records').delete().eq('id', recordId);
      } catch (err) {
        console.warn('Failed to delete activity record in Supabase:', err);
      }
    }

    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(STORAGE_KEYS.ACTIVITY_RECORDS);
      if (local) {
        const list: ActivityRecord[] = JSON.parse(local);
        const filtered = list.filter(a => a.id !== recordId);
        localStorage.setItem(STORAGE_KEYS.ACTIVITY_RECORDS, JSON.stringify(filtered));
      }
    }
  }

  // ----------------------------------------------------
  // EDUCAÇÃO E CONTEÚDOS (FASE 4)
  // ----------------------------------------------------
  public static async getEducationProgress(userId: string): Promise<UserEducationProgress[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_education_progress')
          .select('*')
          .eq('user_id', userId);

        if (!error && data) {
          return data.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            contentType: item.content_type,
            contentId: item.content_id,
            courseId: item.course_id || undefined,
            isCompleted: item.is_completed,
            isBookmarked: item.is_bookmarked,
            lastReadAt: item.last_read_at,
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch education progress in Supabase:', err);
      }
    }

    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(STORAGE_KEYS.EDUCATION_PROGRESS);
      if (local) {
        const list: UserEducationProgress[] = JSON.parse(local);
        return list.filter(p => p.userId === userId);
      }
    }

    return [];
  }

  public static async saveEducationProgress(progress: UserEducationProgress): Promise<UserEducationProgress> {
    if (isSupabaseConfigured && supabase) {
      try {
        const payload: Record<string, unknown> = {
          user_id: progress.userId,
          content_type: progress.contentType,
          content_id: progress.contentId,
          course_id: progress.courseId || null,
          is_completed: progress.isCompleted,
          is_bookmarked: progress.isBookmarked,
          last_read_at: progress.lastReadAt,
          updated_at: new Date().toISOString(),
        };

        if (progress.id && !progress.id.startsWith('edu-temp-')) {
          payload.id = progress.id;
        }

        const { data, error } = await supabase
          .from('user_education_progress')
          .upsert(payload, { onConflict: 'user_id,content_type,content_id' })
          .select()
          .single();

        if (!error && data) {
          progress.id = data.id;
        }
      } catch (err) {
        console.warn('Failed to save education progress in Supabase:', err);
      }
    }

    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(STORAGE_KEYS.EDUCATION_PROGRESS);
      const list: UserEducationProgress[] = local ? JSON.parse(local) : [];
      const index = list.findIndex(
        p => p.userId === progress.userId && p.contentType === progress.contentType && p.contentId === progress.contentId
      );
      if (index >= 0) {
        list[index] = progress;
      } else {
        list.push(progress);
      }
      localStorage.setItem(STORAGE_KEYS.EDUCATION_PROGRESS, JSON.stringify(list));
    }

    return progress;
  }

  // ----------------------------------------------------
  // FASE 5: MULTI-CUIDADOR (CAREGIVERS & CONVITES)
  // ----------------------------------------------------
  public static async getBabyCaregivers(babyId: string): Promise<Caregiver[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('caregivers')
          .select(`
            id,
            baby_id,
            user_id,
            role,
            created_at,
            profiles:user_id (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('baby_id', babyId);

        if (!error && data) {
          return data.map((item: any) => ({
            id: item.id,
            babyId: item.baby_id,
            userId: item.user_id,
            role: item.role as CaregiverRole,
            userName: item.profiles?.full_name || 'Cuidador',
            avatarUrl: item.profiles?.avatar_url,
            createdAt: item.created_at,
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch caregivers from Supabase:', err);
      }
    }

    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(STORAGE_KEYS.CAREGIVERS);
      if (local) {
        const list: Caregiver[] = JSON.parse(local);
        return list.filter(c => c.babyId === babyId);
      }
    }

    return [];
  }

  public static async createCaregiverInvitation(invitationData: {
    babyId: string;
    invitedByUserId: string;
    email: string;
    role: CaregiverRole;
  }): Promise<CaregiverInvitation> {
    // Gera código único amigável de 6 caracteres alfanuméricos
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomCode = 'BS-';
    for (let i = 0; i < 4; i++) {
      randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 dias

    const newInvitation: CaregiverInvitation = {
      id: `inv-${Date.now()}`,
      babyId: invitationData.babyId,
      invitedByUserId: invitationData.invitedByUserId,
      email: invitationData.email.toLowerCase().trim(),
      role: invitationData.role,
      inviteCode: randomCode,
      status: 'PENDING',
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('caregiver_invitations')
          .insert({
            baby_id: newInvitation.babyId,
            invited_by_user_id: newInvitation.invitedByUserId,
            email: newInvitation.email,
            role: newInvitation.role,
            invite_code: newInvitation.inviteCode,
            status: newInvitation.status,
            expires_at: newInvitation.expiresAt,
          })
          .select()
          .single();

        if (!error && data) {
          newInvitation.id = data.id;
        }
      } catch (err) {
        console.warn('Failed to insert invitation in Supabase:', err);
      }
    }

    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(STORAGE_KEYS.CAREGIVER_INVITATIONS);
      const list: CaregiverInvitation[] = local ? JSON.parse(local) : [];
      list.push(newInvitation);
      localStorage.setItem(STORAGE_KEYS.CAREGIVER_INVITATIONS, JSON.stringify(list));
    }

    return newInvitation;
  }

  public static async getCaregiverInvitations(babyId: string): Promise<CaregiverInvitation[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('caregiver_invitations')
          .select('*')
          .eq('baby_id', babyId)
          .eq('status', 'PENDING');

        if (!error && data) {
          return data.map((item: any) => ({
            id: item.id,
            babyId: item.baby_id,
            invitedByUserId: item.invited_by_user_id,
            email: item.email,
            role: item.role,
            inviteCode: item.invite_code,
            status: item.status,
            expiresAt: item.expires_at,
            createdAt: item.created_at,
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch invitations from Supabase:', err);
      }
    }

    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(STORAGE_KEYS.CAREGIVER_INVITATIONS);
      if (local) {
        const list: CaregiverInvitation[] = JSON.parse(local);
        return list.filter(inv => inv.babyId === babyId && inv.status === 'PENDING');
      }
    }

    return [];
  }

  public static async acceptCaregiverInvitation(
    inviteCode: string,
    userId: string,
    userEmail?: string,
    userName?: string
  ): Promise<{ success: boolean; babyId?: string; role?: CaregiverRole; error?: string }> {
    const cleanCode = inviteCode.trim().toUpperCase();

    // 1. Localizar convite
    let invitation: CaregiverInvitation | null = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('caregiver_invitations')
          .select('*')
          .eq('invite_code', cleanCode)
          .eq('status', 'PENDING')
          .single();

        if (!error && data) {
          invitation = {
            id: data.id,
            babyId: data.baby_id,
            invitedByUserId: data.invited_by_user_id,
            email: data.email,
            role: data.role,
            inviteCode: data.invite_code,
            status: data.status,
            expiresAt: data.expires_at,
            createdAt: data.created_at,
          };
        }
      } catch (err) {
        console.warn('Supabase verify invitation error:', err);
      }
    }

    if (!invitation && typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(STORAGE_KEYS.CAREGIVER_INVITATIONS);
      if (local) {
        const list: CaregiverInvitation[] = JSON.parse(local);
        invitation = list.find(inv => inv.inviteCode === cleanCode && inv.status === 'PENDING') || null;
      }
    }

    if (!invitation) {
      return { success: false, error: 'Código de convite inválido ou já utilizado.' };
    }

    // Verificar expiração
    if (new Date(invitation.expiresAt).getTime() < Date.now()) {
      return { success: false, error: 'Este código de convite expirou (validade de 7 dias).' };
    }

    // 2. Vincular cuidador
    const newCaregiver: Caregiver = {
      id: `cg-${Date.now()}`,
      babyId: invitation.babyId,
      userId,
      role: invitation.role,
      userEmail,
      userName: userName || 'Cuidador Convidado',
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        // Inserir cuidador
        await supabase
          .from('caregivers')
          .upsert({
            baby_id: newCaregiver.babyId,
            user_id: newCaregiver.userId,
            role: newCaregiver.role,
          }, { onConflict: 'baby_id,user_id' });

        // Marcar convite como aceito
        await supabase
          .from('caregiver_invitations')
          .update({ status: 'ACCEPTED', updated_at: new Date().toISOString() })
          .eq('id', invitation.id);
      } catch (err) {
        console.warn('Failed to register accepted caregiver in Supabase:', err);
      }
    }

    if (typeof localStorage !== 'undefined') {
      // Salvar cuidador localmente
      const localCg = localStorage.getItem(STORAGE_KEYS.CAREGIVERS);
      const cgList: Caregiver[] = localCg ? JSON.parse(localCg) : [];
      const existsIdx = cgList.findIndex(c => c.babyId === newCaregiver.babyId && c.userId === userId);
      if (existsIdx >= 0) {
        cgList[existsIdx] = newCaregiver;
      } else {
        cgList.push(newCaregiver);
      }
      localStorage.setItem(STORAGE_KEYS.CAREGIVERS, JSON.stringify(cgList));

      // Atualizar status do convite
      const localInv = localStorage.getItem(STORAGE_KEYS.CAREGIVER_INVITATIONS);
      if (localInv) {
        const invList: CaregiverInvitation[] = JSON.parse(localInv);
        const invIdx = invList.findIndex(i => i.id === invitation!.id);
        if (invIdx >= 0) {
          invList[invIdx].status = 'ACCEPTED';
          localStorage.setItem(STORAGE_KEYS.CAREGIVER_INVITATIONS, JSON.stringify(invList));
        }
      }
    }

    return { 
      success: true, 
      babyId: invitation.babyId, 
      role: invitation.role 
    };
  }

  public static async removeCaregiver(babyId: string, userId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('caregivers')
          .delete()
          .eq('baby_id', babyId)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Failed to delete caregiver in Supabase:', err);
      }
    }

    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(STORAGE_KEYS.CAREGIVERS);
      if (local) {
        const list: Caregiver[] = JSON.parse(local);
        const filtered = list.filter(c => !(c.babyId === babyId && c.userId === userId));
        localStorage.setItem(STORAGE_KEYS.CAREGIVERS, JSON.stringify(filtered));
      }
    }
  }

  public static async revokeInvitation(invitationId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('caregiver_invitations')
          .delete()
          .eq('id', invitationId);
      } catch (err) {
        console.warn('Failed to revoke invitation in Supabase:', err);
      }
    }

    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(STORAGE_KEYS.CAREGIVER_INVITATIONS);
      if (local) {
        const list: CaregiverInvitation[] = JSON.parse(local);
        const filtered = list.filter(i => i.id !== invitationId);
        localStorage.setItem(STORAGE_KEYS.CAREGIVER_INVITATIONS, JSON.stringify(filtered));
      }
    }
  }

  // ----------------------------------------------------
  // FASE 5: ASSINATURAS E STRIPE PAYWALL
  // ----------------------------------------------------
  public static async getUserSubscription(userId: string): Promise<UserSubscription> {
    const defaultSub: UserSubscription = {
      id: `sub-${userId}`,
      userId,
      planType: 'FREE',
      status: 'ACTIVE',
      cancelAtPeriodEnd: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            userId: data.user_id,
            planType: data.plan_type,
            status: data.status,
            stripeCustomerId: data.stripe_customer_id,
            stripeSubscriptionId: data.stripe_subscription_id,
            currentPeriodEnd: data.current_period_end,
            cancelAtPeriodEnd: data.cancel_at_period_end,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (err) {
        console.warn('Failed to query user subscription in Supabase:', err);
      }
    }

    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(STORAGE_KEYS.USER_SUBSCRIPTIONS);
      if (local) {
        const list: UserSubscription[] = JSON.parse(local);
        const found = list.find(s => s.userId === userId);
        if (found) return found;
      }
    }

    return defaultSub;
  }

  public static async updateUserSubscription(
    userId: string,
    planType: SubscriptionPlanType,
    status: SubscriptionStatus = 'ACTIVE'
  ): Promise<UserSubscription> {
    // 30 dias se mensal, 365 dias se anual
    const periodDays = planType === 'PREMIUM_YEARLY' ? 365 : 30;
    const currentPeriodEnd = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString();

    const subscription: UserSubscription = {
      id: `sub-${userId}`,
      userId,
      planType,
      status,
      currentPeriodEnd: planType === 'FREE' ? undefined : currentPeriodEnd,
      cancelAtPeriodEnd: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            plan_type: planType,
            status,
            current_period_end: subscription.currentPeriodEnd || null,
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })
          .select()
          .single();

        if (!error && data) {
          subscription.id = data.id;
        }
      } catch (err) {
        console.warn('Failed to update subscription in Supabase:', err);
      }
    }

    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(STORAGE_KEYS.USER_SUBSCRIPTIONS);
      const list: UserSubscription[] = local ? JSON.parse(local) : [];
      const index = list.findIndex(s => s.userId === userId);
      if (index >= 0) {
        list[index] = subscription;
      } else {
        list.push(subscription);
      }
      localStorage.setItem(STORAGE_KEYS.USER_SUBSCRIPTIONS, JSON.stringify(list));
    }

    return subscription;
  }

  // ----------------------------------------------------
  // FASE 5: RELATÓRIO CLÍNICO PARA CONSULTA DO PEDIATRA
  // ----------------------------------------------------
  public static async generatePediatricReport(
    babyId: string, 
    days: number = 7
  ): Promise<PediatricReportData> {
    const baby = await DataService.getBabyProfile(babyId);
    const userProfile = await DataService.getUserProfile();

    const now = new Date();
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Carregar registros do período
    const allSleep = await DataService.getSleepRecords(babyId);
    const allFeeding = await DataService.getFeedingRecords(babyId);
    const allDiapers = await DataService.getDiaperRecords(babyId);

    const sleepFiltered = allSleep.filter(s => new Date(s.startTime) >= cutoffDate && s.endTime);
    const feedingFiltered = allFeeding.filter(f => new Date(f.timestamp) >= cutoffDate);
    const diapersFiltered = allDiapers.filter(d => new Date(d.timestamp) >= cutoffDate);

    // Cálculos de Sono
    let totalSleepMinutes = 0;
    let totalNapsCount = 0;
    let totalNapMinutes = 0;
    let totalNightMinutes = 0;
    let totalNightSleepsCount = 0;

    sleepFiltered.forEach(s => {
      const dur = s.durationMinutes || 0;
      totalSleepMinutes += dur;
      if (s.type === 'NAP') {
        totalNapsCount++;
        totalNapMinutes += dur;
      } else {
        totalNightSleepsCount++;
        totalNightMinutes += dur;
      }
    });

    const totalSleepHours = Math.round((totalSleepMinutes / 60) * 10) / 10;
    const averageSleepHoursPerDay = Math.round((totalSleepMinutes / 60 / days) * 10) / 10;
    const averageNapsPerDay = Math.round((totalNapsCount / days) * 10) / 10;
    const averageNapDurationMinutes = totalNapsCount > 0 ? Math.round(totalNapMinutes / totalNapsCount) : 0;
    const averageNightSleepDurationHours = totalNightSleepsCount > 0 
      ? Math.round((totalNightMinutes / 60 / totalNightSleepsCount) * 10) / 10 
      : 0;

    // Despertares noturnos médios
    let awakeningsCount = 0;
    sleepFiltered.forEach(s => {
      if (s.awakenings) {
        awakeningsCount += s.awakenings.length;
      }
    });
    const nightAwakeningsAverage = totalNightSleepsCount > 0 
      ? Math.round((awakeningsCount / totalNightSleepsCount) * 10) / 10 
      : 0;

    // Cálculos de Alimentação
    let breastfeedingTotalMinutes = 0;
    let bottleTotalMl = 0;
    let solidMealsCount = 0;

    feedingFiltered.forEach(f => {
      if (f.type === 'BREAST') {
        breastfeedingTotalMinutes += f.breastDurationMinutes || ((f.leftDurationMinutes || 0) + (f.rightDurationMinutes || 0));
      } else if (f.type === 'BOTTLE') {
        bottleTotalMl += Number(f.bottleAmountMl || 0);
      } else if (f.type === 'SOLID') {
        solidMealsCount++;
      }
    });

    // Cálculos de Fraldas
    let wetCount = 0;
    let dirtyCount = 0;
    diapersFiltered.forEach(d => {
      if (d.type === 'WET' || d.type === 'BOTH') wetCount++;
      if (d.type === 'DIRTY' || d.type === 'BOTH') dirtyCount++;
    });

    // Notas e observações
    const notesSummary: string[] = [];
    sleepFiltered.filter(s => s.notes).slice(0, 3).forEach(s => notesSummary.push(`Sono: "${s.notes}"`));
    feedingFiltered.filter(f => f.notes).slice(0, 3).forEach(f => notesSummary.push(`Alimentação: "${f.notes}"`));

    return {
      babyName: baby?.name || 'Bebê',
      babyAgeFormatted: 'Calculada no período',
      periodDays: days,
      startDate: cutoffDate.toLocaleDateString('pt-BR'),
      endDate: now.toLocaleDateString('pt-BR'),
      generatedAt: now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      caregiverName: userProfile?.fullName || 'Responsável',
      totalSleepHours,
      averageSleepHoursPerDay,
      averageNapsPerDay,
      averageNapDurationMinutes,
      averageNightSleepDurationHours,
      nightAwakeningsAverage,
      totalFeedings: feedingFiltered.length,
      feedingsPerDayAverage: Math.round((feedingFiltered.length / days) * 10) / 10,
      breastfeedingTotalMinutes,
      bottleTotalMl,
      solidMealsCount,
      wetDiapersPerDayAverage: Math.round((wetCount / days) * 10) / 10,
      dirtyDiapersPerDayAverage: Math.round((dirtyCount / days) * 10) / 10,
      caregiverNotesSummary: notesSummary,
    };
  }
}
