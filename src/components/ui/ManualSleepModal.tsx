import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { SleepType } from '@/types';
import { useSleepTracker } from '@/features/sleep-tracker/SleepTrackerContext';
import { format } from 'date-fns';

interface ManualSleepModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualSleepModal: React.FC<ManualSleepModalProps> = ({ isOpen, onClose }) => {
  const { addManualRecord } = useManualSleepTracker();
  const [type, setType] = useState<SleepType>('NAP');
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState<string>('13:00');
  const [endTime, setEndTime] = useState<string>('14:15');
  const [qualityRating, setQualityRating] = useState<number>(4);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  function useManualSleepTracker() {
    return useSleepTracker();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startIso = new Date(`${date}T${startTime}:00`).toISOString();
      const endIso = new Date(`${date}T${endTime}:00`).toISOString();

      await addManualRecord({
        type,
        startTime: startIso,
        endTime: endIso,
        qualityRating,
        notes: notes.trim() || undefined,
        isOngoing: false,
        isManuallyAdded: true,
      });

      onClose();
    } catch (err) {
      console.error('Erro ao adicionar registro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Registro de Sono">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de Sono */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setType('NAP')}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              type === 'NAP'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            😴 Soneca
          </button>
          <button
            type="button"
            onClick={() => setType('NIGHT_SLEEP')}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              type === 'NIGHT_SLEEP'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            🌙 Sono Noturno
          </button>
        </div>

        {/* Data */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Data
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        {/* Horários Início e Fim */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Dormiu às
            </label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Acordou às
            </label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
        </div>

        {/* Qualidade do Sono */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Como foi o sono?
          </label>
          <div className="flex gap-2">
            {[
              { val: 1, label: 'Muito agitado 😫' },
              { val: 3, label: 'Normal 😐' },
              { val: 5, label: 'Muito calmo 😴' },
            ].map(item => (
              <button
                key={item.val}
                type="button"
                onClick={() => setQualityRating(item.val)}
                className={`flex-1 py-2 px-1 text-xs rounded-xl border text-center transition ${
                  qualityRating === item.val
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Observações (opcional)
          </label>
          <input
            type="text"
            placeholder="Ex: dormiu fácil no colo após a mamadeira"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="pt-2 flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" className="flex-1" isLoading={loading}>
            Salvar Registro
          </Button>
        </div>
      </form>
    </Modal>
  );
};
