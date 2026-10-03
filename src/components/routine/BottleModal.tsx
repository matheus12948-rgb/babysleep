import React, { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { BottleContentType } from '@/types';
import { useFeeding } from '@/hooks/useFeeding';
import { BOTTLE_PRESET_AMOUNTS, validateBottleAmount } from '@/utils/routine';
import { format } from 'date-fns';

interface BottleModalProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: string;
  onSuccess?: () => void;
}

export const BottleModal: React.FC<BottleModalProps> = ({
  isOpen,
  onClose,
  babyId,
  onSuccess,
}) => {
  const { saveBottle } = useFeeding(babyId);

  const [amountMl, setAmountMl] = useState<number>(120);
  const [customInput, setCustomInput] = useState<string>('120');
  const [contents, setContents] = useState<BottleContentType>('FORMULA');
  const [time, setTime] = useState<string>(format(new Date(), 'HH:mm'));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validation = validateBottleAmount(amountMl);

  const handleSelectPreset = (val: number) => {
    setAmountMl(val);
    setCustomInput(String(val));
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      setAmountMl(parsed);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid) return;

    setIsSubmitting(true);
    try {
      const now = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      const recordDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours || 12, minutes || 0);

      await saveBottle({
        amountMl,
        contents,
        timestamp: recordDate.toISOString(),
        notes: notes.trim() || undefined,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to save bottle record:', err);
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
        aria-labelledby="bottle-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍼</span>
            <div>
              <h2 id="bottle-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Mamadeira
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registro de quantidade e tipo de leite
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Seleção do Tipo de Conteúdo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Tipo de Leite
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'FORMULA', label: 'Fórmula' },
                { id: 'BREAST_MILK', label: 'Materno' },
                { id: 'OTHER', label: 'Outro' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setContents(opt.id as BottleContentType)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    contents === opt.id
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold ring-1 ring-sky-500'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantidade em ml com Presets Rápidos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quantidade (ml)
              </label>
              <span className="text-lg font-extrabold text-sky-600 dark:text-sky-400">
                {amountMl > 0 ? `${amountMl} ml` : '--'}
              </span>
            </div>

            {/* Presets em Grade */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {BOTTLE_PRESET_AMOUNTS.map((preset: number) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all ${
                    amountMl === preset
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {preset} ml
                </button>
              ))}
            </div>

            {/* Input Personalizado */}
            <div>
              <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                Ou digite um valor personalizado:
              </label>
              <input
                type="number"
                min="5"
                max="1000"
                value={customInput}
                onChange={handleCustomChange}
                placeholder="Ex: 135"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            {/* Aviso se quantidade incomum */}
            {validation.warning && (
              <div className="mt-2 flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{validation.warning}</span>
              </div>
            )}
          </div>

          {/* Horário */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Horário da Mamadeira
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
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
              placeholder="Ex: Tomou tudo com facilidade..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
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
              disabled={!validation.isValid || isSubmitting}
              className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar Mamadeira'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
