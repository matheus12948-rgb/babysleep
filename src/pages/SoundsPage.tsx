import React, { useState } from 'react';
import { 
  Volume2, 
  Play, 
  Pause, 
  Clock, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Search, 
  Bookmark, 
  Sliders, 
  GraduationCap, 
  Music, 
  ChevronRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { useSound } from '@/features/sounds/SoundContext';
import { SOUND_LIBRARY, SoundTrackInfo } from '@/features/sounds/SoundEngine';
import { useEducation } from '@/features/education/useEducation';
import { Course } from '@/features/education/types';
import { LessonReaderModal } from '@/features/education/LessonReaderModal';
import { ArticleReaderModal } from '@/features/education/ArticleReaderModal';

export const SoundsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sounds' | 'education'>('sounds');

  // Sound Engine Context
  const { 
    activeTrack, 
    isPlaying, 
    volume, 
    timerMinutes, 
    remainingSeconds, 
    fadeOutMinutes, 
    isFadingOut,
    playSound, 
    pauseSound, 
    stopSound, 
    setVolume, 
    setTimer, 
    setFadeOutMinutes 
  } = useSound();

  // Education Module Hook
  const {
    courses,
    articles,
    allTags,
    isLoading: isEduLoading,
    isCompleted,
    isBookmarked,
    toggleCompleted,
    toggleBookmark,
    getCourseProgress,
    selectedCourse,
    setSelectedCourse,
    activeLesson,
    setActiveLessonId,
    activeArticle,
    setActiveArticleId,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
  } = useEducation();

  const [soundCategoryFilter, setSoundCategoryFilter] = useState<string>('all');
  const [showFadeSettings, setShowFadeSettings] = useState<boolean>(false);

  // Categorias de Sons
  const soundCategories = [
    { id: 'all', label: 'Todos os Sons' },
    { id: 'NOISE', label: 'Ruídos Contínuos' },
    { id: 'NATURE', label: 'Natureza Serena' },
    { id: 'WOMB', label: 'Útero & Conforto' },
  ];

  const filteredSounds = SOUND_LIBRARY.filter(track => {
    if (soundCategoryFilter === 'all') return true;
    return track.category === soundCategoryFilter;
  });

  const formatTimerDisplay = (seconds: number | null) => {
    if (seconds === null) return 'Modo Contínuo ♾️';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header Principal com Abas Modernas */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              Sons & Conhecimento
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ambiente acústico aconchegante e guia prático para o sono do bebê
            </p>
          </div>
        </div>

        {/* Segmented Controls / Abas */}
        <div className="grid grid-cols-2 p-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl">
          <button
            onClick={() => setActiveTab('sounds')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs transition-all ${
              activeTab === 'sounds'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Sons para Dormir</span>
          </button>

          <button
            onClick={() => setActiveTab('education')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs transition-all ${
              activeTab === 'education'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Guia Educativo & Aulas</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ABA 1: SONS PARA DORMIR                                   */}
      {/* ======================================================== */}
      {activeTab === 'sounds' && (
        <div className="space-y-6">
          {/* Card do Som Ativo em Destaque */}
          {activeTrack ? (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-xl border border-indigo-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-3xl shadow-inner border border-white/10 shrink-0">
                    {activeTrack.icon}
                  </div>
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                        Reproduzindo agora
                      </span>
                      {isPlaying && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mt-0.5">
                      {activeTrack.name}
                    </h3>
                    <p className="text-xs text-slate-300 max-w-sm mt-1">
                      {activeTrack.description}
                    </p>
                  </div>
                </div>

                {/* Botões de Ação Imediata */}
                <div className="flex items-center gap-3">
                  {isPlaying ? (
                    <button
                      onClick={pauseSound}
                      className="px-5 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs flex items-center gap-2 transition backdrop-blur-sm"
                    >
                      <Pause className="w-4 h-4 fill-current" /> Pausar
                    </button>
                  ) : (
                    <button
                      onClick={() => playSound(activeTrack.id)}
                      className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition shadow-lg shadow-indigo-600/30"
                    >
                      <Play className="w-4 h-4 fill-current" /> Continuar
                    </button>
                  )}

                  <button
                    onClick={stopSound}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition"
                    title="Parar reprodução"
                  >
                    Encerrar
                  </button>
                </div>
              </div>

              {/* Status do Temporizador e Fade-out */}
              <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span className="text-slate-300">Tempo restante:</span>
                  <span className="font-bold text-white">
                    {formatTimerDisplay(remainingSeconds)}
                  </span>
                </div>

                {isFadingOut ? (
                  <span className="text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 border border-amber-500/30">
                    <Sparkles className="w-3 h-3 animate-spin" /> Fade-out gradual em andamento
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px]">
                    Fade-out programado para os últimos {fadeOutMinutes} min
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Banner quando nenhum som está tocando */
            <div className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl shrink-0">
                🌙
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  Pronto para acalmar o ambiente
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Escolha uma faixa abaixo para iniciar a síntese contínua de som.
                </p>
              </div>
            </div>
          )}

          {/* Controles de Configuração: Volume, Timer e Fade-Out */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/60 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-500" /> Configuração do Player
              </h4>

              <button
                onClick={() => setShowFadeSettings(!showFadeSettings)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                {showFadeSettings ? 'Ocultar Fade-out' : 'Ajustar Fade-out'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Volume Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-slate-400" /> Volume Geral
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  aria-label="Controle de volume do som"
                />
              </div>

              {/* Seletor de Temporizador */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" /> Temporizador
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {timerMinutes === null ? 'Sem limite' : `${timerMinutes} minutos`}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[15, 30, 60, null].map((mins, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTimer(mins)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition ${
                        timerMinutes === mins
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {mins === null ? 'Contínuo' : `${mins}m`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Painel Expansível de Fade-out Gradual */}
            {showFadeSettings && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/50 space-y-2 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    🌙 Duração do Fade-Out Gradual
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {fadeOutMinutes} {fadeOutMinutes === 1 ? 'minuto' : 'minutos'} antes de desligar
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Diminui o volume de forma imperceptível nos últimos minutos para que o bebê não desperte com a mudança repentina de som.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 5].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setFadeOutMinutes(mins)}
                      className={`py-1 px-3 rounded-lg text-xs font-medium transition ${
                        fadeOutMinutes === mins
                          ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-400/40'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filtros de Categoria de Sons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {soundCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSoundCategoryFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  soundCategoryFilter === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grade com os 12 Sons Nativos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSounds.map((track: SoundTrackInfo) => {
              const isThisTrackPlaying = activeTrack?.id === track.id && isPlaying;
              const isThisTrackSelected = activeTrack?.id === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    if (isThisTrackPlaying) {
                      pauseSound();
                    } else {
                      playSound(track.id);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isThisTrackSelected
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-800/90 border-slate-200/70 dark:border-slate-700/60 hover:border-indigo-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700/80 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shrink-0">
                        {track.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-tight">
                          {track.name}
                        </h4>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                          {track.categoryLabel}
                        </span>
                      </div>
                    </div>

                    <button
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition shrink-0 ${
                        isThisTrackPlaying
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600'
                      }`}
                      aria-label={isThisTrackPlaying ? 'Pausar' : 'Tocar'}
                    >
                      {isThisTrackPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2">
                    {track.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Dica de Segurança e Volume Acústico Pediátrico */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Recomendação de Conforto e Segurança Sonora:</p>
              <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                Posicione o dispositivo a pelo menos 1 a 2 metros de distância do berço do bebê e mantenha o volume em nível moderado (aproximadamente 50 dB, equivalente a uma conversa baixa ou chuveiro calmo).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ABA 2: GUIA EDUCATIVO & CURSOS                            */}
      {/* ======================================================== */}
      {activeTab === 'education' && (
        <div className="space-y-6">
          {/* Card Resumo de Progresso */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-100 uppercase tracking-wider">
                <BookOpen className="w-4 h-4" /> Academia BabySleep
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                Conhecimento para noites tranquilas
              </h3>
              <p className="text-xs text-indigo-100/90 mt-0.5 max-w-md">
                Aulas rápidas e artigos fundamentados em neurociência do desenvolvimento e acolhimento familiar.
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-center">
              <span className="text-2xl font-black">{courses.length}</span>
              <span className="text-[10px] uppercase font-semibold text-indigo-100">Cursos</span>
            </div>
          </div>

          {/* Seção 1: Cursos Estruturados por Faixa Etária */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-500" /> Cursos por Marcos de Idade
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {courses.map((course: Course) => {
                const progressPct = getCourseProgress(course);
                const completedLessons = course.lessons.filter(l => isCompleted('LESSON', l.id)).length;

                return (
                  <div
                    key={course.id}
                    onClick={() => {
                      setSelectedCourse(course);
                      // Abre a primeira lição ou primeira não concluída
                      const firstIncomplete = course.lessons.find(l => !isCompleted('LESSON', l.id));
                      setActiveLessonId(firstIncomplete ? firstIncomplete.id : course.lessons[0].id);
                    }}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500 transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                          {course.icon}
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                          {course.ageRange}
                        </span>
                      </div>

                      <h4 className="font-bold text-base text-slate-800 dark:text-white mt-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {course.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {course.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                        <span className="text-slate-500 dark:text-slate-400">
                          {completedLessons} de {course.lessons.length} aulas concluídas
                        </span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {progressPct}%
                        </span>
                      </div>

                      {/* Barra de Progresso */}
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seção 2: Biblioteca de Artigos Educativos */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" /> Artigos & Dicas Práticas
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Explicações claras para os desafios comuns da rotina familiar
                </p>
              </div>

              {/* Barra de Busca */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar artigo ou tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Tags Filtros */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                  selectedTag === null
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Todas as tags
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition flex items-center gap-1 ${
                    selectedTag === tag
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Tag className="w-2.5 h-2.5" /> #{tag}
                </button>
              ))}
            </div>

            {/* Lista de Artigos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {articles.map(article => {
                const bookmarked = isBookmarked('ARTICLE', article.id);

                return (
                  <div
                    key={article.id}
                    onClick={() => setActiveArticleId(article.id)}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-xl shrink-0">
                          {article.icon}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark('ARTICLE', article.id);
                          }}
                          className={`p-1.5 rounded-full transition ${
                            bookmarked
                              ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title="Salvar artigo"
                        >
                          <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <h4 className="font-bold text-sm text-slate-800 dark:text-white mt-2.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {article.summary}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {article.readTimeMinutes} min de leitura
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Ler artigo <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {articles.length === 0 && (
              <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                Nenhum artigo encontrado com os filtros atuais.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leitor Imersivo de Aula */}
      <LessonReaderModal
        lesson={activeLesson}
        course={selectedCourse}
        isOpen={!!activeLesson}
        isCompleted={activeLesson ? isCompleted('LESSON', activeLesson.id) : false}
        isBookmarked={activeLesson ? isBookmarked('LESSON', activeLesson.id) : false}
        onClose={() => setActiveLessonId(null)}
        onToggleCompleted={() => {
          if (activeLesson) {
            toggleCompleted('LESSON', activeLesson.id, activeLesson.courseId);
          }
        }}
        onToggleBookmark={() => {
          if (activeLesson) {
            toggleBookmark('LESSON', activeLesson.id, activeLesson.courseId);
          }
        }}
        onNavigateLesson={(lessonId) => setActiveLessonId(lessonId)}
      />

      {/* Leitor Imersivo de Artigo */}
      <ArticleReaderModal
        article={activeArticle}
        isOpen={!!activeArticle}
        isBookmarked={activeArticle ? isBookmarked('ARTICLE', activeArticle.id) : false}
        onClose={() => setActiveArticleId(null)}
        onToggleBookmark={() => {
          if (activeArticle) {
            toggleBookmark('ARTICLE', activeArticle.id);
          }
        }}
      />
    </div>
  );
};
export default SoundsPage;
