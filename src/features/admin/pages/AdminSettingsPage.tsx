import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  Sliders, 
  Bell, 
  CreditCard, 
  Save, 
  Check, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { AdminDataService } from '@/services/adminDataService';
import { useAuth } from '@/features/auth/AuthContext';

export const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Record<string, any>>({
    app_info: { name: 'BabySleep', version: '1.8.0', maintenance_mode: false },
    prediction_engine: { weight_history: 0.4, weight_last_nap: 0.35, weight_night_sleep: 0.25, tolerance_minutes: 15 },
    notification_defaults: { global_reminders: true, default_lead_time: 15 },
    subscription_sandbox: { sandbox_mode: true, stripe_test_active: true }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await AdminDataService.getSystemSettings();
      setSettings(data);
    } catch (err) {
      console.warn('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (sectionKey: string) => {
    if (!user) return;
    setSavingKey(sectionKey);
    try {
      await AdminDataService.updateSystemSetting(user.id, sectionKey, settings[sectionKey]);
      showToast('Configurações atualizadas e registradas na auditoria.');
    } catch (err) {
      showToast('Erro ao salvar configurações.');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast flutuante */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl">
          {toastMsg}
        </div>
      )}

      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Configurações Globais do Sistema
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ajuste fino de parâmetros de aplicação, algoritmo de sono, avisos PWA e sandbox.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Configurações da Aplicação */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Settings size={18} className="text-indigo-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Aplicação & Status
              </h2>
            </div>
            <button
              onClick={() => handleSaveSection('app_info')}
              disabled={savingKey === 'app_info'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              <Save size={14} />
              <span>{savingKey === 'app_info' ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Nome do Aplicativo</label>
              <input
                type="text"
                value={settings.app_info?.name || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  app_info: { ...settings.app_info, name: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Versão do Produto</label>
              <input
                type="text"
                value={settings.app_info?.version || ''}
                disabled
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Modo Manutenção</span>
                <span className="text-[11px] text-slate-400">Suspende o app para usuários comuns temporariamente</span>
              </div>
              <input
                type="checkbox"
                checked={settings.app_info?.maintenance_mode || false}
                onChange={(e) => setSettings({
                  ...settings,
                  app_info: { ...settings.app_info, maintenance_mode: e.target.checked }
                })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </div>
          </div>
        </div>

        {/* 2. Parâmetros do Algoritmo de Sono */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders size={18} className="text-violet-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Pesos do Motor Preditivo de Sono
              </h2>
            </div>
            <button
              onClick={() => handleSaveSection('prediction_engine')}
              disabled={savingKey === 'prediction_engine'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              <Save size={14} />
              <span>{savingKey === 'prediction_engine' ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500 font-semibold">Peso do Histórico Real</span>
                <span className="font-bold text-slate-900 dark:text-white">{settings.prediction_engine?.weight_history * 100}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={settings.prediction_engine?.weight_history || 0.4}
                onChange={(e) => setSettings({
                  ...settings,
                  prediction_engine: { ...settings.prediction_engine, weight_history: parseFloat(e.target.value) }
                })}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500 font-semibold">Peso da Última Soneca</span>
                <span className="font-bold text-slate-900 dark:text-white">{settings.prediction_engine?.weight_last_nap * 100}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={settings.prediction_engine?.weight_last_nap || 0.35}
                onChange={(e) => setSettings({
                  ...settings,
                  prediction_engine: { ...settings.prediction_engine, weight_last_nap: parseFloat(e.target.value) }
                })}
                className="w-full accent-violet-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-500 font-semibold">Tolerância da Estimativa (Minutos)</span>
                <span className="font-bold text-slate-900 dark:text-white">{settings.prediction_engine?.tolerance_minutes} min</span>
              </div>
              <input
                type="number"
                value={settings.prediction_engine?.tolerance_minutes || 15}
                onChange={(e) => setSettings({
                  ...settings,
                  prediction_engine: { ...settings.prediction_engine, tolerance_minutes: parseInt(e.target.value, 10) }
                })}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>
          </div>
        </div>

        {/* 3. Lembretes e Notificações Globais */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Notificações PWA
              </h2>
            </div>
            <button
              onClick={() => handleSaveSection('notification_defaults')}
              disabled={savingKey === 'notification_defaults'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              <Save size={14} />
              <span>{savingKey === 'notification_defaults' ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Envio de Lembretes Global</span>
                <span className="text-[11px] text-slate-400">Permite disparos de janelas de sono via Service Worker</span>
              </div>
              <input
                type="checkbox"
                checked={settings.notification_defaults?.global_reminders ?? true}
                onChange={(e) => setSettings({
                  ...settings,
                  notification_defaults: { ...settings.notification_defaults, global_reminders: e.target.checked }
                })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Antecedência Padrão (Minutos)</label>
              <select
                value={settings.notification_defaults?.default_lead_time || 15}
                onChange={(e) => setSettings({
                  ...settings,
                  notification_defaults: { ...settings.notification_defaults, default_lead_time: parseInt(e.target.value, 10) }
                })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <option value={5}>5 minutos antes</option>
                <option value={10}>10 minutos antes</option>
                <option value={15}>15 minutos antes</option>
                <option value={30}>30 minutos antes</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Ambiente Sandbox de Assinaturas */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-emerald-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Ambiente Sandbox
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
              Simulado
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
              <Info size={16} className="shrink-0 text-indigo-500 mt-0.5" />
              <span>O simulador sandbox gerencia o ciclo completo (Free, Mensal, Anual e Cancelamento) sem cobranças financeiras.</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Modo Sandbox Ativo</span>
                <span className="text-[11px] text-slate-400">Obrigatório para esta fase do projeto</span>
              </div>
              <input
                type="checkbox"
                checked={true}
                disabled
                className="w-4 h-4 accent-indigo-600 rounded opacity-60"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
