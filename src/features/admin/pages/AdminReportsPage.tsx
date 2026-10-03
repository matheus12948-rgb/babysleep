import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Moon, 
  Utensils, 
  BookOpen, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { AdminDataService } from '@/services/adminDataService';
import { AdminReportData } from '@/types/admin';

export const AdminReportsPage: React.FC = () => {
  const [days, setDays] = useState<7 | 14 | 30 | 90>(14);
  const [data, setData] = useState<AdminReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadReports();
  }, [days]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await AdminDataService.getReportData(days);
      setData(res);
    } catch (err) {
      console.warn('Erro ao carregar relatórios:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Filtro de Período */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Relatórios e Tendências de Plataforma
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Métricas analíticas consolidadas de engajamento, sono, rotina e conversão.
          </p>
        </div>

        {/* Filtro de Período */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          {([7, 14, 30, 90] as const).map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                days === d
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {d} dias
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="py-24 text-center text-slate-400" role="status" aria-live="polite">
          <div className="inline-block w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold">Consolidando dados analíticos do período...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. Gráfico de Crescimento de Usuários & Bebês */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp size={16} className="text-indigo-500" />
                  Evolução da Base de Usuários e Bebês
                </h3>
                <p className="text-[11px] text-slate-400">Novos cuidadores e bebês cadastrados no intervalo selecionado</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.growthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      backgroundColor: '#1e293b', 
                      border: 'none', 
                      color: '#fff',
                      fontSize: '11px' 
                    }} 
                  />
                  <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" name="Usuários" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Grid com Gráfico de Sono e Rotina */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Registros de Sono e Sonecas */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Moon size={16} className="text-violet-500" />
                  Padrões Diários de Sonecas
                </h3>
                <p className="text-[11px] text-slate-400">Média de sonecas registradas por dia</p>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.sleepData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', backgroundColor: '#1e293b', border: 'none', color: '#fff', fontSize: '11px' }} 
                    />
                    <Bar dataKey="napsCount" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Sonecas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Eventos de Rotina (Alimentação / Fraldas / Atividades) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Utensils size={16} className="text-amber-500" />
                  Eventos de Rotina (Alimentação e Fraldas)
                </h3>
                <p className="text-[11px] text-slate-400">Distribuição diária de cuidados essenciais</p>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.routineData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', backgroundColor: '#1e293b', border: 'none', color: '#fff', fontSize: '11px' }} 
                    />
                    <Bar dataKey="feeding" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Alimentação" />
                    <Bar dataKey="diapers" fill="#10b981" radius={[6, 6, 0, 0]} name="Fraldas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 3. Engajamento Educacional */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen size={16} className="text-indigo-500" />
              Engajamento com Cursos e Conteúdos Educativos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {data.educationData.map((course, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">
                    {course.courseTitle}
                  </span>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Iniciados: <strong className="text-indigo-600 dark:text-indigo-400">{course.started}</strong></span>
                    <span>Concluídos: <strong className="text-emerald-500">{course.completed}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
