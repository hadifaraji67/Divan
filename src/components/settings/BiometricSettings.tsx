import React, { useState, useEffect } from 'react';
import { Fingerprint, Scan, Check, AlertTriangle, Shield, Info, Loader2 } from 'lucide-react';
import {
  checkBiometricAvailability,
  enableBiometric,
  disableBiometric,
  isBiometricEnabled,
  isCapacitor,
  type BiometricAvailability,
} from '../../lib/server/biometric';
import { serverClient } from '../../lib/server/server-client';
import { notify } from '../../lib/toast';

export const BiometricSettings: React.FC = () => {
  const [avail, setAvail] = useState<BiometricAvailability | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    (async () => {
      const a = await checkBiometricAvailability();
      setAvail(a);
      setEnabled(isBiometricEnabled());
    })();
  }, []);

  const handleEnable = async () => {
    if (!password) {
      notify.warning('رمز عبور را وارد کنید');
      return;
    }

    const user = serverClient.getUser();
    if (!user) {
      notify.error('ابتدا به حساب وارد شوید');
      return;
    }

    setBusy(true);
    try {
      // تست رمز با login
      await serverClient.login(user.username, password);
      const ok = await enableBiometric(user.username, password);

      if (ok) {
        notify.success('ورود بیومتریک فعال شد');
        setEnabled(true);
        setShowSetup(false);
        setPassword('');
      } else {
        notify.error('فعال‌سازی ناموفق');
      }
    } catch (err: any) {
      notify.error(err.message || 'رمز عبور اشتباه است');
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm('ورود بیومتریک غیرفعال شود؟')) return;
    setBusy(true);
    try {
      await disableBiometric();
      setEnabled(false);
      notify.success('غیرفعال شد');
    } finally {
      setBusy(false);
    }
  };

  if (!isCapacitor()) {
    return (
      <div className="rounded-2xl border bg-white dark:bg-slate-900/50 p-4" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm mb-1">ورود بیومتریک</h3>
            <p className="text-xs opacity-60 leading-relaxed">
              این قابلیت فقط در <b>اپلیکیشن اندروید</b> کار می‌کند.
              از Google Play یا GitHub Releases نصب کن.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!avail?.available) {
    return (
      <div className="rounded-2xl border bg-white dark:bg-slate-900/50 p-4" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center shrink-0">
            <Fingerprint className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <h3 className="font-bold text-sm mb-1">ورود بیومتریک</h3>
            <p className="text-xs opacity-60 leading-relaxed">
              {avail?.reason || 'در این دستگاه قابل استفاده نیست'}
            </p>
            <p className="text-[11px] opacity-50 mt-2">
              برای فعال‌سازی، از تنظیمات گوشی → امنیت → اثر انگشت / چهره را اضافه کن
            </p>
          </div>
        </div>
      </div>
    );
  }

  const Icon = avail.type === 'face' ? Scan : Fingerprint;
  const typeLabel = avail.type === 'face' ? 'چهره' : avail.type === 'iris' ? 'چشم' : 'اثر انگشت';

  return (
    <div className="rounded-2xl border bg-white dark:bg-slate-900/50 overflow-hidden" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-black/[0.02] dark:bg-white/[0.02]" style={{ borderColor: 'inherit' }}>
        <div className={`p-1.5 rounded-lg ${enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold">ورود با {typeLabel}</h3>
        {enabled && (
          <span className="mr-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 font-bold">
            فعال
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
          <Shield className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed opacity-80">
            با فعال‌سازی، دفعه بعد بدون وارد کردن رمز وارد می‌شوید.
            رمز شما در <b>Keychain امن اندروید</b> ذخیره می‌شود.
          </div>
        </div>

        {!enabled && !showSetup && (
          <button
            onClick={() => setShowSetup(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl"
          >
            <Icon className="w-4 h-4" />
            فعال‌سازی
          </button>
        )}

        {!enabled && showSetup && (
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs opacity-60 block mb-1">برای تأیید، رمز عبور را وارد کنید</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEnable()}
                placeholder="••••••••"
                className="w-full p-3 border-2 rounded-xl text-sm bg-white dark:bg-slate-900 focus:border-emerald-500 outline-none"
                dir="ltr"
                autoFocus
              />
            </label>

            <div className="flex gap-2">
              <button
                onClick={() => { setShowSetup(false); setPassword(''); }}
                disabled={busy}
                className="flex-1 px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/10 rounded-xl"
              >
                لغو
              </button>
              <button
                onClick={handleEnable}
                disabled={busy || !password}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {busy ? 'در حال...' : 'فعال کن'}
              </button>
            </div>
          </div>
        )}

        {enabled && (
          <button
            onClick={handleDisable}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
            غیرفعال کردن
          </button>
        )}
      </div>
    </div>
  );
};

export default BiometricSettings;
