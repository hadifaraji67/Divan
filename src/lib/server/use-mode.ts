import { useState, useEffect } from 'react';
import { getMode, setMode, onModeChange, type AppMode } from './mode';
import { serverClient } from './server-client';

export function useAppMode() {
  const [mode, setModeState] = useState<AppMode>(getMode);
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  });

  useEffect(() => {
    const unsub = onModeChange(setModeState);
    return unsub;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const changeMode = (newMode: AppMode) => {
    setMode(newMode);
    setModeState(newMode);
  };

  return {
    mode,
    isLocal: mode === 'local',
    isServer: mode === 'server',
    isOnline,
    isConfigured: serverClient.isConfigured,
    isAuthenticated: serverClient.isAuthenticated,
    changeMode,
  };
}
