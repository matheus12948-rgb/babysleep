import { NotificationSettings } from '@/types';

export class NotificationService {
  public static checkPermission(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  public static async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      console.warn('Erro ao solicitar permissão de notificação:', err);
      return false;
    }
  }

  /**
   * Avalia se um determinado horário está dentro da janela de Horário Silencioso (ex: 22:00 às 06:30)
   */
  public static isInQuietHours(
    date: Date, 
    quietStart: string = '22:00', 
    quietEnd: string = '06:30'
  ): boolean {
    const parseTimeToMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const currentMinutes = date.getHours() * 60 + date.getMinutes();
    const startMinutes = parseTimeToMinutes(quietStart);
    const endMinutes = parseTimeToMinutes(quietEnd);

    // Se o início for maior que o fim (atravessa a meia-noite, ex: 22:00 às 06:30)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    } else {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }
  }

  /**
   * Dispara uma notificação local via Service Worker ou Notification API nativa
   */
  public static async sendNotification(
    title: string, 
    options?: {
      body?: string;
      tag?: string;
      icon?: string;
      badge?: string;
      data?: any;
    }
  ): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission !== 'granted') {
      return false;
    }

    const defaultOptions = {
      body: options?.body || 'Aviso da rotina do seu bebê.',
      icon: options?.icon || '/favicon.svg',
      badge: options?.badge || '/favicon.svg',
      tag: options?.tag || 'babysleep-notification',
      vibrate: [100, 50, 100],
      data: options?.data || { url: '/' },
    };

    try {
      // 1. Tenta disparar via Service Worker Registration (funciona em background / tela desligada)
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && 'showNotification' in registration) {
          await registration.showNotification(title, defaultOptions);
          return true;
        }
      }

      // 2. Fallback para Notification nativa
      new Notification(title, defaultOptions);
      return true;
    } catch (err) {
      console.warn('Erro ao disparar notificação local:', err);
      return false;
    }
  }

  /**
   * Dispara lembrete inteligente de janela de sono do bebê respeitando horários de silêncio
   */
  public static async sendNapReminder(
    babyName: string,
    predictedSleepTime: Date,
    leadTimeMinutes: number,
    settings: NotificationSettings
  ): Promise<boolean> {
    if (!settings.napRemindersEnabled) return false;

    const now = new Date();

    // Bloqueia se estiver em horário de silêncio
    if (this.isInQuietHours(now, settings.quietHoursStart, settings.quietHoursEnd)) {
      return false;
    }

    const timeStr = predictedSleepTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return this.sendNotification(`Janela de Sono de ${babyName} 🌙`, {
      body: `A estimativa para a próxima soneca é às ${timeStr} (em aproximadamente ${leadTimeMinutes} min). Prepare o ambiente calmo!`,
      tag: `nap-reminder-${babyName}`,
    });
  }

  /**
   * Envia notificação de teste para confirmação do usuário
   */
  public static async sendTestNotification(): Promise<boolean> {
    return this.sendNotification('BabySleep Ativado! 🎉', {
      body: 'As notificações de janelas de sono e rotina estão prontas para apoiar você.',
      tag: 'test-notification',
    });
  }
}
