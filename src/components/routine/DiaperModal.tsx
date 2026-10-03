import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { DiaperType, StoolConsistency, StoolColor } from '@/types';
import { useDiapers } from '@/hooks/useDiapers';
import { format } from 'date-fns';

interface DiaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: string;
  onSuccess?: () => void;
}

export const DiaperModal: React.FC<DiaperModalProps> = ({
  isOpen,
  onClose,
  babyId,
  onSuccess,
}) => {
  const { saveDiaper } = useDiapers(babyId);

  const [type, setType] = useState<DiaperType>('WET');
  const [consistency, setConsistency] = useState<StoolConsistency>('NORMAL');
  const [color, setColor] = useState<StoolColor>('YELLOW');
  const [time, setTime] = useState<string>(format(new Date(), 'HH:mm'));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const showStoolDetails = type === 'DIRTY' || type === 'BOTH';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const now = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      const recordDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours || 12, minutes || 0);

      await saveDiaper({
        type,
        consistency: showStoolDetails ? consistency : undefined,
        color: showStoolDetails ? color : undefined,
        timestamp: recordDate.toISOString(),
        notes: notes.trim() || undefined,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to save diaper record:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="diaper-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💧</span>
            <div>
              <h2 id="diaper-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Troca de Fralda
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registro descritivo de troca
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Tipo de Fralda (1 toque) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Conteúdo da Fralda
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'WET', label: 'Xixi', icon: '💧' },
                { id: 'DIRTY', label: 'Cocô', icon: '💩' },
                { id: 'BOTH', label: 'Ambos', icon: '💧+💩' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setType(opt.id as DiaperType)}
                  className={`py-3 px-2 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                    type === opt.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-xs font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detalhes de Cocô se aplicável */}
          {showStoolDetails && (
            <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              {/* Consistência */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Consistência
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'NORMAL', label: 'Normal' },
                    { id: 'SOFT', label: 'Pastosa' },
                    { id: 'LIQUID', label: 'Líquida' },
                    { id: 'HARD', label: 'Ressecada' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setConsistency(c.id as StoolConsistency)}
                      className={`py-1.5 px-1 rounded-xl text-xs text-center border transition-all ${
                        consistency === c.id
                          ? 'border-emerald-500 bg-emerald-600 text-white font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cor */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Cor
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'YELLOW', label: 'Amarelada', dot: 'bg-yellow-400' },
                    { id: 'BROWN', label: 'Castanha', dot: 'bg-amber-800' },
                    { id: 'GREEN', label: 'Esverdeada', dot: 'bg-emerald-600' },
                    { id: 'BLACK', label: 'Escura', dot: 'bg-slate-900' },
                    { id: 'RED', label: 'Avermelhada', dot: 'bg-rose-500' },
                    { id: 'OTHER', label: 'Outra', dot: 'bg-slate-400' },
                  ].map((colorOpt) => (
                    <button
                      key={colorOpt.id}
                      type="button"
                      onClick={() => setColor(colorOpt.id as StoolColor)}
                      className={`py-1.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 border transition-all ${
                        color === colorOpt.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${colorOpt.dot}`} />
                      <span>{colorOpt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                Anotação descritiva. Não constitui diagnóstico clínico.
              </p>
            </div>
          )}

          {/* Horário */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Horário da Troca
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Observações (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pomada aplicada, vazou um pouco..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar Fralda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
