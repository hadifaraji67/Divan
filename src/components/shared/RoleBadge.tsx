import React from 'react';
import { Shield, UserCog, ShoppingCart, Eye } from 'lucide-react';
import { getCurrentRole, getRoleLabel } from '../../lib/rbac';

const ICONS: Record<string, React.ElementType> = {
  admin: Shield,
  accountant: UserCog,
  seller: ShoppingCart,
  viewer: Eye,
};

const COLORS: Record<string, string> = {
  admin: 'bg-rose-500/20 text-rose-700 dark:text-rose-400',
  accountant: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400',
  seller: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
  viewer: 'bg-slate-500/20 text-slate-700 dark:text-slate-400',
};

interface Props {
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<Props> = ({ showIcon = true, size = 'sm' }) => {
  const role = getCurrentRole();
  if (!role) return null;

  const Icon = ICONS[role] || Eye;
  const colorClass = COLORS[role] || COLORS.viewer;
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-bold ${colorClass} ${sizeClass}`}>
      {showIcon && <Icon className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />}
      {getRoleLabel(role)}
    </span>
  );
};

export default RoleBadge;
