import React, { useState, useEffect } from 'react';
import { ModeSelection } from './ModeSelection';
import { AuthGuard } from './AuthGuard';
import { getMode } from '../../lib/server/mode';
import { serverClient } from '../../lib/server/server-client';

interface Props {
  children: React.ReactNode;
}

const SETUP_KEY = 'divan_setup_completed';

export const AppGuard: React.FC<Props> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    const setupDone = localStorage.getItem(SETUP_KEY);

    if (setupDone !== 'true') {
      // اولین بار → صفحه انتخاب حالت
      setNeedsSetup(true);
      setChecking(false);
      return;
    }

    // اگر حالت سرور است و وارد نشده → نیاز به login
    const mode = getMode();
    if (mode === 'server' && !serverClient.isAuthenticated) {
      setNeedsLogin(true);
      setChecking(false);
      return;
    }

    // همه چیز OK
    setReady(true);
    setChecking(false);
  };

  const handleComplete = () => {
    localStorage.setItem(SETUP_KEY, 'true');
    setNeedsSetup(false);
    setNeedsLogin(false);

    // اگر حالت سرور و وارد شده → ready
    const mode = getMode();
    if (mode === 'server' && !serverClient.isAuthenticated) {
      setNeedsLogin(true);
    } else {
      setReady(true);
    }
  };

  const handleLoginComplete = () => {
    setNeedsLogin(false);
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

  // ۱. نیاز به setup (اولین بار)
  if (needsSetup) {
    return <ModeSelection onComplete={handleComplete} />;
  }

  // ۲. نیاز به login (حالت سرور بدون توکن)
  if (needsLogin) {
    return (
      <ModeSelection onComplete={handleLoginComplete} />
    );
  }

  // ۳. اگر ready شد، اما در حالت سرور و بدون ورود → AuthGuard
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
