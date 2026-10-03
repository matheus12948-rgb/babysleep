import React from 'react';
import { 
  Moon, 
  Heart, 
  Baby, 
  Utensils, 
  Droplets, 
  Bath, 
  Thermometer, 
  Pill, 
  Footprints, 
  BookOpen,
  X 
} from 'lucide-react';
import { useSleepTracker } from '@/features/sleep-tracker/SleepTrackerContext';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSleep: () => void;
  onOpenBreastfeeding: () => void;
  onOpenBottle: () => void;
  onOpenSolidFood: () => void;
  onOpenDiaper: () => void;
  onOpenBath: () => void;
  onOpenTemperature: () => void;
  onOpenMedicine: () => void;
  onOpenActivity: () => void;
  onOpenJournal: () => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  onOpenSleep,
  onOpenBreastfeeding,
  onOpenBottle,
  onOpenSolidFood,
  onOpenDiaper,
  onOpenBath,
  onOpenTemperature,
  onOpenMedicine,
  onOpenActivity,
  onOpenJournal,
}) => {
  const { activeSleep, stopSleep } = useSleepTracker();

  if (!isOpen) return null;

  const quickActions = [
    {
      id: 'sleep',
      title: activeSleep ? 'Acordou!' : 'Sono',
      subtitle: activeSleep ? 'Encerrar soneca' : 'Iniciar ou registrar',
      icon: <Moon className="w-5 h-5" />,
      colorClass: activeSleep 
        ? 'bg-rose-500 text-white animate-pulse' 
        : 'bg-indigo-600 text-white',
      badgeClass: activeSleep 
        ? 'border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300' 
        : 'border-indigo-100 hover:border-indigo-300 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200',
      onClick: () => {
        onClose();
        if (activeSleep) {
          stopSleep();
        } else {
          onOpenSleep();
        }
      },
    },
    {
      id: 'breast',
      title: 'Amamentação',
      subtitle: 'Cronômetro L/R',
      icon: <span className="text-xl">🤱</span>,
      colorClass: 'bg-pink-500 text-white',
      badgeClass: 'border-pink-100 hover:border-pink-300 dark:border-pink-900/40 bg-pink-50/50 dark:bg-pink-950/20 text-pink-900 dark:text-pink-200',
      onClick: () => {
        onClose();
        onOpenBreastfeeding();
      },
    },
    {
      id: 'bottle',
      title: 'Mamadeira',
      subtitle: 'Presets em ml',
      icon: <span className="text-xl">🍼</span>,
      colorClass: 'bg-sky-500 text-white',
      badgeClass: 'border-sky-100 hover:border-sky-300 dark:border-sky-900/40 bg-sky-50/50 dark:bg-sky-950/20 text-sky-900 dark:text-sky-200',
      onClick: () => {
        onClose();
        onOpenBottle();
      },
    },
    {
      id: 'solid',
      title: 'Alimentação',
      subtitle: 'Comidas sólidas',
      icon: <span className="text-xl">🥣</span>,
      colorClass: 'bg-amber-500 text-white',
      badgeClass: 'border-amber-100 hover:border-amber-300 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200',
      onClick: () => {
        onClose();
        onOpenSolidFood();
      },
    },
    {
      id: 'diaper',
      title: 'Fralda',
      subtitle: 'Xixi e cocô',
      icon: <span className="text-xl">💧</span>,
      colorClass: 'bg-emerald-500 text-white',
      badgeClass: 'border-emerald-100 hover:border-emerald-300 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200',
      onClick: () => {
        onClose();
        onOpenDiaper();
      },
    },
    {
      id: 'bath',
      title: 'Banho',
      subtitle: 'Banho do bebê',
      icon: <span className="text-xl">🛁</span>,
      colorClass: 'bg-cyan-500 text-white',
      badgeClass: 'border-cyan-100 hover:border-cyan-300 dark:border-cyan-900/40 bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-900 dark:text-cyan-200',
      onClick: () => {
        onClose();
        onOpenBath();
      },
    },
    {
      id: 'temperature',
      title: 'Temperatura',
      subtitle: '°C / °F',
      icon: <span className="text-xl">🌡️</span>,
      colorClass: 'bg-rose-500 text-white',
      badgeClass: 'border-rose-100 hover:border-rose-300 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200',
      onClick: () => {
        onClose();
        onOpenTemperature();
      },
    },
    {
      id: 'medicine',
      title: 'Medicamento',
      subtitle: 'Registro do cuidador',
      icon: <span className="text-xl">💊</span>,
      colorClass: 'bg-purple-500 text-white',
      badgeClass: 'border-purple-100 hover:border-purple-300 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-200',
      onClick: () => {
        onClose();
        onOpenMedicine();
      },
    },
    {
      id: 'activity',
      title: 'Atividade',
      subtitle: 'Passeio / Brincar',
      icon: <span className="text-xl">🚶</span>,
      colorClass: 'bg-teal-500 text-white',
      badgeClass: 'border-teal-100 hover:border-teal-300 dark:border-teal-900/40 bg-teal-50/50 dark:bg-teal-950/20 text-teal-900 dark:text-teal-200',
      onClick: () => {
        onClose();
        onOpenActivity();
      },
    },
    {
      id: 'journal',
      title: 'Diário',
      subtitle: 'Notas e memórias',
      icon: <span className="text-xl">📝</span>,
      colorClass: 'bg-violet-500 text-white',
      badgeClass: 'border-violet-100 hover:border-violet-300 dark:border-violet-900/40 bg-violet-50/50 dark:bg-violet-950/20 text-violet-900 dark:text-violet-200',
      onClick: () => {
        onClose();
        onOpenJournal();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 z-10 animate-in slide-in-from-bottom-5 duration-200 max-h-[90vh] flex flex-col">
        {/* Handle for mobile pull */}
        <div className="flex justify-center -mt-2 pb-3 sm:hidden">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Registro Rápido</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Escolha o evento para registrar em 1 toque</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grade de 10 Ações */}
        <div className="grid grid-cols-2 gap-2.5 overflow-y-auto py-2 pr-1">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left group active:scale-[0.98] ${action.badgeClass}`}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 bg-white dark:bg-slate-800 shadow-xs border border-slate-100 dark:border-slate-700">
                {action.icon}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs sm:text-sm block truncate text-slate-900 dark:text-slate-100">
                  {action.title}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                  {action.subtitle}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
