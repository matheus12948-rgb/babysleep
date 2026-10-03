import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Search, 
  CheckCircle, 
  EyeOff, 
  AlertCircle,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { AdminDataService } from '@/services/adminDataService';
import { AdminContentItem } from '@/types/admin';
import { useAuth } from '@/features/auth/AuthContext';

export const AdminContentPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<AdminContentItem[]>(() => AdminDataService.getContentList());
  const [filterType, setFilterType] = useState<'ALL' | 'COURSE' | 'ARTICLE'>('ALL');
  const [search, setSearch] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleTogglePublish = async (item: AdminContentItem) => {
    if (!user) return;
    try {
      await AdminDataService.toggleContentPublish(user.id, item.id, item.status);
      const updated = AdminDataService.getContentList();
      setItems(updated);
      showToast(item.status === 'PUBLISHED' ? 'Conteúdo despublicado com sucesso.' : 'Conteúdo publicado e visível para os pais.');
    } catch (err) {
      showToast('Erro ao atualizar status de publicação');
    }
  };

  const filteredItems = items.filter(item => {
    if (filterType !== 'ALL' && item.type !== filterType) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
          Gestão de Conteúdo Educativo
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Gerenciamento de cursos, trilhas de marcos de desenvolvimento e biblioteca de artigos para famílias.
        </p>
      </div>

      {/* Disclaimer Ético Mandatório */}
      <div className="p-4 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-700 dark:text-indigo-300 flex items-start gap-3">
        <ShieldCheck size={18} className="shrink-0 mt-0.5 text-indigo-500" />
        <div>
          <span className="font-bold block mb-0.5">Diretriz Pediátrica de Conteúdo</span>
          Todos os conteúdos publicados no BabySleep possuem finalidade estritamente educativa e informativa sobre sono infantil e rotina familiar. Nunca substituem a consulta, o diagnóstico ou a conduta individualizada do médico pediatra.
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por título do curso ou artigo..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'COURSE', 'ARTICLE'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterType === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {type === 'ALL' ? 'Todos' : type === 'COURSE' ? 'Cursos' : 'Artigos'}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Conteúdos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map(item => {
          const isPublished = item.status === 'PUBLISHED';
          return (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase ${
                    item.type === 'COURSE'
                      ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300'
                      : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                  }`}>
                    {item.type === 'COURSE' ? 'Curso Estruturado' : 'Artigo Prático'}
                  </span>

                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    isPublished
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {isPublished ? 'PUBLICADO' : 'RASCUNHO'}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {item.subtitle}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                    <Tag size={12} /> {item.categoryOrAgeRange}
                  </span>
                  {item.lessonsCount !== undefined && (
                    <span>• {item.lessonsCount} aulas práticas</span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleTogglePublish(item)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isPublished
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                  aria-label={isPublished ? `Despublicar ${item.title}` : `Publicar ${item.title}`}
                >
                  {isPublished ? <EyeOff size={14} /> : <CheckCircle size={14} />}
                  <span>{isPublished ? 'Despublicar' : 'Publicar'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
