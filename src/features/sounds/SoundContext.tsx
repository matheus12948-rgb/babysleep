import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { SoundEngine, SoundTrackId, SoundTrackInfo, SOUND_LIBRARY } from './SoundEngine';

interface SoundContextType {
  activeTrack: SoundTrackInfo | null;
  isPlaying: boolean;
  volume: number;
  timerMinutes: number | null; // null = contínuo
  remainingSeconds: number | null;
  fadeOutMinutes: number;
  isFadingOut: boolean;
  playSound: (trackId: SoundTrackId) => void;
  pauseSound: () => void;
  stopSound: () => void;
  setVolume: (vol: number) => void;
  setTimer: (minutes: number | null) => void;
  setFadeOutMinutes: (minutes: number) => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

const STORAGE_KEYS = {
  VOLUME: 'babysleep_sound_volume',
  FADE_OUT: 'babysleep_sound_fadeout',
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTrack, setActiveTrack] = useState<SoundTrackInfo | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  const [volume, setVolumeState] = useState<number>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.VOLUME) : null;
    return saved ? parseFloat(saved) : 0.6;
  });

  const [timerMinutes, setTimerMinutes] = useState<number | null>(30); // 30 min padrão
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(30 * 60);
  
  const [fadeOutMinutes, setFadeOutMinutesState] = useState<number>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.FADE_OUT) : null;
    return saved ? parseInt(saved, 10) : 2;
  });

  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);

  const engine = SoundEngine.getInstance();

  // Volume
  const setVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    engine.setVolume(clamped);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.VOLUME, String(clamped));
    }
  };

  // Fade-out configurável
  const setFadeOutMinutes = (mins: number) => {
    const clamped = Math.max(1, Math.min(10, mins));
    setFadeOutMinutesState(clamped);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.FADE_OUT, String(clamped));
    }
  };

  // Temporizador
  const setTimer = (mins: number | null) => {
    setTimerMinutes(mins);
    if (mins === null) {
      setRemainingSeconds(null);
    } else {
      setRemainingSeconds(mins * 60);
    }
    setIsFadingOut(false);
  };

  // Tocar Som
  const playSound = (trackId: SoundTrackId) => {
    const track = SOUND_LIBRARY.find(t => t.id === trackId) || null;
    if (!track) return;

    setActiveTrack(track);
    setIsPlaying(true);
    setIsFadingOut(false);
    
    // Reseta temporizador se estiver esgotado
    if (timerMinutes !== null && (!remainingSeconds || remainingSeconds <= 0)) {
      setRemainingSeconds(timerMinutes * 60);
    }

    engine.play(trackId, volume);
    engine.updateMediaSession(track, true);
  };

  // Pausar
  const pauseSound = () => {
    engine.stop();
    setIsPlaying(false);
    engine.updateMediaSession(activeTrack, false);
  };

  // Parar
  const stopSound = () => {
    engine.stop();
    setIsPlaying(false);
    setActiveTrack(null);
    setIsFadingOut(false);
    engine.clearMediaSession();
    if (timerMinutes !== null) {
      setRemainingSeconds(timerMinutes * 60);
    }
  };

  // Configura os handlers da MediaSession para responder a botões físicos e tela de bloqueio
  useEffect(() => {
    engine.setupMediaSessionHandlers({
      onPlay: () => {
        if (activeTrack) {
          playSound(activeTrack.id);
        }
      },
      onPause: () => {
        pauseSound();
      },
      onStop: () => {
        stopSound();
      },
    });
  }, [activeTrack, volume]);

  // Efeito do Contador e Fade-out Programável
  useEffect(() => {
    if (isPlaying && timerMinutes !== null && remainingSeconds !== null) {
      intervalRef.current = window.setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            // Fim do timer
            stopSound();
            return 0;
          }

          const nextSec = prev - 1;

          // Inicia rampa suave de Fade-Out nos últimos N minutos
          const fadeSecs = fadeOutMinutes * 60;
          if (nextSec === fadeSecs && !isFadingOut) {
            setIsFadingOut(true);
            engine.applyGradualFadeOut(fadeSecs);
          }

          return nextSec;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, timerMinutes, remainingSeconds, fadeOutMinutes, isFadingOut]);

  return (
    <SoundContext.Provider
      value={{
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
        setFadeOutMinutes,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export function useSound(): SoundContextType {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return ctx;
}
