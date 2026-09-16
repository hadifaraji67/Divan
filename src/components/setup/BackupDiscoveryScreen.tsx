import React, { useState, useEffect } from 'react';
import {
  HardDrive, Lock, Unlock, AlertTriangle, Check, Loader2,
  ChevronLeft, FileText, Calendar, User, Package, Receipt,
  Users, Wallet, ArrowRight, X, RefreshCw, Clock,
} from 'lucide-react';
import {
  discoverBackups, loadBackupContent, formatSize, formatBackupDate,
  categorizeBackups, dismissSuggestion, type DiscoveredBackup,
} from '../../lib/backup/discovery';
import { parseBackup } from '../../lib/backup/backup-core';
import { isCapacitor } from '../../lib/backup/filesystem';
import { notify } from '../../lib/toast';
import { APP_VERSION } from '../../lib/update-service';

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

type Screen = 'loading' | 'empty' | 'list' | 'password' | 'restore' | 'success';

export const BackupDiscoveryScreen: React.FC<Props> = ({ onComplete, onSkip }) => {
  const [screen, setScreen] = useState<Screen>('loading');
  const [backups, setBackups] = useState<DiscoveredBackup[]>([]);
  const [selected, setSelected] = useState<DiscoveredBackup | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    scan();
  }, []);

  const scan = async () => {
    if (!isCapacitor()) {
      setScreen('empty');
      return;
    }

    setScreen('loading');
    try {
      const list = await discoverBackups();
      const valid = list.filter(b => b.valid);
      setBackups(valid);
      setScreen(valid.length === 0 ? 'empty' : 'list');
    } catch (err: any) {
      setError(err.message);
      setScreen('empty');
    }
  };

  const handleSelect = (backup: DiscoveredBackup) => {
    setSelected(backup);
    setPassword('');
    setError('');
    setScreen(backup.encrypted ? 'password' : 'restore');
  };

  const handleRestore = async () => {
    if (!selected) return;

    setBusy(true);
    setError('');

    try {
      const content = await loadBackupContent(selected.filename);
      if (!content) {
        setError('فایل قابل خواندن نیست');
        setBusy(false);
        return;
      }

      const result = await parseBackup(content, password || undefined);

      if (!result.success) {
        setError(result.error || 'خطا در بازیابی');
        setBusy(false);
        return;
      }

      setScreen('success');
      notify.success('داده‌ها بازیابی شد');

      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  };

  const handleSkip = () => {
    dismissSuggestion();
    onSkip();
  };

  // ═══ Loading ═══
  if (screen === 'loading') {
    return (
      <Shell>
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 text-indigo-500 mx-auto animate-spin mb-4" />
          <h2 className="font-bold text-lg mb-2">در حال جستجو...</h2>
          <p className="text-xs opacity-60">به دنبال بکاپ‌های قبلی در گوشی هستیم</p>
        </div>
      </Shell>
    );
  }

  // ═══ Empty ═══
  if (screen === 'empty') {
    return (
      <Shell>
        <div className="text-center py-6">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-slate-500/10 items-center justify-center mb-4">
            <HardDrive className="w-7 h-7 text-slate-500" />
          </div>
          <h2 className="font-bold text-lg mb-2">بکاپ قبلی یافت نشد</h2>
          <p className="text-xs opacity-60 leading-relaxed mb-6">
            {isCapacitor()
              ? 'هیچ فایل بکاپی در حافظه گوشی پیدا نشد. اپ را تازه راه‌اندازی می‌کنیم.'
              : 'جستجوی بکاپ فقط در اپلیکیشن اندروید کار می‌کند.'}
          </p>
          <button
            onClick={handleSkip}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl"
          >
            ادامه راه‌اندازی
          </button>
        </div>
      </Shell>
    );
  }

  // ═══ List ═══
  if (screen === 'list') {
    const { recent, older } = categorizeBackups(backups);
    const showList = showAll ? backups : recent;

    return (
      <Shell wide>
        <div className="mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-3">
            <HardDrive className="w-3.5 h-3.5" />
            {backups.length} بکاپ یافت شد
          </div>
          <h2 className="font-bold text-xl mb-1">بکاپ‌های قبلی پیدا شد</h2>
          <p className="text-xs opacity-60 leading-relaxed">
            می‌خواهید داده‌های قبلی خود را بازیابی کنید یا از صفر شروع کنید؟
          </p>
        </div>

        <div className="space-y-3 mb-5 max-h-[40vh] overflow-y-auto">
          {showList.map(backup => (
            <BackupCard
              key={backup.filename}
              backup={backup}
              onSelect={() => handleSelect(backup)}
            />
          ))}

          {!showAll && older.length > 0 && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full text-xs text-indigo-600 dark:text-indigo-400 hover:underline py-2"
            >
              نمایش {older.length} بکاپ قدیمی‌تر
            </button>
          )}
        </div>

        <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleSkip}
            className="w-full py-3 text-sm text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl"
          >
            شروع از صفر (بدون بازیابی)
          </button>
        </div>
      </Shell>
    );
  }

  // ═══ Password ═══
  if (screen === 'password' && selected) {
    return (
      <Shell>
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold mb-3">
            <Lock className="w-3.5 h-3.5" />
            رمزنگاری‌شده
          </div>
          <h2 className="font-bold text-lg mb-1">رمز فایل بکاپ</h2>
          <p className="text-xs opacity-60 leading-relaxed">
            این فایل با رمزنگاری محافظت شده. برای بازیابی، رمز را وارد کنید.
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && password && handleRestore()}
              placeholder="رمز بکاپ..."
              className="w-full p-4 pl-12 text-sm border-2 rounded-xl bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-indigo-500 outline-none"
              dir="ltr"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-black/5"
            >
              {showPassword ? <Unlock className="w-4 h-4 opacity-60" /> : <Lock className="w-4 h-4 opacity-60" />}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs leading-relaxed">
              <AlertTriangle className="w-4 h-4 inline ml-1" /> {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setScreen('list'); setSelected(null); setError(''); }}
              className="flex-1 py-3 text-sm hover:bg-black/5 dark:hover:bg-white/10 rounded-xl"
            >
              بازگشت
            </button>
            <button
              onClick={handleRestore}
              disabled={busy || !password}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {busy ? 'در حال...' : 'بازیابی'}
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  // ═══ Restore confirm ═══
  if (screen === 'restore' && selected) {
    return (
      <Shell>
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold mb-3">
            <ArrowRight className="w-3.5 h-3.5" />
            آماده بازیابی
          </div>
          <h2 className="font-bold text-lg mb-1">بازیابی بکاپ</h2>
          <p className="text-xs opacity-60 leading-relaxed">
            داده‌های این بکاپ بازیابی می‌شوند:
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-5 space-y-2 text-sm">
          <StatRow icon={Calendar} label="تاریخ" value={formatBackupDate(selected.mtime)} />
          <StatRow icon={HardDrive} label="حجم" value={formatSize(selected.size)} />
          {selected.appVersion && (
            <StatRow icon={Package} label="نسخه" value={selected.appVersion} />
          )}
          {selected.stats && (
            <>
              <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
              <StatRow icon={Users} label="مشتریان" value={selected.stats.contacts || 0} />
              <StatRow icon={Package} label="کالاها" value={selected.stats.products || 0} />
              <StatRow icon={Receipt} label="فاکتورها" value={selected.stats.invoices || 0} />
              <StatRow icon={Wallet} label="پرداخت‌ها" value={selected.stats.payments || 0} />
            </>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs mb-4">
            <AlertTriangle className="w-4 h-4 inline ml-1" /> {error}
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={handleRestore}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {busy ? 'در حال بازیابی...' : 'بله، بازیابی کن'}
          </button>
          <button
            onClick={() => { setScreen('list'); setSelected(null); setError(''); }}
            disabled={busy}
            className="w-full py-3 text-sm text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl"
          >
            بازگشت
          </button>
        </div>
      </Shell>
    );
  }

  // ═══ Success ═══
  if (screen === 'success') {
    return (
      <Shell>
        <div className="text-center py-8">
          <div className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 items-center justify-center mb-4 shadow-2xl shadow-emerald-500/30">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-bold text-xl mb-2">بازیابی موفق!</h2>
          <p className="text-xs opacity-60 mb-4">در حال بارگذاری اپ...</p>
          <Loader2 className="w-5 h-5 text-emerald-500 animate-spin mx-auto" />
        </div>
      </Shell>
    );
  }

  return null;
};

/* ═══ اجزای کمکی ═══ */

const BackupCard: React.FC<{ backup: DiscoveredBackup; onSelect: () => void }> = ({ backup, onSelect }) => {
  const stats = backup.stats || {};
  const isRecent = Date.now() - (backup.mtime > 10000000000 ? backup.mtime : backup.mtime * 1000) < 7 * 24 * 60 * 60 * 1000;

  return (
    <button
      onClick={onSelect}
      className="w-full text-right p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:shadow-lg transition-all group"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isRecent ? 'bg-emerald-500/10' : 'bg-indigo-500/10'}`}>
          <FileText className={`w-5 h-5 ${isRecent ? 'text-emerald-600' : 'text-indigo-500'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-sm truncate">{backup.filename}</span>
            {backup.encrypted && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold inline-flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> رمزنگاری
              </span>
            )}
          </div>
          <div className="text-[11px] opacity-60 flex flex-wrap gap-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatBackupDate(backup.mtime)}
            </span>
            <span>{formatSize(backup.size)}</span>
          </div>
        </div>
        <ChevronLeft className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:text-indigo-500 transition-all" />
      </div>

      {stats && Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-4 gap-2 text-[10px] opacity-70">
          {stats.contacts > 0 && <MiniStat label="مشتری" value={stats.contacts} />}
          {stats.products > 0 && <MiniStat label="کالا" value={stats.products} />}
          {stats.invoices > 0 && <MiniStat label="فاکتور" value={stats.invoices} />}
          {stats.payments > 0 && <MiniStat label="پرداخت" value={stats.payments} />}
        </div>
      )}
    </button>
  );
};

const MiniStat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 text-center">
    <div className="font-bold">{value}</div>
    <div className="text-[9px] opacity-60">{label}</div>
  </div>
);

const StatRow: React.FC<{ icon: any; label: string; value: any }> = ({ icon: Icon, label, value }) => (
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-2 opacity-70">
      <Icon className="w-3.5 h-3.5" />
      <span className="text-xs">{label}</span>
    </div>
    <span className="text-sm font-bold">{value}</span>
  </div>
);

const Shell: React.FC<{ children: React.ReactNode; wide?: boolean }> = ({ children, wide }) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-950 dark:to-slate-900" dir="rtl">
    <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8`}>
      {children}
      <p className="mt-4 text-center text-[10px] opacity-30">نسخه {APP_VERSION}</p>
    </div>
  </div>
);

export default BackupDiscoveryScreen;
