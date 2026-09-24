import React from 'react';
import { X, Trash2, Download, CheckSquare } from 'lucide-react';

interface BulkAction {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success';
}

interface Props {
  count: number;
  total: number;
  onClear: () => void;
  onSelectAll: () => void;
  actions: BulkAction[];
}

export const BulkActionsBar: React.FC<Props> = ({
  count,
  total,
  onClear,
  onSelectAll,
  actions,
}) => {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-2xl px-3 py-2.5 flex items-center gap-2 max-w-[95vw] overflow-x-auto">
        <button
          onClick={onClear}
          className="p-1.5 rounded-lg hover:bg-white/10 shrink-0"
          title="لغو انتخاب"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-xs whitespace-nowrap px-2 border-l border-r border-white/20">
          <span className="font-bold text-indigo-400">{count.toLocaleString('fa-IR')}</span>
          <span className="opacity-60"> / {total.toLocaleString('fa-IR')}</span>
        </div>

        <button
          onClick={onSelectAll}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs whitespace-nowrap shrink-0"
          title="انتخاب همه"
        >
          <CheckSquare className="w-3.5 h-3.5" />
          همه
        </button>

        {actions.map((a, i) => {
          const Icon = a.icon;
          const variantClass =
            a.variant === 'danger'
              ? 'bg-rose-600 hover:bg-rose-700'
              : a.variant === 'success'
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-indigo-600 hover:bg-indigo-700';

          return (
            <button
              key={i}
              onClick={a.onClick}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 ${variantClass}`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BulkActionsBar;
