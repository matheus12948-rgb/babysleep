import React, { useState } from 'react';
import { X, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCaregiver } from './useCaregiver';

interface JoinBabyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinedSuccess: (babyId: string) => void;
}

export const JoinBabyModal: React.FC<JoinBabyModalProps> = ({
  isOpen,
  onClose,
  onJoinedSuccess,
}) => {
  const { acceptInvite } = useCaregiver();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Por favor, informe o código de convite.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await acceptInvite(code);
    setLoading(false);

    if (res.success && res.babyId) {
      onJoinedSuccess(res.babyId);
      setCode('');
      onClose();
    } else {
      setError(res.error || 'Código inválido ou expirado.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col my-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                Vincular Bebê da Família
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Insira o código compartilhado pelo cuidador
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Código de Convite
            </label>
            <input
              type="text"
              placeholder="Ex: BS-7K2M"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={10}
              className="w-full text-center text-lg font-bold tracking-widest py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 uppercase focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p className="text-[11px] text-slate-400 text-center">
              O código foi enviado por e-mail ou mensagem pelo responsável do bebê.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              {loading ? 'Validando...' : (
                <>
                  <span>Vincular</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
