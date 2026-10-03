import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Baby, 
  CreditCard, 
  BookOpen, 
  Volume2, 
  BarChart3, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useTheme } from '@/hooks/useTheme';

export type AdminTab = 
  | 'dashboard' 
  | 'users' 
  | 'babies' 
  | 'subscriptions' 
  | 'content' 
  | 'sounds' 
  | 'reports' 
  | 'audit' 
  | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onNavigate: (tab: AdminTab) => void;
  onExitAdmin: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onNavigate,
  onExitAdmin,
  children,
}) => {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'users', label: 'Usuários', icon: <Users size={18} /> },
    { id: 'babies', label: 'Bebês', icon: <Baby size={18} /> },
    { id: 'subscriptions', label: 'Assinaturas', icon: <CreditCard size={18} /> },
    { id: 'content', label: 'Conteúdo', icon: <BookOpen size={18} /> },
    { id: 'sounds', label: 'Sons', icon: <Volume2 size={18} /> },
    { id: 'reports', label: 'Relatórios', icon: <BarChart3 size={18} /> },
    { id: 'audit', label: 'Auditoria', icon: <ShieldCheck size={18} /> },
    { id: 'settings', label: 'Configurações', icon: <Settings size={18} /> },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    onNavigate(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Botão Menu Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Abrir menu de navegação administrativa"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo Admin */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm font-black text-xs">
                BS
              </div>
              <div>
                <span className="font-black text-base tracking-tight text-slate-900 dark:text-white">
                  BabySleep <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold ml-1">Admin</span>
                </span>
              </div>
            </div>
          </div>

          {/* Ações Topo Direito */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Voltar ao App do Cuidador */}
            <button
              onClick={onExitAdmin}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition"
              title="Ir para o aplicativo comum"
            >
              <ExternalLink size={14} /> Ver App do Cuidador
            </button>

            {/* Alternar Tema */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Alternar tema claro/escuro"
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            {/* Identificação do Admin e Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden md:block text-right">
                <span className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                  {user?.fullName || 'Administrador'}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {user?.email || 'admin@babysleep.app'}
                </span>
              </div>

              <button
                onClick={() => signOut()}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                title="Sair da conta"
                aria-label="Encerrar sessão de administrador"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Corpo com Sidebar Desktop e Conteúdo Central */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <nav 
            aria-label="Navegação administrativa"
            className="sticky top-22 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-3 shadow-xs space-y-1"
          >
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Drawer Mobile */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-900 h-full p-4 flex flex-col shadow-2xl z-10 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-black text-sm text-slate-900 dark:text-white">Menu Admin</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Fechar menu lateral"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto">
                {navItems.map(item => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={onExitAdmin}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  <ExternalLink size={14} /> Voltar para o App
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Área Central de Conteúdo */}
        <main className="flex-1 min-w-0" role="main">
          {children}
        </main>
      </div>
    </div>
  );
};
