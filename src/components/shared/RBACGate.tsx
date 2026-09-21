import React from 'react';
import { Lock } from 'lucide-react';
import { useRBAC } from '../../lib/use-rbac';
import type { Permission } from '../../lib/rbac';

interface Props {
  permission: Permission | Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  mode?: 'hide' | 'disable' | 'fallback';
}

/**
 * RBACGate — محافظ UI بر اساس دسترسی
 * 
 * استفاده:
 *   <RBACGate permission="invoice.delete">
 *     <DeleteButton />
 *   </RBACGate>
 */
export const RBACGate: React.FC<Props> = ({
  permission,
  children,
  fallback,
  mode = 'hide',
}) => {
  const { can, canAny } = useRBAC();

  const hasAccess = Array.isArray(permission)
    ? canAny(...permission)
    : can(permission);

  if (hasAccess) return <>{children}</>;

  if (mode === 'hide') return null;

  if (mode === 'disable') {
    return (
      <div className="opacity-50 pointer-events-none cursor-not-allowed">
        {children}
      </div>
    );
  }

  if (mode === 'fallback') {
    return <>{fallback || <DefaultNoAccess />}</>;
  }

  return null;
};

const DefaultNoAccess: React.FC = () => (
  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
    <Lock className="w-4 h-4" />
    دسترسی شما به این بخش محدود است
  </div>
);

export default RBACGate;
