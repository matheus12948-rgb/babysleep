import React, { useState, lazy, Suspense } from 'react';
import { ThemeProvider } from '@/hooks/useTheme';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { BabyProvider, useBaby } from '@/features/baby/BabyContext';
import { SleepTrackerProvider } from '@/features/sleep-tracker/SleepTrackerContext';
import { SoundProvider } from '@/features/sounds/SoundContext';
import { SubscriptionProvider } from '@/features/subscription/SubscriptionContext';

// Carregamento Imediato (Core Crítico da Aplicação)
import { AuthView } from '@/features/auth/AuthView';
import { AppLayout, ActiveTab } from '@/layouts/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { BabySelectorModal } from '@/components/ui/BabySelectorModal';
import { ManualSleepModal } from '@/components/ui/ManualSleepModal';
import { BabyJournalModal } from '@/components/ui/BabyJournalModal';
import { PageLoader } from '@/components/ui/PageLoader';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Carregamento Sob Demanda (Code Splitting / Lazy Loading)
const OnboardingView = lazy(() => import('@/features/onboarding/OnboardingView').then(m => ({ default: m.OnboardingView })));
const TimelinePage = lazy(() => import('@/pages/TimelinePage').then(m => ({ default: m.TimelinePage })));
const StatsPage = lazy(() => import('@/pages/StatsPage').then(m => ({ default: m.StatsPage })));
const SoundsPage = lazy(() => import('@/pages/SoundsPage').then(m => ({ default: m.SoundsPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

const MainApplication: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { babies, activeBaby, loading: babyLoading, refreshBabies } = useBaby();

  const [currentTab, setCurrentTab] = useState<ActiveTab>('home');
  const [isAddingNewBaby, setIsAddingNewBaby] = useState<boolean>(false);
  const [isBabySelectorOpen, setIsBabySelectorOpen] = useState<boolean>(false);
  const [isManualSleepOpen, setIsManualSleepOpen] = useState<boolean>(false);
  const [isJournalOpen, setIsJournalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (title: string, msg: string) => {
    setToastMessage(`${title}: ${msg}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Tela de Carregamento Inicial
  if (authLoading || babyLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-indigo-200">
          Iniciando BabySleep...
        </p>
      </div>
    );
  }

  // 2. Não autenticado -> Tela de Login / Cadastro
  if (!user) {
    return <AuthView />;
  }

  // 3. Sem bebês ou adicionando novo bebê -> Onboarding
  if (babies.length === 0 || isAddingNewBaby) {
    return (
      <Suspense fallback={<PageLoader message="Iniciando cadastro do bebê..." />}>
        <OnboardingView
          onComplete={async () => {
            setIsAddingNewBaby(false);
            await refreshBabies();
            setCurrentTab('home');
          }}
        />
      </Suspense>
    );
  }

  // 4. Fluxo Principal da Aplicação
  return (
    <AppLayout
      currentTab={currentTab}
      onNavigate={setCurrentTab}
      onOpenBabySelector={() => setIsBabySelectorOpen(true)}
    >
      {/* Toast flutuante */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg backdrop-blur-xs animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Renderização Condicional da Aba Ativa com Code Splitting */}
      {currentTab === 'home' && (
        <DashboardPage
          onOpenManualSleep={() => setIsManualSleepOpen(true)}
          onOpenJournal={() => setIsJournalOpen(true)}
          onOpenActionNotice={showToast}
        />
      )}

      {currentTab === 'timeline' && (
        <Suspense fallback={<PageLoader message="Carregando linha do tempo..." />}>
          <TimelinePage onOpenManualSleep={() => setIsManualSleepOpen(true)} />
        </Suspense>
      )}

      {currentTab === 'stats' && (
        <Suspense fallback={<PageLoader message="Calculando estatísticas e tendências..." />}>
          <StatsPage />
        </Suspense>
      )}

      {currentTab === 'sounds' && (
        <Suspense fallback={<PageLoader message="Preparando sons relaxantes..." />}>
          <SoundsPage />
        </Suspense>
      )}

      {currentTab === 'profile' && (
        <Suspense fallback={<PageLoader message="Carregando perfil..." />}>
          <ProfilePage onAddNewBaby={() => setIsAddingNewBaby(true)} />
        </Suspense>
      )}

      {/* Modais de Controle */}
      <BabySelectorModal
        isOpen={isBabySelectorOpen}
        onClose={() => setIsBabySelectorOpen(false)}
        onAddNewBaby={() => {
          setIsBabySelectorOpen(false);
          setIsAddingNewBaby(true);
        }}
      />
    </AppLayout>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <BabyProvider>
              <SleepTrackerProvider>
                <SoundProvider>
                  <MainApplication />
                </SoundProvider>
              </SleepTrackerProvider>
            </BabyProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
