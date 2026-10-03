import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { FoodReaction } from '@/types';
import { useFeeding } from '@/hooks/useFeeding';
import { format } from 'date-fns';

interface SolidFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: string;
  onSuccess?: () => void;
}

export const SolidFoodModal: React.FC<SolidFoodModalProps> = ({
  isOpen,
  onClose,
  babyId,
  onSuccess,
}) => {
  const { saveSolidFood } = useFeeding(babyId);

  const [foodName, setFoodName] = useState('');
  const [amount, setAmount] = useState('');
  const [reaction, setReaction] = useState<FoodReaction>('LIKED');
  const [time, setTime] = useState<string>(format(new Date(), 'HH:mm'));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    setIsSubmitting(true);
    try {
      const now = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      const recordDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours || 12, minutes || 0);

      await saveSolidFood({
        foodName: foodName.trim(),
        amount: amount.trim() || undefined,
        reaction,
        timestamp: recordDate.toISOString(),
        notes: notes.trim() || undefined,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to save solid food record:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reactionOptions: { id: FoodReaction; label: string; emoji: string }[] = [
    { id: 'LIKED', label: 'Gostou', emoji: '😊' },
    { id: 'NEUTRAL', label: 'Neutro', emoji: '😐' },
    { id: 'DISLIKED', label: 'Recusou', emoji: '😕' },
    { id: 'MESSY', label: 'Bagunça', emoji: '🥣' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="solid-food-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥣</span>
            <div>
              <h2 id="solid-food-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Alimentação Sólida
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Diário de introdução alimentar descritivo
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
          {/* Nome do Alimento */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Alimento oferecido *
            </label>
            <input
              type="text"
              required
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="Ex: Banana amassada, Purê de abóbora..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Quantidade Opcional */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Porção aproximada (opcional)
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 3 colheres de sopa, meia banana..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Reação do Bebê */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Reação observada
            </label>
            <div className="grid grid-cols-4 gap-2">
              {reactionOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setReaction(opt.id)}
                  className={`py-2 px-1 rounded-xl text-center border transition-all ${
                    reaction === opt.id
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 font-bold ring-1 ring-amber-500'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xl mb-0.5">{opt.emoji}</div>
                  <div className="text-[11px] font-medium leading-none">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Horário */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Horário
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
              placeholder="Ex: Mastigou sozinho, primeira vez provando..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <p className="text-[11px] text-slate-400 text-center italic">
            Registro descritivo. Não substitui orientações nutricionais ou pediátricas.
          </p>

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
              disabled={!foodName.trim() || isSubmitting}
              className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
