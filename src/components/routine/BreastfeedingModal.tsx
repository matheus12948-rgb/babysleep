import React, { useState } from 'react';
import { X, Play, Pause, ArrowLeftRight, Check, Clock } from 'lucide-react';
import { useFeeding } from '@/hooks/useFeeding';
import { formatDuration } from '@/utils/routine';

interface BreastfeedingModalProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: string;
  onSuccess?: () => void;
}

export const BreastfeedingModal: React.FC<BreastfeedingModalProps> = ({
  isOpen,
  onClose,
  babyId,
  onSuccess,
}) => {
  const {
    activeSide,
    isPaused,
    leftSeconds,
    rightSeconds,
    totalSeconds,
    startBreastfeeding,
    switchSide,
    pauseTimer,
    resumeTimer,
    cancelTimer,
    finishBreastfeeding,
  } = useFeeding(babyId);

  const [notes, setNotes] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  if (!isOpen) return null;

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      await finishBreastfeeding(notes);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to finish breastfeeding:', err);
    } finally {
      setIsFinishing(false);
    }
  };

  const handleCancel = () => {
    cancelTimer();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="breastfeeding-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤱</span>
            <div>
              <h2 id="breastfeeding-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Amamentação
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cronômetro por lado (sem conversão de volume)
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Display Principal de Tempo */}
          <div className="text-center py-4 bg-pink-50/50 dark:bg-pink-950/20 rounded-2xl border border-pink-100 dark:border-pink-900/30">
            <span className="text-xs font-semibold tracking-wider text-pink-600 dark:text-pink-400 uppercase">
              Duração Total
            </span>
            <div className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
              {formatDuration(totalSeconds)}
            </div>
            {activeSide && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                Lado Ativo: {activeSide === 'LEFT' ? 'Esquerdo' : 'Direito'}
              </div>
            )}
          </div>

          {/* Cards dos Lados: Esquerdo e Direito */}
          <div className="grid grid-cols-2 gap-4">
            {/* Lado Esquerdo */}
            <div 
              className={`p-4 rounded-2xl border transition-all text-center ${
                activeSide === 'LEFT'
                  ? 'border-pink-500 bg-pink-500/10 shadow-md ring-2 ring-pink-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
              }`}
            >
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Esquerdo
              </span>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                {formatDuration(leftSeconds)}
              </div>
              <button
                type="button"
                onClick={() => startBreastfeeding('LEFT')}
                disabled={activeSide === 'LEFT' && !isPaused}
                className={`mt-3 w-full py-2.5 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeSide === 'LEFT'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                {activeSide === 'LEFT' ? 'Ativo' : 'Iniciar'}
              </button>
            </div>

            {/* Lado Direito */}
            <div 
              className={`p-4 rounded-2xl border transition-all text-center ${
                activeSide === 'RIGHT'
                  ? 'border-pink-500 bg-pink-500/10 shadow-md ring-2 ring-pink-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
              }`}
            >
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Direito
              </span>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                {formatDuration(rightSeconds)}
              </div>
              <button
                type="button"
                onClick={() => startBreastfeeding('RIGHT')}
                disabled={activeSide === 'RIGHT' && !isPaused}
                className={`mt-3 w-full py-2.5 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeSide === 'RIGHT'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                {activeSide === 'RIGHT' ? 'Ativo' : 'Iniciar'}
              </button>
            </div>
          </div>

          {/* Controles de Cronômetro */}
          {activeSide && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={switchSide}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeftRight className="w-4 h-4 text-pink-500" />
                Trocar de Lado
              </button>

              {isPaused ? (
                <button
                  type="button"
                  onClick={resumeTimer}
                  className="flex-1 py-3 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Play className="w-4 h-4" />
                  Continuar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pauseTimer}
                  className="flex-1 py-3 px-4 rounded-xl border border-pink-300 dark:border-pink-800 bg-pink-50/50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 hover:bg-pink-100 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  Pausar
                </button>
              )}
            </div>
          )}

          {/* Observações Opcionais */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Observações (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pegou bem, arrotou no meio..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleFinish}
            disabled={totalSeconds === 0 || isFinishing}
            className="flex-1 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Check className="w-4 h-4" />
            {isFinishing ? 'Salvando...' : 'Finalizar Mamada'}
          </button>
        </div>
      </div>
    </div>
  );
};
