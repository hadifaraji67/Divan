import React, { useState, useEffect } from 'react';
import { ModeSelection } from './ModeSelection';
import { AuthGuard } from './AuthGuard';
import { LockScreen } from '../security/LockScreen';
import { getMode } from '../../lib/server/mode';
import { serverClient } from '../../lib/server/server-client';
import { isLockEnabled, isLocked, checkStartupLock } from '../../lib/security/lock-service';

interface Props {
  children: React.ReactNode;
}

const SETUP_KEY = 'divan_setup_completed';

export const AppGuard: React.FC<Props> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [needsUnlock, setNeedsUnlock] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    const setupDone = localStorage.getItem(SETUP_KEY);

    // ۱. اولین بار → انتخاب حالت
    if (setupDone !== 'true') {
      setNeedsSetup(true);
      setChecking(false);
      return;
    }

    // ۲. حالت سرور و وارد نشده → Login
    const mode = getMode();
    if (mode === 'server' && !serverClient.isAuthenticated) {
      setNeedsLogin(true);
      setChecking(false);
      return;
    }

    // ۳. قفل محلی فعال و بسته → صفحه قفل
    if (isLockEnabled() && checkStartupLock()) {
      setNeedsUnlock(true);
      setChecking(false);
      return;
    }

    // ۴. همه چیز OK
    setReady(true);
    setChecking(false);
  };

  const handleSetupComplete = () => {
    localStorage.setItem(SETUP_KEY, 'true');
    setNeedsSetup(false);

    // بعد از setup، چک کن مرحله بعد چیست
    const mode = getMode();
    if (mode === 'server' && !serverClient.isAuthenticated) {
      setNeedsLogin(true);
    } else if (isLockEnabled() && isLocked()) {
      setNeedsUnlock(true);
    } else {
      setReady(true);
    }
  };

  const handleLoginComplete = () => {
    setNeedsLogin(false);

    // بعد از login، چک کن قفل محلی هست یا نه
    if (isLockEnabled() && isLocked()) {
      setNeedsUnlock(true);
    } else {
      setReady(true);
    }
  };

  const handleUnlockComplete = () => {
    setNeedsUnlock(false);
    setReady(true);
  };

  // ═══ صفحه بارگذاری ═══
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-2xl shadow-indigo-500/30 animate-pulse">
            د
          </div>
          <div className="text-sm opacity-60">در حال بارگذاری...</div>
        </div>
      </div>
    );
  }

  // ═══ ۱. Setup اولیه ═══
  if (needsSetup) {
    return <ModeSelection onComplete={handleSetupComplete} />;
  }

  // ═══ ۲. Login سرور ═══
  if (needsLogin) {
    return <ModeSelection onComplete={handleLoginComplete} />;
  }

  // ═══ ۳. قفل محلی ═══
  if (needsUnlock) {
    return <LockScreen onUnlock={handleUnlockComplete} />;
  }

  // ═══ ۴. همه چیز OK ═══
  return (
    <AuthGuard onNeedLogin={() => {
      setReady(false);
      setNeedsLogin(true);
    }}>
      {ready ? children : null}
    </AuthGuard>
  );
};

export default AppGuard;
