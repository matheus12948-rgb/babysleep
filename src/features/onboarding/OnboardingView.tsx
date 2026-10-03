import React, { useState } from 'react';
import { Baby, Moon, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useBaby } from '@/features/baby/BabyContext';
import { Gender } from '@/types';
import { calculateBabyAge } from '@/utils/date';

interface OnboardingViewProps {
  onComplete: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const { saveBabyProfile } = useBaby();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Campos do formulário
  const [name, setName] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [gender, setGender] = useState<Gender>('PREFER_NOT_TO_SAY');
  const [habitualWakeTime, setHabitualWakeTime] = useState<string>('07:00');
  const [habitualBedtime, setHabitualBedtime] = useState<string>('19:30');
  const [expectedNapsCount, setExpectedNapsCount] = useState<number>(3);
  const [parentingGoal, setParentingGoal] = useState<string>('Estabelecer uma rotina previsível e tranquila');

  const agePreview = birthDate ? calculateBabyAge(birthDate) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthDate) return;

    setLoading(true);
    try {
      await saveBabyProfile({
        name: name.trim(),
        birthDate,
        gender,
        habitualWakeTime: `${habitualWakeTime}:00`,
        habitualBedtime: `${habitualBedtime}:00`,
        expectedNapsCount,
        parentingGoal,
      });

      onComplete();
    } catch (err) {
      console.error('Erro ao salvar bebê:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-center px-4 py-8">
      <div className="max-w-md w-full mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-800">
        {/* Header Onboarding */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
            <Baby size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Boas-vindas ao BabySleep
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Vamos personalizar o acompanhamento com base no ritmo único do seu bebê.
          </p>
        </div>

        {/* Indicador de passos */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-indigo-600' : 'w-3 bg-slate-200 dark:bg-slate-700'}`} />
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-indigo-600' : 'w-3 bg-slate-200 dark:bg-slate-700'}`} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Passo 1: Conhecendo o bebê
              </h2>

              {/* Nome */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Qual é o nome ou apelido do bebê? *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Theo, Alice, Maya..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              {/* Data de Nascimento */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Data de nascimento *
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              {/* Prévia Automática da Idade */}
              {agePreview && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-500 shrink-0" />
                  <div>
                    <span className="font-bold">Idade calculada: </span>
                    <span>{agePreview.formatted} ({agePreview.weeks} semanas ou {agePreview.days} dias de vida)</span>
                  </div>
                </div>
              )}

              {/* Sexo (Opcional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sexo (opcional)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'MALE', label: 'Menino' },
                    { val: 'FEMALE', label: 'Menina' },
                    { val: 'PREFER_NOT_TO_SAY', label: 'Prefiro não informar' },
                  ].map(item => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setGender(item.val as Gender)}
                      className={`py-2.5 px-1 text-xs rounded-xl border transition ${
                        gender === item.val
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                className="w-full mt-4"
                disabled={!name.trim() || !birthDate}
                onClick={() => setStep(2)}
              >
                Avançar para a Rotina →
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Passo 2: Ritmo e Hábitos
              </h2>

              {/* Horários habituais de acordar e dormir */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Costuma acordar às
                  </label>
                  <input
                    type="time"
                    value={habitualWakeTime}
                    onChange={e => setHabitualWakeTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Costuma dormir às
                  </label>
                  <input
                    type="time"
                    value={habitualBedtime}
                    onChange={e => setHabitualBedtime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Quantidade de sonecas aproximada */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Quantas sonecas por dia ele costuma fazer?
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setExpectedNapsCount(n)}
                      className={`flex-1 py-2 rounded-xl border text-sm font-bold transition ${
                        expectedNapsCount === n
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Objetivo dos pais */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Qual é o objetivo principal da família?
                </label>
                <select
                  value={parentingGoal}
                  onChange={e => setParentingGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Estabelecer rotina previsível">Estabelecer uma rotina previsível</option>
                  <option value="Diminuir despertares noturnos">Diminuir os despertares noturnos</option>
                  <option value="Regularizar horários de soneca">Regularizar os horários de soneca</option>
                  <option value="Acompanhar marcos e desenvolvimento">Acompanhar marcos e desenvolvimento</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  ← Voltar
                </Button>
                <Button type="submit" variant="primary" className="flex-2" isLoading={loading}>
                  Criar Perfil e Iniciar ✨
                </Button>
              </div>
            </div>
          )}
        </form>

        {/* Disclaimer médico */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-400 leading-tight">
            O BabySleep fornece estimativas de janelas de sono baseadas em parâmetros de referência e hábitos do bebê. Não substitui orientações pediátricas.
          </p>
        </div>
      </div>
    </div>
  );
};
