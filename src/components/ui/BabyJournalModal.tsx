import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useBaby } from '@/features/baby/BabyContext';
import { DataService } from '@/services/dataService';
import { BabyJournalEntry } from '@/types';
import { format } from 'date-fns';

import { sanitizeInput } from '@/utils/security';

interface BabyJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const BabyJournalModal: React.FC<BabyJournalModalProps> = ({ isOpen, onClose, onSaved }) => {
  const { activeBaby } = useBaby();
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState<string>(format(new Date(), 'HH:mm'));
  const [mood, setMood] = useState<BabyJournalEntry['mood']>('CALM');
  const [content, setContent] = useState<string>('');
  const [associatedEvent, setAssociatedEvent] = useState<string>('SLEEP');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedContent = sanitizeInput(content);
    if (!activeBaby || !sanitizedContent) return;

    setLoading(true);
    try {
      const entry: BabyJournalEntry = {
        id: crypto.randomUUID ? crypto.randomUUID() : 'journal-' + Date.now(),
        babyId: activeBaby.id,
        date,
        time,
        mood,
        content: sanitizedContent,
        associatedEventType: associatedEvent,
        createdAt: new Date().toISOString(),
      };

      await DataService.saveJournalEntry(entry);
      setContent('');
      onSaved?.();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar no diário:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Diário do Bebê — Registrar Memória">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Humor do Bebê */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Como o bebê estava se sentindo?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 'HAPPY', emoji: '😊', label: 'Feliz' },
              { val: 'CALM', emoji: '😌', label: 'Calmo' },
              { val: 'TIRED', emoji: '🥱', label: 'Sonolento' },
              { val: 'FUSSY', emoji: '🥺', label: 'Manhoso' },
              { val: 'CRYING', emoji: '😢', label: 'Choroso' },
              { val: 'PLAYFUL', emoji: '🎉', label: 'Brincalhão' },
            ].map(m => (
              <button
                key={m.val}
                type="button"
                onClick={() => setMood(m.val as BabyJournalEntry['mood'])}
                className={`py-2 px-1 text-xs rounded-xl border flex flex-col items-center gap-1 transition ${
                  mood === m.val
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="text-lg">{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Data e Horário */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Horário
            </label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
        </div>

        {/* Associação de Evento */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Relacionado com a rotina de:
          </label>
          <select
            value={associatedEvent}
            onChange={e => setAssociatedEvent(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="SLEEP">😴 Soneca / Sono</option>
            <option value="FEEDING">🍼 Alimentação / Mamadeira</option>
            <option value="BATH">🛁 Banho relaxante</option>
            <option value="WALK">🌳 Passeio</option>
            <option value="MILESTONE">🌟 Marco de desenvolvimento</option>
            <option value="GENERAL">📝 Observação geral</option>
          </select>
        </div>

        {/* Texto do diário */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            O que aconteceu?
          </label>
          <textarea
            rows={3}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Ex: Hoje teve uma soneca mais longa e tranquila depois do banho quentinho."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            required
          />
        </div>

        <div className="pt-2 flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" className="flex-1" isLoading={loading}>
            Salvar Memória
          </Button>
        </div>
      </form>
    </Modal>
  );
};
