import React, { useState } from 'react';
import { 
  Home, 
  CalendarDays, 
  BarChart3, 
  Volume2, 
  User, 
  Plus, 
  Moon, 
  Sun, 
  Baby, 
  ChevronDown 
} from 'lucide-react';
import { useBaby } from '@/features/baby/BabyContext';
import { useTheme } from '@/hooks/useTheme';
import { QuickLogModal } from '@/components/ui/QuickLogModal';
import { ManualSleepModal } from '@/components/ui/ManualSleepModal';
import { BabyJournalModal } from '@/components/ui/BabyJournalModal';
import { BreastfeedingModal } from '@/components/routine/BreastfeedingModal';
import { BottleModal } from '@/components/routine/BottleModal';
import { SolidFoodModal } from '@/components/routine/SolidFoodModal';
import { DiaperModal } from '@/components/routine/DiaperModal';
import { CareActivityModal, CareModalMode } from '@/components/routine/CareActivityModal';
import { MiniSoundPlayer } from '@/features/sounds/MiniSoundPlayer';
import { PWAInstallBanner } from '@/components/ui/PWAInstallBanner';
import { NetworkStatusIndicator } from '@/components/ui/NetworkStatusIndicator';

export type ActiveTab = 'home' | 'timeline' | 'stats' | 'sounds' | 'profile';

interface AppLayoutProps {
  currentTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  onOpenBabySelector?: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onNavigate,
  onOpenBabySelector,
  children,
}) => {
  const { activeBaby, babyAge } = useBaby();
  const { isDark, toggleTheme } = useTheme();

  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isManualSleepOpen, setIsManualSleepOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isBreastfeedingOpen, setIsBreastfeedingOpen] = useState(false);
  const [isBottleOpen, setIsBottleOpen] = useState(false);
  const [isSolidFoodOpen, setIsSolidFoodOpen] = useState(false);
  const [isDiaperOpen, setIsDiaperOpen] = useState(false);
  const [isCareOpen, setIsCareOpen] = useState(false);
  const [careMode, setCareMode] = useState<CareModalMode>('BATH');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (title: string, msg: string) => {
    setToastMessage(`${title}: ${msg}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg backdrop-blur-xs animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Network Status Offline/Online Indicator */}
      <NetworkStatusIndicator />

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-2xl mx-auto px-4 h-15 flex items-center justify-between">
          {/* Seletor de Bebê Ativo */}
          <button
            onClick={onOpenBabySelector}
            aria-label={`Bebê selecionado: ${activeBaby ? activeBaby.name : 'Meu Bebê'}. Toque para trocar de bebê`}
            aria-haspopup="dialog"
            className="flex items-center gap-2 p-1.5 -ml-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition group text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-400 flex items-center justify-center text-white shadow-xs">
              <Baby size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {activeBaby ? activeBaby.name : 'Meu Bebê'}
                </span>
                <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
              </div>
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400">
                {babyAge ? babyAge.formatted : 'Carregando...'}
              </p>
            </div>
          </button>

          {/* Ações da Direita: Dark Mode & Perfil */}
          <div className="flex items-center gap-1.5">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
              title={isDark ? 'Ativar Modo Claro' : 'Ativar Modo Noturno'}
              aria-label={isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Noturno'}
            >
              {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
            </button>

            {/* Perfil */}
            <button
              onClick={() => onNavigate('profile')}
              aria-label="Perfil e Configurações"
              aria-current={currentTab === 'profile' ? 'page' : undefined}
              className={`p-2 rounded-xl transition active:scale-95 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                currentTab === 'profile'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Perfil e Configurações"
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-4 pb-28" role="main">
        {children}
      </main>

      {/* Bottom Navigation Bar (Mobile First) */}
      <nav 
        aria-label="Navegação principal"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 safe-area-bottom"
      >
        <div className="max-w-2xl mx-auto px-4 h-17 flex items-center justify-between relative">
          {/* 1. Início */}
          <button
            onClick={() => onNavigate('home')}
            aria-label="Aba Início"
            aria-current={currentTab === 'home' ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              currentTab === 'home'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Home size={21} strokeWidth={currentTab === 'home' ? 2.5 : 2} />
            <span className="text-[10px] mt-1">Início</span>
          </button>

          {/* 2. Rotina */}
          <button
            onClick={() => onNavigate('timeline')}
            aria-label="Aba Rotina e Linha do Tempo"
            aria-current={currentTab === 'timeline' ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              currentTab === 'timeline'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <CalendarDays size={21} strokeWidth={currentTab === 'timeline' ? 2.5 : 2} />
            <span className="text-[10px] mt-1">Rotina</span>
          </button>

          {/* Botão Central Flutuante (+ Ação Rápida em 1 Toque) */}
          <div className="flex-1 flex justify-center -mt-6">
            <button
              onClick={() => setIsQuickLogOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 text-white shadow-lg shadow-indigo-500/30 dark:shadow-indigo-950/50 flex items-center justify-center transition-all duration-200 active:scale-90 focus:outline-hidden focus-visible:ring-4 focus-visible:ring-indigo-400"
              aria-label="Abrir menu de registro rápido de atividades"
              aria-haspopup="dialog"
            >
              <Plus size={28} strokeWidth={2.5} />
            </button>
          </div>

          {/* 3. Estatísticas */}
          <button
            onClick={() => onNavigate('stats')}
            aria-label="Aba Estatísticas de Sono e Rotina"
            aria-current={currentTab === 'stats' ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              currentTab === 'stats'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 size={21} strokeWidth={currentTab === 'stats' ? 2.5 : 2} />
            <span className="text-[10px] mt-1">Estatísticas</span>
          </button>

          {/* 4. Sons */}
          <button
            onClick={() => onNavigate('sounds')}
            aria-label="Aba Sons e Músicas de Ninar"
            aria-current={currentTab === 'sounds' ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              currentTab === 'sounds'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Volume2 size={21} strokeWidth={currentTab === 'sounds' ? 2.5 : 2} />
            <span className="text-[10px] mt-1">Sons</span>
          </button>
        </div>
      </nav>

      {/* Modais Globais de Ação Rápida */}
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        onOpenSleep={() => setIsManualSleepOpen(true)}
        onOpenBreastfeeding={() => setIsBreastfeedingOpen(true)}
        onOpenBottle={() => setIsBottleOpen(true)}
        onOpenSolidFood={() => setIsSolidFoodOpen(true)}
        onOpenDiaper={() => setIsDiaperOpen(true)}
        onOpenBath={() => {
          setCareMode('BATH');
          setIsCareOpen(true);
        }}
        onOpenTemperature={() => {
          setCareMode('TEMPERATURE');
          setIsCareOpen(true);
        }}
        onOpenMedicine={() => {
          setCareMode('MEDICINE');
          setIsCareOpen(true);
        }}
        onOpenActivity={() => {
          setCareMode('ACTIVITY');
          setIsCareOpen(true);
        }}
        onOpenJournal={() => setIsJournalOpen(true)}
      />

      <ManualSleepModal
        isOpen={isManualSleepOpen}
        onClose={() => setIsManualSleepOpen(false)}
      />

      <BabyJournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        onSaved={() => showToast('Memória Gravada', 'Entrada adicionada ao diário')}
      />

      <BreastfeedingModal
        isOpen={isBreastfeedingOpen}
        onClose={() => setIsBreastfeedingOpen(false)}
        babyId={activeBaby?.id || ''}
        onSuccess={() => showToast('Amamentação', 'Sessão de amamentação gravada com sucesso')}
      />

      <BottleModal
        isOpen={isBottleOpen}
        onClose={() => setIsBottleOpen(false)}
        babyId={activeBaby?.id || ''}
        onSuccess={() => showToast('Mamadeira', 'Mamadeira adicionada à rotina')}
      />

      <SolidFoodModal
        isOpen={isSolidFoodOpen}
        onClose={() => setIsSolidFoodOpen(false)}
        babyId={activeBaby?.id || ''}
        onSuccess={() => showToast('Alimentação', 'Refeição registrada')}
      />

      <DiaperModal
        isOpen={isDiaperOpen}
        onClose={() => setIsDiaperOpen(false)}
        babyId={activeBaby?.id || ''}
        onSuccess={() => showToast('Fralda', 'Troca registrada')}
      />

      <CareActivityModal
        isOpen={isCareOpen}
        initialMode={careMode}
        onClose={() => setIsCareOpen(false)}
        babyId={activeBaby?.id || ''}
        onSuccess={() => showToast('Cuidado Registrado', 'Evento adicionado à rotina')}
      />

      {/* Mini Player de Sons Persistente */}
      <MiniSoundPlayer 
        onOpenSoundsTab={() => onNavigate('sounds')}
        isSoundsTab={currentTab === 'sounds'}
      />

      {/* Banner de Instalação do PWA */}
      <PWAInstallBanner />
    </div>
  );
};
