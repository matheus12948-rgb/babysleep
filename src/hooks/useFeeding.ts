import { useState, useEffect, useRef, useCallback } from 'react';
import { FeedingRecord, BreastSide, BottleContentType, FoodReaction } from '@/types';
import { DataService } from '@/services/dataService';

export function useFeeding(babyId?: string) {
  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Estado do cronômetro de amamentação
  const [activeSide, setActiveSide] = useState<BreastSide | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [leftSeconds, setLeftSeconds] = useState(0);
  const [rightSeconds, setRightSeconds] = useState(0);
  const [startTime, setStartTime] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);

  // Carregar registros de alimentação
  const loadRecords = useCallback(async () => {
    if (!babyId) return;
    setLoading(true);
    try {
      const records = await DataService.getFeedingRecords(babyId);
      setFeedingRecords(records);
    } catch (err) {
      console.error('Error loading feeding records:', err);
    } finally {
      setLoading(false);
    }
  }, [babyId]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Efeito do cronômetro
  useEffect(() => {
    if (activeSide && !isPaused) {
      timerRef.current = window.setInterval(() => {
        if (activeSide === 'LEFT') {
          setLeftSeconds(prev => prev + 1);
        } else if (activeSide === 'RIGHT') {
          setRightSeconds(prev => prev + 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeSide, isPaused]);

  // Controles de Amamentação
  const startBreastfeeding = (side: 'LEFT' | 'RIGHT') => {
    if (!activeSide) {
      setStartTime(new Date().toISOString());
      setLeftSeconds(0);
      setRightSeconds(0);
    }
    setActiveSide(side);
    setIsPaused(false);
  };

  const switchSide = () => {
    if (activeSide === 'LEFT') {
      setActiveSide('RIGHT');
      setIsPaused(false);
    } else if (activeSide === 'RIGHT') {
      setActiveSide('LEFT');
      setIsPaused(false);
    }
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const cancelTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setActiveSide(null);
    setIsPaused(false);
    setLeftSeconds(0);
    setRightSeconds(0);
    setStartTime(null);
  };

  const finishBreastfeeding = async (notes?: string): Promise<FeedingRecord | null> => {
    if (!babyId || !startTime) return null;

    const leftMinutes = Math.max(1, Math.round(leftSeconds / 60));
    const rightMinutes = Math.max(1, Math.round(rightSeconds / 60));
    const totalMinutes = Math.round((leftSeconds + rightSeconds) / 60) || 1;

    let breastSide: BreastSide = 'BOTH';
    if (leftSeconds > 0 && rightSeconds === 0) breastSide = 'LEFT';
    if (rightSeconds > 0 && leftSeconds === 0) breastSide = 'RIGHT';

    const newRecord: FeedingRecord = {
      id: `feeding-temp-${Date.now()}`,
      babyId,
      type: 'BREAST',
      timestamp: startTime,
      endTime: new Date().toISOString(),
      breastSide,
      breastDurationMinutes: totalMinutes,
      leftDurationMinutes: leftMinutes,
      rightDurationMinutes: rightMinutes,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await DataService.saveFeedingRecord(newRecord);
    setFeedingRecords(prev => [saved, ...prev.filter(r => r.id !== saved.id)]);

    cancelTimer();
    return saved;
  };

  // Salvar registro de mamadeira
  const saveBottle = async (data: {
    amountMl: number;
    contents: BottleContentType;
    timestamp?: string;
    notes?: string;
  }): Promise<FeedingRecord | null> => {
    if (!babyId) return null;

    const record: FeedingRecord = {
      id: `feeding-temp-${Date.now()}`,
      babyId,
      type: 'BOTTLE',
      timestamp: data.timestamp || new Date().toISOString(),
      bottleAmountMl: data.amountMl,
      bottleContents: data.contents,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await DataService.saveFeedingRecord(record);
    setFeedingRecords(prev => [saved, ...prev.filter(r => r.id !== saved.id)]);
    return saved;
  };

  // Salvar introdução alimentar
  const saveSolidFood = async (data: {
    foodName: string;
    amount?: string;
    reaction?: FoodReaction;
    timestamp?: string;
    notes?: string;
  }): Promise<FeedingRecord | null> => {
    if (!babyId) return null;

    const record: FeedingRecord = {
      id: `feeding-temp-${Date.now()}`,
      babyId,
      type: 'SOLID',
      timestamp: data.timestamp || new Date().toISOString(),
      solidFoodName: data.foodName,
      solidFoodAmount: data.amount,
      solidFoodReaction: data.reaction || 'NEUTRAL',
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await DataService.saveFeedingRecord(record);
    setFeedingRecords(prev => [saved, ...prev.filter(r => r.id !== saved.id)]);
    return saved;
  };

  // Salvar ou Atualizar
  const saveFeeding = async (record: FeedingRecord): Promise<FeedingRecord> => {
    const saved = await DataService.saveFeedingRecord(record);
    setFeedingRecords(prev => {
      const idx = prev.findIndex(r => r.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    return saved;
  };

  // Excluir
  const deleteFeeding = async (recordId: string): Promise<void> => {
    await DataService.deleteFeedingRecord(recordId);
    setFeedingRecords(prev => prev.filter(r => r.id !== recordId));
  };

  return {
    feedingRecords,
    loading,
    refreshFeedings: loadRecords,
    // Timer de amamentação
    activeSide,
    isPaused,
    leftSeconds,
    rightSeconds,
    totalSeconds: leftSeconds + rightSeconds,
    startBreastfeeding,
    switchSide,
    pauseTimer,
    resumeTimer,
    cancelTimer,
    finishBreastfeeding,
    // Helpers
    saveBottle,
    saveSolidFood,
    saveFeeding,
    deleteFeeding,
  };
}
