/**
 * BabySleep - Motor de Áudio Procedural para Sono Infantil (Web Audio API)
 * Síntese em tempo real autônoma (100% offline, zero dependência de arquivos externos).
 */

export type SoundTrackId = 
  | 'white-noise'
  | 'pink-noise'
  | 'brown-noise'
  | 'gentle-fan'
  | 'hairdryer'
  | 'gentle-rain'
  | 'ocean-waves'
  | 'serene-forest'
  | 'mountain-stream'
  | 'heartbeat'
  | 'womb-shush'
  | 'lullaby-synth';

export type SoundCategory = 'RUIDOS' | 'NATUREZA' | 'UTERO' | 'MELODIA';

export interface SoundTrackInfo {
  id: SoundTrackId;
  name: string;
  category: SoundCategory;
  categoryLabel: string;
  emoji: string;
  icon?: string;
  description: string;
  tags: string[];
}

export const SOUND_LIBRARY: SoundTrackInfo[] = [
  // 1. RUÍDOS
  {
    id: 'white-noise',
    name: 'Ruído Branco Puro',
    category: 'RUIDOS',
    categoryLabel: 'Ruídos Estáticos',
    emoji: '💨',
    description: 'Distribuição contínua de frequências para mascarar ruídos súbitos da casa.',
    tags: ['Constante', 'Isolamento', 'Recém-nascido'],
  },
  {
    id: 'pink-noise',
    name: 'Ruído Rosa Aveludado',
    category: 'RUIDOS',
    categoryLabel: 'Ruídos Estáticos',
    emoji: '🌸',
    description: 'Frequências graves equilibradas com atenuação de agudos para sono profundo.',
    tags: ['Suave', 'Relaxamento', 'Sono Contínuo'],
  },
  {
    id: 'brown-noise',
    name: 'Ruído Marrom Profundo',
    category: 'RUIDOS',
    categoryLabel: 'Ruídos Estáticos',
    emoji: '🪵',
    description: 'Som grave e denso, comparado a uma cachoeira distante ou trovão suave.',
    tags: ['Grave', 'Acolhedor', 'Anti-ansiedade'],
  },
  {
    id: 'gentle-fan',
    name: 'Ventilador Silencioso',
    category: 'RUIDOS',
    categoryLabel: 'Ruídos Mecânicos',
    emoji: '🌀',
    description: 'Zumbido mecânico relaxante com modulação sutil de rotação do ar.',
    tags: ['Rotina', 'Quarto', 'Ritmo Suave'],
  },
  {
    id: 'hairdryer',
    name: 'Secador Distante',
    category: 'RUIDOS',
    categoryLabel: 'Ruídos Mecânicos',
    emoji: '🔌',
    description: 'Simula o ruído contínuo e reconfortante de fluxo de ar aquecido no ambiente.',
    tags: ['Acalma Cólicas', 'Frequência Média'],
  },

  // 2. NATUREZA
  {
    id: 'gentle-rain',
    name: 'Chuva Mansa na Janela',
    category: 'NATUREZA',
    categoryLabel: 'Sons da Natureza',
    emoji: '🌧️',
    description: 'Gotículas aconchegantes e serenas caindo em cadência relaxante.',
    tags: ['Chuva', 'Clima Bom', 'Aconchegante'],
  },
  {
    id: 'ocean-waves',
    name: 'Ondas Suaves do Mar',
    category: 'NATUREZA',
    categoryLabel: 'Sons da Natureza',
    emoji: '🌊',
    description: 'Ritmo suave de enchente e vazante marítima com respiração natural.',
    tags: ['Ondas', 'Respiração', 'Brisa'],
  },
  {
    id: 'serene-forest',
    name: 'Brisa na Floresta',
    category: 'NATUREZA',
    categoryLabel: 'Sons da Natureza',
    emoji: '🍃',
    description: 'Vento delicado passando entre folhagens de árvores em um bosque sereno.',
    tags: ['Ar Livre', 'Tranquilidade', 'Suave'],
  },
  {
    id: 'mountain-stream',
    name: 'Riacho da Montanha',
    category: 'NATUREZA',
    categoryLabel: 'Sons da Natureza',
    emoji: '💧',
    description: 'Água corrente límpida fluindo continuamente sobre pedras lisas.',
    tags: ['Água Viva', 'Fresco', 'Contínuo'],
  },

  // 3. CONFORTO UTERINO
  {
    id: 'heartbeat',
    name: 'Batimentos do Coração',
    category: 'UTERO',
    categoryLabel: 'Ambiente Uterino',
    emoji: '❤️',
    description: 'Pulso rítmico em 65 BPM com som grave abafado, recriando a segurança do útero.',
    tags: ['0 a 3 meses', 'Apego', 'Segurança'],
  },
  {
    id: 'womb-shush',
    name: 'Shhh Suave de Ninar',
    category: 'UTERO',
    categoryLabel: 'Ambiente Uterino',
    emoji: '🤫',
    description: 'Envelope ritmado de ruído suave em padrão de ninar materno cadenciado.',
    tags: ['Ninar', 'Transição', 'Calmante'],
  },

  // 4. MELODIA
  {
    id: 'lullaby-synth',
    name: 'Caixa de Música Celestial',
    category: 'MELODIA',
    categoryLabel: 'Melodias Calmantes',
    emoji: '✨',
    description: 'Harmônicos puros e delicados em arpejos suaves para o ritual do sono.',
    tags: ['Canção de Ninar', 'Harmônico', 'Doce'],
  },
];

// Garante compatibilidade de icon e emoji
SOUND_LIBRARY.forEach(track => {
  if (!track.icon) {
    track.icon = track.emoji;
  }
});

export class SoundEngine {
  private static instance: SoundEngine | null = null;
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private currentTrackId: SoundTrackId | null = null;
  private targetVolume: number = 0.5;

  private constructor() {}

  public static getInstance(): SoundEngine {
    if (!SoundEngine.instance) {
      SoundEngine.instance = new SoundEngine();
    }
    return SoundEngine.instance;
  }

  private initContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public getCurrentTrack(): SoundTrackId | null {
    return this.currentTrackId;
  }

  public isPlaying(): boolean {
    return this.currentTrackId !== null;
  }

  public setVolume(volume: number, rampDurationSecs: number = 0.05): void {
    this.targetVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.audioCtx) {
      const currentTime = this.audioCtx.currentTime;
      this.masterGain.gain.cancelScheduledValues(currentTime);
      // Curva suave quadrática para audição humana
      const actualGain = this.targetVolume * this.targetVolume * 0.25;
      this.masterGain.gain.linearRampToValueAtTime(actualGain, currentTime + rampDurationSecs);
    }
  }

  public getVolume(): number {
    return this.targetVolume;
  }

  public applyGradualFadeOut(fadeDurationSecs: number): void {
    if (this.masterGain && this.audioCtx && this.currentTrackId) {
      const currentTime = this.audioCtx.currentTime;
      this.masterGain.gain.cancelScheduledValues(currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, currentTime);
      // Rampa linear suave de fade-out até silêncio absoluto
      this.masterGain.gain.linearRampToValueAtTime(0.0001, currentTime + fadeDurationSecs);
      setTimeout(() => {
        if (this.masterGain && this.masterGain.gain.value <= 0.001) {
          this.stop();
        }
      }, fadeDurationSecs * 1000);
    }
  }

  public stop(): void {
    // Para timers procedurais
    this.activeNodes.forEach(node => {
      if (typeof node === 'number') {
        window.clearInterval(node);
      } else {
        try {
          (node as any).stop?.();
          node.disconnect();
        } catch {}
      }
    });
    this.activeNodes = [];

    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {}
      this.masterGain = null;
    }

    this.currentTrackId = null;
    this.clearMediaSession();
  }

  /**
   * Configura metadados da MediaSession API para exibição na tela de bloqueio e central de controle
   */
  public updateMediaSession(track: SoundTrackInfo | null, isPlaying: boolean): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      if (track && isPlaying) {
        navigator.mediaSession.playbackState = 'playing';
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `${track.emoji} ${track.name}`,
          artist: 'BabySleep • Sons para Ninar',
          album: track.categoryLabel,
          artwork: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
          ]
        });
      } else if (track && !isPlaying) {
        navigator.mediaSession.playbackState = 'paused';
      } else {
        this.clearMediaSession();
      }
    } catch (e) {
      console.warn('Erro ao atualizar MediaSession:', e);
    }
  }

  /**
   * Limpa metadados e reseta estado da MediaSession
   */
  public clearMediaSession(): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = 'none';
      navigator.mediaSession.metadata = null;
    } catch {}
  }

  /**
   * Conecta os manipuladores de hardware (fone de ouvido, tela de bloqueio) aos comandos do app
   */
  public setupMediaSessionHandlers(callbacks: {
    onPlay?: () => void;
    onPause?: () => void;
    onStop?: () => void;
  }): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    const actionHandlers: [MediaSessionAction, MediaSessionActionHandler | null][] = [
      ['play', callbacks.onPlay ? () => callbacks.onPlay!() : null],
      ['pause', callbacks.onPause ? () => callbacks.onPause!() : null],
      ['stop', callbacks.onStop ? () => callbacks.onStop!() : null],
    ];

    actionHandlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {}
    });
  }

  public play(trackId: SoundTrackId, initialVolume: number = this.targetVolume): void {
    this.stop();
    const ctx = this.initContext();
    this.currentTrackId = trackId;
    this.targetVolume = initialVolume;

    // Master Gain
    const master = ctx.createGain();
    const initialGain = initialVolume * initialVolume * 0.25;
    master.gain.setValueAtTime(initialGain, ctx.currentTime);
    master.connect(ctx.destination);
    this.masterGain = master;

    switch (trackId) {
      case 'white-noise':
        this.synthesizeWhiteNoise(ctx, master);
        break;
      case 'pink-noise':
        this.synthesizePinkNoise(ctx, master);
        break;
      case 'brown-noise':
        this.synthesizeBrownNoise(ctx, master);
        break;
      case 'gentle-fan':
        this.synthesizeFan(ctx, master);
        break;
      case 'hairdryer':
        this.synthesizeHairdryer(ctx, master);
        break;
      case 'gentle-rain':
        this.synthesizeRain(ctx, master);
        break;
      case 'ocean-waves':
        this.synthesizeOcean(ctx, master);
        break;
      case 'serene-forest':
        this.synthesizeForest(ctx, master);
        break;
      case 'mountain-stream':
        this.synthesizeStream(ctx, master);
        break;
      case 'heartbeat':
        this.synthesizeHeartbeat(ctx, master);
        break;
      case 'womb-shush':
        this.synthesizeShush(ctx, master);
        break;
      case 'lullaby-synth':
        this.synthesizeLullaby(ctx, master);
        break;
    }
  }

  // ----------------------------------------------------
  // SINTETIZADORES PROCEDURAIS NATIVOS
  // ----------------------------------------------------

  private synthesizeWhiteNoise(ctx: AudioContext, destination: AudioNode): void {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);

    source.connect(filter);
    filter.connect(destination);
    source.start();
    this.activeNodes.push(source, filter);
  }

  private synthesizePinkNoise(ctx: AudioContext, destination: AudioNode): void {
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, ctx.currentTime);

    source.connect(filter);
    filter.connect(destination);
    source.start();
    this.activeNodes.push(source, filter);
  }

  private synthesizeBrownNoise(ctx: AudioContext, destination: AudioNode): void {
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.2; // Volume compensatório
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    source.connect(filter);
    filter.connect(destination);
    source.start();
    this.activeNodes.push(source, filter);
  }

  private synthesizeFan(ctx: AudioContext, destination: AudioNode): void {
    // Ruído filtrado com LFO lento simulando as pás do ventilador
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const w = Math.random() * 2 - 1;
      data[i] = (last + 0.04 * w) / 1.04;
      last = data[i];
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(220, ctx.currentTime);
    filter.Q.setValueAtTime(1.8, ctx.currentTime);

    // LFO de modulação
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(4.5, ctx.currentTime); // ~4.5 Hz rotação
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(40, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    source.connect(filter);
    filter.connect(destination);
    source.start();
    this.activeNodes.push(source, filter, lfo, lfoGain);
  }

  private synthesizeHairdryer(ctx: AudioContext, destination: AudioNode): void {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter1 = ctx.createBiquadFilter();
    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(480, ctx.currentTime);

    const filter2 = ctx.createBiquadFilter();
    filter2.type = 'peaking';
    filter2.frequency.setValueAtTime(140, ctx.currentTime);
    filter2.gain.setValueAtTime(6, ctx.currentTime);

    source.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(destination);
    source.start();
    this.activeNodes.push(source, filter1, filter2);
  }

  private synthesizeRain(ctx: AudioContext, destination: AudioNode): void {
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.15 ? 0.35 : 0.9);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, ctx.currentTime);
    filter.Q.setValueAtTime(0.7, ctx.currentTime);

    source.connect(filter);
    filter.connect(destination);
    source.start();
    this.activeNodes.push(source, filter);
  }

  private synthesizeOcean(ctx: AudioContext, destination: AudioNode): void {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const w = Math.random() * 2 - 1;
      data[i] = (last + 0.03 * w) / 1.03;
      last = data[i];
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.3, ctx.currentTime);

    // LFO simulando o ciclo de 12 segundos de uma onda marítima
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
    const lfoAmp = ctx.createGain();
    lfoAmp.gain.setValueAtTime(0.25, ctx.currentTime);
    lfo.connect(lfoAmp);
    lfoAmp.connect(waveGain.gain);
    lfo.start();

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(550, ctx.currentTime);

    source.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(destination);
    source.start();
    this.activeNodes.push(source, filter, waveGain, lfo, lfoAmp);
  }

  private synthesizeForest(ctx: AudioContext, destination: AudioNode): void {
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(1.2, ctx.currentTime);

    source.connect(filter);
    filter.connect(destination);
    source.start();
    this.activeNodes.push(source, filter);
  }

  private synthesizeStream(ctx: AudioContext, destination: AudioNode): void {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const w = Math.random() * 2 - 1;
      data[i] = (last + 0.08 * w) / 1.08;
      last = data[i];
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, ctx.currentTime);

    source.connect(filter);
    filter.connect(destination);
    source.start();
    this.activeNodes.push(source, filter);
  }

  private synthesizeHeartbeat(ctx: AudioContext, destination: AudioNode): void {
    // Pulso duplo ritmado (lub-dub) a cada ~0.92 segundos (~65 bpm)
    const intervalMs = 920;
    const playBeat = () => {
      if (!this.currentTrackId) return;
      const now = ctx.currentTime;
      
      // Primeiro batimento (lub)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.frequency.setValueAtTime(68, now);
      osc1.frequency.exponentialRampToValueAtTime(35, now + 0.12);
      gain1.gain.setValueAtTime(0.7, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc1.connect(gain1);
      gain1.connect(destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Segundo batimento (dub) 280ms depois
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.frequency.setValueAtTime(55, now + 0.28);
      osc2.frequency.exponentialRampToValueAtTime(30, now + 0.40);
      gain2.gain.setValueAtTime(0.5, now + 0.28);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc2.connect(gain2);
      gain2.connect(destination);
      osc2.start(now + 0.28);
      osc2.stop(now + 0.43);
    };

    playBeat();
    const intervalId = window.setInterval(playBeat, intervalMs);
    this.activeNodes.push(intervalId);
  }

  private synthesizeShush(ctx: AudioContext, destination: AudioNode): void {
    // Ruído rosa filtrado com envelope dinâmico suave de respiração (shhh... pausa... shhh...)
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const shushGain = ctx.createGain();
    shushGain.gain.setValueAtTime(0.05, ctx.currentTime);

    // Ciclo de 3 segundos
    const cycleMs = 3000;
    const triggerShush = () => {
      if (!this.currentTrackId) return;
      const now = ctx.currentTime;
      shushGain.gain.cancelScheduledValues(now);
      shushGain.gain.setValueAtTime(0.01, now);
      shushGain.gain.linearRampToValueAtTime(0.4, now + 0.6);
      shushGain.gain.linearRampToValueAtTime(0.01, now + 2.0);
    };

    triggerShush();
    const intervalId = window.setInterval(triggerShush, cycleMs);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(1.0, ctx.currentTime);

    source.connect(filter);
    filter.connect(shushGain);
    shushGain.connect(destination);
    source.start();
    this.activeNodes.push(source, filter, shushGain, intervalId);
  }

  private synthesizeLullaby(ctx: AudioContext, destination: AudioNode): void {
    // Arpejo pentatônico reconfortante (C4, E4, G4, A4, C5) tocando notas suaves com decaimento de sino
    const notes = [261.63, 329.63, 392.00, 440.00, 523.25, 440.00, 392.00, 329.63];
    let noteIndex = 0;

    const playNote = () => {
      if (!this.currentTrackId) return;
      const now = ctx.currentTime;
      const freq = notes[noteIndex % notes.length];
      noteIndex++;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(now);
      osc.stop(now + 1.7);
    };

    playNote();
    const intervalId = window.setInterval(playNote, 1400); // 1.4s por nota
    this.activeNodes.push(intervalId);
  }
}
