import React, { useState } from 'react';
import { X, Crown, Check, Sparkles, Shield, Zap, Heart, Baby, FileText, Music2 } from 'lucide-react';
import { useSubscription } from './SubscriptionContext';
import { SubscriptionPlanType } from '@/types/subscription';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { upgradePlan, isPremium } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const plan: SubscriptionPlanType = billingCycle === 'yearly' ? 'PREMIUM_YEARLY' : 'PREMIUM_MONTHLY';
      await upgradePlan(plan);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.warn('Erro ao atualizar plano:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-2xl border border-indigo-500/40 p-5 sm:p-7 flex flex-col my-auto overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header do Paywall */}
        <div className="text-center pt-2 pb-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-indigo-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-3">
            <Crown className="w-3.5 h-3.5 fill-current" />
            <span>BabySleep Pro</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Noites tranquilas para toda a família
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
            Multi-cuidador em tempo real, relatórios pediátricos e previsões ilimitadas.
          </p>
        </div>

        {/* Toggle Mensal / Anual */}
        <div className="p-1 rounded-2xl bg-white/10 backdrop-blur-sm grid grid-cols-2 gap-1 mb-5 relative z-10 border border-white/10">
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`py-2 px-3 rounded-xl font-bold text-xs transition flex flex-col items-center justify-center relative ${
              billingCycle === 'yearly'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-wide shadow-sm">
              Economize 33%
            </span>
            <span>Plano Anual</span>
            <span className="text-[10px] font-normal opacity-90">R$ 19,90 / mês</span>
          </button>

          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`py-2 px-3 rounded-xl font-bold text-xs transition flex flex-col items-center justify-center ${
              billingCycle === 'monthly'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>Plano Mensal</span>
            <span className="text-[10px] font-normal opacity-90">R$ 29,90 / mês</span>
          </button>
        </div>

        {/* Checklist de Benefícios Premium */}
        <div className="space-y-3 mb-6 relative z-10 bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="flex items-start gap-3 text-xs text-slate-200">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div>
              <strong className="text-white">Multi-Cuidador Ilimitado:</strong> Convide parceiro(a), babá e avós com controle de papéis (escrita ou observador).
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-slate-200">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-white">Sincronização em Tempo Real:</strong> Quando um cuidador registra uma mamadeira ou soneca, todos os celulares atualizam na hora.
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-slate-200">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-white">Relatório Clínico para o Pediatra:</strong> Exportação consolidada de médias de sono, alimentação e fraldas.
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-slate-200">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Music2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-white">12 Faixas Acústicas com Fade-Out Suave:</strong> Sem cortes repentinos de som que acordam o bebê.
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-slate-200">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Baby className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-white">Múltiplos Bebês Ilimitados:</strong> Acompanhe irmãos ou gêmeos em perfis separados.
            </div>
          </div>
        </div>

        {/* Botão de Ação / Checkout Simulado */}
        <div className="space-y-2.5 relative z-10">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wide transition shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            {loading ? 'Processando assinatura...' : 'Experimentar 7 Dias Grátis'}
          </button>

          <p className="text-[11px] text-center text-slate-400">
            Cobrado apenas após os 7 dias de teste. Cancele com 1 clique a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  );
};
