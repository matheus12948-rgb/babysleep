import { useState, useEffect, useCallback } from 'react';
import { ActivityRecord, ActivityCategory } from '@/types';
import { DataService } from '@/services/dataService';

export function useActivities(babyId?: string) {
  const [activityRecords, setActivityRecords] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRecords = useCallback(async () => {
    if (!babyId) return;
    setLoading(true);
    try {
      const records = await DataService.getActivityRecords(babyId);
      setActivityRecords(records);
    } catch (err) {
      console.error('Error loading activity records:', err);
    } finally {
      setLoading(false);
    }
  }, [babyId]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Salvar Banho
  const saveBath = async (data: {
    durationMinutes?: number;
    timestamp?: string;
    notes?: string;
  }): Promise<ActivityRecord | null> => {
    if (!babyId) return null;

    const record: ActivityRecord = {
      id: `act-temp-${Date.now()}`,
      babyId,
      timestamp: data.timestamp || new Date().toISOString(),
      category: 'BATH',
      durationMinutes: data.durationMinutes,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await DataService.saveActivityRecord(record);
    setActivityRecords(prev => [saved, ...prev.filter(r => r.id !== saved.id)]);
    return saved;
  };

  // Salvar Temperatura
  const saveTemperature = async (data: {
    valueNumeric: number;
    unit: 'C' | 'F';
    measurementMethod?: 'AXILLARY' | 'RECTAL' | 'EAR' | 'FOREHEAD';
    timestamp?: string;
    notes?: string;
  }): Promise<ActivityRecord | null> => {
    if (!babyId) return null;

    const record: ActivityRecord = {
      id: `act-temp-${Date.now()}`,
      babyId,
      timestamp: data.timestamp || new Date().toISOString(),
      category: 'TEMPERATURE',
      valueNumeric: data.valueNumeric,
      unit: data.unit,
      measurementMethod: data.measurementMethod,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await DataService.saveActivityRecord(record);
    setActivityRecords(prev => [saved, ...prev.filter(r => r.id !== saved.id)]);
    return saved;
  };

  // Salvar Medicamento (Apenas registro pelo cuidador com disclaimer)
  const saveMedicine = async (data: {
    medicineName: string;
    timestamp?: string;
    notes?: string;
  }): Promise<ActivityRecord | null> => {
    if (!babyId) return null;

    const record: ActivityRecord = {
      id: `act-temp-${Date.now()}`,
      babyId,
      timestamp: data.timestamp || new Date().toISOString(),
      category: 'MEDICINE',
      medicineName: data.medicineName,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await DataService.saveActivityRecord(record);
    setActivityRecords(prev => [saved, ...prev.filter(r => r.id !== saved.id)]);
    return saved;
  };

  // Salvar Passeio / Atividade Geral
  const saveActivity = async (data: {
    category: ActivityCategory;
    durationMinutes?: number;
    timestamp?: string;
    notes?: string;
  }): Promise<ActivityRecord | null> => {
    if (!babyId) return null;

    const record: ActivityRecord = {
      id: `act-temp-${Date.now()}`,
      babyId,
      timestamp: data.timestamp || new Date().toISOString(),
      category: data.category,
      durationMinutes: data.durationMinutes,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await DataService.saveActivityRecord(record);
    setActivityRecords(prev => [saved, ...prev.filter(r => r.id !== saved.id)]);
    return saved;
  };

  const updateActivity = async (record: ActivityRecord): Promise<ActivityRecord> => {
    const saved = await DataService.saveActivityRecord(record);
    setActivityRecords(prev => {
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

  const deleteActivity = async (recordId: string): Promise<void> => {
    await DataService.deleteActivityRecord(recordId);
    setActivityRecords(prev => prev.filter(r => r.id !== recordId));
  };

  return {
    activityRecords,
    loading,
    refreshActivities: loadRecords,
    saveBath,
    saveTemperature,
    saveMedicine,
    saveActivity,
    updateActivity,
    deleteActivity,
  };
}
