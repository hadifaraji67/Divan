import { useMemo, useEffect, useState } from 'react';
import {
  hasPermission,
  hasAnyPermission,
  getCurrentRole,
  isAdmin,
  isViewer,
  getRoleLabel,
  type Permission,
} from './rbac';

export function useRBAC() {
  const [role, setRole] = useState(getCurrentRole());
  const [tick, setTick] = useState(0);

  // بروزرسانی وقتی کاربر تغییر می‌کند
  useEffect(() => {
    const handler = () => {
      setRole(getCurrentRole());
      setTick((t) => t + 1);
    };

    window.addEventListener('storage', handler);
    window.addEventListener('divan-auth-changed', handler as EventListener);
    window.addEventListener('divan-mode-changed', handler as EventListener);

    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('divan-auth-changed', handler as EventListener);
      window.removeEventListener('divan-mode-changed', handler as EventListener);
    };
  }, []);

  return useMemo(
    () => ({
      role,
      roleLabel: role ? getRoleLabel(role) : null,
      can: (permission: Permission) => hasPermission(permission),
      canAny: (...permissions: Permission[]) => hasAnyPermission(...permissions),
      isAdmin: isAdmin(),
      isViewer: isViewer(),
    }),
    [role, tick]
  );
}
