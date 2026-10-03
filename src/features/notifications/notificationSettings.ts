import { NotificationSettings } from '@/types';

const STORAGE_KEY = 'babysleep_notification_settings';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  userId: '',
  babyId: '',
  napRemindersEnabled: true,
  bedtimeRemindersEnabled: true,
  routineRemindersEnabled: true,
  leadTimeMinutes: 15,
  quietHoursStart: '22:00',
  quietHoursEnd: '06:30',
};

export class NotificationSettingsService {
  public static getSettings(userId: string, babyId: string): NotificationSettings {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(`${STORAGE_KEY}_${babyId}`);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
    }
    return {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      userId,
      babyId,
    };
  }

  public static saveSettings(settings: NotificationSettings): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        `${STORAGE_KEY}_${settings.babyId}`, 
        JSON.stringify(settings)
      );
    }
  }
}
