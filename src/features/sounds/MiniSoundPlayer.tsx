import React from 'react';
import { useSound } from './SoundContext';
import { Play, Pause, Square, Volume2, Sparkles } from 'lucide-react';

interface MiniSoundPlayerProps {
  onOpenSoundsTab?: () => void;
  isSoundsTab?: boolean;
}

export const MiniSoundPlayer: React.FC<MiniSoundPlayerProps> = ({
  onOpenSoundsTab,
  isSoundsTab = false,
}) => {
  const { 
    activeTrack, 
    isPlaying, 
    pauseSound, 
    playSound, 
    stopSound, 
    remainingSeconds, 
    isFadingOut,
    volume,
    setVolume
  } = useSound();

  if (!activeTrack) return null;

  const formatTime = (secs: number | null) => {
    if (secs === null) return 'Contínuo';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div 
      className="fixed z-40 bottom-20 left-3 right-3 max-w-lg mx-auto bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md text-white rounded-2xl p-3 shadow-2xl border border-indigo-500/30 flex items-center justify-between gap-3 animate-slide-up"
      role="region"
      aria-label="Mini Player de Sons"
    >
      {/* Informações da Faixa (Clicável para ir até a aba de sons) */}
      <button 
        type="button"
        onClick={() => !isSoundsTab && onOpenSoundsTab && onOpenSoundsTab()}
        className={`flex items-center gap-3 text-left overflow-hidden flex-1 ${!isSoundsTab ? 'hover:opacity-90 cursor-pointer' : 'cursor-default'}`}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shrink-0 shadow-inner">
          {activeTrack.icon}
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-1.5">
            <h4 className="font-semibold text-xs sm:text-sm text-white truncate">
              {activeTrack.name}
            </h4>
            {isPlaying && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            {isFadingOut ? (
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-pulse" /> Fade-out suave...
              </span>
            ) : (
              <span>⏱️ {formatTime(remainingSeconds)}</span>
            )}
            <span>•</span>
            <span className="text-indigo-300">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      </button>

      {/* Controle de Volume rápido (Desktop/Tablet) */}
      <div className="hidden sm:flex items-center gap-1.5 w-24">
        <Volume2 className="w-3.5 h-3.5 text-slate-400" />
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
          aria-label="Volume do Mini Player"
        />
      </div>

      {/* Controles de Play/Pause e Parar */}
      <div className="flex items-center gap-1 shrink-0">
        {isPlaying ? (
          <button
            onClick={pauseSound}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Pausar Som"
            aria-label="Pausar Som"
          >
            <Pause className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button
            onClick={() => playSound(activeTrack.id)}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm"
            title="Continuar Som"
            aria-label="Continuar Som"
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
        )}

        <button
          onClick={stopSound}
          className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
          title="Encerrar Som"
          aria-label="Encerrar Som"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
