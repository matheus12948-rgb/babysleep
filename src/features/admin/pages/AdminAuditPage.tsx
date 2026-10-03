import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Search,
  Eye,
  X
} from 'lucide-react';
import { AdminDataService } from '@/services/adminDataService';
import { AdminAuditLog } from '@/types/admin';

export const AdminAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);
  const limit = 15;

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await AdminDataService.getAuditLogs({ page, limit, actionFilter });
      setLogs(res.items);
      setTotal(res.total);
    } catch (err) {
      console.warn('Erro ao carregar audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  const actionList = [
    'ALL',
    'BLOCK_USER',
    'UNBLOCK_USER',
    'PUBLISH_CONTENT',
    'UNPUBLISH_CONTENT',
    'ACTIVATE_SOUND',
    'DEACTIVATE_SOUND',
    'UPDATE_SYSTEM_SETTING'
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Trilha de Auditoria Administrativa
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registro imutável de todas as ações sensíveis realizadas por administradores no sistema.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
          <ShieldCheck size={15} />
          <span>RLS Protegido (Somente ADMIN)</span>
        </div>
      </div>

      {/* Filtro por Ação */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Filter size={15} />
          <span className="font-semibold">Filtrar por Tipo de Ação:</span>
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 font-semibold"
          >
            {actionList.map(a => (
              <option key={a} value={a}>
                {a === 'ALL' ? 'Todas as Ações' : a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Ação</th>
                <th className="py-3.5 px-4">Entidade Afetada</th>
                <th className="py-3.5 px-4">Admin ID</th>
                <th className="py-3.5 px-4">Data e Hora</th>
                <th className="py-3.5 px-4 text-right">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Carregando trilha de auditoria...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Nenhum registro de auditoria encontrado.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-200">
                      {log.entityType} {log.entityId ? <span className="font-mono text-slate-400">#{log.entityId.slice(0, 8)}</span> : ''}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {log.adminUserId ? log.adminUserId.slice(0, 12) + '...' : 'Sistema'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                        title="Ver payload do log"
                        aria-label="Ver detalhes do registro de auditoria"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Total: <strong>{total}</strong> registros auditados</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Página anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Próxima página"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Payload do Log */}
      {selectedLog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Detalhes da auditoria"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Log de Auditoria</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{selectedLog.action}</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Fechar modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">ID do Registro</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedLog.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Data e Hora</span>
                <span className="text-slate-700 dark:text-slate-300">{new Date(selectedLog.createdAt).toLocaleString('pt-BR')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Metadados Registrados (JSON)</span>
                <pre className="mt-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 font-mono text-[11px] text-slate-800 dark:text-slate-200 overflow-x-auto max-h-48">
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
