import React, { useState, useEffect } from 'react';
import { ModeSelection } from './ModeSelection';
import { getMode } from '../../lib/server/mode';
import { serverClient } from '../../lib/server/server-client';

interface Props {
  children: React.ReactNode;
}

const SETUP_KEY = 'divan_setup_completed';

export const AppGuard: React.FC<Props> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    // ۱. چک کن قبلاً setup شده
    const setupDone = localStorage.getItem(SETUP_KEY);
    if (setupDone === 'true') {
      // ولی اگر حالت سرور است و توکن ندارد → باید دوباره login کند
      const mode = getMode();
      if (mode === 'server' && !serverClient.isAuthenticated) {
        setNeedsSetup(true);
      } else {
        setReady(true);
      }
      setChecking(false);
      return;
    }

    // ۲. اگر تاگل setup کامل نشده → نمایش صفحه انتخاب
    setNeedsSetup(true);
    setChecking(false);
  };

  const handleComplete = () => {
    localStorage.setItem(SETUP_KEY, 'true');
    setNeedsSetup(false);
    setReady(true);
  };

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

  if (needsSetup) {
    return <ModeSelection onComplete={handleComplete} />;
  }

  return <>{children}</>;
};

export default AppGuard;
