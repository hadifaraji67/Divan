import React, { useState, useEffect } from 'react';
import { AlertTriangle, LogOut, RefreshCw, Fingerprint, Scan, Loader2 } from 'lucide-react';
import { getMode } from '../../lib/server/mode';
import { serverClient } from '../../lib/server/server-client';
import { notify } from '../../lib/toast';
import {
  checkBiometricAvailability,
  loginWithBiometric,
  isBiometricEnabled,
  type BiometricAvailability,
} from '../../lib/server/biometric';

interface Props {
  children: React.ReactNode;
  onNeedLogin: () => void;
}

export const AuthGuard: React.FC<Props> = ({ children, onNeedLogin }) => {
  const [checked, setChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [expired, setExpired] = useState(false);

  // بیومتریک
  const [bioAvail, setBioAvail] = useState<BiometricAvailability | null>(null);
  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);

  const check = () => {
    const mode = getMode();
    if (mode !== 'server') {
      setIsAuthed(true);
      setChecked(true);
      return;
    }
    const authed = serverClient.isAuthenticated;
    setIsAuthed(authed);
    setChecked(true);
  };

  // بررسی بیومتریک
  const checkBio = async () => {
    const a = await checkBiometricAvailability();
    setBioAvail(a);
    setBioEnabled(isBiometricEnabled());
  };

  useEffect(() => {
    check();
    checkBio();

    const handler = () => {
      setExpired(true);
      setIsAuthed(false);
      notify.error('نشست شما منقضی شده — لطفاً دوباره وارد شوید');
    };

    window.addEventListener('divan-auth-expired', handler);
    const timer = setInterval(check, 30000);

    return () => {
      window.removeEventListener('divan-auth-expired', handler);
      clearInterval(timer);
    };
  }, []);

  // ورود با بیومتریک
  const handleBiometricLogin = async () => {
    setBioBusy(true);
    try {
      const cred = await loginWithBiometric();
      if (!cred) {
        notify.warning('تأیید هویت ناموفق');
        setBioBusy(false);
        return;
      }

      // ورود با رمز خوانده‌شده از Keychain
      await serverClient.login(cred.username, cred.password);
      notify.success('ورود موفق');
      setExpired(false);
      setIsAuthed(true);
    } catch (err: any) {
      notify.error(err.message || 'خطا در ورود بیومتریک');
    } finally {
      setBioBusy(false);
    }
  };

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-950 dark:to-slate-900">
        <RefreshCw className="w-6 h-6 animate-spin opacity-40" />
      </div>
    );
  }

  if (!isAuthed) {
    const canUseBio = bioAvail?.available && bioEnabled;
    const BioIcon = bioAvail?.type === 'face' ? Scan : Fingerprint;
    const bioLabel = bioAvail?.type === 'face' ? 'ورود با چهره' : 'ورود با اثر انگشت';

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-950 dark:to-slate-900" dir="rtl">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 text-center">
          <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
            expired ? 'bg-amber-500/10' : 'bg-rose-500/10'
          }`}>
            {expired ? (
              <AlertTriangle className="w-7 h-7 text-amber-600" />
            ) : (
              <LogOut className="w-7 h-7 text-rose-600" />
            )}
          </div>

          <h2 className="text-lg font-bold mb-2">
            {expired ? 'نشست منقضی شده' : 'نیاز به ورود'}
          </h2>
          <p className="text-sm opacity-60 mb-6 leading-relaxed">
            {expired
              ? 'برای امنیت، نشست شما بسته شده. لطفاً دوباره وارد شوید.'
              : 'برای دسترسی به داده‌های سرور، باید وارد شوید.'}
          </p>

          <div className="space-y-2">
            {canUseBio && (
              <button
                onClick={handleBiometricLogin}
                disabled={bioBusy}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl"
              >
                {bioBusy ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> در حال تأیید...</>
                ) : (
                  <><BioIcon className="w-5 h-5" /> {bioLabel}</>
                )}
              </button>
            )}

            <button
              onClick={() => {
                setExpired(false);
                onNeedLogin();
              }}
              className={`w-full py-3 text-sm font-bold rounded-xl ${
                canUseBio
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              ورود با نام کاربری و رمز
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
