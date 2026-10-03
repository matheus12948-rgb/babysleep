import React, { useState } from 'react';
import { X, Mail, Shield, Eye, Copy, Check, UserPlus, Sparkles } from 'lucide-react';
import { CaregiverRole, CaregiverInvitation } from '@/types/caregiver';
import { useCaregiver } from './useCaregiver';

interface InviteCaregiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  babyName: string;
}

export const InviteCaregiverModal: React.FC<InviteCaregiverModalProps> = ({
  isOpen,
  onClose,
  babyName,
}) => {
  const { inviteCaregiver } = useCaregiver();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CaregiverRole>('CAREGIVER');
  const [loading, setLoading] = useState(false);
  const [createdInvite, setCreatedInvite] = useState<CaregiverInvitation | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Por favor, informe um e-mail válido.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const invite = await inviteCaregiver(email, role);
      setCreatedInvite(invite);
    } catch (err: any) {
      setError(err?.message || 'Erro ao gerar convite.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (!createdInvite) return;
    navigator.clipboard.writeText(createdInvite.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setCreatedInvite(null);
    setEmail('');
    setCopied(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                Convidar Cuidador
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compartilhe o acompanhamento de {babyName}
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {!createdInvite ? (
          <form onSubmit={handleSend} className="space-y-4 pt-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Email input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                E-mail do cuidador
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="exemplo@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Seletor de Papéis */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nível de Permissão
              </label>
              <div className="grid grid-cols-2 gap-2">
                {/* Cuidador */}
                <div
                  onClick={() => setRole('CAREGIVER')}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                    role === 'CAREGIVER'
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className={`w-4 h-4 ${role === 'CAREGIVER' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="font-bold text-xs text-slate-800 dark:text-white">
                      Cuidador
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                    Pode registrar sono, alimentação, fraldas e ver tudo.
                  </p>
                </div>

                {/* Observador */}
                <div
                  onClick={() => setRole('VIEWER')}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                    role === 'VIEWER'
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Eye className={`w-4 h-4 ${role === 'VIEWER' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="font-bold text-xs text-slate-800 dark:text-white">
                      Observador
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                    Apenas visualiza status, linha do tempo e relatórios.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Gerando convite...' : 'Gerar Código de Convite'}
            </button>
          </form>
        ) : (
          /* Sucesso: Código Gerado */
          <div className="space-y-4 pt-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-xl">
              ✓
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                Convite Criado com Sucesso!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Envie o código abaixo para o cuidador ({createdInvite.email}).
              </p>
            </div>

            {/* Caixa com o Código */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">
                  Código de Acesso (Válido por 7 dias)
                </span>
                <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300 tracking-widest mt-0.5">
                  {createdInvite.inviteCode}
                </p>
              </div>

              <button
                type="button"
                onClick={copyCode}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              O cuidador só precisa acessar o BabySleep, abrir o Perfil e clicar em <strong>"Entrar com Código"</strong>.
            </p>

            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-200"
            >
              Concluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
