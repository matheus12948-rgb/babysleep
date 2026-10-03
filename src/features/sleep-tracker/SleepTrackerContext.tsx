import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { SleepRecord, SleepType, SleepPrediction } from '@/types';
import { DataService } from '@/services/dataService';
import { useBaby } from '@/features/baby/BabyContext';
import { SleepPredictionEngine } from '@/features/sleep-engine/predictionEngine';
import { differenceInMinutes, parseISO } from 'date-fns';

interface SleepTrackerContextType {
  records: SleepRecord[];
  activeSleep: SleepRecord | null;
  latestPrediction: SleepPrediction | null;
  elapsedSeconds: number;
  loading: boolean;
  startSleep: (type?: SleepType) => Promise<SleepRecord>;
  stopSleep: (notes?: string, qualityRating?: number) => Promise<SleepRecord | null>;
  addManualRecord: (record: Omit<SleepRecord, 'id' | 'babyId' | 'createdAt' | 'updatedAt'>) => Promise<SleepRecord>;
  deleteRecord: (id: string) => Promise<void>;
  refreshRecords: () => Promise<void>;
}

const SleepTrackerContext = createContext<SleepTrackerContextType | undefined>(undefined);

export const SleepTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeBaby } = useBaby();
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [latestPrediction, setLatestPrediction] = useState<SleepPrediction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const activeSleep = useMemo(() => {
    return records.find(r => r.isOngoing) || null;
  }, [records]);

  // Timer em tempo real quando há sono em andamento
  useEffect(() => {
    if (!activeSleep) {
      setElapsedSeconds(0);
      return;
    }

    const updateTimer = () => {
      const startTime = new Date(activeSleep.startTime).getTime();
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((now - startTime) / 1000));
      setElapsedSeconds(diffSecs);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSleep]);

  const refreshRecords = useCallback(async () => {
    if (!activeBaby) {
      setRecords([]);
      setLatestPrediction(null);
      setLoading(false);
      return;
    }

    try {
      const fetched = await DataService.getSleepRecords(activeBaby.id);
      setRecords(fetched);

      // Calcula estimativa da próxima janela de sono
      const lastCompleted = fetched.find(r => !r.isOngoing);
      const prediction = SleepPredictionEngine.calculateNextSleep({
        babyId: activeBaby.id,
        birthDate: activeBaby.birthDate,
        lastSleepRecord: lastCompleted,
        recentSleepRecords: fetched.slice(0, 10),
      });

      setLatestPrediction(prediction);
      await DataService.savePrediction(prediction);
    } catch (err) {
      console.error('Erro ao atualizar registros de sono:', err);
    } finally {
      setLoading(false);
    }
  }, [activeBaby]);

  useEffect(() => {
    refreshRecords();
  }, [refreshRecords]);

  // AÇÃO RÁPIDA: Iniciar Sono (1 Toque)
  const startSleep = async (type: SleepType = 'NAP'): Promise<SleepRecord> => {
    if (!activeBaby) throw new Error('Nenhum bebê selecionado');

    const now = new Date();
    const nowIso = now.toISOString();

    // Se havia uma previsão ativa, calcula calibração Previsão vs Realidade
    if (latestPrediction) {
      const { diffMinutes } = SleepPredictionEngine.comparePredictionWithReality(
        latestPrediction,
        nowIso
      );
      latestPrediction.actualSleepTime = nowIso;
      latestPrediction.diffMinutes = diffMinutes;
      await DataService.savePrediction(latestPrediction);
    }

    const newRecord: SleepRecord = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'sleep-' + Date.now(),
      babyId: activeBaby.id,
      type,
      startTime: nowIso,
      isOngoing: true,
      isManuallyAdded: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const saved = await DataService.saveSleepRecord(newRecord);
    await refreshRecords();
    return saved;
  };

  // AÇÃO RÁPIDA: Finalizar Sono
  const stopSleep = async (notes?: string, qualityRating?: number): Promise<SleepRecord | null> => {
    if (!activeSleep) return null;

    const endTime = new Date().toISOString();
    const duration = Math.max(1, differenceInMinutes(parseISO(endTime), parseISO(activeSleep.startTime)));

    const updated: SleepRecord = {
      ...activeSleep,
      endTime,
      durationMinutes: duration,
      isOngoing: false,
      notes: notes || activeSleep.notes,
      qualityRating: qualityRating || activeSleep.qualityRating,
      updatedAt: endTime,
    };

    const saved = await DataService.saveSleepRecord(updated);
    await refreshRecords();
    return saved;
  };

  // Registro Manual Retroativo
  const addManualRecord = async (
    record: Omit<SleepRecord, 'id' | 'babyId' | 'createdAt' | 'updatedAt'>
  ): Promise<SleepRecord> => {
    if (!activeBaby) throw new Error('Nenhum bebê selecionado');

    const nowIso = new Date().toISOString();
    let duration = record.durationMinutes;
    if (!duration && record.endTime) {
      duration = Math.max(1, differenceInMinutes(parseISO(record.endTime), parseISO(record.startTime)));
    }

    const fullRecord: SleepRecord = {
      ...record,
      id: crypto.randomUUID ? crypto.randomUUID() : 'manual-' + Date.now(),
      babyId: activeBaby.id,
      durationMinutes: duration,
      isManuallyAdded: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const saved = await DataService.saveSleepRecord(fullRecord);
    await refreshRecords();
    return saved;
  };

  const deleteRecord = async (id: string): Promise<void> => {
    await DataService.deleteSleepRecord(id);
    await refreshRecords();
  };

  return (
    <SleepTrackerContext.Provider
      value={{
        records,
        activeSleep,
        latestPrediction,
        elapsedSeconds,
        loading,
        startSleep,
        stopSleep,
        addManualRecord,
        deleteRecord,
        refreshRecords,
      }}
    >
      {children}
    </SleepTrackerContext.Provider>
  );
};

export const useSleepTracker = () => {
  const context = useContext(SleepTrackerContext);
  if (!context) throw new Error('useSleepTracker deve ser usado dentro de um SleepTrackerProvider');
  return context;
};
