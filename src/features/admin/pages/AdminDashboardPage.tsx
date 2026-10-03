import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Baby, 
  CreditCard, 
  Moon, 
  Clock, 
  TrendingUp, 
  Activity,
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { AdminDataService } from '@/services/adminDataService';
import { AdminKPIs } from '@/types/admin';

interface AdminDashboardPageProps {
  onNavigateToTab: (tab: any) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateToTab }) => {
  const [kpis, setKpis] = useState<AdminKPIs | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AdminDataService.getKPIs();
      setKpis(data);
    } catch (err) {
      setError('Não foi possível carregar os KPIs do sistema.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" role="status" aria-live="polite">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div role="alert" className="p-8 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center space-y-3">
        <AlertCircle size={32} className="mx-auto text-rose-500" />
        <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{error || 'Erro desconhecido'}</p>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Visão Geral */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard Administrativo
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Visão consolidada em tempo real da base de usuários, sono e métricas do BabySleep.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Dados em Tempo Real
          </span>
        </div>
      </div>

      {/* Grid de Cards de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Usuários */}
        <div 
          onClick={() => onNavigateToTab('users')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-500 dark:hover:border-indigo-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Usuários
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition">
              <Users size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {kpis.totalUsers}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-emerald-500 font-semibold">+{kpis.newUsersToday} hoje</span>
            <span>• {kpis.newUsersLast7Days} nos últimos 7d</span>
          </div>
        </div>

        {/* Total Bebês */}
        <div 
          onClick={() => onNavigateToTab('babies')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-violet-500 dark:hover:border-violet-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Bebês
            </span>
            <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-105 transition">
              <Baby size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {kpis.totalBabies}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Perfis de crianças acompanhadas ativamente
          </div>
        </div>

        {/* Assinaturas Premium vs Free */}
        <div 
          onClick={() => onNavigateToTab('subscriptions')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-500 dark:hover:border-amber-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Premium Ativos
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {kpis.activePremium}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {kpis.totalFree} usuários no plano FREE (Sandbox)
          </div>
        </div>

        {/* Registros de Sono */}
        <div 
          onClick={() => onNavigateToTab('reports')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-500 dark:hover:border-indigo-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Registros de Sono
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition">
              <Moon size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {kpis.totalSleepRecords}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {kpis.totalRoutineEvents} eventos de rotina registrados
          </div>
        </div>
      </div>

      {/* Seção Inferior: Atividade Recente da Auditoria */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Últimas Ações Administrativas (Auditoria)
            </h2>
          </div>
          <button
            onClick={() => onNavigateToTab('audit')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Ver todos os logs
          </button>
        </div>

        {kpis.recentAuditLogs.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
            Nenhuma ação administrativa recente registrada no banco de dados.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {kpis.recentAuditLogs.map(log => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-[10px]">
                    {log.action}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {log.entityType} {log.entityId ? `#${log.entityId.slice(0, 8)}` : ''}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(log.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
