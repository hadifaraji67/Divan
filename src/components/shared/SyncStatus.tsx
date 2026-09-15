import React, { useState } from 'react';
import { RefreshCw, CloudOff, Cloud, AlertCircle, CheckCircle2, Clock, X } from 'lucide-react';
import { useSync } from '../../lib/sync/use-sync';
import { getMode } from '../../lib/server/mode';
import { serverClient } from '../../lib/server/server-client';
import { useSettings } from '../../lib/theme-context';

export const SyncStatus: React.FC = () => {
  const { sync, busy, queue, lastSync, status } = useSync();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const mode = getMode();

  // در حالت مستقل چیزی نشان نده
  if (mode !== 'server') return null;

  const IconMap: any = {
    off: CloudOff,
    error: AlertCircle,
    sync: RefreshCw,
    pending: Clock,
    ok: CheckCircle2,
  };
  const Icon = IconMap[status.icon] || Cloud;

  const colorMap: any = {
    slate: 'text-slate-500',
    rose: 'text-rose-500',
    amber: 'text-amber-500',
    emerald: 'text-emerald-500',
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return 'هرگز';
    try {
      const d = new Date(iso);
      const now = Date.now();
      const diff = Math.floor((now - d.getTime()) / 1000);
      if (diff < 60) return 'همین الان';
      if (diff < 3600) return `${Math.floor(diff / 60)} دقیقه پیش`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} ساعت پیش`;
      return d.toLocaleDateString('fa-IR');
    } catch { return 'هرگز'; }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        title={status.label}
      >
        <Icon className={`w-4 h-4 ${colorMap[status.color]} ${busy ? 'animate-spin' : ''}`} />
        {queue > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
            {queue > 99 ? '99+' : queue}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
            style={{ animation: 'scaleIn 0.15s ease-out' }}>
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-sm">همگام‌سازی</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-black/5">
                <X className="w-3.5 h-3.5 opacity-50" />
              </button>
            </div>

            <div className="p-3 space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-black/5 dark:border-white/5">
                <span className="opacity-60">وضعیت</span>
                <span className={`font-bold ${colorMap[status.color]}`}>{status.label}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-black/5 dark:border-white/5">
                <span className="opacity-60">آخرین sync</span>
                <span className="font-bold">{formatTime(lastSync)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-black/5 dark:border-white/5">
                <span className="opacity-60">در انتظار</span>
                <span className="font-bold">{queue} تغییر</span>
              </div>
              {serverClient.isAuthenticated && serverClient.getUser() && (
                <div className="flex justify-between py-1.5">
                  <span className="opacity-60">کاربر</span>
                  <span className="font-bold">{serverClient.getUser()?.username}</span>
                </div>
              )}
            </div>

            <div className="p-3 pt-0">
              <button
                onClick={() => { sync(true); setOpen(false); }}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold rounded-lg"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} />
                {busy ? 'در حال همگام‌سازی...' : 'همگام‌سازی فوری'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SyncStatus;
