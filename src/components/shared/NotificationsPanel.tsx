import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, Package, Users, CheckSquare, X, Check } from 'lucide-react';
import { getNotifications, type AppNotification } from '../../lib/notifications';
import { formatNum } from '../../lib/theme-context';
import { useSettings } from '../../lib/theme-context';

interface Props {
  onNavigate?: (view: string) => void;
}

export const NotificationsPanel: React.FC<Props> = ({ onNavigate }) => {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('divan_read_notifs') || '[]'); } catch { return []; }
  });
  const ref = useRef<HTMLDivElement>(null);

  const refresh = () => setItems(getNotifications());

  useEffect(() => {
    refresh();
    const i = setInterval(refresh, 60000); // هر دقیقه
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  const unread = items.filter(i => !readIds.includes(i.id));
  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);

  const markAllRead = () => {
    const ids = [...new Set([...readIds, ...items.map(i => i.id)])];
    setReadIds(ids);
    localStorage.setItem('divan_read_notifs', JSON.stringify(ids));
  };

  const handleClick = (n: AppNotification) => {
    if (!readIds.includes(n.id)) {
      const newIds = [...readIds, n.id];
      setReadIds(newIds);
      localStorage.setItem('divan_read_notifs', JSON.stringify(newIds));
    }
    if (n.action && onNavigate) {
      onNavigate(n.action.view);
      setOpen(false);
    }
  };

  const severityIcon = (s: string) => {
    if (s === 'danger') return <AlertCircle className="w-4 h-4 text-rose-500" />;
    if (s === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <Info className="w-4 h-4 text-sky-500" />;
  };

  const typeIcon = (t: string) => {
    if (t.startsWith('cheque')) return <CheckSquare className="w-3.5 h-3.5" />;
    if (t === 'low-stock') return <Package className="w-3.5 h-3.5" />;
    if (t === 'debtor') return <Users className="w-3.5 h-3.5" />;
    return <Bell className="w-3.5 h-3.5" />;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); refresh(); }}
        className="relative p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        title="اعلان‌ها"
      >
        <Bell className="w-4 h-4" />
        {unread.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread.length > 99 ? '۹۹+' : f(unread.length)}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-[340px] max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50"
          style={{ animation: 'scaleIn 0.15s ease-out' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <div className="font-bold text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-500" />
              اعلان‌ها {unread.length > 0 && <span className="text-rose-500">({f(unread.length)} جدید)</span>}
            </div>
            {unread.length > 0 && (
              <button onClick={markAllRead} className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                <Check className="w-3 h-3" /> خواندن همه
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-8 text-center text-xs opacity-40">
                <Check className="w-8 h-8 mx-auto mb-2 opacity-30" />
                هیچ اعلان فعالی نیست
              </div>
            ) : (
              items.map(n => {
                const isRead = readIds.includes(n.id);
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-right p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3 ${isRead ? 'opacity-60' : ''}`}
                  >
                    <div className="shrink-0 mt-0.5">{severityIcon(n.severity)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-sm font-bold truncate">
                        {n.title}
                        {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                      </div>
                      <div className="text-[11px] opacity-70 mt-0.5 line-clamp-2">{n.description}</div>
                      {n.amount && (
                        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                          {f(n.amount)} {settings.currency}
                        </div>
                      )}
                      {n.action && (
                        <div className="text-[10px] text-indigo-500 mt-1">← {n.action.label}</div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
