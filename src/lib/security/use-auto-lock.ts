import { useEffect, useRef } from 'react';
import { isLockEnabled, isLocked, lockNow, loadConfig } from './lock-service';

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousedown',
  'mousemove',
  'keydown',
  'touchstart',
  'touchmove',
  'scroll',
  'click',
  'wheel',
];

const CHECK_INTERVAL_MS = 10 * 1000;

/**
 * Auto-lock: بعد از بی‌کاری کاربر، اپ رو قفل می‌کنه
 * - به activity events گوش می‌ده
 * - هر ۱۰ ثانیه چک می‌کنه
 * - بر اساس autoLockDelay قفل می‌کنه
 */
export function useAutoLock(onLock: () => void) {
  const lastActivityRef = useRef<number>(Date.now());
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isLockEnabled()) return;

    const config = loadConfig();
    if (config.autoLockDelay === 'never') return;

    const thresholdMs = config.autoLockDelay === 'immediate'
      ? 5000
      : (config.autoLockDelay as number) * 60 * 1000;

    lastActivityRef.current = Date.now();

    const onActivity = () => {
      lastActivityRef.current = Date.now();
    };

    ACTIVITY_EVENTS.forEach((e) => {
      window.addEventListener(e, onActivity, { passive: true });
    });

    intervalRef.current = window.setInterval(() => {
      if (!isLockEnabled()) return;
      if (isLocked()) return;

      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed > thresholdMs) {
        lockNow();
        onLock();
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((e) => {
        window.removeEventListener(e, onActivity);
      });
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [onLock]);
}
