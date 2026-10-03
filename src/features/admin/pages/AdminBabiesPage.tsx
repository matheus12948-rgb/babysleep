import React, { useEffect, useState } from 'react';
import { 
  Baby, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Calendar,
  Users,
  Moon
} from 'lucide-react';
import { AdminDataService } from '@/services/adminDataService';
import { AdminBabyListItem } from '@/types/admin';

export const AdminBabiesPage: React.FC = () => {
  const [babies, setBabies] = useState<AdminBabyListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const limit = 10;

  useEffect(() => {
    loadBabies();
  }, [page]);

  const loadBabies = async () => {
    setLoading(true);
    try {
      const res = await AdminDataService.getBabies({ page, limit, search });
      setBabies(res.items);
      setTotal(res.total);
    } catch (err) {
      console.warn('Erro ao carregar lista de bebês:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadBabies();
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Perfis de Bebês Cadastrados
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhamento protegido sob o princípio de mínimo acesso para suporte à rotina.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold">
          <ShieldCheck size={14} className="text-indigo-500" />
          <span>Privacidade Reforçada</span>
        </div>
      </div>

      {/* Busca */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome do bebê..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
        </form>
      </div>

      {/* Tabela de Bebês */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Nome do Bebê</th>
                <th className="py-3.5 px-4">Data de Nascimento</th>
                <th className="py-3.5 px-4">Responsável</th>
                <th className="py-3.5 px-4 text-center">Cuidadores</th>
                <th className="py-3.5 px-4 text-center">Registros de Sono</th>
                <th className="py-3.5 px-4 text-right">Cadastrado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Carregando perfis de bebês...</p>
                  </td>
                </tr>
              ) : babies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nenhum bebê encontrado.
                  </td>
                </tr>
              ) : (
                babies.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                          <Baby size={16} />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {b.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {b.birthDate}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <span className="font-medium">{b.ownerName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <Users size={13} className="text-slate-400" />
                        {b.caregiversCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <Moon size={13} className="text-indigo-500" />
                        {b.totalSleepRecords}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {new Date(b.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Paginação */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Total: <strong>{total}</strong> bebês</span>
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
    </div>
  );
};
