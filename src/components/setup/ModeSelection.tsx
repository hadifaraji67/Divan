import React, { useState } from 'react';
import {
  Smartphone, Server, ChevronLeft, Check, Loader2,
  Wifi, AlertTriangle, Shield, Info,
} from 'lucide-react';
import { serverClient } from '../../lib/server/server-client';
import { setMode } from '../../lib/server/mode';
import { notify } from '../../lib/toast';
import { APP_VERSION } from '../../lib/update-service';
import { BiometricButton } from './BiometricButton';
import { enableBiometric, checkBiometricAvailability, isBiometricEnabled, isCapacitor } from '../../lib/server/biometric';

interface Props { onComplete: () => void; }
type Screen = 'choice' | 'server-config' | 'server-login' | 'server-setup';

export const ModeSelection: React.FC<Props> = ({ onComplete }) => {
  const [screen, setScreen] = useState<Screen>('choice');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [serverUrl, setServerUrl] = useState('http://192.168.1.100:4000');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);

  const handleLocalMode = () => {
    setMode('local');
    notify.success('حالت مستقل انتخاب شد');
    onComplete();
  };

  const testConnection = async () => {
    if (!serverUrl.trim()) { setError('آدرس سرور لازم است'); return; }
    setBusy(true); setError('');
    try {
      serverClient.setUrl(serverUrl.trim());
      const health = await serverClient.health();
      if (health.status === 'healthy') {
        notify.success('اتصال به سرور موفق');
        const needs = await serverClient.needsSetup();
        setScreen(needs ? 'server-setup' : 'server-login');
      } else setError('سرور در دسترس نیست');
    } catch (err: any) {
      setError(err?.message || 'خطا در اتصال به سرور');
      serverClient.setUrl('');
    } finally { setBusy(false); }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password) { setError('نام کاربری و رمز عبور لازم است'); return; }
    setBusy(true); setError('');
    try {
      await serverClient.login(username.trim(), password);
      setMode('server');
      notify.success('ورود موفق');

      // اگر بیومتریک در دسترس است و قبلاً فعال نشده → پیشنهاد بده
      if (isCapacitor() && !isBiometricEnabled()) {
        const avail = await checkBiometricAvailability();
        if (avail.available) {
          setShowBiometricPrompt(true);
          setBusy(false);
          return;
        }
      }

      onComplete();
    } catch (err: any) { setError(err?.message || 'خطا در ورود'); }
    finally { setBusy(false); }
  };

  const handleEnableBiometric = async () => {
    setBusy(true);
    try {
      const ok = await enableBiometric(username.trim(), password);
      if (ok) {
        notify.success('ورود بیومتریک فعال شد');
      } else {
        notify.warning('فعال‌سازی بیومتریک ناموفق بود');
      }
    } catch (err: any) {
      notify.error(err.message);
    } finally {
      setBusy(false);
      setShowBiometricPrompt(false);
      onComplete();
    }
  };

  const handleSkipBiometric = () => {
    setShowBiometricPrompt(false);
    onComplete();
  };

  const handleSetup = async () => {
    if (!username.trim() || !password) { setError('نام کاربری و رمز عبور لازم است'); return; }
    if (password.length < 4) { setError('رمز عبور حداقل ۴ کاراکتر'); return; }
    setBusy(true); setError('');
    try {
      await serverClient.setup(username.trim(), password, fullName || username);
      setMode('server');
      notify.success('حساب مدیر ساخته شد');
      onComplete();
    } catch (err: any) { setError(err?.message || 'خطا در راه‌اندازی'); }
    finally { setBusy(false); }
  };

  if (screen === 'choice') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-950 dark:to-slate-900" dir="rtl">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 items-center justify-center shadow-2xl shadow-indigo-500/30 mb-4">
              <span className="text-4xl font-bold text-white">د</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">به دیوان خوش آمدید</h1>
            <p className="text-sm opacity-60">حالت استفاده خود را انتخاب کنید</p>
            <p className="text-[11px] opacity-40 mt-1">نسخه {APP_VERSION}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={handleLocalMode} className="group p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-500 hover:shadow-xl transition-all text-right">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">مستقل</h3>
              <p className="text-xs opacity-60 leading-relaxed mb-4">داده‌ها فقط روی این دستگاه ذخیره می‌شوند. بدون نیاز به اینترنت یا سرور.</p>
              <div className="space-y-1.5 text-[11px]">
                <Feature text="کاملاً آفلاین" />
                <Feature text="بدون نیاز به راه‌اندازی" />
                <Feature text="فقط این دستگاه" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600 group-hover:gap-3 transition-all">
                شروع <ChevronLeft className="w-3.5 h-3.5" />
              </div>
            </button>
            <button onClick={() => setScreen('server-config')} className="group p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-500 hover:shadow-xl transition-all text-right">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                <Server className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">اتصال به سرور</h3>
              <p className="text-xs opacity-60 leading-relaxed mb-4">داده‌ها روی سرور شما ذخیره می‌شوند. قابل دسترسی از چند دستگاه.</p>
              <div className="space-y-1.5 text-[11px]">
                <Feature text="چند دستگاه" />
                <Feature text="چند کاربر" />
                <Feature text="همگام‌سازی خودکار" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-600 group-hover:gap-3 transition-all">
                پیکربندی <ChevronLeft className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
          <div className="mt-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div><b>نکته:</b> می‌توانید بعداً از تنظیمات، حالت را تغییر دهید.</div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'server-config') {
    return (
      <Shell title="اتصال به سرور" onBack={() => setScreen('choice')}>
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex items-start gap-2 text-xs">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed opacity-80">آدرس سرور دیوان را وارد کنید.</div>
          </div>
          <label className="block">
            <span className="text-xs opacity-70 block mb-1 font-medium">آدرس سرور *</span>
            <input type="text" value={serverUrl} onChange={(e) => { setServerUrl(e.target.value); setError(''); }}
              placeholder="http://192.168.1.100:4000"
              className="w-full p-3 border-2 rounded-xl text-sm bg-white dark:bg-slate-900 focus:border-indigo-500 outline-none" dir="ltr" autoFocus />
          </label>
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><div>{error}</div>
            </div>
          )}
          <button onClick={testConnection} disabled={busy || !serverUrl.trim()}
            className="w-full flex items-center justify-center gap-2 p-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl">
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال اتصال...</> : <><Wifi className="w-4 h-4" /> تست اتصال</>}
          </button>
        </div>
      </Shell>
    );
  }

  if (screen === 'server-login') {
    return (
      <Shell title="ورود به سرور" onBack={() => setScreen('server-config')}>
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
            <Check className="w-4 h-4 shrink-0" />
            <div>اتصال به <b dir="ltr" className="font-mono">{serverClient.url}</b></div>
          </div>
          <label className="block">
            <span className="text-xs opacity-70 block mb-1 font-medium">نام کاربری *</span>
            <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setError(''); }}
              placeholder="admin" className="w-full p-3 border-2 rounded-xl text-sm bg-white dark:bg-slate-900 focus:border-indigo-500 outline-none" dir="ltr" autoFocus />
          </label>
          <label className="block">
            <span className="text-xs opacity-70 block mb-1 font-medium">رمز عبور *</span>
            <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="••••••••"
              className="w-full p-3 border-2 rounded-xl text-sm bg-white dark:bg-slate-900 focus:border-indigo-500 outline-none" dir="ltr" />
          </label>
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><div>{error}</div>
            </div>
          )}
          <button onClick={handleLogin} disabled={busy || !username || !password}
            className="w-full flex items-center justify-center gap-2 p-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl">
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال ورود...</> : <><Shield className="w-4 h-4" /> ورود</>}
          </button>

          <BiometricButton
            onSuccess={(u, p) => {
              setUsername(u);
              setPassword(p);
              // ورود خودکار
              setTimeout(() => handleLogin(), 100);
            }}
            onError={(e) => setError(e)}
          />
        </div>
      </Shell>
    );
  }

  if (showBiometricPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-950 dark:to-slate-900" dir="rtl">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-emerald-500/30">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-lg font-bold mb-2">فعال‌سازی ورود سریع</h2>
          <p className="text-sm opacity-60 leading-relaxed mb-6">
            آیا می‌خواهید دفعه بعد با اثر انگشت یا چهره وارد شوید؟
            نیازی به وارد کردن رمز نخواهد بود.
          </p>
          <div className="flex gap-2">
            <button onClick={handleSkipBiometric} disabled={busy}
              className="flex-1 px-4 py-3 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 rounded-xl">
              بعداً
            </button>
            <button onClick={handleEnableBiometric} disabled={busy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl">
              {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> فعال‌سازی...</> : <><Check className="w-4 h-4" /> فعال کن</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'server-setup') {
    return (
      <Shell title="راه‌اندازی اولیه" onBack={() => setScreen('server-config')}>
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">این سرور تازه نصب شده است. اولین حساب کاربری <b>مدیر</b> ساخته می‌شود.</div>
          </div>
          <label className="block">
            <span className="text-xs opacity-70 block mb-1 font-medium">نام کامل</span>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="مدیر سیستم"
              className="w-full p-3 border-2 rounded-xl text-sm bg-white dark:bg-slate-900 focus:border-indigo-500 outline-none" />
          </label>
          <label className="block">
            <span className="text-xs opacity-70 block mb-1 font-medium">نام کاربری *</span>
            <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setError(''); }}
              placeholder="admin" className="w-full p-3 border-2 rounded-xl text-sm bg-white dark:bg-slate-900 focus:border-indigo-500 outline-none" dir="ltr" autoFocus />
          </label>
          <label className="block">
            <span className="text-xs opacity-70 block mb-1 font-medium">رمز عبور * (حداقل ۴ کاراکتر)</span>
            <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSetup()} placeholder="••••••••"
              className="w-full p-3 border-2 rounded-xl text-sm bg-white dark:bg-slate-900 focus:border-indigo-500 outline-none" dir="ltr" />
          </label>
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><div>{error}</div>
            </div>
          )}
          <button onClick={handleSetup} disabled={busy || !username || !password}
            className="w-full flex items-center justify-center gap-2 p-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl">
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال راه‌اندازی...</> : <><Check className="w-4 h-4" /> ساخت حساب مدیر</>}
          </button>
        </div>
      </Shell>
    );
  }

  return null;
};

const Feature: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-1.5 opacity-70">
    <Check className="w-3 h-3 text-emerald-500" /><span>{text}</span>
  </div>
);

const Shell: React.FC<{ title: string; onBack: () => void; children: React.ReactNode }> = ({ title, onBack, children }) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-950 dark:to-slate-900" dir="rtl">
    <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold flex-1">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

export default ModeSelection;
