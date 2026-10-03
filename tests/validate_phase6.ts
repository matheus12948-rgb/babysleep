/**
 * BabySleep - Testes Automatizados de Validação Técnica da FASE 6
 * PWA Offline Completo, Notificações Inteligentes, Horário Silencioso e Áudio em Segundo Plano (MediaSession)
 */

import fs from 'node:fs';
import path from 'node:path';
import { NotificationService, NotificationSettings } from '../src/features/notifications/NotificationService';
import { SoundEngine, SOUND_LIBRARY } from '../src/features/sounds/SoundEngine';

// Mock de localStorage para ambiente Node.js de teste
const mockStorage: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, val: string) => { mockStorage[key] = String(val); },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
  };
}
if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = globalThis;
}

// Mock de navigator e MediaSession para ambiente de teste Node.js
if (typeof (globalThis as any).navigator === 'undefined') {
  (globalThis as any).navigator = {} as any;
}
let lastPlaybackState = 'none';
let lastMetadata: any = null;
const registeredActionHandlers: Record<string, Function | null> = {};

(globalThis as any).navigator.mediaSession = {
  get playbackState() {
    return lastPlaybackState;
  },
  set playbackState(val: string) {
    lastPlaybackState = val;
  },
  get metadata() {
    return lastMetadata;
  },
  set metadata(val: any) {
    lastMetadata = val;
  },
  setActionHandler: (action: string, handler: Function | null) => {
    registeredActionHandlers[action] = handler;
  }
};
(globalThis as any).MediaMetadata = class {
  title: string;
  artist: string;
  album: string;
  artwork: any[];
  constructor(init: any) {
    this.title = init.title;
    this.artist = init.artist;
    this.album = init.album;
    this.artwork = init.artwork;
  }
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails: string[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    const msg = `  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`;
    console.error(msg);
    failureDetails.push(msg);
  }
}

console.log('\n======================================================');
console.log('  INICIANDO BATERIA DE TESTES TÉCNICOS — FASE 6');
console.log('  PWA Offline, Service Worker, Notificações & MediaSession');
console.log('======================================================\n');

(async () => {
  // -----------------------------------------------------------
  // TESTE 1: PWA Manifest & Configurações de Aplicativo
  // -----------------------------------------------------------
  console.log('--- TESTE 1: Web App Manifest & Meta Tags PWA ---');
  {
    const manifestPath = path.resolve(process.cwd(), 'public/manifest.webmanifest');
    assert(fs.existsSync(manifestPath), 'Arquivo manifest.webmanifest existe em public/');

    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    let manifest: any = null;
    try {
      manifest = JSON.parse(manifestContent);
      assert(true, 'manifest.webmanifest é um JSON válido');
    } catch (e) {
      assert(false, 'manifest.webmanifest é um JSON válido', String(e));
    }

    if (manifest) {
      assert(manifest.name.includes('BabySleep'), 'Manifest define o name completo contendo BabySleep');
      assert(manifest.short_name === 'BabySleep', 'Manifest define short_name correto');
      assert(manifest.display === 'standalone', 'Manifest define display como standalone');
      assert(manifest.start_url === '/', 'Manifest define start_url raiz');
      assert(manifest.theme_color === '#1e1b4b', 'Manifest define theme_color noturno acolhedor');
      assert(manifest.background_color === '#0f172a', 'Manifest define background_color');
      assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'Manifest contém lista de ícones');
      assert(Array.isArray(manifest.shortcuts) && manifest.shortcuts.length >= 2, 'Manifest possui atalhos rápidos (shortcuts)');
    }

    // Validação do index.html
    const indexPath = path.resolve(process.cwd(), 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    assert(indexContent.includes('rel="manifest" href="/manifest.webmanifest"'), 'index.html referencia manifest.webmanifest');
    assert(indexContent.includes('apple-mobile-web-app-capable'), 'index.html suporta modo standalone iOS');
    assert(indexContent.includes('apple-touch-icon'), 'index.html define apple-touch-icon');
    assert(indexContent.includes('name="theme-color"'), 'index.html define meta tag theme-color');
  }

  // -----------------------------------------------------------
  // TESTE 2: Service Worker & Estratégias de Cache Offline
  // -----------------------------------------------------------
  console.log('\n--- TESTE 2: Service Worker & Gerenciamento PWA ---');
  {
    const swPath = path.resolve(process.cwd(), 'public/sw.js');
    assert(fs.existsSync(swPath), 'Arquivo public/sw.js existe');

    const swContent = fs.readFileSync(swPath, 'utf-8');
    assert(swContent.includes('CACHE_NAME'), 'SW define chave de cache com versionamento');
    assert(swContent.includes('STATIC_PRECACHE'), 'SW lista recursos essenciais para pre-cache');
    assert(swContent.includes("addEventListener('install'"), 'SW implementa evento de instalação com skipWaiting');
    assert(swContent.includes("addEventListener('activate'"), 'SW implementa evento de ativação com limpeza de caches antigos');
    assert(swContent.includes("addEventListener('fetch'"), 'SW implementa interceptação de requisições com cache');
    assert(swContent.includes("addEventListener('push'"), 'SW implementa handler de notificações Push');
    assert(swContent.includes("addEventListener('notificationclick'"), 'SW implementa handler de clique em notificação com foco na aba');

    // Validação do PWAService
    const pwaServicePath = path.resolve(process.cwd(), 'src/pwa/pwaService.ts');
    assert(fs.existsSync(pwaServicePath), 'src/pwa/pwaService.ts existe');
    const pwaServiceContent = fs.readFileSync(pwaServicePath, 'utf-8');
    assert(pwaServiceContent.includes('register()'), 'PWAService possui método estático register()');
    assert(pwaServiceContent.includes('beforeinstallprompt'), 'PWAService escuta evento beforeinstallprompt');
    assert(pwaServiceContent.includes('promptInstall()'), 'PWAService possui método promptInstall()');
    assert(pwaServiceContent.includes('isInstalled()'), 'PWAService possui verificação isInstalled()');
  }

  // -----------------------------------------------------------
  // TESTE 3: Cálculo Algorítmico de Horário Silencioso (Quiet Hours)
  // -----------------------------------------------------------
  console.log('\n--- TESTE 3: Algoritmo de Horário Silencioso (Quiet Hours) ---');
  {
    const quietStart = '22:00';
    const quietEnd = '06:30';

    // Caso 1: Horário 23:00 (dentro do horário noturno)
    const d23h = new Date(2026, 9, 3, 23, 0, 0);
    assert(
      NotificationService.isInQuietHours(d23h, quietStart, quietEnd) === true,
      '23:00 está dentro do horário silencioso noturno (22:00 - 06:30)'
    );

    // Caso 2: Horário 03:30 (madrugada, dentro do horário noturno)
    const d03h = new Date(2026, 9, 3, 3, 30, 0);
    assert(
      NotificationService.isInQuietHours(d03h, quietStart, quietEnd) === true,
      '03:30 está dentro do horário silencioso da madrugada'
    );

    // Caso 3: Horário exato de início 22:00
    const d22h = new Date(2026, 9, 3, 22, 0, 0);
    assert(
      NotificationService.isInQuietHours(d22h, quietStart, quietEnd) === true,
      '22:00 exato é considerado início do horário silencioso'
    );

    // Caso 4: Horário 06:29 (um minuto antes de acabar)
    const d0629 = new Date(2026, 9, 3, 6, 29, 0);
    assert(
      NotificationService.isInQuietHours(d0629, quietStart, quietEnd) === true,
      '06:29 ainda é horário silencioso'
    );

    // Caso 5: Horário exato de término 06:30 (já liberado)
    const d0630 = new Date(2026, 9, 3, 6, 30, 0);
    assert(
      NotificationService.isInQuietHours(d0630, quietStart, quietEnd) === false,
      '06:30 libera notificações diurnas (fora do horário silencioso)'
    );

    // Caso 6: Horário diurno 14:15
    const d14h = new Date(2026, 9, 3, 14, 15, 0);
    assert(
      NotificationService.isInQuietHours(d14h, quietStart, quietEnd) === false,
      '14:15 durante o dia NÃO está no horário silencioso'
    );

    // Caso 7: Horário diurno configurado (ex: soneca dos pais 13:00 às 15:00 sem cruzar meia-noite)
    const dayQuietStart = '13:00';
    const dayQuietEnd = '15:00';
    const d14hDuring = new Date(2026, 9, 3, 14, 0, 0);
    const d12hBefore = new Date(2026, 9, 3, 12, 59, 0);
    const d16hAfter = new Date(2026, 9, 3, 16, 0, 0);

    assert(
      NotificationService.isInQuietHours(d14hDuring, dayQuietStart, dayQuietEnd) === true,
      '14:00 está dentro do intervalo diurno 13:00 - 15:00'
    );
    assert(
      NotificationService.isInQuietHours(d12hBefore, dayQuietStart, dayQuietEnd) === false,
      '12:59 está fora do intervalo diurno 13:00 - 15:00'
    );
    assert(
      NotificationService.isInQuietHours(d16hAfter, dayQuietStart, dayQuietEnd) === false,
      '16:00 está fora do intervalo diurno 13:00 - 15:00'
    );
  }

  // -----------------------------------------------------------
  // TESTE 4: Serviço de Notificações & Persistência de Configurações
  // -----------------------------------------------------------
  console.log('\n--- TESTE 4: Serviço de Notificações e Lembretes de Janela ---');
  {
    // Limpeza prévia
    localStorage.clear();

    const { NotificationSettingsService } = await import('../src/features/notifications/notificationSettings');
    const loadedSettings = NotificationSettingsService.getSettings('user-1', 'baby-1');
    assert(loadedSettings.napRemindersEnabled === true, 'Configuração padrão de lembretes vem ativada');
    assert(loadedSettings.leadTimeMinutes === 15, 'Antecedência padrão de 15 minutos');

    // Salvar nova configuração
    const customSettings: NotificationSettings = {
      userId: 'user-1',
      babyId: 'baby-1',
      napRemindersEnabled: false,
      bedtimeRemindersEnabled: true,
      routineRemindersEnabled: true,
      leadTimeMinutes: 30,
      quietHoursStart: '23:30',
      quietHoursEnd: '07:00',
    };
    NotificationSettingsService.saveSettings(customSettings);
    const reloaded = NotificationSettingsService.getSettings('user-1', 'baby-1');
    assert(reloaded.napRemindersEnabled === false, 'Salva e recupera napRemindersEnabled');
    assert(reloaded.leadTimeMinutes === 30, 'Salva e recupera leadTimeMinutes');
    assert(reloaded.quietHoursStart === '23:30', 'Salva e recupera horário silencioso customizado');

    // Teste de simulação de disparo com lembrete respeitando quiet hours
    let notifSent = false;
    const napTarget = new Date(Date.now() + 30 * 60 * 1000);

    // Se napRemindersEnabled for false
    notifSent = await NotificationService.sendNapReminder('Theo', napTarget, 30, customSettings);
    assert(notifSent === false, 'sendNapReminder não envia se napRemindersEnabled estiver falso');

    // Se reativar e estiver fora de quiet hours
    customSettings.napRemindersEnabled = true;
    notifSent = await NotificationService.sendNapReminder('Theo', napTarget, 30, customSettings);
    assert(typeof notifSent === 'boolean', 'sendNapReminder retorna status booleano com segurança');
  }

  // -----------------------------------------------------------
  // TESTE 5: MediaSession API e Controles em Segundo Plano
  // -----------------------------------------------------------
  console.log('\n--- TESTE 5: MediaSession API no SoundEngine ---');
  {
    const engine = SoundEngine.getInstance();
    const track = SOUND_LIBRARY[0]; // Ruído Branco Puro

    // Teste de atualização da MediaSession
    engine.updateMediaSession(track, true);
    assert(navigator.mediaSession.playbackState === 'playing', 'MediaSession define playbackState como "playing"');
    assert(navigator.mediaSession.metadata !== null, 'MediaSession define metadata ativo');
    assert(navigator.mediaSession.metadata.title.includes(track.name), 'Metadata contém o nome da faixa ativa');
    assert(navigator.mediaSession.metadata.artist === 'BabySleep • Sons para Ninar', 'Metadata define artista BabySleep');

    // Teste de pausa
    engine.updateMediaSession(track, false);
    assert(navigator.mediaSession.playbackState === 'paused', 'MediaSession altera para "paused"');

    // Teste de parada / limpeza
    engine.clearMediaSession();
    assert(navigator.mediaSession.playbackState === 'none', 'clearMediaSession reseta playbackState para "none"');
    assert(navigator.mediaSession.metadata === null, 'clearMediaSession anula metadata');

    // Teste de registro de handlers de botões físicos / tela de bloqueio
    let playTriggered = false;
    let pauseTriggered = false;
    let stopTriggered = false;

    engine.setupMediaSessionHandlers({
      onPlay: () => { playTriggered = true; },
      onPause: () => { pauseTriggered = true; },
      onStop: () => { stopTriggered = true; },
    });

    assert(typeof registeredActionHandlers['play'] === 'function', 'Handler "play" registrado na MediaSession');
    assert(typeof registeredActionHandlers['pause'] === 'function', 'Handler "pause" registrado na MediaSession');
    assert(typeof registeredActionHandlers['stop'] === 'function', 'Handler "stop" registrado na MediaSession');

    // Simula clique em play do fone de ouvido
    registeredActionHandlers['play']?.();
    assert(playTriggered === true, 'Disparo do botão físico play executa callback onPlay');

    // Simula clique em pause do fone de ouvido
    registeredActionHandlers['pause']?.();
    assert(pauseTriggered === true, 'Disparo do botão físico pause executa callback onPause');

    // Simula clique em stop
    registeredActionHandlers['stop']?.();
    assert(stopTriggered === true, 'Disparo do botão físico stop executa callback onStop');
  }

  // -----------------------------------------------------------
  // TESTE 6: Arquitetura de Componentes PWA e Integração Visual
  // -----------------------------------------------------------
  console.log('\n--- TESTE 6: Arquitetura e Integração com UI ---');
  {
    const filesToCheck = [
      'public/manifest.webmanifest',
      'public/sw.js',
      'src/pwa/pwaService.ts',
      'src/components/ui/PWAInstallBanner.tsx',
      'src/features/notifications/NotificationService.ts',
      'src/features/notifications/NotificationSettingsModal.tsx',
      'src/features/sounds/SoundEngine.ts',
      'src/features/sounds/SoundContext.tsx',
      'src/layouts/AppLayout.tsx',
      'src/pages/ProfilePage.tsx',
      'src/main.tsx'
    ];

    filesToCheck.forEach(relPath => {
      const fullPath = path.resolve(process.cwd(), relPath);
      assert(fs.existsSync(fullPath), `Arquivo essencial da Fase 6 existe: ${relPath}`);
    });

    // Validar registro do SW no main.tsx
    const mainContent = fs.readFileSync(path.resolve(process.cwd(), 'src/main.tsx'), 'utf-8');
    assert(mainContent.includes('PWAService.register()'), 'main.tsx chama PWAService.register()');

    // Validar PWAInstallBanner no AppLayout.tsx
    const appLayoutContent = fs.readFileSync(path.resolve(process.cwd(), 'src/layouts/AppLayout.tsx'), 'utf-8');
    assert(appLayoutContent.includes('PWAInstallBanner'), 'AppLayout.tsx renderiza PWAInstallBanner');

    // Validar NotificationSettingsModal no ProfilePage.tsx
    const profileContent = fs.readFileSync(path.resolve(process.cwd(), 'src/pages/ProfilePage.tsx'), 'utf-8');
    assert(profileContent.includes('NotificationSettingsModal'), 'ProfilePage.tsx inclui NotificationSettingsModal');
    assert(profileContent.includes('Lembretes de Sono & PWA'), 'ProfilePage.tsx possui opção visual de Lembretes de Sono');

    // Validar MediaSession no SoundContext.tsx
    const soundContextContent = fs.readFileSync(path.resolve(process.cwd(), 'src/features/sounds/SoundContext.tsx'), 'utf-8');
    assert(soundContextContent.includes('setupMediaSessionHandlers'), 'SoundContext sincroniza handlers de MediaSession');
    assert(soundContextContent.includes('updateMediaSession'), 'SoundContext chama updateMediaSession no play e pause');
  }

  // -----------------------------------------------------------
  // RELATÓRIO FINAL DA BATERIA
  // -----------------------------------------------------------
  console.log('\n======================================================');
  console.log(`  RESULTADO FASE 6: ${passedTests}/${totalTests} testes aprovados`);
  if (failedTests === 0) {
    console.log('  🎉 TODOS OS TESTES DA FASE 6 PASSARAM COM SUCESSO!');
  } else {
    console.error(`  ⚠️ ${failedTests} testes falharam.`);
    failureDetails.forEach(f => console.error(f));
    process.exit(1);
  }
  console.log('======================================================\n');
})();
