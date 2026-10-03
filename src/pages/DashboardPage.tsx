import React, { useState } from 'react';
import { 
  Moon, 
  Sun, 
  Clock, 
  Sparkles, 
  Play, 
  Square, 
  Milk, 
  Droplets, 
  BookOpen, 
  AlertCircle,
  TrendingUp,
  Heart,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { useBaby } from '@/features/baby/BabyContext';
import { useSleepTracker } from '@/features/sleep-tracker/SleepTrackerContext';
import { useFeeding } from '@/hooks/useFeeding';
import { useDiapers } from '@/hooks/useDiapers';
import { useActivities } from '@/hooks/useActivities';
import { formatTime, formatDurationMinutes } from '@/utils/date';
import { parseISO, differenceInMinutes, isSameDay, subDays } from 'date-fns';

interface DashboardPageProps {
  onOpenManualSleep: () => void;
  onOpenJournal: () => void;
  onOpenActionNotice: (title: string, msg: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenManualSleep,
  onOpenJournal,
  onOpenActionNotice,
}) => {
  const { activeBaby, babyAge } = useBaby();
  const { 
    records, 
    activeSleep, 
    latestPrediction, 
    elapsedSeconds, 
    startSleep, 
    stopSleep 
  } = useSleepTracker();

  const [showReasoning, setShowReasoning] = useState<boolean>(false);

  // Formatação do cronômetro de sono ativo
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Tempo acordado (Janela de Vigília Atual) se o bebê estiver acordado
  const lastFinishedSleep = records.find(r => !r.isOngoing);
  const wakeTime = lastFinishedSleep?.endTime ? parseISO(lastFinishedSleep.endTime) : null;
  const awakeMinutes = wakeTime ? Math.max(0, differenceInMinutes(new Date(), wakeTime)) : 0;

  // Tempo restante até a próxima previsão
  let minutesUntilPredicted = 0;
  if (latestPrediction && !activeSleep) {
    const predDate = parseISO(latestPrediction.predictedSleepTime);
    minutesUntilPredicted = differenceInMinutes(predDate, new Date());
  }

  // Estatísticas do dia corrente ("COMO ESTÁ O DIA")
  const today = new Date();
  const todayRecords = records.filter(r => {
    try {
      return isSameDay(parseISO(r.startTime), today);
    } catch {
      return false;
    }
  });

  const todaySleepMinutes = todayRecords.reduce((acc, r) => acc + (r.durationMinutes || 0), 0);
  const todayNapsCount = todayRecords.filter(r => r.type === 'NAP').length;

  // Rotina de Hoje (Amamentação, Mamadeira, Fralda, Banho)
  const { feedingRecords } = useFeeding(activeBaby?.id);
  const { diaperRecords } = useDiapers(activeBaby?.id);
  const { activityRecords } = useActivities(activeBaby?.id);

  const todayBreastCount = feedingRecords.filter(r => {
    try {
      return r.type === 'BREAST' && isSameDay(parseISO(r.timestamp), today);
    } catch {
      return false;
    }
  }).length;

  const todayBottleCount = feedingRecords.filter(r => {
    try {
      return r.type === 'BOTTLE' && isSameDay(parseISO(r.timestamp), today);
    } catch {
      return false;
    }
  }).length;

  const todayDiaperCount = diaperRecords.filter(r => {
    try {
      return isSameDay(parseISO(r.timestamp), today);
    } catch {
      return false;
    }
  }).length;

  const todayBathCount = activityRecords.filter(r => {
    try {
      return r.category === 'BATH' && isSameDay(parseISO(r.timestamp), today);
    } catch {
      return false;
    }
  }).length;

  // Sono noturno da noite anterior (ontem)
  const yesterday = subDays(today, 1);
  const previousNightRecords = records.filter(r => {
    try {
      return r.type === 'NIGHT_SLEEP' && isSameDay(parseISO(r.startTime), yesterday);
    } catch {
      return false;
    }
  });

  const previousNightDuration = previousNightRecords.reduce(
    (acc, r) => acc + (r.durationMinutes || 0), 
    0
  );
  const previousNightAwakenings = previousNightRecords.reduce(
    (acc, r) => acc + (r.awakenings?.length || 0), 
    0
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Card de Status Atual do Bebê */}
      <div className={`p-6 rounded-3xl border transition-all shadow-sm ${
        activeSleep 
          ? 'bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-indigo-700/50 shadow-indigo-950/20'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${activeSleep ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">
              {activeSleep ? 'Status: Bebê Dormindo' : 'Status: Bebê Acordado'}
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100/20 dark:bg-slate-800 text-slate-400 dark:text-slate-300">
            {babyAge ? babyAge.formatted : '...'}
          </span>
        </div>

        {activeSleep ? (
          // Vista Quando o Bebê Está Dormindo
          <div className="text-center py-2 space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-500/20 text-indigo-300 animate-pulse-subtle">
              <Moon size={40} className="text-indigo-300" />
            </div>
            <div>
              <div className="text-4xl font-black font-mono tracking-tight text-indigo-100">
                {formatTimer(elapsedSeconds)}
              </div>
              <p className="text-xs text-indigo-200/70 mt-1">
                Adormeceu às {formatTime(activeSleep.startTime)} ({activeSleep.type === 'NAP' ? 'Soneca' : 'Sono Noturno'})
              </p>
            </div>

            <button
              onClick={() => stopSleep()}
              className="w-full py-4 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-98 text-white font-bold text-base shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2 transition"
            >
              <Square size={18} fill="currentColor" />
              Acordou! Encerrar Sono
            </button>
          </div>
        ) : (
          // Vista Quando o Bebê Está Acordado (Janela de Vigília Ativa)
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tempo acordado</p>
                <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                  {formatDurationMinutes(awakeMinutes)}
                </div>
              </div>
              {wakeTime && lastFinishedSleep?.endTime && (
                <div className="text-right text-xs text-slate-400">
                  Acordou às <span className="font-semibold text-slate-600 dark:text-slate-300">{formatTime(lastFinishedSleep.endTime)}</span>
                </div>
              )}
            </div>

            {/* CTA Primário para Iniciar Sono com 1 Toque */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => startSleep('NAP')}
                className="py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition"
              >
                <Play size={16} fill="currentColor" />
                Iniciar Soneca
              </button>
              <button
                onClick={() => startSleep('NIGHT_SLEEP')}
                className="py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 active:scale-98 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
              >
                <Moon size={16} />
                Sono Noturno
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Estimativa de Janela de Sono (Sleep Prediction Card - FASE 2) */}
      {latestPrediction && !activeSleep && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-transparent border border-indigo-200/60 dark:border-indigo-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <Sparkles size={18} />
              <h2 className="text-sm font-bold tracking-tight">Estimativa de Janela de Sono</h2>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
              Confiança {latestPrediction.confidenceScore}% ({latestPrediction.confidenceLevel === 'HIGH' ? 'Alta' : latestPrediction.confidenceLevel === 'MEDIUM' ? 'Média' : 'Inicial'})
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-2 bg-white/70 dark:bg-slate-900/70 rounded-2xl border border-indigo-100 dark:border-slate-800/80">
            <div className="p-2">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Próximo sono</p>
              <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                {formatTime(latestPrediction.predictedSleepTime)}
              </p>
            </div>
            <div className="p-2 border-x border-slate-100 dark:border-slate-800">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Janela sugerida</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
                {formatTime(latestPrediction.windowStartTime)} – {formatTime(latestPrediction.windowEndTime)}
              </p>
            </div>
            <div className="p-2">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Falta cerca de</p>
              <p className={`text-base font-bold mt-0.5 ${minutesUntilPredicted <= 15 ? 'text-amber-600 dark:text-amber-400 animate-pulse' : 'text-slate-700 dark:text-slate-200'}`}>
                {minutesUntilPredicted > 0 ? `${minutesUntilPredicted} min` : 'Janela aberta'}
              </p>
            </div>
          </div>

          {/* Seção Dobrável: Sobre esta estimativa */}
          <div className="pt-1">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="w-full flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 py-1"
            >
              <span className="flex items-center gap-1.5">
                <Info size={14} />
                Sobre esta estimativa
              </span>
              {showReasoning ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showReasoning && latestPrediction.reasoning && (
              <div className="mt-2 p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-indigo-100 dark:border-slate-800 space-y-1.5 animate-in fade-in duration-200 text-xs">
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Fatores considerados pelo motor de previsão:
                </p>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400 pl-4 list-disc text-[11px]">
                  {latestPrediction.reasoning.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Ações Rápidas de Rotina */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Ações Rápidas
          </h2>
          <button
            onClick={onOpenManualSleep}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            + Sono manual
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
          <button
            onClick={() => onOpenActionNotice('Mamadeira', 'Registro de mamadeira de 120ml')}
            className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 transition active:scale-95 text-slate-700 dark:text-slate-200"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-500 flex items-center justify-center mb-1">
              <Milk size={18} />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold">Mamadeira</span>
          </button>

          <button
            onClick={() => onOpenActionNotice('Amamentação', 'Registro de amamentação iniciado')}
            className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 transition active:scale-95 text-slate-700 dark:text-slate-200"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-pink-50 dark:bg-pink-950/50 text-pink-500 flex items-center justify-center mb-1">
              <Heart size={18} />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold">Amamentar</span>
          </button>

          <button
            onClick={() => onOpenActionNotice('Fralda', 'Troca de fralda anotada')}
            className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 transition active:scale-95 text-slate-700 dark:text-slate-200"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center mb-1">
              <Droplets size={18} />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold">Fralda</span>
          </button>

          <button
            onClick={onOpenJournal}
            className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 transition active:scale-95 text-slate-700 dark:text-slate-200"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-500 flex items-center justify-center mb-1">
              <BookOpen size={18} />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold">Diário</span>
          </button>
        </div>
      </div>

      {/* 4. COMO ESTÁ O DIA (Estatísticas Instantâneas) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Como Está o Dia
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850">
            <p className="text-[11px] text-slate-400">Sono Total Hoje</p>
            <p className="text-base font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {formatDurationMinutes(todaySleepMinutes)}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850">
            <p className="text-[11px] text-slate-400">Sonecas Hoje</p>
            <p className="text-base font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {todayNapsCount}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850">
            <p className="text-[11px] text-slate-400">Noite Anterior</p>
            <p className="text-base font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {previousNightDuration > 0 ? formatDurationMinutes(previousNightDuration) : '--'}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850">
            <p className="text-[11px] text-slate-400">Despertares</p>
            <p className="text-base font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {previousNightAwakenings}
            </p>
          </div>
        </div>
      </div>

      {/* 5. ROTINA DE HOJE (Resumo das Atividades Diárias) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Rotina de Hoje
          </h2>
          <span className="text-[11px] text-slate-400">
            Acompanhamento diário
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-pink-50/60 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/30">
            <span className="text-lg">🤱</span>
            <p className="text-[10px] font-semibold text-pink-700 dark:text-pink-300 mt-0.5 truncate">
              Amamentações
            </p>
            <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {todayBreastCount}
            </p>
          </div>

          <div className="p-2.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/30">
            <span className="text-lg">🍼</span>
            <p className="text-[10px] font-semibold text-sky-700 dark:text-sky-300 mt-0.5 truncate">
              Mamadeiras
            </p>
            <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {todayBottleCount}
            </p>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30">
            <span className="text-lg">💧</span>
            <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 mt-0.5 truncate">
              Fraldas
            </p>
            <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {todayDiaperCount}
            </p>
          </div>

          <div className="p-2.5 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/30">
            <span className="text-lg">🛁</span>
            <p className="text-[10px] font-semibold text-cyan-700 dark:text-cyan-300 mt-0.5 truncate">
              Banho
            </p>
            <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {todayBathCount}
            </p>
          </div>

          <div className="p-2.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30">
            <span className="text-lg">😴</span>
            <p className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 mt-0.5 truncate">
              Sonecas
            </p>
            <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {todayNapsCount}
            </p>
          </div>
        </div>
      </div>

      {/* 6. Disclaimer de Responsabilidade Médica Obrigatório */}
      <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 flex items-start gap-2.5 text-slate-400 dark:text-slate-400">
        <AlertCircle size={16} className="shrink-0 mt-0.5 text-slate-400" />
        <p className="text-[10px] leading-relaxed">
          Este aplicativo fornece estimativas e informações gerais sobre sono infantil baseadas em parâmetros de referência e hábitos do bebê. Não substitui avaliação, orientação ou diagnóstico de profissionais de saúde.
        </p>
      </div>
    </div>
  );
};
