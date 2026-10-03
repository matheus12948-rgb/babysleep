import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { BabyProfile } from '@/types';
import { DataService } from '@/services/dataService';
import { calculateBabyAge, BabyAge } from '@/utils/date';
import { useAuth } from '@/features/auth/AuthContext';

interface BabyContextType {
  babies: BabyProfile[];
  activeBaby: BabyProfile | null;
  babyAge: BabyAge | null;
  loading: boolean;
  selectBaby: (babyId: string) => void;
  saveBabyProfile: (babyData: Omit<BabyProfile, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<BabyProfile>;
  deleteBaby: (babyId: string) => Promise<void>;
  refreshBabies: () => Promise<void>;
}

const BabyContext = createContext<BabyContextType | undefined>(undefined);

export const BabyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [babies, setBabies] = useState<BabyProfile[]>([]);
  const [activeBabyId, setActiveBabyId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshBabies = async () => {
    if (!user) {
      setBabies([]);
      setActiveBabyId(null);
      setLoading(false);
      return;
    }

    try {
      const list = await DataService.getBabies(user.id);
      setBabies(list);

      const savedActiveId = DataService.getActiveBabyId();
      if (savedActiveId && list.some(b => b.id === savedActiveId)) {
        setActiveBabyId(savedActiveId);
      } else if (list.length > 0) {
        setActiveBabyId(list[0].id);
        DataService.setActiveBabyId(list[0].id);
      } else {
        setActiveBabyId(null);
      }
    } catch (err) {
      console.error('Erro ao carregar bebês:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBabies();
  }, [user]);

  const activeBaby = useMemo(() => {
    if (!activeBabyId) return null;
    return babies.find(b => b.id === activeBabyId) || babies[0] || null;
  }, [babies, activeBabyId]);

  const babyAge = useMemo(() => {
    if (!activeBaby?.birthDate) return null;
    return calculateBabyAge(activeBaby.birthDate);
  }, [activeBaby]);

  const selectBaby = (babyId: string) => {
    setActiveBabyId(babyId);
    DataService.setActiveBabyId(babyId);
  };

  const saveBabyProfile = async (
    babyData: Omit<BabyProfile, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<BabyProfile> => {
    if (!user) throw new Error('Usuário não autenticado');

    const id = babyData.id || (crypto.randomUUID ? crypto.randomUUID() : 'baby-' + Date.now());
    const fullProfile: BabyProfile = {
      ...babyData,
      id,
      ownerId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await DataService.saveBaby(fullProfile);
    await refreshBabies();
    return saved;
  };

  const deleteBaby = async (babyId: string): Promise<void> => {
    await DataService.deleteBaby(babyId);
    await refreshBabies();
  };

  return (
    <BabyContext.Provider
      value={{
        babies,
        activeBaby,
        babyAge,
        loading,
        selectBaby,
        saveBabyProfile,
        deleteBaby,
        refreshBabies,
      }}
    >
      {children}
    </BabyContext.Provider>
  );
};

export const useBaby = () => {
  const context = useContext(BabyContext);
  if (!context) throw new Error('useBaby deve ser usado dentro de um BabyProvider');
  return context;
};
