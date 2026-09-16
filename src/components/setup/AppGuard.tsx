import React, { useState, useEffect } from 'react';
import { ModeSelection } from './ModeSelection';
import { AuthGuard } from './AuthGuard';
import { LockScreen } from '../security/LockScreen';
import { BackupDiscoveryScreen } from './BackupDiscoveryScreen';
import { getMode } from '../../lib/server/mode';
import { serverClient } from '../../lib/server/server-client';
import { isLockEnabled, checkStartupLock } from '../../lib/security/lock-service';
import { shouldSuggestBackup } from '../../lib/backup/discovery';
import { isCapacitor } from '../../lib/backup/filesystem';

interface Props {
  children: React.ReactNode;
}

const SETUP_KEY = 'divan_setup_completed';

export const AppGuard: React.FC<Props> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [needsBackupCheck, setNeedsBackupCheck] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [needsUnlock, setNeedsUnlock] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    const setupDone = localStorage.getItem(SETUP_KEY);

    // ═══ ۱. اولین بار (setup کامل نشده) ═══
    if (setupDone !== 'true') {
      // اگر در APK هستیم و بکاپ‌ها پیشنهاد داده نشده → صفحه بازیابی
      if (isCapacitor() && shouldSuggestBackup()) {
        setNeedsBackupCheck(true);
        setChecking(false);
        return;
      }

      // در غیر این صورت → انتخاب حالت
      setNeedsSetup(true);
      setChecking(false);
      return;
    }

    // ═══ ۲. حالت سرور و وارد نشده → Login ═══
    const mode = getMode();
    if (mode === 'server' && !serverClient.isAuthenticated) {
      setNeedsLogin(true);
      setChecking(false);
      return;
    }

    // ═══ ۳. قفل محلی فعال و بسته → LockScreen ═══
    if (isLockEnabled() && checkStartupLock()) {
      setNeedsUnlock(true);
      setChecking(false);
      return;
    }

    // ═══ ۴. همه چیز OK ═══
    setReady(true);
    setChecking(false);
  };

  // بعد از بازیابی بکاپ موفق → setup را کامل شده در نظر بگیر
  const handleBackupComplete = () => {
    localStorage.setItem(SETUP_KEY, 'true');
    setNeedsBackupCheck(false);

    // اگر بعد از بازیابی، حالت سرور بود و login لازم → Login
    const mode = getMode();
    if (mode === 'server' && !serverClient.isAuthenticated) {
      setNeedsLogin(true);
      return;
    }

    setReady(true);
    // reload کن تا داده‌های بازیابی‌شده بارگذاری شوند
    setTimeout(() => window.location.reload(), 300);
  };

  // بعد از رد کردن بکاپ → برو به setup معمولی
  const handleBackupSkip = () => {
    setNeedsBackupCheck(false);
    setNeedsSetup(true);
  };

  const handleSetupComplete = () => {
    localStorage.setItem(SETUP_KEY, 'true');
    setNeedsSetup(false);

    const mode = getMode();
    if (mode === 'server' && !serverClient.isAuthenticated) {
      setNeedsLogin(true);
    } else if (isLockEnabled() && checkStartupLock()) {
      setNeedsUnlock(true);
    } else {
      setReady(true);
    }
  };

  const handleLoginComplete = () => {
    setNeedsLogin(false);

    if (isLockEnabled() && checkStartupLock()) {
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

  // ═══ ۱. بازیابی بکاپ ═══
  if (needsBackupCheck) {
    return (
      <BackupDiscoveryScreen
        onComplete={handleBackupComplete}
        onSkip={handleBackupSkip}
      />
    );
  }

  // ═══ ۲. Setup اولیه ═══
  if (needsSetup) {
    return <ModeSelection onComplete={handleSetupComplete} />;
  }

  // ═══ ۳. Login سرور ═══
  if (needsLogin) {
    return <ModeSelection onComplete={handleLoginComplete} />;
  }

  // ═══ ۴. قفل محلی ═══
  if (needsUnlock) {
    return <LockScreen onUnlock={handleUnlockComplete} />;
  }

  // ═══ ۵. همه چیز OK ═══
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
