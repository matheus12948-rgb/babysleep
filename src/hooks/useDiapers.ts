import { useState, useEffect, useCallback } from 'react';
import { DiaperRecord, DiaperType, StoolConsistency, StoolColor } from '@/types';
import { DataService } from '@/services/dataService';

export function useDiapers(babyId?: string) {
  const [diaperRecords, setDiaperRecords] = useState<DiaperRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRecords = useCallback(async () => {
    if (!babyId) return;
    setLoading(true);
    try {
      const records = await DataService.getDiaperRecords(babyId);
      setDiaperRecords(records);
    } catch (err) {
      console.error('Error loading diaper records:', err);
    } finally {
      setLoading(false);
    }
  }, [babyId]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const saveDiaper = async (data: {
    type: DiaperType;
    consistency?: StoolConsistency;
    color?: StoolColor;
    timestamp?: string;
    notes?: string;
  }): Promise<DiaperRecord | null> => {
    if (!babyId) return null;

    const record: DiaperRecord = {
      id: `diaper-temp-${Date.now()}`,
      babyId,
      timestamp: data.timestamp || new Date().toISOString(),
      type: data.type,
      consistency: data.consistency,
      color: data.color,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await DataService.saveDiaperRecord(record);
    setDiaperRecords(prev => [saved, ...prev.filter(r => r.id !== saved.id)]);
    return saved;
  };

  const updateDiaper = async (record: DiaperRecord): Promise<DiaperRecord> => {
    const saved = await DataService.saveDiaperRecord(record);
    setDiaperRecords(prev => {
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

  const deleteDiaper = async (recordId: string): Promise<void> => {
    await DataService.deleteDiaperRecord(recordId);
    setDiaperRecords(prev => prev.filter(r => r.id !== recordId));
  };

  return {
    diaperRecords,
    loading,
    refreshDiapers: loadRecords,
    saveDiaper,
    updateDiaper,
    deleteDiaper,
  };
}
