import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';
import { PWAService } from '@/pwa/pwaService';

export const PWAInstallBanner: React.FC = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem('babysleep_pwa_dismissed') === 'true';
    }
    return false;
  });

  useEffect(() => {
    PWAService.initInstallListener((available) => {
      setCanInstall(available);
    });
  }, []);

  if (!canInstall || isDismissed || PWAService.isInstalled()) {
    return null;
  }

  const handleInstall = async () => {
    const accepted = await PWAService.promptInstall();
    if (accepted) {
      setCanInstall(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('babysleep_pwa_dismissed', 'true');
    }
  };

  return (
    <div 
      className="fixed z-50 top-3 left-3 right-3 max-w-md mx-auto p-3.5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl shadow-xl border border-indigo-500/40 flex items-center justify-between gap-3 animate-slide-down backdrop-blur-md"
      role="banner"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/30 flex items-center justify-center text-xl shrink-0 border border-indigo-400/30">
          🌙
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-white">Instalar BabySleep</h4>
            <span className="text-[10px] text-amber-300 flex items-center gap-0.5 font-semibold">
              <Sparkles size={11} /> Rápido & Offline
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight line-clamp-1 mt-0.5">
            Adicione à tela inicial para acesso instantâneo e notificações.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
        >
          <Download size={13} />
          <span>Instalar</span>
        </button>

        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
          title="Fechar"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
