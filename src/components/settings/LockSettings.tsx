import React, { useState, useEffect } from 'react';
import {
  Lock, Unlock, Shield, Key, Fingerprint, Grid3x3, Type,
  Check, AlertTriangle, Eye, EyeOff, Copy, Loader2, X,
} from 'lucide-react';
import {
  getLockInfo, isLockEnabled, enableLock, disableLock, changeSecret,
  getRecoveryCreatedAt,
} from '../../lib/security/lock-service';
import type { LockMethod, AutoLockDelay } from '../../lib/security/lock-types';
import { checkBiometricAvailability, isCapacitor } from '../../lib/server/biometric';
import { notify } from '../../lib/toast';

export const LockSettings: React.FC = () => {
  const [enabled, setEnabled] = useState(isLockEnabled());
  const [info, setInfo] = useState(getLockInfo());
  const [bioAvail, setBioAvail] = useState<'fingerprint' | 'face' | 'iris' | 'none'>('none');
  const [showSetup, setShowSetup] = useState(false);
  const [showChange, setShowChange] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');

  const [method, setMethod] = useState<LockMethod>('pin');
  const [secret, setSecret] = useState('');
  const [confirm, setConfirm] = useState('');
  const [hint, setHint] = useState('');
  const [autoLock, setAutoLock] = useState<AutoLockDelay>(5);
  const [useBiometric, setUseBiometric] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const [oldSecret, setOldSecret] = useState('');
  const [newSecret, setNewSecret] = useState('');
  const [newConfirm, setNewConfirm] = useState('');

  useEffect(() => {
    (async () => {
      const avail = await checkBiometricAvailability();
      if (avail.available) setBioAvail(avail.type);
    })();
  }, []);

  const refresh = () => {
    setEnabled(isLockEnabled());
    setInfo(getLockInfo());
  };

  const handleEnable = async () => {
    setError('');
    if (secret.length < 4) { setError('رمز حداقل ۴ کاراکتر باشد'); return; }
    if (secret !== confirm) { setError('رمز و تأیید آن یکسان نیست'); return; }

    setBusy(true);
    const result = await enableLock(secret, method, {
      autoLockDelay: autoLock,
      hint: hint || undefined,
      biometricEnabled: useBiometric && bioAvail !== 'none',
    });
    setBusy(false);

    if (result.success) {
      setRecoveryCode(result.recoveryCode || '');
      setShowSetup(false);
      setShowRecovery(true);
      setSecret(''); setConfirm(''); setHint('');
      refresh();
      notify.success('قفل فعال شد');
    } else {
      setError(result.error || 'خطا');
    }
  };

  const handleDisable = async () => {
    const pwd = prompt('برای غیرفعال‌سازی، رمز فعلی را وارد کنید:');
    if (!pwd) return;

    setBusy(true);
    const result = await disableLock(pwd);
    setBusy(false);

    if (result.success) {
      notify.success('قفل غیرفعال شد');
      refresh();
    } else {
      notify.error(result.error || 'رمز اشتباه');
    }
  };

  const handleChange = async () => {
    setError('');
    if (newSecret.length < 4) { setError('رمز جدید حداقل ۴ کاراکتر'); return; }
    if (newSecret !== newConfirm) { setError('رمز و تأیید آن یکسان نیست'); return; }

    setBusy(true);
    const result = await changeSecret(oldSecret, newSecret);
    setBusy(false);

    if (result.success) {
      notify.success('رمز تغییر کرد');
      setShowChange(false);
      setOldSecret(''); setNewSecret(''); setNewConfirm('');
      refresh();
    } else {
      setError(result.error || 'خطا');
    }
  };

  const methodLabel = (m: LockMethod) => ({ pin: 'PIN', password: 'رمز عبور', pattern: 'الگو', biometric: 'بیومتریک' }[m] || m);
  const autoLockLabel = (d: AutoLockDelay) => {
    if (d === 'immediate') return 'فوری';
    if (d === 'never') return 'هرگز';
    return `${d} دقیقه`;
  };

  if (showRecovery && recoveryCode) {
    return (
      <div className="max-w-2xl mx-auto" dir="rtl">
        <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 p-5">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm mb-1">کد بازیابی — مهم!</h3>
              <p className="text-xs opacity-70 leading-relaxed">
                این کد را در جای امنی ذخیره کنید. اگر رمز را فراموش کنید، تنها راه بازیابی این کد است.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 mb-4 text-center">
            <div className="font-mono text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-widest" dir="ltr">
              {recoveryCode}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => { navigator.clipboard.writeText(recoveryCode); notify.success('کد کپی شد'); }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl"
            >
              <Copy className="w-4 h-4" /> کپی کد
            </button>
            <button
              onClick={() => {
                const text = `کد بازیابی دیوان:\n${recoveryCode}\n\nاین کد را ذخیره کنید.`;
                if (navigator.share) navigator.share({ title: 'کد بازیابی', text }).catch(() => {});
                else { navigator.clipboard.writeText(text); notify.success('کپی شد'); }
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-xl"
            >
              اشتراک‌گذاری
            </button>
          </div>

          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-400 mb-4 leading-relaxed">
            <b>هشدار:</b> این کد فقط یک بار نمایش داده می‌شود.
          </div>

          <button
            onClick={() => { setShowRecovery(false); setRecoveryCode(''); }}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl"
          >
            کد را ذخیره کردم
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4" dir="rtl">
      <div className={`rounded-2xl border p-5 ${enabled ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-teal-500/5' : 'border-slate-200 dark:border-slate-700'}`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${enabled ? 'bg-emerald-500/20' : 'bg-slate-500/10'}`}>
            {enabled ? <Lock className="w-6 h-6 text-emerald-600" /> : <Unlock className="w-6 h-6 text-slate-500" />}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1">{enabled ? 'قفل فعال است' : 'قفل غیرفعال است'}</h3>
            <p className="text-xs opacity-60 leading-relaxed mb-3">
              {enabled ? `روش: ${methodLabel(info.method)} — قفل خودکار: ${autoLockLabel(info.autoLockDelay)}` : 'با فعال‌سازی، هنگام باز کردن اپ باید رمز وارد کنید.'}
            </p>
            {!enabled ? (
              <button onClick={() => setShowSetup(true)} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg">
                <Lock className="w-3.5 h-3.5 inline ml-1" /> فعال‌سازی قفل
              </button>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowChange(true)} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg">
                  <Key className="w-3.5 h-3.5 inline ml-1" /> تغییر رمز
                </button>
                <button onClick={handleDisable} disabled={busy} className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg disabled:opacity-50">
                  <Unlock className="w-3.5 h-3.5 inline ml-1" /> غیرفعال‌سازی
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {enabled && getRecoveryCreatedAt() && (
        <div className="rounded-xl border p-3 text-xs flex items-center gap-2" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
          <Shield className="w-4 h-4 text-indigo-500" />
          <div className="flex-1">کد بازیابی ساخته شده در: <b>{new Date(getRecoveryCreatedAt()!).toLocaleDateString('fa-IR')}</b></div>
        </div>
      )}

      {showSetup && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg my-8" dir="rtl">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold">فعال‌سازی قفل</h3>
              <button onClick={() => { setShowSetup(false); setError(''); }} className="p-2 hover:bg-black/5 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs opacity-60 block mb-2 font-medium">روش قفل</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: 'pin', icon: Key, label: 'PIN' },
                    { v: 'password', icon: Type, label: 'رمز' },
                    { v: 'pattern', icon: Grid3x3, label: 'الگو' },
                  ].map(opt => {
                    const Icon = opt.icon;
                    const active = method === opt.v;
                    return (
                      <button key={opt.v} onClick={() => setMethod(opt.v as LockMethod)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${active ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700'}`}>
                        <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : 'opacity-60'}`} />
                        <span className={`text-xs ${active ? 'font-bold text-indigo-700 dark:text-indigo-400' : ''}`}>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block">
                <span className="text-xs opacity-60 block mb-1 font-medium">
                  {method === 'pattern' ? 'الگو (مثال: 0-1-2-5)' : 'رمز (حداقل ۴ کاراکتر)'}
                </span>
                <div className="relative">
                  <input type={showSecret ? 'text' : 'password'} value={secret}
                    onChange={(e) => { setSecret(e.target.value); setError(''); }}
                    placeholder={method === 'pattern' ? '0-1-2-5' : '••••'}
                    className="w-full p-3 border-2 rounded-xl text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-indigo-500 outline-none"
                    dir="ltr" />
                  <button type="button" onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-black/5">
                    {showSecret ? <EyeOff className="w-4 h-4 opacity-50" /> : <Eye className="w-4 h-4 opacity-50" />}
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="text-xs opacity-60 block mb-1 font-medium">تأیید رمز</span>
                <input type={showSecret ? 'text' : 'password'} value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                  className="w-full p-3 border-2 rounded-xl text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-indigo-500 outline-none"
                  dir="ltr" />
              </label>

              <label className="block">
                <span className="text-xs opacity-60 block mb-1 font-medium">راهنما (اختیاری)</span>
                <input value={hint} onChange={(e) => setHint(e.target.value)}
                  placeholder="راهنمای یادآوری رمز"
                  className="w-full p-3 border-2 rounded-xl text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-indigo-500 outline-none"
                  maxLength={50} />
              </label>

              <label className="block">
                <span className="text-xs opacity-60 block mb-1 font-medium">قفل خودکار پس از</span>
                <select value={String(autoLock)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setAutoLock(v === 'immediate' || v === 'never' ? v as AutoLockDelay : Number(v) as AutoLockDelay);
                  }}
                  className="w-full p-3 border-2 rounded-xl text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-indigo-500 outline-none">
                  <option value="immediate">فوری</option>
                  <option value="1">۱ دقیقه</option>
                  <option value="5">۵ دقیقه</option>
                  <option value="15">۱۵ دقیقه</option>
                  <option value="30">۳۰ دقیقه</option>
                  <option value="never">هرگز</option>
                </select>
              </label>

              {isCapacitor() && bioAvail !== 'none' && (
                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
                  <input type="checkbox" checked={useBiometric} onChange={(e) => setUseBiometric(e.target.checked)} />
                  <Fingerprint className="w-4 h-4 text-indigo-500" />
                  <div>
                    <div className="text-sm font-medium">فعال‌سازی {bioAvail === 'face' ? 'چهره' : 'اثر انگشت'}</div>
                    <div className="text-[11px] opacity-60">ورود سریع با بیومتریک</div>
                  </div>
                </label>
              )}

              {error && <div className="p-3 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs">{error}</div>}

              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => { setShowSetup(false); setError(''); }} className="px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 rounded-lg">لغو</button>
                <button onClick={handleEnable} disabled={busy}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {busy ? 'در حال...' : 'فعال‌سازی'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showChange && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-5" dir="rtl">
            <h3 className="font-bold mb-4">تغییر رمز</h3>
            <div className="space-y-3">
              <input type="password" value={oldSecret} onChange={(e) => { setOldSecret(e.target.value); setError(''); }}
                placeholder="رمز فعلی"
                className="w-full p-3 border-2 rounded-xl text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-indigo-500 outline-none"
                dir="ltr" />
              <input type="password" value={newSecret} onChange={(e) => { setNewSecret(e.target.value); setError(''); }}
                placeholder="رمز جدید"
                className="w-full p-3 border-2 rounded-xl text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-indigo-500 outline-none"
                dir="ltr" />
              <input type="password" value={newConfirm} onChange={(e) => { setNewConfirm(e.target.value); setError(''); }}
                placeholder="تأیید رمز جدید"
                className="w-full p-3 border-2 rounded-xl text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-indigo-500 outline-none"
                dir="ltr" />

              {error && <div className="p-3 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs">{error}</div>}

              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => { setShowChange(false); setError(''); setOldSecret(''); setNewSecret(''); setNewConfirm(''); }}
                  className="px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 rounded-lg">لغو</button>
                <button onClick={handleChange} disabled={busy}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  ذخیره
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LockSettings;
