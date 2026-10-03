import { useState, useEffect, useCallback, useMemo } from 'react';
import { Caregiver, CaregiverInvitation, CaregiverRole, CaregiverPermissions, getCaregiverPermissions } from '@/types/caregiver';
import { DataService } from '@/services/dataService';
import { useAuth } from '@/features/auth/AuthContext';
import { useBaby } from '@/features/baby/BabyContext';

export function useCaregiver() {
  const { user } = useAuth();
  const { activeBaby, refreshBabies } = useBaby();

  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [invitations, setInvitations] = useState<CaregiverInvitation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const babyId = activeBaby?.id;

  const loadData = useCallback(async () => {
    if (!babyId) {
      setCaregivers([]);
      setInvitations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [cgList, invList] = await Promise.all([
        DataService.getBabyCaregivers(babyId),
        DataService.getCaregiverInvitations(babyId),
      ]);
      setCaregivers(cgList);
      setInvitations(invList);
    } catch (err) {
      console.warn('Erro ao carregar cuidadores:', err);
    } finally {
      setLoading(false);
    }
  }, [babyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Papel do usuário logado em relação ao bebê ativo
  const userRole: CaregiverRole = useMemo(() => {
    if (!activeBaby || !user) return 'VIEWER';
    if (activeBaby.ownerId === user.id) return 'OWNER';

    const match = caregivers.find(c => c.userId === user.id);
    return match ? match.role : 'VIEWER';
  }, [activeBaby, user, caregivers]);

  // Permissões
  const permissions: CaregiverPermissions = useMemo(() => {
    return getCaregiverPermissions(userRole);
  }, [userRole]);

  // Convidar cuidador
  const inviteCaregiver = useCallback(async (
    email: string, 
    role: CaregiverRole = 'CAREGIVER'
  ): Promise<CaregiverInvitation> => {
    if (!babyId || !user) {
      throw new Error('Bebê ou usuário não identificados.');
    }

    const created = await DataService.createCaregiverInvitation({
      babyId,
      invitedByUserId: user.id,
      email,
      role,
    });

    setInvitations(prev => [created, ...prev]);
    return created;
  }, [babyId, user]);

  // Aceitar código de convite
  const acceptInvite = useCallback(async (code: string) => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' };
    }

    const result = await DataService.acceptCaregiverInvitation(
      code,
      user.id,
      user.email,
      user.fullName
    );

    if (result.success) {
      await refreshBabies();
      await loadData();
    }

    return result;
  }, [user, refreshBabies, loadData]);

  // Remover cuidador
  const removeCaregiver = useCallback(async (targetUserId: string) => {
    if (!babyId) return;
    await DataService.removeCaregiver(babyId, targetUserId);
    setCaregivers(prev => prev.filter(c => c.userId !== targetUserId));
  }, [babyId]);

  // Revogar convite
  const revokeInvitation = useCallback(async (invitationId: string) => {
    await DataService.revokeInvitation(invitationId);
    setInvitations(prev => prev.filter(i => i.id !== invitationId));
  }, []);

  return {
    caregivers,
    invitations,
    userRole,
    permissions,
    loading,
    inviteCaregiver,
    acceptInvite,
    removeCaregiver,
    revokeInvitation,
    refreshCaregivers: loadData,
  };
}
