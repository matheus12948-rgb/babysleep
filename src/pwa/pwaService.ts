/**
 * BabySleep - Gerenciador do Ciclo de Vida PWA e Service Worker
 */

let deferredInstallPrompt: any = null;

export class PWAService {
  public static register(): void {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker BabySleep registrado com sucesso:', registration.scope);
          })
          .catch((err) => {
            console.warn('Falha no registro do Service Worker:', err);
          });
      });
    }
  }

  public static initInstallListener(onPromptAvailable: (canInstall: boolean) => void): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      // Previne exibição nativa automática para exibir nosso banner elegante
      e.preventDefault();
      deferredInstallPrompt = e;
      onPromptAvailable(true);
    });

    window.addEventListener('appinstalled', () => {
      deferredInstallPrompt = null;
      onPromptAvailable(false);
      console.log('BabySleep PWA instalado com sucesso na tela inicial!');
    });
  }

  public static async promptInstall(): Promise<boolean> {
    if (!deferredInstallPrompt) {
      return false;
    }

    try {
      deferredInstallPrompt.prompt();
      const choiceResult = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      return choiceResult.outcome === 'accepted';
    } catch (err) {
      console.warn('Erro ao acionar prompt PWA:', err);
      return false;
    }
  }

  public static isInstalled(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }

  public static isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  }
}
