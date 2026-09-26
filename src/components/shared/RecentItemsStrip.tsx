import React, { useEffect, useState } from 'react';
import { History, X } from 'lucide-react';
import { getRecentItems, clearRecentItems, type RecentEntry } from '../../lib/recent-items';

interface Props {
  scope: string;
  onSelect: (id: string) => void;
  /** هر وقت این مقدار عوض بشه، لیست از storage دوباره خونده می‌شه */
  refreshKey?: unknown;
}

export const RecentItemsStrip: React.FC<Props> = ({ scope, onSelect, refreshKey }) => {
  const [items, setItems] = useState<RecentEntry[]>([]);

  useEffect(() => {
    setItems(getRecentItems(scope));
  }, [scope, refreshKey]);

  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mt-1">
      <span className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
        <History className="w-3.5 h-3.5" /> اخیر:
      </span>
      {items.map(item => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs whitespace-nowrap max-w-[160px] truncate"
          title={item.label}
        >
          {item.label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => { clearRecentItems(scope); setItems([]); }}
        className="shrink-0 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400"
        title="پاک کردن موارد اخیر"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
