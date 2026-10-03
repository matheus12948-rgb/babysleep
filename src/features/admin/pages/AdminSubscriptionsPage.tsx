import React, { useEffect, useState } from 'react';
import { 
  CreditCard, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Info,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { AdminDataService } from '@/services/adminDataService';
import { AdminSubscriptionListItem } from '@/types/admin';

export const AdminSubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionListItem[]>([]);
  const [kpis, setKpis] = useState({ totalFree: 0, totalPremium: 0, monthly: 0, yearly: 0, trialing: 0 });
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSubscriptions();
  }, [filter]);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await AdminDataService.getSubscriptions({ page: 1, limit: 50, filter });
      setSubscriptions(res.items);
      setKpis(res.kpis);
    } catch (err) {
      console.warn('Erro ao carregar assinaturas:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Assinaturas & Planos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhamento de conversão, planos ativos e controle do simulador sandbox.
          </p>
        </div>

        {/* Badge Mandatório de Sandbox / Simulação */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold">
          <Info size={15} />
          <span>Modo: Sandbox / Simulação</span>
        </div>
      </div>

      {/* Aviso de Não Cobrança Real */}
      <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-3">
        <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-500" />
        <div>
          <span className="font-bold block mb-0.5">Ambiente de Demonstração / Sandbox</span>
          Nenhuma transação financeira real ou cobrança em cartão de crédito é processada nesta fase. Todos os upgrades simulam o ciclo de vida da assinatura para validação da experiência do usuário.
        </div>
      </div>

      {/* KPIs de Assinaturas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Free</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{kpis.totalFree}</span>
        </div>
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-amber-500 block mb-1">Total Premium</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{kpis.totalPremium}</span>
        </div>
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Mensal</span>
          <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{kpis.monthly}</span>
        </div>
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Anual</span>
          <span className="text-2xl font-black text-slate-700 dark:text-slate-200">{kpis.yearly}</span>
        </div>
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Trials Ativos</span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{kpis.trialing}</span>
        </div>
      </div>

      {/* Tabela de Assinaturas */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Histórico de Contas e Assinaturas
          </span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 font-semibold"
          >
            <option value="ALL">Todos os Planos</option>
            <option value="FREE">Apenas FREE</option>
            <option value="PREMIUM_MONTHLY">Apenas Mensal</option>
            <option value="PREMIUM_YEARLY">Apenas Anual</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Usuário</th>
                <th className="py-3.5 px-4">Plano</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Modo</th>
                <th className="py-3.5 px-4">Início</th>
                <th className="py-3.5 px-4 text-right">Término do Período</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Carregando assinaturas...</p>
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nenhuma assinatura encontrada.
                  </td>
                </tr>
              ) : (
                subscriptions.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{s.userName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{s.userEmail}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        s.planType === 'FREE'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}>
                        {s.planType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[9px]">
                        Sandbox
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">
                      {s.currentPeriodEnd 
                        ? new Date(s.currentPeriodEnd).toLocaleDateString('pt-BR') 
                        : 'Renovação Contínua'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
