import React, { useState, useEffect } from 'react';
import { AdminRoute } from './AdminRoute';
import { AdminLayout, AdminTab } from './AdminLayout';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminBabiesPage } from './pages/AdminBabiesPage';
import { AdminSubscriptionsPage } from './pages/AdminSubscriptionsPage';
import { AdminContentPage } from './pages/AdminContentPage';
import { AdminSoundsPage } from './pages/AdminSoundsPage';
import { AdminReportsPage } from './pages/AdminReportsPage';
import { AdminAuditPage } from './pages/AdminAuditPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';

interface AdminViewProps {
  onExitAdmin: () => void;
}

const TAB_ROUTES: Record<AdminTab, string> = {
  dashboard: '/admin',
  users: '/admin/users',
  babies: '/admin/babies',
  subscriptions: '/admin/subscriptions',
  content: '/admin/content',
  sounds: '/admin/sounds',
  reports: '/admin/reports',
  audit: '/admin/audit',
  settings: '/admin/settings',
};

const getTabFromPath = (path: string): AdminTab => {
  if (path.startsWith('/admin/users')) return 'users';
  if (path.startsWith('/admin/babies')) return 'babies';
  if (path.startsWith('/admin/subscriptions')) return 'subscriptions';
  if (path.startsWith('/admin/content')) return 'content';
  if (path.startsWith('/admin/sounds')) return 'sounds';
  if (path.startsWith('/admin/reports')) return 'reports';
  if (path.startsWith('/admin/audit')) return 'audit';
  if (path.startsWith('/admin/settings')) return 'settings';
  return 'dashboard';
};

export const AdminView: React.FC<AdminViewProps> = ({ onExitAdmin }) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>(() => {
    return typeof window !== 'undefined' ? getTabFromPath(window.location.pathname) : 'dashboard';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentTab(getTabFromPath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (tab: AdminTab) => {
    setCurrentTab(tab);
    const targetUrl = TAB_ROUTES[tab];
    if (typeof window !== 'undefined' && window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
  };

  const handleExit = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
    onExitAdmin();
  };

  return (
    <AdminRoute onUnauthorizedRedirect={handleExit}>
      <AdminLayout
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onExitAdmin={handleExit}
      >
        {currentTab === 'dashboard' && <AdminDashboardPage onNavigateToTab={handleNavigate} />}
        {currentTab === 'users' && <AdminUsersPage />}
        {currentTab === 'babies' && <AdminBabiesPage />}
        {currentTab === 'subscriptions' && <AdminSubscriptionsPage />}
        {currentTab === 'content' && <AdminContentPage />}
        {currentTab === 'sounds' && <AdminSoundsPage />}
        {currentTab === 'reports' && <AdminReportsPage />}
        {currentTab === 'audit' && <AdminAuditPage />}
        {currentTab === 'settings' && <AdminSettingsPage />}
      </AdminLayout>
    </AdminRoute>
  );
};
