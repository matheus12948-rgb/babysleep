import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const NetworkStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300"
    >
      {!isOnline && (
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-800/95 text-amber-300 text-xs font-semibold shadow-lg backdrop-blur-md border border-amber-500/30">
          <WifiOff size={14} className="animate-pulse" />
          <span>Modo Offline • Seus dados continuam sendo salvos localmente</span>
        </div>
      )}

      {isOnline && showReconnected && (
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-600/95 text-white text-xs font-semibold shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <Wifi size={14} />
          <span>Conexão restabelecida • Sincronizando</span>
        </div>
      )}
    </div>
  );
};
