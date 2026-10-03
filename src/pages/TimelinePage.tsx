import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Moon, 
  Sun, 
  Trash2, 
  Clock, 
  Sparkles,
  Calendar,
  Filter,
  AlertCircle
} from 'lucide-react';
import { useSleepTracker } from '@/features/sleep-tracker/SleepTrackerContext';
import { useBaby } from '@/features/baby/BabyContext';
import { useRoutineTimeline } from '@/hooks/useRoutineTimeline';
import { UnifiedTimelineEvent, TimelineFilter } from '@/types';
import { ConfirmDeleteModal } from '@/components/routine/ConfirmDeleteModal';
import { DataService } from '@/services/dataService';
import { formatTime } from '@/utils/date';
import { format, addDays, subDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimelinePageProps {
  onOpenManualSleep: () => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({ onOpenManualSleep }) => {
  const { activeBaby } = useBaby();
  const { latestPrediction, deleteRecord: deleteSleepRecord } = useSleepTracker();
  const { 
    events, 
    filter, 
    setFilter, 
    refreshTimeline 
  } = useRoutineTimeline(activeBaby?.id);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [eventToDelete, setEventToDelete] = useState<UnifiedTimelineEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const handleToday = () => setSelectedDate(new Date());

  const isToday = isSameDay(selectedDate, new Date());

  // Filtra eventos do dia selecionado
  const dayEvents = events.filter(e => {
    try {
      const d = parseISO(e.timestamp);
      return isSameDay(d, selectedDate);
    } catch {
      return false;
    }
  });

  // Confirmação de exclusão
  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      if (eventToDelete.eventType === 'SLEEP') {
        await deleteSleepRecord(eventToDelete.id);
      } else if (eventToDelete.eventType === 'FEEDING') {
        await DataService.deleteFeedingRecord(eventToDelete.id);
      } else if (eventToDelete.eventType === 'DIAPER') {
        await DataService.deleteDiaperRecord(eventToDelete.id);
      } else if (eventToDelete.eventType === 'ACTIVITY') {
        await DataService.deleteActivityRecord(eventToDelete.id);
      } else if (eventToDelete.eventType === 'JOURNAL') {
        await DataService.deleteJournalEntry(eventToDelete.id);
      }
      await refreshTimeline();
      setEventToDelete(null);
    } catch (err) {
      console.error('Failed to delete routine event:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filterTabs: { id: TimelineFilter; label: string; icon: string }[] = [
    { id: 'ALL', label: 'Todos', icon: '✨' },
    { id: 'SLEEP', label: 'Sono', icon: '😴' },
    { id: 'FEEDING', label: 'Alimentação', icon: '🍼' },
    { id: 'DIAPER', label: 'Fraldas', icon: '💧' },
    { id: 'CARE', label: 'Cuidados', icon: '🛁' },
    { id: 'ACTIVITY', label: 'Atividades', icon: '🚶' },
    { id: 'JOURNAL', label: 'Diário', icon: '📝' },
  ];

  const getEventEmoji = (event: UnifiedTimelineEvent) => {
    if (event.eventType === 'SLEEP') return event.subType === 'NAP' ? '😴' : '🌙';
    if (event.eventType === 'FEEDING') {
      if (event.subType === 'BREAST') return '🤱';
      if (event.subType === 'BOTTLE') return '🍼';
      return '🥣';
    }
    if (event.eventType === 'DIAPER') return '💧';
    if (event.eventType === 'ACTIVITY') {
      if (event.subType === 'BATH') return '🛁';
      if (event.subType === 'TEMPERATURE') return '🌡️';
      if (event.subType === 'MEDICINE') return '💊';
      return '🚶';
    }
    return '📝';
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Navegador de Data */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-xs">
        <button
          onClick={handlePrevDay}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          aria-label="Dia anterior"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base capitalize">
            <Calendar size={16} className="text-indigo-500" />
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </div>
          {!isToday && (
            <button
              onClick={handleToday}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-0.5"
            >
              Voltar para Hoje
            </button>
          )}
        </div>

        <button
          onClick={handleNextDay}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          aria-label="Próximo dia"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Barra de Filtros da Timeline (Horizontal Scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none px-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              filter === tab.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Lista Unificada de Eventos */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Linha do Tempo Completa ({dayEvents.length})
          </h2>
          <button
            onClick={onOpenManualSleep}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            + Registrar Sono
          </button>
        </div>

        {dayEvents.length === 0 ? (
          // Estado Vazio
          <div className="py-12 text-center text-slate-400">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-400">
              <Clock size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Nenhum evento registrado nesta categoria
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Utilize o botão de ação rápida (+) na barra inferior para registrar qualquer atividade.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {dayEvents.map(event => {
              const emoji = getEventEmoji(event);

              return (
                <div key={event.id} className="relative group">
                  {/* Ponto / Ícone no trilho da timeline */}
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 bg-white dark:bg-slate-800 shadow-xs text-xs">
                    {emoji}
                  </div>

                  {/* Card do Evento */}
                  <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition hover:border-slate-300 dark:hover:border-slate-700">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                            {formatTime(event.timestamp)}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${event.colorBadgeClass}`}>
                            {emoji} {event.title}
                          </span>
                        </div>

                        <div className="mt-1 text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {event.details}
                        </div>

                        {event.notes && (
                          <p className="mt-2 text-xs italic text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                            "{event.notes}"
                          </p>
                        )}
                      </div>

                      {/* Botão de Excluir com Confirmação */}
                      <button
                        onClick={() => setEventToDelete(event)}
                        className="opacity-0 group-hover:opacity-100 transition p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Excluir este evento"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Estimativa de Próxima Soneca no Dia de Hoje (se filtro ALL ou SLEEP) */}
            {isToday && latestPrediction && (filter === 'ALL' || filter === 'SLEEP') && (
              <div className="relative">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 bg-amber-400 text-slate-900">
                  <Sparkles size={10} />
                </div>
                <div className="p-3.5 rounded-2xl border border-dashed border-indigo-300 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
                    <span className="font-mono">{formatTime(latestPrediction.predictedSleepTime)}</span>
                    <span>✨ Previsão: Próxima janela de sono estimada</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Janela calculada: {formatTime(latestPrediction.windowStartTime)} – {formatTime(latestPrediction.windowEndTime)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={eventToDelete ? `Excluir ${eventToDelete.title}?` : 'Excluir evento?'}
        description={`Tem certeza de que deseja remover este registro das ${eventToDelete ? formatTime(eventToDelete.timestamp) : ''}? Esta ação não pode ser desfeita.`}
        isDeleting={isDeleting}
      />
    </div>
  );
};
