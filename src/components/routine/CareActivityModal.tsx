import React, { useState } from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';
import { ActivityCategory } from '@/types';
import { useActivities } from '@/hooks/useActivities';
import { 
  celsiusToFahrenheit, 
  fahrenheitToCelsius, 
  validateTemperature,
  MEDICINE_DISCLAIMER 
} from '@/utils/routine';
import { format } from 'date-fns';

export type CareModalMode = 'BATH' | 'TEMPERATURE' | 'MEDICINE' | 'ACTIVITY';

interface CareActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  babyId: string;
  initialMode?: CareModalMode;
  onSuccess?: () => void;
}

export const CareActivityModal: React.FC<CareActivityModalProps> = ({
  isOpen,
  onClose,
  babyId,
  initialMode = 'BATH',
  onSuccess,
}) => {
  const { saveBath, saveTemperature, saveMedicine, saveActivity } = useActivities(babyId);

  const [mode, setMode] = useState<CareModalMode>(initialMode);
  const [time, setTime] = useState<string>(format(new Date(), 'HH:mm'));
  const [durationMinutes, setDurationMinutes] = useState<string>('15');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Temperatura State
  const [tempValue, setTempValue] = useState<string>('36.8');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [measMethod, setMeasMethod] = useState<'AXILLARY' | 'RECTAL' | 'EAR' | 'FOREHEAD'>('AXILLARY');

  // Medicamento State (sem prescrição médica)
  const [medicineName, setMedicineName] = useState('');

  // Atividade State
  const [actType, setActType] = useState<ActivityCategory>('WALK');

  if (!isOpen) return null;

  // Conversão de Temperatura ao alternar unidade
  const handleToggleUnit = (newUnit: 'C' | 'F') => {
    if (newUnit === tempUnit) return;
    const currentNum = parseFloat(tempValue);
    if (!isNaN(currentNum)) {
      if (newUnit === 'F') {
        setTempValue(celsiusToFahrenheit(currentNum).toFixed(1));
      } else {
        setTempValue(fahrenheitToCelsius(currentNum).toFixed(1));
      }
    }
    setTempUnit(newUnit);
  };

  const tempNum = parseFloat(tempValue);
  const tempValidation = mode === 'TEMPERATURE' 
    ? validateTemperature(tempNum, tempUnit) 
    : { isValid: true, warning: undefined };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const now = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      const recordDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours || 12, minutes || 0);
      const timestamp = recordDate.toISOString();

      if (mode === 'BATH') {
        await saveBath({
          durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : undefined,
          timestamp,
          notes: notes.trim() || undefined,
        });
      } else if (mode === 'TEMPERATURE') {
        if (!isNaN(tempNum)) {
          await saveTemperature({
            valueNumeric: tempNum,
            unit: tempUnit,
            measurementMethod: measMethod,
            timestamp,
            notes: notes.trim() || undefined,
          });
        }
      } else if (mode === 'MEDICINE') {
        if (medicineName.trim()) {
          await saveMedicine({
            medicineName: medicineName.trim(),
            timestamp,
            notes: notes.trim() || undefined,
          });
        }
      } else if (mode === 'ACTIVITY') {
        await saveActivity({
          category: actType,
          durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : undefined,
          timestamp,
          notes: notes.trim() || undefined,
        });
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to save care/activity record:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'BATH': return { title: 'Banho', icon: '🛁' };
      case 'TEMPERATURE': return { title: 'Temperatura', icon: '🌡️' };
      case 'MEDICINE': return { title: 'Medicamento', icon: '💊' };
      case 'ACTIVITY': return { title: 'Atividade / Passeio', icon: '🚶' };
    }
  };

  const modalInfo = getModeTitle();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="care-activity-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{modalInfo.icon}</span>
            <div>
              <h2 id="care-activity-title" className="text-lg font-bold text-slate-900 dark:text-white">
                {modalInfo.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registro de cuidado diário
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
          {/* Seletor rápido de tipo de cuidado */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            {[
              { id: 'BATH', label: 'Banho', icon: '🛁' },
              { id: 'TEMPERATURE', label: 'Termômetro', icon: '🌡️' },
              { id: 'MEDICINE', label: 'Remédio', icon: '💊' },
              { id: 'ACTIVITY', label: 'Passeio', icon: '🚶' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMode(tab.id as CareModalMode)}
                className={`py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center gap-0.5 ${
                  mode === tab.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* MODO 1: BANHO */}
          {mode === 'BATH' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Duração estimada (minutos, opcional)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="Ex: 15"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          )}

          {/* MODO 2: TEMPERATURA */}
          {mode === 'TEMPERATURE' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Valor da Temperatura
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="115"
                    required
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  {/* Seletor °C / °F com conversão automática */}
                  <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => handleToggleUnit('C')}
                      className={`px-4 py-2 text-xs font-bold transition-all ${
                        tempUnit === 'C'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      °C
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleUnit('F')}
                      className={`px-4 py-2 text-xs font-bold transition-all ${
                        tempUnit === 'F'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      °F
                    </button>
                  </div>
                </div>

                {/* Aviso se temperatura incomum (aviso, sem diagnóstico) */}
                {tempValidation.warning && (
                  <div className="mt-2 flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{tempValidation.warning}</span>
                  </div>
                )}
              </div>

              {/* Método de Medição */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Método (opcional)
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'AXILLARY', label: 'Axilar' },
                    { id: 'FOREHEAD', label: 'Frontal' },
                    { id: 'EAR', label: 'Ouvido' },
                    { id: 'RECTAL', label: 'Retal' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMeasMethod(m.id as any)}
                      className={`py-2 px-1 rounded-xl text-xs text-center border transition-all ${
                        measMethod === m.id
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                Apenas registro do valor medido. Não interpreta como diagnóstico nem recomenda medicamentos.
              </p>
            </div>
          )}

          {/* MODO 3: MEDICAMENTO COM DISCLAIMER OBRIGATÓRIO */}
          {mode === 'MEDICINE' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Nome do Medicamento *
                </label>
                <input
                  type="text"
                  required
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="Ex: Paracetamol infantil, Vitamina D..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Disclaimer de Saúde Mandatório */}
              <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-purple-900 dark:text-purple-200 text-xs flex gap-2.5">
                <Info className="w-5 h-5 shrink-0 text-purple-600 dark:text-purple-400 mt-0.5" />
                <p className="leading-relaxed">
                  {MEDICINE_DISCLAIMER}
                </p>
              </div>
            </div>
          )}

          {/* MODO 4: ATIVIDADE / PASSEIO */}
          {mode === 'ACTIVITY' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Tipo de Atividade
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'WALK', label: 'Passeio 🌳' },
                    { id: 'PLAY', label: 'Brincadeira 🧸' },
                    { id: 'TUMMY_TIME', label: 'Tummy Time 🤸' },
                    { id: 'OTHER', label: 'Ao Ar Livre ☀️' },
                    { id: 'NOTE', label: 'Outro 📝' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActType(cat.id as ActivityCategory)}
                      className={`py-2 px-1 rounded-xl text-xs text-center border transition-all ${
                        actType === cat.id
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 font-bold ring-1 ring-teal-500'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Duração (minutos, opcional)
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="Ex: 30"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Horário (comum a todos) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Horário
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
            />
          </div>

          {/* Observações (comum a todos) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Observações (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Cuidador responsável, observações adicionais..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
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
              disabled={isSubmitting || (mode === 'MEDICINE' && !medicineName.trim())}
              className="flex-1 py-3 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 text-white dark:text-slate-900 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
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
