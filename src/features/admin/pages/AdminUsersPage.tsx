import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Ban, 
  CheckCircle2, 
  Baby, 
  Moon, 
  Utensils, 
  Sparkles,
  X,
  AlertCircle
} from 'lucide-react';
import { AdminDataService } from '@/services/adminDataService';
import { AdminUserListItem, AdminUserDetail } from '@/types/admin';
import { useAuth } from '@/features/auth/AuthContext';

export const AdminUsersPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const [search, setSearch] = useState<string>('');
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  // Modal de Detalhe (/admin/users/:id)
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    loadUsers();
  }, [page, planFilter, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await AdminDataService.getUsers({
        page,
        limit,
        search,
        planFilter,
        statusFilter,
      });
      setUsers(res.items);
      setTotal(res.total);
    } catch (err) {
      showToast('Erro ao carregar lista de usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleOpenDetail = async (userId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await AdminDataService.getUserDetail(userId);
      setSelectedUserDetail(detail);
    } catch (err) {
      showToast('Erro ao carregar detalhes do usuário');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleToggleBlock = async (targetUser: AdminUserListItem) => {
    if (!currentAdmin) return;
    const isBlocking = !targetUser.isBlocked;
    const confirmMsg = isBlocking 
      ? `Tem certeza que deseja bloquear o acesso de ${targetUser.fullName}?`
      : `Deseja desbloquear ${targetUser.fullName}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await AdminDataService.blockUser(currentAdmin.id, targetUser.id, isBlocking);
      showToast(isBlocking ? 'Usuário bloqueado com sucesso.' : 'Usuário desbloqueado.');
      await loadUsers();
      if (selectedUserDetail?.id === targetUser.id) {
        setSelectedUserDetail(prev => prev ? { ...prev, isBlocked: isBlocking } : null);
      }
    } catch (err) {
      showToast('Erro ao atualizar status do usuário');
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Toast flutuante */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl">
          {toastMsg}
        </div>
      )}

      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Gestão de Usuários
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Controle de contas cadastradas, planos, histórico de uso e moderação com mínimo privilégio.
        </p>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome ou e-mail..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
        </form>

        <div className="w-full md:w-auto flex items-center gap-3">
          {/* Filtro de Plano */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter size={14} />
            <select
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">Todos os Planos</option>
              <option value="FREE">Apenas FREE</option>
              <option value="PREMIUM_MONTHLY">Premium Mensal</option>
              <option value="PREMIUM_YEARLY">Premium Anual</option>
            </select>
          </div>

          {/* Filtro de Status */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">Todos os Status</option>
            <option value="ACTIVE">Ativos</option>
            <option value="CANCELED">Cancelados</option>
            <option value="TRIALING">Em Teste (Trial)</option>
          </select>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Nome & Função</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Cadastro</th>
                <th className="py-3.5 px-4">Plano</th>
                <th className="py-3.5 px-4 text-center">Bebês</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Carregando usuários...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Nenhum usuário encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {u.fullName}
                        </span>
                        {u.role === 'ADMIN' && (
                          <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[9px]">
                            ADMIN
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        u.plan === 'FREE' 
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' 
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {u.babiesCount}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {u.isBlocked ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                          BLOQUEADO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                          {u.subscriptionStatus}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(u.id)}
                          className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                          title="Visualizar detalhes"
                          aria-label={`Ver detalhes do usuário ${u.fullName}`}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleBlock(u)}
                          className={`p-1.5 rounded-lg transition ${
                            u.isBlocked 
                              ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40' 
                              : 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                          }`}
                          title={u.isBlocked ? 'Desbloquear usuário' : 'Bloquear usuário'}
                          aria-label={u.isBlocked ? 'Desbloquear conta' : 'Bloquear conta'}
                        >
                          {u.isBlocked ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Paginação */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Total: <strong>{total}</strong> usuários</span>
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

      {/* Modal de Detalhe do Usuário (/admin/users/:id) */}
      {selectedUserDetail && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label={`Detalhes do usuário ${selectedUserDetail.fullName}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  {selectedUserDetail.fullName[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {selectedUserDetail.fullName}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedUserDetail.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Fechar detalhes do usuário"
              >
                <X size={18} />
              </button>
            </div>

            {/* Informações da Conta e Assinatura */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Plano Atual</span>
                <p className="font-bold text-slate-900 dark:text-white">{selectedUserDetail.plan}</p>
                <span className="text-[10px] text-emerald-500 font-semibold">{selectedUserDetail.subscriptionStatus}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Fuso Horário</span>
                <p className="font-bold text-slate-900 dark:text-white">{selectedUserDetail.timezone}</p>
                <span className="text-[10px] text-slate-400">Cadastrado em {new Date(selectedUserDetail.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            {/* Bebês Vinculados */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Bebês Cadastrados ({selectedUserDetail.babies.length})
              </span>
              {selectedUserDetail.babies.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhum bebê cadastrado por este usuário.</p>
              ) : (
                <div className="space-y-2">
                  {selectedUserDetail.babies.map(b => (
                    <div key={b.id} className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <Baby size={18} className="text-indigo-500" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{b.name}</span>
                          <span className="text-[10px] text-slate-400">Nascimento: {b.birthDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Métricas de Uso de Rotina */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Histórico de Uso
              </span>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <Moon size={16} className="mx-auto text-indigo-500 mb-1" />
                  <span className="block font-black text-sm text-slate-900 dark:text-white">
                    {selectedUserDetail.usageStats.sleepRecordsCount}
                  </span>
                  <span className="text-[9px] text-slate-400">Sono</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <Utensils size={16} className="mx-auto text-amber-500 mb-1" />
                  <span className="block font-black text-sm text-slate-900 dark:text-white">
                    {selectedUserDetail.usageStats.feedingRecordsCount}
                  </span>
                  <span className="text-[9px] text-slate-400">Mamadas</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <Sparkles size={16} className="mx-auto text-emerald-500 mb-1" />
                  <span className="block font-black text-sm text-slate-900 dark:text-white">
                    {selectedUserDetail.usageStats.diaperRecordsCount}
                  </span>
                  <span className="text-[9px] text-slate-400">Fraldas</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <Users size={16} className="mx-auto text-violet-500 mb-1" />
                  <span className="block font-black text-sm text-slate-900 dark:text-white">
                    {selectedUserDetail.usageStats.activityRecordsCount}
                  </span>
                  <span className="text-[9px] text-slate-400">Atividades</span>
                </div>
              </div>
            </div>

            {/* Ações de Conta */}
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedUserDetail(null)}
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
