import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Action {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: Action[];
  iconColor?: string;
}

export const EmptyState: React.FC<Props> = ({
  icon: Icon,
  title,
  description,
  actions = [],
  iconColor = 'text-indigo-500',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-5 shadow-inner">
        <Icon className={`w-12 h-12 ${iconColor}`} />
      </div>

      <h3 className="font-bold text-lg mb-2">{title}</h3>

      {description && (
        <p className="text-sm opacity-60 mb-6 max-w-sm leading-relaxed">{description}</p>
      )}

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {actions.map((action, i) => {
            const ActionIcon = action.icon;
            const variant = action.variant || 'primary';

            const classes = {
              primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20',
              secondary: 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200',
              ghost: 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-indigo-600 dark:text-indigo-400',
            }[variant];

            return (
              <button
                key={i}
                onClick={action.onClick}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${classes}`}
              >
                {ActionIcon && <ActionIcon className="w-4 h-4" />}
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
