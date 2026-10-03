import React, { useState, useEffect } from 'react';
import { X, Bell, BellRing, Moon, Clock, Sparkles, Check, AlertCircle } from 'lucide-react';
import { NotificationSettings } from '@/types';
import { NotificationSettingsService } from './notificationSettings';
import { NotificationService } from './NotificationService';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  babyId?: string;
  babyName?: string;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  userId = 'default_user',
  babyId = 'default_baby',
  babyName = 'Bebê',
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    return NotificationSettingsService.getSettings(userId, babyId);
  });

  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(NotificationSettingsService.getSettings(userId, babyId));
      setPermission(NotificationService.checkPermission());
    }
  }, [isOpen, userId, babyId]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof NotificationSettings) => {
    const updated = {
      ...settings,
      [key]: !settings[key as keyof NotificationSettings],
    };
    setSettings(updated);
    NotificationSettingsService.saveSettings(updated);
  };

  const handleLeadTimeChange = (mins: number) => {
    const updated = { ...settings, leadTimeMinutes: mins };
    setSettings(updated);
    NotificationSettingsService.saveSettings(updated);
  };

  const handleQuietHoursChange = (start: string, end: string) => {
    const updated = { ...settings, quietHoursStart: start, quietHoursEnd: end };
    setSettings(updated);
    NotificationSettingsService.saveSettings(updated);
  };

  const handleRequestPermission = async () => {
    const granted = await NotificationService.requestPermission();
    setPermission(granted ? 'granted' : 'denied');
  };

  const handleSendTest = async () => {
    const success = await NotificationService.sendTestNotification();
    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-5 sm:p-6 flex flex-col my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                Lembretes & Notificações
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ajustes de alertas de janelas para {babyName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 pt-4 text-xs text-slate-700 dark:text-slate-200">
          {/* Status de Permissão */}
          {permission !== 'granted' && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-indigo-950 dark:text-indigo-200 leading-tight">
                  Para receber os alertas no celular ou computador, conceda permissão de notificação.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRequestPermission}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 transition"
              >
                Permitir
              </button>
            </div>
          )}

          {/* Toggles principais */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Lembretes de Soneca</span>
                <p className="text-[11px] text-slate-400">Avisa antes da estimativa da janela de vigília fechar</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('napRemindersEnabled')}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                  settings.napRemindersEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.napRemindersEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Sono Noturno</span>
                <p className="text-[11px] text-slate-400">Alerta para iniciar o ritual da noite no horário ideal</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('bedtimeRemindersEnabled')}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                  settings.bedtimeRemindersEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.bedtimeRemindersEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* Antecedência do Lembrete */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" /> Antecedência do Alerta
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {settings.leadTimeMinutes} min antes
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Tempo para preparar o quarto e diminuir o ritmo.</p>
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[10, 15, 20, 30].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleLeadTimeChange(mins)}
                  className={`py-1.5 rounded-xl font-semibold text-xs transition ${
                    settings.leadTimeMinutes === mins
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Horário Silencioso */}
          <div className="space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
            <div className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-bold text-slate-900 dark:text-white">Horário Silencioso</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Nenhuma notificação sonora será enviada durante esta janela para não acordar ninguém.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Início do Silêncio</label>
                <input
                  type="time"
                  value={settings.quietHoursStart}
                  onChange={(e) => handleQuietHoursChange(e.target.value, settings.quietHoursEnd)}
                  className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 font-bold text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Fim do Silêncio</label>
                <input
                  type="time"
                  value={settings.quietHoursEnd}
                  onChange={(e) => handleQuietHoursChange(settings.quietHoursStart, e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 font-bold text-xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* Botão de Teste */}
          <div className="pt-1 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleSendTest}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              {testSent ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <BellRing className="w-3.5 h-3.5 text-indigo-500" />}
              <span>{testSent ? 'Notificação enviada!' : 'Testar Notificação Agora'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition"
            >
              Salvar & Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
