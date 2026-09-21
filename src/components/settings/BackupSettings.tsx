import React, { useState, useEffect, useRef } from 'react';
import {
  Download, Upload, HardDrive, Shield, Clock, Trash2, RefreshCw,
  Check, X, AlertTriangle, FileText, Info, Smartphone, Cloud, Lock,
  Unlock, Share2, Eye, Calendar, Zap, RotateCcw,
} from 'lucide-react';
import { createBackup, parseBackup, inspectBackup } from '../../lib/backup/backup-core';
import { saveToDevice, listBackups, deleteBackup, shareFile, readBackupFile, isCapacitor, requestStoragePermission } from '../../lib/backup/filesystem';
import { runBackup, loadBackupSettings, saveBackupSettings, type BackupSettings as BSettings } from '../../lib/backup/use-auto-backup';
import { notify } from '../../lib/toast';
import { shareBackupFile } from '../../lib/backup/share-helper';
import { formatNum } from '../../lib/theme-context';
import { useSettings } from '../../lib/theme-context';

interface StoredBackup {
  name: string;
  uri: string;
  size: number;
  mtime: number;
}

export const BackupSettings: React.FC = () => {
  const { settings } = useSettings();
  const [config, setConfig] = useState<BSettings>(loadBackupSettings());
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [backups, setBackups] = useState<StoredBackup[]>([]);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [restoreFile, setRestoreFile] = useState<{ name: string; content: string; meta: any } | null>(null);
  const [restorePassword, setRestorePassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const native = isCapacitor();

  useEffect(() => {
    refreshBackups();
  }, []);

  const refreshBackups = async () => {
    if (!native) return;
    const list = await listBackups();
    setBackups(list.sort((a, b) => b.mtime - a.mtime));
  };

  const updateConfig = (patch: Partial<BSettings>) => {
    const updated = { ...config, ...patch };
    setConfig(updated);
    saveBackupSettings(patch);
  };

  const handleManualBackup = async () => {
    setBusy(true);
    const toastId = notify.loading('در حال ساخت بکاپ...');
    try {
      const result = await runBackup({ password: config.password, silent: false });
      notify.dismiss(toastId);
      if (result.success) {
        notify.success(`بکاپ ساخته شد (${formatNum(Math.round((result.size || 0) / 1024), settings.persianNumbers)} KB)`);
        refreshBackups();
      } else {
        notify.error(result.error || 'خطا در بکاپ');
      }
    } catch (err: any) {
      notify.dismiss(toastId);
      notify.error(err?.message || 'خطای ناشناخته');
    } finally {
      setBusy(false);
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const meta = inspectBackup(content);

      if (!meta.valid) {
        notify.error(meta.error || 'فایل معتبر نیست');
        return;
      }

      setRestoreFile({ name: file.name, content, meta });
      setRestorePassword('');
      setShowRestoreDialog(true);
    };
    reader.readAsText(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmRestore = async () => {
    if (!restoreFile) return;

    if (!confirm('⚠️ تمام داده‌های فعلی جایگزین می‌شوند. مطمئنید؟')) return;

    setBusy(true);
    const toastId = notify.loading('در حال بازیابی...');

    try {
      const result = await parseBackup(restoreFile.content, restorePassword || undefined);
      notify.dismiss(toastId);

      if (result.success) {
        notify.success('بازیابی موفق — صفحه در حال بارگذاری مجدد...');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        notify.error(result.error || 'خطا در بازیابی');
      }
    } catch (err: any) {
      notify.dismiss(toastId);
      notify.error(err?.message || 'خطای ناشناخته');
    } finally {
      setBusy(false);
      setShowRestoreDialog(false);
      setRestoreFile(null);
    }
  };

  const handleDelete = async (backup: StoredBackup) => {
    if (!confirm(`حذف «${backup.name}»؟`)) return;
    const ok = await deleteBackup(backup.uri);
    if (ok) {
      notify.success('حذف شد');
      refreshBackups();
    } else {
      notify.error('خطا در حذف');
    }
  };

  const handleRestoreFromList = async (backup: StoredBackup) => {
    setBusy(true);
    const toastId = notify.loading('در حال خواندن بکاپ...');
    try {
      const content = await readBackupFile(backup.name);
      notify.dismiss(toastId);

      if (!content) {
        notify.error('خواندن فایل ناموفق بود');
        setBusy(false);
        return;
      }

      const meta = inspectBackup(content);
      if (!meta.valid) {
        notify.error(meta.error || 'فایل معتبر نیست');
        setBusy(false);
        return;
      }

      setRestoreFile({ name: backup.name, content, meta });
      setRestorePassword('');
      setShowRestoreDialog(true);
    } catch (err: any) {
      notify.dismiss(toastId);
      notify.error(err?.message || 'خطای ناشناخته');
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async (backup: StoredBackup) => {
    setBusy(true);
    try {
      const ok = await shareBackupFile(backup.uri, backup.name);
      if (!ok) notify.error('اشتراک‌گذاری ناموفق');
    } catch (err: any) {
      notify.error(err?.message || 'خطا');
    } finally {
      setBusy(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${formatNum(Math.round(bytes / 1024), settings.persianNumbers)} KB`;
    return `${formatNum(Math.round(bytes / 1024 / 1024), settings.persianNumbers)} MB`;
  };

  const formatDate = (ms: number) => {
    try {
      const d = new Date(ms > 10000000000 ? ms : ms * 1000);
      return d.toLocaleDateString('fa-IR') + ' — ' + d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4" dir="rtl">

      {/* کارت اصلی */}
      <div className="rounded-2xl border bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-5" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base">پشتیبان‌گیری و بازیابی</h3>
            <p className="text-xs opacity-60 mt-1 leading-relaxed">
              فایل‌های بکاپ با فرمت <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[11px]">.divan</code> ذخیره می‌شوند
              {native ? ' در پوشه Divan-Backups حافظه گوشی.' : ' و دانلود می‌شوند.'}
            </p>
          </div>
        </div>
      </div>

      {/* تنظیمات بکاپ خودکار */}
      <Section icon={Zap} title="بکاپ خودکار">
        <Toggle
          label="بکاپ خودکار روزانه"
          desc="هر ۲۴ ساعت، به‌طور خودکار یک بکاپ ساخته می‌شود"
          checked={config.autoEnabled}
          onChange={(v) => updateConfig({ autoEnabled: v })}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 py-2">
          <div>
            <div className="text-sm font-medium">نگهداری بکاپ‌ها</div>
            <div className="text-[11px] opacity-50 mt-0.5">بکاپ‌های قدیمی‌تر به‌طور خودکار حذف می‌شوند</div>
          </div>
          <select
            value={config.keepDays}
            onChange={(e) => updateConfig({ keepDays: Number(e.target.value) })}
            className="w-full md:w-auto min-w-[160px] p-2 border rounded-lg text-sm bg-white dark:bg-slate-900"
          >
            <option value={7}>۷ روز اخیر</option>
            <option value={14}>۱۴ روز اخیر</option>
            <option value={30}>۳۰ روز اخیر</option>
            <option value={90}>۳ ماه اخیر</option>
            <option value={365}>۱ سال اخیر</option>
          </select>
        </div>

        {config.lastBackupAt && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="opacity-70">آخرین بکاپ:</span>
            <span className="font-bold text-emerald-600">
              {new Date(config.lastBackupAt).toLocaleString('fa-IR')}
            </span>
          </div>
        )}
      </Section>

      {/* رمزنگاری */}
      <Section icon={Shield} title="رمزنگاری">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs opacity-80 leading-relaxed">
            با رمزنگاری، فایل بکاپ با رمز شما محافظت می‌شود (AES-256).
            <b className="text-rose-600"> اگر رمز را فراموش کنید، داده‌ها قابل بازیابی نیستند.</b>
          </div>
        </div>

        <label className="block">
          <span className="text-xs opacity-60 block mb-1">رمز عبور بکاپ (اختیاری)</span>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={config.password}
              onChange={(e) => updateConfig({ password: e.target.value })}
              placeholder="اگر خالی باشد، بکاپ بدون رمز ذخیره می‌شود"
              className="w-full p-2.5 pl-10 border rounded-lg text-sm bg-white dark:bg-slate-900"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10"
            >
              {showPassword ? <Unlock className="w-4 h-4 opacity-60" /> : <Lock className="w-4 h-4 opacity-60" />}
            </button>
          </div>
          {config.password && (
            <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              رمزنگاری فعال است
            </div>
          )}
        </label>
      </Section>

      {/* دکمه‌های عملیات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={handleManualBackup}
          disabled={busy}
          className="flex items-center justify-center gap-2 px-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors"
        >
          {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {busy ? 'در حال ساخت...' : 'بکاپ فوری'}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="flex items-center justify-center gap-2 px-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors"
        >
          <Upload className="w-4 h-4" />
          بازیابی از فایل
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".divan,.json"
          onChange={handleRestoreFile}
          className="hidden"
        />
      </div>

      {/* Google Drive — به زودی */}
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
            <Cloud className="w-5 h-5 text-sky-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm">پشتیبان‌گیری ابری (Google Drive)</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                به زودی
              </span>
            </div>
            <p className="text-xs opacity-60 mt-1 leading-relaxed">
              به‌زودی امکان آپلود خودکار بکاپ به Google Drive فراهم می‌شود. با اتصال به حساب گوگل، بکاپ‌ها به‌طور خودکار در فضای ابری شما ذخیره می‌شوند.
            </p>
          </div>
        </div>
      </div>

      {/* لیست بکاپ‌های محلی */}
      {native && (
        <Section icon={HardDrive} title="بکاپ‌های روی گوشی" action={{ label: 'بروزرسانی', onClick: refreshBackups }}>
          {backups.length === 0 ? (
            <div className="text-center text-xs opacity-40 py-6">
              هنوز بکاپی ذخیره نشده
            </div>
          ) : (
            <div className="space-y-2">
              {backups.map(b => (
                <div key={b.uri} className="flex items-center gap-3 p-3 rounded-lg border border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{b.name}</div>
                    <div className="text-[10px] opacity-60 flex flex-wrap gap-2 mt-0.5">
                      <span>{formatDate(b.mtime)}</span>
                      <span>{formatBytes(b.size)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                        onClick={() => handleRestoreFromList(b)}
                        disabled={busy}
                        className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 disabled:opacity-50"
                        title="بازیابی از این بکاپ"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                      onClick={() => handleShare(b)}
                      title="اشتراک‌گذاری"
                      className="p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-500/10 text-sky-600"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b)}
                      title="حذف"
                      className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* اطلاعات سیستم */}
      <div className="rounded-xl border p-3 text-[11px] opacity-70 flex items-center gap-2" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        {native ? <Smartphone className="w-3.5 h-3.5" /> : <HardDrive className="w-3.5 h-3.5" />}
        حالت فعلی: <b>{native ? 'اپلیکیشن اندروید' : 'مرورگر وب'}</b>
        {!native && ' — بکاپ‌ها دانلود می‌شوند'}
      </div>

      {/* دیالوگ بازیابی */}
      {showRestoreDialog && restoreFile && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => !busy && setShowRestoreDialog(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5" onClick={(e) => e.stopPropagation()} dir="rtl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm">تایید بازیابی</h3>
                <p className="text-[11px] opacity-60 mt-0.5">تمام داده‌های فعلی جایگزین می‌شوند</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] space-y-1.5 text-xs mb-4">
              <div className="flex justify-between">
                <span className="opacity-60">فایل:</span>
                <b className="truncate max-w-[200px]" dir="ltr">{restoreFile.name}</b>
              </div>
              {restoreFile.meta.createdAt && (
                <div className="flex justify-between">
                  <span className="opacity-60">تاریخ بکاپ:</span>
                  <b>{new Date(restoreFile.meta.createdAt).toLocaleString('fa-IR')}</b>
                </div>
              )}
              {restoreFile.meta.stats && (
                <div className="pt-1.5 border-t border-black/5 dark:border-white/5">
                  <div className="text-[10px] opacity-60 mb-1">محتوای بکاپ:</div>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <span>مشتریان: <b>{formatNum(restoreFile.meta.stats.contacts || 0, settings.persianNumbers)}</b></span>
                    <span>کالاها: <b>{formatNum(restoreFile.meta.stats.products || 0, settings.persianNumbers)}</b></span>
                    <span>فاکتورها: <b>{formatNum(restoreFile.meta.stats.invoices || 0, settings.persianNumbers)}</b></span>
                    <span>پرداخت‌ها: <b>{formatNum(restoreFile.meta.stats.payments || 0, settings.persianNumbers)}</b></span>
                  </div>
                </div>
              )}
              {restoreFile.meta.encrypted && (
                <div className="flex items-center gap-1.5 pt-2 border-t border-black/5 dark:border-white/5 text-amber-600">
                  <Lock className="w-3 h-3" />
                  <b>فایل رمزنگاری‌شده است</b>
                </div>
              )}
            </div>

            {restoreFile.meta.encrypted && (
              <label className="block mb-4">
                <span className="text-xs opacity-60 block mb-1">رمز فایل</span>
                <input
                  type="password"
                  value={restorePassword}
                  onChange={(e) => setRestorePassword(e.target.value)}
                  placeholder="رمز را وارد کنید"
                  className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-900"
                  dir="ltr"
                  autoFocus
                />
              </label>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowRestoreDialog(false); setRestoreFile(null); }}
                disabled={busy}
                className="px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 rounded-lg"
              >
                لغو
              </button>
              <button
                onClick={confirmRestore}
                disabled={busy || (restoreFile.meta.encrypted && !restorePassword)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-bold rounded-lg"
              >
                {busy ? 'در حال بازیابی...' : 'بازیابی کن'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============ اجزای کمکی ============ */
const Section: React.FC<{ icon: any; title: string; action?: { label: string; onClick: () => void }; children: React.ReactNode }> = ({ icon: Icon, title, action, children }) => (
  <div className="rounded-2xl border bg-white dark:bg-slate-900/50 overflow-hidden" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
    <div className="flex items-center justify-between px-4 py-3 border-b bg-black/[0.02] dark:bg-white/[0.02]" style={{ borderColor: 'inherit' }}>
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      {action && (
        <button onClick={action.onClick} className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
          <RefreshCw className="w-3 h-3" />
          {action.label}
        </button>
      )}
    </div>
    <div className="p-4 space-y-3">{children}</div>
  </div>
);

const Toggle: React.FC<{ label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between gap-3 py-1">
    <div className="min-w-0">
      <div className="text-sm font-medium">{label}</div>
      {desc && <div className="text-[11px] opacity-50 mt-0.5">{desc}</div>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
    >
      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ right: checked ? '2px' : '22px' }} />
    </button>
  </div>
);

export default BackupSettings;
