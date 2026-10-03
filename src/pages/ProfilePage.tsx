import React, { useState } from 'react';
import { 
  Baby, 
  User, 
  LogOut, 
  Plus, 
  Check, 
  ShieldCheck, 
  Moon, 
  Sun,
  Crown,
  Users,
  UserPlus,
  KeyRound,
  FileText,
  Sparkles,
  Shield,
  Eye,
  Trash2,
  Clock,
  Radio,
  Bell
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useBaby } from '@/features/baby/BabyContext';
import { useTheme } from '@/hooks/useTheme';
import { useCaregiver } from '@/features/caregiver/useCaregiver';
import { useSubscription } from '@/features/subscription/SubscriptionContext';
import { useBabyRealtime } from '@/features/realtime/useBabyRealtime';
import { isSupabaseConfigured } from '@/services/supabase';
import { InviteCaregiverModal } from '@/features/caregiver/InviteCaregiverModal';
import { JoinBabyModal } from '@/features/caregiver/JoinBabyModal';
import { PremiumUpgradeModal } from '@/features/subscription/PremiumUpgradeModal';
import { PediatricReportModal } from '@/features/subscription/PediatricReportModal';
import { NotificationSettingsModal } from '@/features/notifications/NotificationSettingsModal';

interface ProfilePageProps {
  onAddNewBaby: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onAddNewBaby }) => {
  const { user, signOut } = useAuth();
  const { babies, activeBaby, selectBaby, refreshBabies } = useBaby();
  const { isDark, toggleTheme } = useTheme();

  // Multi-cuidador
  const { 
    caregivers, 
    invitations, 
    userRole, 
    permissions, 
    removeCaregiver, 
    revokeInvitation 
  } = useCaregiver();

  // Assinaturas
  const { 
    isPremium, 
    subscription, 
    isUpgradeModalOpen, 
    openUpgradeModal, 
    closeUpgradeModal,
    cancelSubscription 
  } = useSubscription();

  // Sincronização Realtime
  const { isConnected: isRealtimeActive, lastSyncTime } = useBabyRealtime({
    babyId: activeBaby?.id,
  });

  // Modais
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleOpenReport = () => {
    if (isPremium) {
      setIsReportModalOpen(true);
    } else {
      openUpgradeModal();
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-16">
      {/* Toast flutuante */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl">
          {toastMsg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Perfil & Configurações
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Gerenciamento da família, cuidadores e plano de assinatura
        </p>
      </div>

      {/* 1. CARD DE STATUS DA ASSINATURA / PLANO */}
      <div className={`p-5 rounded-3xl border transition-all relative overflow-hidden ${
        isPremium
          ? 'bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white border-amber-500/40 shadow-xl'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
      }`}>
        {isPremium && (
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        )}

        <div className="flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
              isPremium 
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-md' 
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
            }`}>
              <Crown className="w-6 h-6 fill-current" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isPremium 
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {isPremium ? 'Assinante Pro Ativo' : 'Plano Gratuito'}
                </span>
                {isPremium && (
                  <span className="text-xs text-amber-400 flex items-center gap-1 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" /> Acesso Total
                  </span>
                )}
              </div>

              <h2 className={`font-black text-lg mt-0.5 ${isPremium ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                {isPremium 
                  ? (subscription?.planType === 'PREMIUM_YEARLY' ? 'BabySleep Pro Anual' : 'BabySleep Pro Mensal') 
                  : 'BabySleep Gratuito'}
              </h2>
              <p className={`text-xs ${isPremium ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                {isPremium 
                  ? 'Multi-cuidador, relatórios pediátricos e sons completos habilitados' 
                  : 'Upgrade disponível para sincronização multi-cuidador em tempo real'}
              </p>
            </div>
          </div>

          <button
            onClick={() => isPremium ? showToast('Assinatura Pro ativa e renovada!') : openUpgradeModal()}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition shrink-0 ${
              isPremium
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/20'
            }`}
          >
            {isPremium ? 'Plano Ativo ⭐' : 'Fazer Upgrade'}
          </button>
        </div>

        {/* Ação rápida de Relatório Pediátrico */}
        <div className={`mt-4 pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
          isPremium ? 'border-white/10' : 'border-slate-100 dark:border-slate-800'
        }`}>
          <span className={isPremium ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}>
            🩺 Relatório Consolidado para o Pediatra:
          </span>
          <button
            onClick={handleOpenReport}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 self-start sm:self-auto"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Gerar Relatório de Consulta {isPremium ? '' : '⭐ Pro'}</span>
          </button>
        </div>
      </div>

      {/* 2. CARD DO USUÁRIO LOGADO */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {user?.fullName || 'Cuidador'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                {userRole === 'OWNER' ? 'Responsável Principal' : userRole === 'CAREGIVER' ? 'Cuidador' : 'Observador'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user?.email || 'Sessão ativa'}
            </p>
          </div>
        </div>

        <button
          onClick={signOut}
          className="p-2.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Sair da conta"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* 3. MULTI-CUIDADOR DA FAMÍLIA (FASE 5) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Cuidadores de {activeBaby?.name || 'Bebê'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Compartilhe registros em tempo real com co-pais, babás e avós
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
            >
              <KeyRound size={13} /> Entrar com Código
            </button>

            {permissions.canInvite && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                <UserPlus size={13} /> Convidar
              </button>
            )}
          </div>
        </div>

        {/* Lista de Cuidadores Vinculados */}
        <div className="space-y-2">
          {/* O Dono / Criador */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                👑
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                  {activeBaby?.ownerId === user?.id ? (user?.fullName || 'Você') : 'Responsável Principal'}
                </span>
                <p className="text-[11px] text-slate-400">Criador do perfil do bebê</p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 uppercase">
              Owner
            </span>
          </div>

          {/* Outros Cuidadores */}
          {caregivers.map(cg => {
            const isMe = cg.userId === user?.id;

            return (
              <div
                key={cg.id}
                className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                    {cg.role === 'CAREGIVER' ? <Shield className="w-4 h-4 text-emerald-500" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {cg.userName} {isMe ? '(Você)' : ''}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {cg.role === 'CAREGIVER' ? 'Permissão de registro e leitura' : 'Apenas visualização'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    cg.role === 'CAREGIVER' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {cg.role === 'CAREGIVER' ? 'Cuidador' : 'Observador'}
                  </span>

                  {permissions.isOwner && !isMe && (
                    <button
                      onClick={() => removeCaregiver(cg.userId)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                      title="Remover cuidador"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {caregivers.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-2">
              Nenhum outro cuidador vinculado ainda. Clique em "Convidar" para adicionar.
            </p>
          )}
        </div>

        {/* Convites Pendentes */}
        {invitations.length > 0 && permissions.canInvite && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Convites Aguardando Aceite ({invitations.length})
            </span>
            <div className="space-y-1.5">
              {invitations.map(inv => (
                <div 
                  key={inv.id}
                  className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{inv.email}</span>
                    <span className="ml-2 text-[10px] font-mono font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md text-indigo-600 dark:text-indigo-400">
                      {inv.inviteCode}
                    </span>
                  </div>

                  <button
                    onClick={() => revokeInvitation(inv.id)}
                    className="text-[11px] font-medium text-rose-500 hover:underline"
                  >
                    Cancelar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. LISTA DE BEBÊS */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Bebês Cadastrados
          </h2>
          <button
            onClick={onAddNewBaby}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <Plus size={14} /> Adicionar Bebê
          </button>
        </div>

        <div className="space-y-2">
          {babies.map(b => {
            const isSelected = activeBaby?.id === b.id;

            return (
              <div
                key={b.id}
                onClick={() => selectBaby(b.id)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    <Baby size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{b.name}</h3>
                    <p className="text-[11px] text-slate-400">
                      Nascido(a) em {b.birthDate}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Check size={14} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. PREFERÊNCIAS, TEMA E SINCRONIZAÇÃO EM TEMPO REAL */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Preferências e Conectividade
        </h2>

        {/* Modo Noturno */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-200">
            {isDark ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-amber-500" />}
            <span>Modo Noturno (Baixo Brilho)</span>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
              isDark ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out ${
              isDark ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Lembretes Inteligentes de Sono */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Bell size={16} className="text-indigo-500" />
            <div>
              <span className="font-medium block">Lembretes de Sono & PWA</span>
              <span className="text-[11px] text-slate-400">Janelas de sono e horário silencioso</span>
            </div>
          </div>
          <button
            onClick={() => setIsNotificationModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-semibold transition"
          >
            Ajustar
          </button>
        </div>

        {/* Sincronização em Tempo Real (Realtime) */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Radio size={14} className={isRealtimeActive ? 'text-emerald-500 animate-pulse' : 'text-slate-400'} />
            Sincronização em Tempo Real
          </span>
          <span className={`inline-flex items-center gap-1 font-semibold ${
            isRealtimeActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
          }`}>
            {isRealtimeActive ? '🟢 Conectado ao vivo' : '🟡 Modo Local'}
          </span>
        </div>

        {/* Status de Conexão Supabase */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500">Banco de Dados Supabase</span>
          <span className={`inline-flex items-center gap-1 font-semibold ${
            isSupabaseConfigured ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
          }`}>
            {isSupabaseConfigured ? <ShieldCheck size={14} /> : null}
            {isSupabaseConfigured ? 'Conectado e Seguro' : 'Modo Offline / Local'}
          </span>
        </div>

        {/* Painel Administrativo (Acesso restrito e exclusivo para Administradores) */}
        {(user?.role === 'ADMIN' || user?.isAdmin) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs bg-indigo-50/50 dark:bg-indigo-950/30 p-2.5 rounded-2xl">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
              <div>
                <span className="font-bold block">Painel Administrativo</span>
                <span className="text-[11px] text-slate-400">Área de controle e métricas do sistema</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.history.pushState({}, '', '/admin');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
              aria-label="Acessar o Painel Administrativo"
            >
              Acessar Painel
            </button>
          </div>
        )}
      </div>

      {/* Modais de Suporte */}
      <InviteCaregiverModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        babyName={activeBaby?.name || 'Bebê'}
      />

      <JoinBabyModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoinedSuccess={async () => {
          await refreshBabies();
          showToast('Bebê vinculado com sucesso à sua conta!');
        }}
      />

      <PremiumUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        onSuccess={() => showToast('Parabéns! Plano BabySleep Pro ativado!')}
      />

      <PediatricReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        babyId={activeBaby?.id || ''}
      />

      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        userId={user?.id || 'default_user'}
        babyId={activeBaby?.id || 'default_baby'}
        babyName={activeBaby?.name || 'Bebê'}
      />
    </div>
  );
};
export default ProfilePage;
