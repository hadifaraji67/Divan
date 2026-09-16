import { useState, useEffect, useRef, useCallback } from 'react';
import {
  isLockEnabled, isLocked, loadConfig,
  lockNow, unlockWithSecret,
} from './lock-service';

export function useLock() {
  const [enabled, setEnabled] = useState<boolean>(() => isLockEnabled());
  const [locked, setLocked] = useState<boolean>(() => isLocked());
  const idleTimerRef = useRef<any>(null);

  const refresh = useCallback(() => {
    setEnabled(isLockEnabled());
    setLocked(isLocked());
  }, []);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('divan-lock-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('divan-lock-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, [refresh]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }

    if (!enabled || locked) return;

    const config = loadConfig();
    const delay = config.autoLockDelay;
    if (delay === 'never') return;
    if (delay === 'immediate') return; // در حالت فوری، idle timer نداریم

    const ms = (delay as number) * 60 * 1000;

    idleTimerRef.current = setTimeout(() => {
      lockNow();
      setLocked(true);
    }, ms);
  }, [enabled, locked]);

  useEffect(() => {
    if (!enabled || locked) return;

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'click', 'scroll'];
    const handler = () => resetIdleTimer();

    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetIdleTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [enabled, locked, resetIdleTimer]);

  useEffect(() => {
    if (!enabled) return;

    const handler = () => {
      if (document.hidden) {
        const config = loadConfig();
        if (config.autoLockDelay === 'immediate') {
          lockNow();
          setLocked(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [enabled]);

  return {
    enabled,
    locked,
    refresh,
    unlock: async (secret: string) => {
      const result = await unlockWithSecret(secret);
      if (result.success) setLocked(false);
      return result;
    },
    lock: () => {
      lockNow();
      setLocked(true);
    },
  };
}
