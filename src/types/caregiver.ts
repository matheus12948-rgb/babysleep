// ========================================================
// BabySleep - Tipos para Multi-Cuidador e Permissões
// ========================================================

export type CaregiverRole = 'OWNER' | 'CAREGIVER' | 'VIEWER';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface Caregiver {
  id: string;
  babyId: string;
  userId: string;
  role: CaregiverRole;
  userEmail?: string;
  userName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface CaregiverInvitation {
  id: string;
  babyId: string;
  invitedByUserId: string;
  email: string;
  role: CaregiverRole;
  inviteCode: string;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
}

export interface CaregiverPermissions {
  canEdit: boolean;
  canInvite: boolean;
  canDeleteBaby: boolean;
  isOwner: boolean;
  isViewerOnly: boolean;
}

export function getCaregiverPermissions(role: CaregiverRole | null | undefined): CaregiverPermissions {
  if (role === 'OWNER') {
    return {
      canEdit: true,
      canInvite: true,
      canDeleteBaby: true,
      isOwner: true,
      isViewerOnly: false,
    };
  }
  if (role === 'CAREGIVER') {
    return {
      canEdit: true,
      canInvite: false,
      canDeleteBaby: false,
      isOwner: false,
      isViewerOnly: false,
    };
  }
  // VIEWER ou sem permissão
  return {
    canEdit: false,
    canInvite: false,
    canDeleteBaby: false,
    isOwner: false,
    isViewerOnly: true,
  };
}
