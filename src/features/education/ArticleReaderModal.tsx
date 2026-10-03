import React from 'react';
import { Article } from './types';
import { X, Bookmark, Clock, Tag } from 'lucide-react';

interface ArticleReaderModalProps {
  article: Article | null;
  isOpen: boolean;
  isBookmarked: boolean;
  onClose: () => void;
  onToggleBookmark: () => void;
}

export const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({
  article,
  isOpen,
  isBookmarked,
  onClose,
  onToggleBookmark
}) => {
  if (!isOpen || !article) return null;

  const categoryNames: Record<string, string> = {
    sleep: 'Sono & Janelas',
    leaps: 'Saltos de Desenvolvimento',
    feeding: 'Alimentação & Sono',
    wellbeing: 'Saúde & Ambiente Seguro'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-start gap-3">
            <span className="text-3xl p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl shrink-0">
              {article.icon}
            </span>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <span>{categoryNames[article.category] || 'Artigo'}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white leading-snug mt-0.5">
                {article.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            <button
              onClick={onToggleBookmark}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked 
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title={isBookmarked ? 'Remover dos salvos' : 'Salvar artigo'}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
          {/* Metadata pill & tags */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-medium">
              <Clock className="w-3.5 h-3.5" /> {article.readTimeMinutes} min de leitura
            </span>
            {article.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full font-medium">
                <Tag className="w-3 h-3" /> #{tag}
              </span>
            ))}
          </div>

          {/* Subtitle / Hook */}
          <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-200 italic border-l-4 border-indigo-500 pl-3">
            {article.subtitle}
          </p>

          {/* Formatted Text */}
          <div className="space-y-4 whitespace-pre-line prose dark:prose-invert max-w-none">
            {article.content}
          </div>

          {/* Pediatric reference note */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            ℹ️ <strong>Parâmetros de referência de rotina:</strong> Conteúdo informativo para apoio parental. O desenvolvimento de cada bebê é único. Consulte sempre o médico pediatra.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between">
          <button
            onClick={onToggleBookmark}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all ${
              isBookmarked
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            {isBookmarked ? 'Artigo Salvo nos Favoritos' : 'Salvar para Ler Depois'}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors shadow-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
