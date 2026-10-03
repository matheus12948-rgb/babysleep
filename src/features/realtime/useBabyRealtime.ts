import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/services/supabase';

export interface RealtimeSyncEvent {
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  newRecord?: any;
  oldRecord?: any;
  timestamp: string;
}

interface UseBabyRealtimeOptions {
  babyId: string | null | undefined;
  onRemoteChange?: (event: RealtimeSyncEvent) => void;
}

export function useBabyRealtime({ babyId, onRemoteChange }: UseBabyRealtimeOptions) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncCount, setSyncCount] = useState<number>(0);
  const onRemoteChangeRef = useRef(onRemoteChange);

  useEffect(() => {
    onRemoteChangeRef.current = onRemoteChange;
  }, [onRemoteChange]);

  const handlePayload = useCallback((table: string, payload: any) => {
    const event: RealtimeSyncEvent = {
      table,
      eventType: payload.eventType,
      newRecord: payload.new,
      oldRecord: payload.old,
      timestamp: new Date().toISOString(),
    };

    setLastSyncTime(new Date());
    setSyncCount(prev => prev + 1);

    if (onRemoteChangeRef.current) {
      onRemoteChangeRef.current(event);
    }
  }, []);

  useEffect(() => {
    if (!babyId || !isSupabaseConfigured || !supabase) {
      setIsConnected(false);
      return;
    }

    const channelName = `baby-realtime-${babyId}`;
    const channel = supabase.channel(channelName);

    // 1. Escuta mudanças em sono
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'sleep_records', filter: `baby_id=eq.${babyId}` },
      (payload) => handlePayload('sleep_records', payload)
    );

    // 2. Escuta mudanças em alimentação
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'feeding_records', filter: `baby_id=eq.${babyId}` },
      (payload) => handlePayload('feeding_records', payload)
    );

    // 3. Escuta mudanças em fraldas
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'diaper_records', filter: `baby_id=eq.${babyId}` },
      (payload) => handlePayload('diaper_records', payload)
    );

    // 4. Escuta mudanças em atividades
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'activity_records', filter: `baby_id=eq.${babyId}` },
      (payload) => handlePayload('activity_records', payload)
    );

    // 5. Escuta mudanças em cuidadores vinculados
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'caregivers', filter: `baby_id=eq.${babyId}` },
      (payload) => handlePayload('caregivers', payload)
    );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        setLastSyncTime(new Date());
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setIsConnected(false);
      }
    });

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
      setIsConnected(false);
    };
  }, [babyId, handlePayload]);

  return {
    isConnected,
    lastSyncTime,
    syncCount,
  };
}
