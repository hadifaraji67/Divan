import React, { useEffect, useState } from 'react';
import { FolderOpen, Search, RefreshCw, AlertTriangle, HardDrive, Check } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Directory } from '@capacitor/filesystem';
import { listBackups, readBackupFile, type StoredBackup } from '../../lib/backup/filesystem';
import { inspectBackup, parseBackup } from '../../lib/backup/backup-core';
import { notify } from '../../lib/toast';

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

export const BackupDiscoveryScreen: React.FC<Props> = ({ onComplete, onSkip }) => {
  const [scanning, setScanning] = useState(true);
  const [backups, setBackups] = useState<StoredBackup[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState('');

  const scan = async () => {
    setScanning(true);
    setError('');

    try {
      if (!Capacitor.isNativePlatform()) {
        setError('اسکن فقط در نسخه اندروید');
        setScanning(false);
        return;
      }

      // ─── مرحله ۱: اسکن TRY_DIRS (Documents, External, Data) ───
      const found = await listBackups();
      console.log('[Discovery] found in TRY_DIRS:', found.length);

      // ─── مرحله ۲: اسکن مستقیم Documents (اگر TRY_DIRS جواب نداد) ───
      if (found.length === 0) {
        const w = window as any;
        const Filesystem = w.Capacitor?.Plugins?.Filesystem;
        if (Filesystem) {
          // تلاش مستقیم روی Documents
          try {
            const r = await Filesystem.readdir({
              path: 'Divan-Backups',
              directory: Directory.Documents,
            });
            const files = (r.files || []).filter((f: any) => f.name?.endsWith('.divan'));
            console.log('[Discovery] direct Documents scan:', files.length);

            for (const f of files) {
              try {
                const uriR = await Filesystem.getUri({
                  path: `Divan-Backups/${f.name}`,
                  directory: Directory.Documents,
                });
                found.push({
                  name: f.name,
                  uri: uriR.uri,
                  size: f.size || 0,
                  mtime: f.mtime || 0,
                  path: 'Documents',
                });
              } catch {}
            }
          } catch (e: any) {
            console.warn('[Discovery] direct Documents fail:', e?.message);
          }
        }
      }

      // ─── مرتب‌سازی ───
      found.sort((a, b) => (b.mtime || 0) - (a.mtime || 0));
      setBackups(found);

      if (found.length === 0) {
        setError('هیچ بکاپی پیدا نشد');
      }
    } catch (err: any) {
      console.error('[Discovery] error:', err);
      setError(err?.message || 'خطا در اسکن');
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    scan();
  }, []);

  const formatTime = (ts: number) => {
    if (!ts) return '';
    try {
      const ms = ts > 1e12 ? ts : ts * 1000;
      return new Date(ms).toLocaleString('fa-IR');
    } catch {
      return '';
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  const handleRestore = async (backup: StoredBackup) => {
    setRestoring(true);
    const toastId = notify.loading('در حال بازیابی...');

    try {
      const content = await readBackupFile(backup.name);
      notify.dismiss(toastId);

      if (!content) {
        notify.error('خواندن فایل ناموفق');
        setRestoring(false);
        return;
      }

      const meta = inspectBackup(content);
      if (!meta.valid) {
        notify.error(meta.error || 'فایل نامعتبر');
        setRestoring(false);
        return;
      }

      if (!confirm('⚠️ داده‌های فعلی جایگزین می‌شوند. مطمئن هستید؟')) {
        setRestoring(false);
        return;
      }

      const result = await parseBackup(content);
      if (result.success) {
        notify.success('بازیابی موفق!');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        notify.error(result.error || 'خطا در بازیابی');
        setRestoring(false);
      }
    } catch (err: any) {
      notify.dismiss(toastId);
      notify.error(err?.message || 'خطا');
      setRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 to-violet-700 z-50 flex flex-col" dir="rtl">
      {/* Header */}
      <div className="p-6 text-white text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-3">
          <HardDrive className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold mb-1">بکاپ‌های قبلی</h1>
        <p className="text-xs opacity-80">
          اگر قبلاً از دیوان بکاپ گرفته‌اید، الان می‌توانید بازیابی کنید
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-t-3xl p-4 overflow-y-auto">
        {/* در حال اسکن */}
        {scanning && (
          <div className="text-center py-12">
            <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-3 text-indigo-500" />
            <div className="text-sm opacity-70">در حال جستجو...</div>
            <div className="text-[10px] opacity-50 mt-2">
              پوشه‌های Documents، External، Data اسکن می‌شوند
            </div>
          </div>
        )}

        {/* خطا */}
        {!scanning && error && (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-amber-500" />
            <div className="text-sm font-bold mb-1">بکاپی پیدا نشد</div>
            <div className="text-xs opacity-60 mb-6 leading-relaxed max-w-xs mx-auto">
              اگر قبلاً بکاپ داشتید، فایل‌ها باید در پوشه‌ی:
              <br />
              <span dir="ltr" className="inline-block mt-2 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">
                Documents/Divan-Backups
              </span>
              <br />
              باشد.
            </div>

            <div className="flex gap-2 justify-center">
              <button
                onClick={scan}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                اسکن مجدد
              </button>
              <button
                onClick={onSkip}
                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg"
              >
                شروع از صفر
              </button>
            </div>

            <div className="mt-6 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] leading-relaxed text-right max-w-sm mx-auto">
              <div className="font-bold text-sky-700 dark:text-sky-400 mb-1">
                💡 چرا بکاپ پیدا نشد؟
              </div>
              <div className="opacity-70 space-y-1">
                <div>• اگر تازه دیوان را نصب کرده‌اید، طبیعی است</div>
                <div>• اگر بکاپ دارید، مطمئن شوید در Documents/Divan-Backups است</div>
                <div>• می‌توانید دستی از فایل بازیابی کنید</div>
              </div>
            </div>
          </div>
        )}

        {/* لیست بکاپ‌ها */}
        {!scanning && !error && backups.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs opacity-70">
                {backups.length} بکاپ پیدا شد
              </div>
              <button
                onClick={scan}
                className="text-xs text-indigo-600 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                اسکن مجدد
              </button>
            </div>

            {backups.map((b: StoredBackup) => (
              <button
                key={b.uri}
                onClick={() => setSelected(b.uri)}
                disabled={restoring}
                className={`w-full p-3 rounded-xl border-2 text-right transition-all ${
                  selected === b.uri
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <HardDrive className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs truncate" dir="ltr">
                      {b.name}
                    </div>
                    <div className="text-[10px] opacity-60 mt-0.5">
                      {formatSize(b.size)} • {formatTime(b.mtime)}
                    </div>
                    {b.path && (
                      <div className="text-[9px] opacity-40 mt-0.5">
                        پوشه: {b.path}
                      </div>
                    )}
                  </div>
                  {selected === b.uri && (
                    <Check className="w-5 h-5 text-indigo-600 shrink-0" />
                  )}
                </div>
              </button>
            ))}

            <div className="flex gap-2 pt-3">
              <button
                onClick={() => {
                  const b = backups.find((x: StoredBackup) => x.uri === selected);
                  if (b) handleRestore(b);
                }}
                disabled={!selected || restoring}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl"
              >
                {restoring ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {restoring ? 'در حال بازیابی...' : 'بازیابی'}
              </button>
              <button
                onClick={onSkip}
                disabled={restoring}
                className="px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl"
              >
                رد کردن
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupDiscoveryScreen;
