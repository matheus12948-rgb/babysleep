import React, { useState } from 'react';
import { 
  Volume2, 
  CheckCircle, 
  VolumeX, 
  Sparkles,
  Info
} from 'lucide-react';
import { AdminDataService } from '@/services/adminDataService';
import { AdminSoundItem } from '@/types/admin';
import { useAuth } from '@/features/auth/AuthContext';

export const AdminSoundsPage: React.FC = () => {
  const { user } = useAuth();
  const [sounds, setSounds] = useState<AdminSoundItem[]>(() => AdminDataService.getSoundsList());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleToggleSound = async (sound: AdminSoundItem) => {
    if (!user) return;
    const nextState = !sound.isActive;
    try {
      await AdminDataService.toggleSoundActive(user.id, sound.id, nextState);
      const updated = AdminDataService.getSoundsList();
      setSounds(updated);
      showToast(nextState ? `Som "${sound.name}" ativado no catálogo.` : `Som "${sound.name}" desativado.`);
    } catch (err) {
      showToast('Erro ao atualizar status do som');
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Catálogo de Sons Procedurais
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Controle das 12 faixas acústicas sintetizadas em tempo real pela Web Audio API.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
          <Sparkles size={14} />
          <span>100% Offline & Procedural</span>
        </div>
      </div>

      {/* Informação Técnica */}
      <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
        <Info size={18} className="shrink-0 text-indigo-500 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Zero Arquivos de Áudio Externos</span>
          Todas as faixas sonoras são sintetizadas matematicamente pelos osciladores e geradores de ruído da Web Audio API do navegador. A desativação de uma faixa oculta temporariamente o som do catálogo dos cuidadores sem necessidade de novos deploys.
        </div>
      </div>

      {/* Grid dos Sons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sounds.map(sound => (
          <div
            key={sound.id}
            className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 ${
              sound.isActive
                ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs'
                : 'bg-slate-50/50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
                  {sound.emoji}
                </div>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                  sound.isActive
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {sound.isActive ? 'ATIVO' : 'DESATIVADO'}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {sound.name}
              </h3>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mt-0.5">
                {sound.categoryLabel}
              </span>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {sound.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                #{sound.order}
              </span>

              <button
                onClick={() => handleToggleSound(sound)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  sound.isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
                aria-label={sound.isActive ? `Desativar som ${sound.name}` : `Ativar som ${sound.name}`}
              >
                {sound.isActive ? <VolumeX size={14} /> : <Volume2 size={14} />}
                <span>{sound.isActive ? 'Desativar' : 'Ativar'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
