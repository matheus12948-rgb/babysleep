import React, { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { AdminDataService } from '@/services/adminDataService';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
  onUnauthorizedRedirect?: () => void;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children,
  onUnauthorizedRedirect 
}) => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const verifyAdmin = async () => {
      if (authLoading) return;

      if (!user) {
        if (isMounted) {
          setIsAdmin(false);
          setChecking(false);
        }
        return;
      }

      // Validação autoritativa via Backend / Supabase
      const adminStatus = await AdminDataService.checkIsAdmin(user.id);
      if (isMounted) {
        setIsAdmin(adminStatus);
        setChecking(false);
      }
    };

    verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  // 1. Verificando autenticação / permissão
  if (authLoading || checking) {
    return (
      <div 
        role="status" 
        aria-live="polite"
        className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white"
      >
        <div className="w-12 h-12 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-indigo-200">
          Validando credenciais administrativas...
        </p>
      </div>
    );
  }

  // 2. Não autenticado -> Redireciona para login
  if (!user) {
    return (
      <div 
        role="alert"
        className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white space-y-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-xl font-bold">Autenticação Necessária</h2>
        <p className="text-xs text-slate-400 max-w-sm">
          Você precisa estar conectado com uma conta autorizada para acessar o painel administrativo.
        </p>
        <button
          onClick={() => {
            if (onUnauthorizedRedirect) {
              onUnauthorizedRedirect();
            } else {
              window.location.href = '/';
            }
          }}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition"
        >
          Ir para Login
        </button>
      </div>
    );
  }

  // 3. Usuário autenticado mas SEM privilégio ADMIN
  if (!isAdmin) {
    return (
      <div 
        role="alert"
        className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white space-y-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">
          Acesso não autorizado.
        </h1>
        <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
          Sua conta ({user.email || user.fullName}) não possui permissões administrativas para acessar esta área restrita do BabySleep.
        </p>
        <button
          onClick={() => {
            if (onUnauthorizedRedirect) {
              onUnauthorizedRedirect();
            } else {
              window.location.href = '/';
            }
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          aria-label="Voltar para o aplicativo normal"
        >
          <ArrowLeft size={16} /> Voltar para o BabySleep
        </button>
      </div>
    );
  }

  // 4. ADMIN autenticado e autorizado
  return <>{children}</>;
};
