import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { UserSubscription, SubscriptionPlanType, SubscriptionStatus, PLAN_BENEFITS } from '@/types/subscription';
import { DataService } from '@/services/dataService';
import { useAuth } from '@/features/auth/AuthContext';

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  isPremium: boolean;
  loading: boolean;
  upgradePlan: (planType: SubscriptionPlanType) => Promise<UserSubscription>;
  cancelSubscription: () => Promise<void>;
  isUpgradeModalOpen: boolean;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  canAccessFeature: (featureId: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || 'local-caregiver';

  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);

  const loadSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const sub = await DataService.getUserSubscription(userId);
      setSubscription(sub);
    } catch (err) {
      console.warn('Erro ao carregar assinatura:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const isPremium = useMemo(() => {
    if (!subscription) return false;
    return subscription.planType !== 'FREE' && (subscription.status === 'ACTIVE' || subscription.status === 'TRIALING');
  }, [subscription]);

  const upgradePlan = useCallback(async (planType: SubscriptionPlanType): Promise<UserSubscription> => {
    const updated = await DataService.updateUserSubscription(userId, planType, 'ACTIVE');
    setSubscription(updated);
    setIsUpgradeModalOpen(false);
    return updated;
  }, [userId]);

  const cancelSubscription = useCallback(async () => {
    const updated = await DataService.updateUserSubscription(userId, 'FREE', 'CANCELED');
    setSubscription(updated);
  }, [userId]);

  const canAccessFeature = useCallback((featureId: string): boolean => {
    const benefit = PLAN_BENEFITS.find(b => b.id === featureId);
    if (!benefit) return true;
    if (!benefit.isPremiumOnly) return true;
    return isPremium;
  }, [isPremium]);

  const openUpgradeModal = () => setIsUpgradeModalOpen(true);
  const closeUpgradeModal = () => setIsUpgradeModalOpen(false);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isPremium,
        loading,
        upgradePlan,
        cancelSubscription,
        isUpgradeModalOpen,
        openUpgradeModal,
        closeUpgradeModal,
        canAccessFeature,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
