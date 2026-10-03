import React from 'react';
import { Lesson, Course } from './types';
import { X, CheckCircle, Bookmark, ArrowRight, ArrowLeft, Clock } from 'lucide-react';

interface LessonReaderModalProps {
  lesson: Lesson | null;
  course: Course | null;
  isOpen: boolean;
  isCompleted: boolean;
  isBookmarked: boolean;
  onClose: () => void;
  onToggleCompleted: () => void;
  onToggleBookmark: () => void;
  onNavigateLesson?: (lessonId: string) => void;
}

export const LessonReaderModal: React.FC<LessonReaderModalProps> = ({
  lesson,
  course,
  isOpen,
  isCompleted,
  isBookmarked,
  onClose,
  onToggleCompleted,
  onToggleBookmark,
  onNavigateLesson
}) => {
  if (!isOpen || !lesson) return null;

  const currentIdx = course ? course.lessons.findIndex(l => l.id === lesson.id) : -1;
  const prevLesson = (course && currentIdx > 0) ? course.lessons[currentIdx - 1] : null;
  const nextLesson = (course && currentIdx >= 0 && currentIdx < course.lessons.length - 1) 
    ? course.lessons[currentIdx + 1] 
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{course?.icon || '📚'}</span>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <span>{course?.title || 'Curso'}</span>
                <span>•</span>
                <span>Aula {lesson.order} de {course?.lessons.length || 1}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white leading-tight">
                {lesson.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleBookmark}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked 
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title={isBookmarked ? 'Remover dos salvos' : 'Salvar aula'}
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
          {/* Metadata pill */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-medium">
              <Clock className="w-3.5 h-3.5" /> {lesson.durationMinutes} min de leitura
            </span>
            <span className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full font-medium">
              {course?.ageRange}
            </span>
          </div>

          {/* Lesson Summary */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100/60 dark:border-indigo-900/40 text-indigo-950 dark:text-indigo-200 text-sm font-medium">
            💡 {lesson.summary}
          </div>

          {/* Formatted Text */}
          <div className="space-y-4 whitespace-pre-line prose dark:prose-invert max-w-none">
            {lesson.content}
          </div>

          {/* Key Takeaways */}
          {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
                <span>✨</span> Pontos-Chave para Lembrar
              </h4>
              <ul className="space-y-2">
                {lesson.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-emerald-950 dark:text-emerald-200">
                    <span className="text-emerald-500 font-bold shrink-0">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pediatric reference note */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            ℹ️ <strong>Parâmetros de referência e orientações educativas:</strong> Este conteúdo possui finalidade meramente informativa e de suporte à rotina parental. Nunca substitui o diagnóstico, conduta ou acompanhamento com o pediatra do seu bebê.
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onToggleCompleted}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
              isCompleted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
            }`}
          >
            <CheckCircle className={`w-4 h-4 ${isCompleted ? 'fill-current' : ''}`} />
            {isCompleted ? 'Aula Concluída ✅' : 'Marcar como Concluída'}
          </button>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
            {prevLesson && onNavigateLesson && (
              <button
                onClick={() => onNavigateLesson(prevLesson.id)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Anterior
              </button>
            )}

            {nextLesson && onNavigateLesson && (
              <button
                onClick={() => onNavigateLesson(nextLesson.id)}
                className="px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                Próxima Aula <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
