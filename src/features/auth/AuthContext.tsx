import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { supabase, isSupabaseConfigured } from '@/services/supabase';
import { DataService } from '@/services/dataService';
import { secureSignOutCleanup } from '@/utils/security';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, fullName: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const profile = await DataService.getUserProfile();
            if (profile) {
              setUser(profile);
            } else {
              const fallback: UserProfile = {
                id: session.user.id,
                email: session.user.email,
                fullName: session.user.user_metadata?.full_name || 'Cuidador',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
                createdAt: session.user.created_at,
              };
              await DataService.saveUserProfile(fallback);
              setUser(fallback);
            }
          }
        } else {
          // Modo Local Dev / Offline
          const local = await DataService.getUserProfile();
          if (local) {
            setUser(local);
          } else {
            // Se não houver perfil, cria um perfil padrão para experiência imediata
            const defaultUser: UserProfile = {
              id: 'dev-user-01',
              email: 'pais@babysleep.app',
              fullName: 'Família Amorosa',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
              createdAt: new Date().toISOString(),
            };
            await DataService.saveUserProfile(defaultUser);
            setUser(defaultUser);
          }
        }
      } catch (err) {
        console.error('Erro ao inicializar autenticação:', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const signIn = async (email: string, password?: string) => {
    try {
      if (isSupabaseConfigured && supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          const profile = await DataService.getUserProfile();
          setUser(profile);
          return { success: true };
        }
      }

      // Local mock login
      const profile: UserProfile = {
        id: 'user-' + Date.now(),
        email,
        fullName: email.split('@')[0],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
        createdAt: new Date().toISOString(),
      };
      await DataService.saveUserProfile(profile);
      setUser(profile);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha na autenticação';
      return { success: false, error: message };
    }
  };

  const signUp = async (email: string, fullName: string, password?: string) => {
    try {
      if (isSupabaseConfigured && supabase && password) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email,
            fullName,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
            createdAt: new Date().toISOString(),
          };
          await DataService.saveUserProfile(profile);
          setUser(profile);
          return { success: true };
        }
      }

      const profile: UserProfile = {
        id: 'user-' + Date.now(),
        email,
        fullName,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
        createdAt: new Date().toISOString(),
      };
      await DataService.saveUserProfile(profile);
      setUser(profile);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha no cadastro';
      return { success: false, error: message };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    secureSignOutCleanup();
    setUser(null);
  };

  const updateProfile = async (partial: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...partial };
    await DataService.saveUserProfile(updated);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};
