import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  UnifiedTimelineEvent, 
  TimelineFilter, 
  SleepRecord, 
  FeedingRecord, 
  DiaperRecord, 
  ActivityRecord, 
  BabyJournalEntry 
} from '@/types';
import { DataService } from '@/services/dataService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function useRoutineTimeline(babyId?: string) {
  const [filter, setFilter] = useState<TimelineFilter>('ALL');
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([]);
  const [diaperRecords, setDiaperRecords] = useState<DiaperRecord[]>([]);
  const [activityRecords, setActivityRecords] = useState<ActivityRecord[]>([]);
  const [journalEntries, setJournalEntries] = useState<BabyJournalEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAll = useCallback(async () => {
    if (!babyId) return;
    setLoading(true);
    try {
      const [sleeps, feeds, diapers, acts, journals] = await Promise.all([
        DataService.getSleepRecords(babyId),
        DataService.getFeedingRecords(babyId),
        DataService.getDiaperRecords(babyId),
        DataService.getActivityRecords(babyId),
        DataService.getJournalEntries(babyId),
      ]);

      setSleepRecords(sleeps);
      setFeedingRecords(feeds);
      setDiaperRecords(diapers);
      setActivityRecords(acts);
      setJournalEntries(journals);
    } catch (err) {
      console.error('Error loading routine timeline:', err);
    } finally {
      setLoading(false);
    }
  }, [babyId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Converter todos os registros para UnifiedTimelineEvent
  const allEvents = useMemo<UnifiedTimelineEvent[]>(() => {
    const events: UnifiedTimelineEvent[] = [];

    // 1. SONO
    sleepRecords.forEach(s => {
      const isNap = s.type === 'NAP';
      const durationStr = s.durationMinutes 
        ? `${Math.floor(s.durationMinutes / 60)}h ${String(s.durationMinutes % 60).padStart(2, '0')}m`
        : (s.isOngoing ? 'Em andamento' : 'Duração não informada');

      events.push({
        id: s.id,
        eventType: 'SLEEP',
        subType: s.type,
        timestamp: s.startTime,
        title: isNap ? 'Soneca' : 'Sono Noturno',
        details: durationStr,
        notes: s.notes,
        colorBadgeClass: isNap 
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' 
          : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        iconType: 'SLEEP',
        rawRecord: s,
      });
    });

    // 2. ALIMENTAÇÃO
    feedingRecords.forEach(f => {
      if (f.type === 'BREAST') {
        const left = f.leftDurationMinutes || 0;
        const right = f.rightDurationMinutes || 0;
        const total = f.breastDurationMinutes || (left + right);
        let detailText = `${total} min`;
        if (left > 0 && right > 0) {
          detailText += ` (Esq: ${left}m | Dir: ${right}m)`;
        } else if (left > 0) {
          detailText += ` (Lado Esquerdo)`;
        } else if (right > 0) {
          detailText += ` (Lado Direito)`;
        }

        events.push({
          id: f.id,
          eventType: 'FEEDING',
          subType: 'BREAST',
          timestamp: f.timestamp,
          title: 'Amamentação',
          details: detailText,
          notes: f.notes,
          colorBadgeClass: 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200 dark:border-pink-800',
          iconType: 'BREAST',
          rawRecord: f,
        });
      } else if (f.type === 'BOTTLE') {
        const contentLabels: Record<string, string> = {
          BREAST_MILK: 'Leite materno ordenhado',
          FORMULA: 'Fórmula infantil',
          WATER: 'Água',
          OTHER: 'Outro',
        };
        const contentStr = f.bottleContents ? contentLabels[f.bottleContents] || f.bottleContents : '';

        events.push({
          id: f.id,
          eventType: 'FEEDING',
          subType: 'BOTTLE',
          timestamp: f.timestamp,
          title: 'Mamadeira',
          details: `${f.bottleAmountMl || 0} ml ${contentStr ? `• ${contentStr}` : ''}`,
          notes: f.notes,
          colorBadgeClass: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
          iconType: 'BOTTLE',
          rawRecord: f,
        });
      } else if (f.type === 'SOLID') {
        const reactionLabels: Record<string, string> = {
          LIKED: 'Gostou 😊',
          DISLIKED: 'Não gostou 😕',
          NEUTRAL: 'Neutro 😐',
          MESSY: 'Fez bagunça 🥣',
          OTHER: 'Outra reação',
        };
        const reactStr = f.solidFoodReaction ? reactionLabels[f.solidFoodReaction] || '' : '';

        events.push({
          id: f.id,
          eventType: 'FEEDING',
          subType: 'SOLID',
          timestamp: f.timestamp,
          title: `Alimentação: ${f.solidFoodName || 'Introdução alimentar'}`,
          details: `${f.solidFoodAmount ? `${f.solidFoodAmount} • ` : ''}${reactStr}`,
          notes: f.notes,
          colorBadgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          iconType: 'SOLID',
          rawRecord: f,
        });
      }
    });

    // 3. FRALDAS
    diaperRecords.forEach(d => {
      let typeLabel = 'Xixi';
      if (d.type === 'DIRTY') typeLabel = 'Cocô';
      if (d.type === 'BOTH') typeLabel = 'Xixi e Cocô';

      const detailsList: string[] = [];
      if (d.consistency) {
        const consistencyMap: Record<string, string> = {
          LIQUID: 'Líquida',
          SOFT: 'Pastosa',
          HARD: 'Ressecada',
          NORMAL: 'Normal',
        };
        detailsList.push(consistencyMap[d.consistency] || d.consistency);
      }
      if (d.color) {
        const colorMap: Record<string, string> = {
          YELLOW: 'Amarelo',
          BROWN: 'Castanho',
          GREEN: 'Esverdeado',
          BLACK: 'Escuro',
          RED: 'Avermelhado',
          OTHER: 'Outra cor',
        };
        detailsList.push(colorMap[d.color] || d.color);
      }

      events.push({
        id: d.id,
        eventType: 'DIAPER',
        subType: d.type,
        timestamp: d.timestamp,
        title: `Fralda: ${typeLabel}`,
        details: detailsList.length > 0 ? detailsList.join(' • ') : typeLabel,
        notes: d.notes,
        colorBadgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        iconType: 'DIAPER',
        rawRecord: d,
      });
    });

    // 4. ATIVIDADES E CUIDADOS
    activityRecords.forEach(a => {
      if (a.category === 'BATH') {
        events.push({
          id: a.id,
          eventType: 'ACTIVITY',
          subType: 'BATH',
          timestamp: a.timestamp,
          title: 'Banho',
          details: a.durationMinutes ? `${a.durationMinutes} minutos` : 'Banho relaxante',
          notes: a.notes,
          colorBadgeClass: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
          iconType: 'BATH',
          rawRecord: a,
        });
      } else if (a.category === 'TEMPERATURE') {
        const unit = a.unit || 'C';
        const methodMap: Record<string, string> = {
          AXILLARY: 'Axilar',
          RECTAL: 'Retal',
          EAR: 'Auricular',
          FOREHEAD: 'Frontal',
        };
        const methodStr = a.measurementMethod ? ` • ${methodMap[a.measurementMethod] || a.measurementMethod}` : '';

        events.push({
          id: a.id,
          eventType: 'ACTIVITY',
          subType: 'TEMPERATURE',
          timestamp: a.timestamp,
          title: 'Temperatura',
          details: `${a.valueNumeric?.toFixed(1) || '--'} °${unit}${methodStr}`,
          notes: a.notes,
          colorBadgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          iconType: 'TEMPERATURE',
          rawRecord: a,
        });
      } else if (a.category === 'MEDICINE') {
        events.push({
          id: a.id,
          eventType: 'ACTIVITY',
          subType: 'MEDICINE',
          timestamp: a.timestamp,
          title: 'Medicamento',
          details: a.medicineName || 'Medicamento administrado',
          notes: a.notes,
          colorBadgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          iconType: 'MEDICINE',
          rawRecord: a,
        });
      } else {
        const catMap: Record<string, string> = {
          WALK: 'Passeio',
          TUMMY_TIME: 'Tummy Time',
          PLAY: 'Brincadeira',
          NOTE: 'Nota de Cuidado',
          OTHER: 'Atividade Externa',
        };
        const title = catMap[a.category] || 'Atividade';

        events.push({
          id: a.id,
          eventType: 'ACTIVITY',
          subType: a.category,
          timestamp: a.timestamp,
          title,
          details: a.durationMinutes ? `${a.durationMinutes} minutos` : 'Registrado pelo cuidador',
          notes: a.notes,
          colorBadgeClass: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800',
          iconType: 'ACTIVITY',
          rawRecord: a,
        });
      }
    });

    // 5. DIÁRIO
    journalEntries.forEach(j => {
      const moodMap: Record<string, string> = {
        HAPPY: 'Feliz 😊',
        CALM: 'Tranquilo 😌',
        FUSSY: 'Agitado 😕',
        CRYING: 'Choroso 😢',
        TIRED: 'Sonolento 🥱',
        PLAYFUL: 'Brincalhão 🎈',
      };
      const moodStr = j.mood ? moodMap[j.mood] || j.mood : '';

      events.push({
        id: j.id,
        eventType: 'JOURNAL',
        timestamp: `${j.date}T${j.time || '12:00:00'}`,
        title: 'Nota no Diário',
        details: moodStr ? `${moodStr} • ${j.content.slice(0, 40)}...` : `${j.content.slice(0, 50)}...`,
        notes: j.content,
        colorBadgeClass: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800',
        iconType: 'JOURNAL',
        rawRecord: j,
      });
    });

    // Ordenação estritamente cronológica decrescente (mais recente primeiro)
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [sleepRecords, feedingRecords, diaperRecords, activityRecords, journalEntries]);

  // Filtragem dinâmica por categoria
  const filteredEvents = useMemo(() => {
    if (filter === 'ALL') return allEvents;
    if (filter === 'SLEEP') return allEvents.filter(e => e.eventType === 'SLEEP');
    if (filter === 'FEEDING') return allEvents.filter(e => e.eventType === 'FEEDING');
    if (filter === 'DIAPER') return allEvents.filter(e => e.eventType === 'DIAPER');
    if (filter === 'CARE') return allEvents.filter(e => e.eventType === 'ACTIVITY' && (e.subType === 'BATH' || e.subType === 'TEMPERATURE' || e.subType === 'MEDICINE'));
    if (filter === 'ACTIVITY') return allEvents.filter(e => e.eventType === 'ACTIVITY' && e.subType !== 'BATH' && e.subType !== 'TEMPERATURE' && e.subType !== 'MEDICINE');
    if (filter === 'JOURNAL') return allEvents.filter(e => e.eventType === 'JOURNAL');
    return allEvents;
  }, [allEvents, filter]);

  return {
    events: filteredEvents,
    allEventsCount: allEvents.length,
    filter,
    setFilter,
    loading,
    refreshTimeline: loadAll,
  };
}
