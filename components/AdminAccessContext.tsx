'use client';

import { createContext, ReactNode, useContext } from 'react';
import { type AdminRole, canAccessAdminPath, defaultAdminPath, normalizeAdminRole, roleLabel } from '@/lib/adminAccess';

export type AdminAccessProfile = {
  id: string;
  email: string;
  role: AdminRole;
  status: 'active' | 'blocked' | string;
  fullName?: string;
};

type AdminAccessContextValue = {
  profile: AdminAccessProfile;
  canAccess: (path: string) => boolean;
  defaultPath: string;
  roleLabel: string;
};

const AdminAccessContext = createContext<AdminAccessContextValue | null>(null);

export function AdminAccessProvider({ profile, children }: { profile: AdminAccessProfile; children: ReactNode }) {
  const safeProfile = { ...profile, role: normalizeAdminRole(profile.role) };

  return (
    <AdminAccessContext.Provider
      value={{
        profile: safeProfile,
        canAccess: (path: string) => canAccessAdminPath(safeProfile.role, path),
        defaultPath: defaultAdminPath(safeProfile.role),
        roleLabel: roleLabel(safeProfile.role)
      }}
    >
      {children}
    </AdminAccessContext.Provider>
  );
}

export function useAdminAccess() {
  const context = useContext(AdminAccessContext);
  if (!context) {
    return {
      profile: { id: '', email: '', role: 'customer' as AdminRole, status: 'blocked' },
      canAccess: () => false,
      defaultPath: '/account',
      roleLabel: 'Нет доступа'
    };
  }
  return context;
}
