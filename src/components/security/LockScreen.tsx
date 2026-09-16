import React, { useState, useEffect } from 'react';
import { Lock, AlertTriangle, Check } from 'lucide-react';
import { PINPad } from './PINPad';
import { PatternLock } from './PatternLock';
import {
  getLockInfo, unlockWithSecret, unlockBiometric,
  verifyRecoveryCode, resetLockWithRecoveryCode,
  wipeAllAndReset, hasRecoveryInfo,
} from '../../lib/security/lock-service';
import { formatRecoveryCode, normalizeRecoveryCode } from '../../lib/security/recovery-code';
import { checkBiometricAvailability } from '../../lib/server/biometric';
import { APP_VERSION } from '../../lib/update-service';

interface Props {
  onUnlock: () => void;
}

type Screen = 'main' | 'recovery' | 'reset';

export const LockScreen: React.FC<Props> = ({ onUnlock }) => {
  const [screen, setScreen] = useState<Screen>('main');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [bioAvail, setBioAvail] = useState<'fingerprint' | 'face' | 'iris' | 'none'>('none');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newSecret, setNewSecret] = useState('');
  const [newSecretConfirm, setNewSecretConfirm] = useState('');
  const [resetError, setResetError] = useState('');

  const info = getLockInfo();

  useEffect(() => {
    (async () => {
      const avail = await checkBiometricAvailability();
      if (avail.available) setBioAvail(avail.type);
    })();
  }, []);

  const handleUnlock = async (secret: string) => {
    setError('');
    setBusy(true);
    const result = await unlockWithSecret(secret);
    setBusy(false);
    if (result.success) {
      onUnlock();
    } else {
      setError(result.error || 'رمز اشتباه');
    }
  };

  const handleBiometric = async () => {
    setError('');
    const result = await unlockBiometric();
    if (result.success) {
      onUnlock();
    } else {
      setError(result.error || 'خطا');
    }
  };

  const handleRecoveryVerify = async () => {
    setResetError('');
    setBusy(true);
    const ok = await verifyRecoveryCode(recoveryCode);
    setBusy(false);
    if (!ok) {
      setResetError('کد بازیابی اشتباه است');
      return;
    }
    setScreen('reset');
  };

  const handleReset = async () => {
    if (newSecret.length < 4) {
      setResetError('رمز جدید حداقل ۴ کاراکتر');
      return;
    }
    if (newSecret !== newSecretConfirm) {
      setResetError('رمز و تأیید آن یکسان نیست');
      return;
    }
    setResetError('');
    setBusy(true);
    const method = info.method === 'pattern' ? 'pin' : info.method;
    const result = await resetLockWithRecoveryCode(recoveryCode, newSecret, method as any);
    setBusy(false);
    if (result.success) {
      onUnlock();
    } else {
      setResetError(result.error || 'خطا');
    }
  };

  const handleWipe = () => {
    if (!confirm('⚠️ هشدار: تمام داده‌ها پاک می‌شوند. مطمئنید؟')) return;
    if (!confirm('آخرین تأیید — همه چیز حذف می‌شود. ادامه؟')) return;
    wipeAllAndReset();
  };

  if (screen === 'main') {
    return (
      <Shell>
        <div className="text-center mb-6">
          <div className="inline-flex w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 items-center justify-center shadow-2xl shadow-indigo-500/30 mb-3">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-lg font-bold">دیوان</h1>
          <p className="text-xs opacity-50 mt-0.5">قفل فعال</p>
        </div>

        {info.method === 'pattern' ? (
          <PatternLock onComplete={handleUnlock} />
        ) : (
          <PINPad
            mode={info.method === 'password' ? 'password' : 'pin'}
            onSubmit={handleUnlock}
            error={error}
            hint={info.hint}
            biometricType={bioAvail}
            onBiometric={bioAvail !== 'none' ? handleBiometric : undefined}
            onForgot={() => { setScreen('recovery'); setError(''); }}
          />
        )}

        {info.method === 'pattern' && (
          <div className="mt-4 text-center space-y-2">
            {error && (
              <div className="text-rose-600 text-sm font-medium p-2 rounded-lg bg-rose-500/10">{error}</div>
            )}
            <button
              onClick={() => { setScreen('recovery'); setError(''); }}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              رمز را فراموش کرده‌اید؟
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-[10px] opacity-30">نسخه {APP_VERSION}</p>
      </Shell>
    );
  }

  if (screen === 'recovery') {
    if (!hasRecoveryInfo()) {
      return (
        <Shell>
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h2 className="font-bold mb-2">کد بازیابی وجود ندارد</h2>
            <p className="text-xs opacity-60 mb-6 leading-relaxed">
              در این نسخه کد بازیابی ساخته نشده. تنها راه، پاک کردن همه داده‌هاست.
            </p>
            <button
              onClick={handleWipe}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl mb-2"
            >
              پاک کردن همه داده‌ها
            </button>
            <button
              onClick={() => setScreen('main')}
              className="w-full py-3 text-sm hover:bg-black/5 dark:hover:bg-white/10 rounded-xl"
            >
              بازگشت
            </button>
          </div>
        </Shell>
      );
    }

    return (
      <Shell>
        <div className="mb-4">
          <h2 className="font-bold text-lg mb-1">بازیابی با کد</h2>
          <p className="text-xs opacity-60 leading-relaxed">
            کد بازیابی ۱۶ کاراکتری که هنگام فعال‌سازی ذخیره کردید را وارد کنید.
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={recoveryCode}
            onChange={(e) => setRecoveryCode(formatRecoveryCode(e.target.value))}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            className="w-full p-4 text-center text-lg border-2 rounded-2xl bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-indigo-500 outline-none tracking-widest font-mono"
            dir="ltr"
            autoFocus
          />

          {resetError && (
            <div className="text-rose-600 text-sm font-medium text-center p-2 rounded-lg bg-rose-500/10">
              {resetError}
            </div>
          )}

          <button
            onClick={handleRecoveryVerify}
            disabled={busy || normalizeRecoveryCode(recoveryCode).length !== 16}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl"
          >
            {busy ? 'در حال بررسی...' : 'تأیید کد'}
          </button>

          <button
            onClick={() => { setScreen('main'); setResetError(''); }}
            className="w-full py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/10 rounded-xl"
          >
            بازگشت
          </button>

          <button
            onClick={handleWipe}
            className="w-full text-xs text-rose-500 hover:text-rose-700 pt-4"
          >
            کد را ندارم — پاک کردن همه داده‌ها
          </button>
        </div>
      </Shell>
    );
  }

  if (screen === 'reset') {
    return (
      <Shell>
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-3">
            <Check className="w-3.5 h-3.5" />
            کد تأیید شد
          </div>
          <h2 className="font-bold text-lg mb-1">رمز جدید</h2>
          <p className="text-xs opacity-60">یک رمز جدید انتخاب کنید.</p>
        </div>

        <div className="space-y-3">
          <input
            type="password"
            value={newSecret}
            onChange={(e) => setNewSecret(e.target.value)}
            placeholder="رمز جدید"
            className="w-full p-3.5 text-sm border-2 rounded-xl bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-indigo-500 outline-none"
            dir="ltr"
          />
          <input
            type="password"
            value={newSecretConfirm}
            onChange={(e) => setNewSecretConfirm(e.target.value)}
            placeholder="تأیید رمز"
            className="w-full p-3.5 text-sm border-2 rounded-xl bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-indigo-500 outline-none"
            dir="ltr"
          />

          {resetError && (
            <div className="text-rose-600 text-sm font-medium text-center p-2 rounded-lg bg-rose-500/10">
              {resetError}
            </div>
          )}

          <button
            onClick={handleReset}
            disabled={busy}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl"
          >
            {busy ? 'در حال ذخیره...' : 'ذخیره و باز کردن'}
          </button>
        </div>
      </Shell>
    );
  }

  return null;
};

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900" dir="rtl">
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8">
      {children}
    </div>
  </div>
);

export default LockScreen;
