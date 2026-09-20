import { LiveUpdate } from '@capawesome/capacitor-live-update';
import React, { useState, useEffect } from 'react';
import { getLog, clearLog, subscribe, type LogEntry } from '../../lib/error-logger';
import { APP_VERSION } from '../../lib/update/update-v2';

declare const __APP_VERSION__: string;

function cmp(a: string, b: string): number {
  const [aB, aP] = a.replace(/^v/, '').split('-');
  const [bB, bP] = b.replace(/^v/, '').split('-');
  const pa = aB.split('.').map((n) => parseInt(n) || 0);
  const pb = bB.split('.').map((n) => parseInt(n) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0, y = pb[i] || 0;
    if (x !== y) return x > y ? 1 : -1;
  }
  const order: Record<string, number> = { '': 4, rc: 3, beta: 2, alpha: 1 };
  const aT = aP?.split('.')[0] || '';
  const bT = bP?.split('.')[0] || '';
  const aN = parseInt(aP?.split('.')[1] || '0');
  const bN = parseInt(bP?.split('.')[1] || '0');
  if (order[aT] !== order[bT]) return order[aT] > order[bT] ? 1 : -1;
  return aN > bN ? 1 : aN < bN ? -1 : 0;
}

export const UpdateDebug: React.FC = () => {
  const [log, setLog] = useState('');
  const [busy, setBusy] = useState(false);
  const [entries, setEntries] = useState<LogEntry[]>(getLog());
  const [tab, setTab] = useState<'env' | 'errors'>('errors');

  useEffect(() => subscribe(setEntries), []);

  const runEnv = async () => {
    setBusy(true);
    const lines: string[] = [];
    const w = window as any;
    try {
      lines.push(`APP_VERSION: ${typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '?'}`);
      lines.push(`Capacitor: ${!!w.Capacitor}`);
      lines.push(`isNative: ${w.Capacitor?.isNativePlatform?.()}`);
      lines.push('');
      const res = await fetch('https://api.github.com/repos/hadifaraji67/Divan/releases?per_page=10', {
        headers: { Accept: 'application/vnd.github+json' },
        cache: 'no-cache',
      });
      lines.push(`API status: ${res.status}`);
      if (res.ok) {
        const releases = await res.json();
        lines.push(`releases: ${releases.length}`);
        for (const rel of releases) {
          const apk = rel.assets?.find((a: any) => a.name?.endsWith('.apk'));
          const zip = rel.assets?.find((a: any) => a.name?.endsWith('.zip'));
          if (!apk || !zip) continue;
          const v = rel.tag_name.replace(/^v/, '');
          lines.push(`latest: ${v}`);
          const r = cmp(v, APP_VERSION);
          lines.push(`compare: ${r} → ${r > 0 ? '✅ آپدیت هست' : 'ℹ️ آخرین'}`);
          break;
        }
      }
    } catch (err: any) { lines.push(`❌ ${err?.message}`); }
    setLog(lines.join('\n'));
    setBusy(false);
  };

  const fmt = (ts: number) => new Date(ts).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const eC = entries.filter((e) => e.level === 'error').length;
  const wC = entries.filter((e) => e.level === 'warn').length;

  return (
    <div className="mt-4 rounded-xl border-2 border-rose-500/50 bg-rose-500/5 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-rose-500/30">
        <div className="text-xs font-bold text-rose-700 dark:text-rose-400">🐛 دیباگ</div>
        <div className="flex gap-1">
          <button onClick={() => setTab('env')} className={`px-2 py-1 text-[10px] font-bold rounded ${tab === 'env' ? 'bg-rose-600 text-white' : 'bg-white/50 dark:bg-slate-900/50'}`}>🔍 محیط</button>
          <button onClick={() => setTab('errors')} className={`px-2 py-1 text-[10px] font-bold rounded ${tab === 'errors' ? 'bg-rose-600 text-white' : 'bg-white/50 dark:bg-slate-900/50'}`}>🚨 خطاها ({eC}/{wC})</button>
        </div>
      </div>
      {tab === 'env' && (
        <div className="p-3">
          <button onClick={runEnv} disabled={busy} className="w-full py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg mb-2">{busy ? '...' : 'اجرای چک'}</button>
          {log && <pre className="text-[10px] whitespace-pre-wrap break-all bg-white dark:bg-slate-900 p-2 rounded border max-h-72 overflow-auto" dir="ltr">{log}</pre>}
        </div>
      )}
      {tab === 'errors' && (
        <div className="p-3">
          <div className="flex gap-2 mb-2">
            <button onClick={() => { clearLog(); setEntries([]); }} className="flex-1 py-1.5 bg-slate-600 text-white text-[10px] font-bold rounded-lg">🗑 پاک‌سازی</button>
            <button onClick={() => { const t = entries.map((e) => `[${fmt(e.timestamp)}] [${e.level}] [${e.source}] ${e.message}${e.data ? ' | ' + JSON.stringify(e.data).slice(0, 200) : ''}`).join('\n'); navigator.clipboard.writeText(t); }} className="flex-1 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg">📋 کپی</button>
          </div>
          <div className="max-h-96 overflow-auto space-y-1" dir="ltr">
            {entries.length === 0 && <div className="text-center text-[10px] opacity-50 py-4">هیچ خطایی ثبت نشده</div>}
            {entries.slice(0, 50).map((e) => (
              <div key={e.id} className={`p-2 rounded border text-[10px] ${e.level === 'error' ? 'bg-rose-500/10 border-rose-500/30' : e.level === 'warn' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-500/10 border-slate-500/30'}`}>
                <div className="flex justify-between gap-2 mb-1">
                  <span className={`font-bold ${e.level === 'error' ? 'text-rose-600' : 'text-amber-600'}`}>{e.level === 'error' ? '🚨' : '⚠️'} {e.source}</span>
                  <span className="opacity-50 text-[9px]">{fmt(e.timestamp)}</span>
                </div>
                <div className="font-mono break-words">{e.message}</div>
                {e.data && <div className="mt-1 opacity-60 text-[9px] break-all">{JSON.stringify(e.data).slice(0, 150)}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateDebug;
