import { useState, useEffect, useCallback } from 'react';
import {
  syncNow, getSyncState, getLastSync, onSyncStateChange,
  startAutoSync, type SyncState,
} from './engine';
import { queueSize, onQueueChange } from './queue';
import { getMode } from '../server/mode';
import { serverClient } from '../server/server-client';
import { notify } from '../toast';

export function useSync() {
  const [state, setState] = useState<SyncState>(getSyncState);
  const [lastSync, setLastSync] = useState<string | null>(getLastSync);
  const [queue, setQueue] = useState<number>(queueSize);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsubState = onSyncStateChange(setState);
    const unsubQueue = onQueueChange(setQueue);

    // شروع auto sync
    const stopAuto = startAutoSync();

    // بروزرسانی زمان آخرین sync
    const timer = setInterval(() => setLastSync(getLastSync()), 5000);

    return () => {
      unsubState();
      unsubQueue();
      stopAuto();
      clearInterval(timer);
    };
  }, []);

  const sync = useCallback(async (showToast = true) => {
    if (getMode() !== 'server') {
      if (showToast) notify.warning('در حالت مستقل، همگام‌سازی وجود ندارد');
      return;
    }

    if (!serverClient.isAuthenticated) {
      if (showToast) notify.warning('ابتدا به سرور وارد شوید');
      return;
    }

    setBusy(true);
    if (showToast) notify.info('در حال همگام‌سازی...');

    const result = await syncNow();
    setBusy(false);
    setLastSync(getLastSync());
    setQueue(queueSize());

    if (showToast) {
      if (result.success) {
        notify.success(`همگام‌سازی کامل (${result.pushed} ارسال، ${result.pulled} دریافت)`);
      } else {
        notify.error(result.error || 'خطا در همگام‌سازی');
      }
    }

    return result;
  }, []);

  const status = (() => {
    if (getMode() === 'local') return { icon: 'off', label: 'مستقل', color: 'slate' };
    if (!serverClient.isAuthenticated) return { icon: 'error', label: 'وارد نشده', color: 'rose' };
    if (state === 'syncing') return { icon: 'sync', label: 'در حال همگام‌سازی', color: 'amber' };
    if (state === 'error') return { icon: 'error', label: 'خطا در همگام‌سازی', color: 'rose' };
    if (queue > 0) return { icon: 'pending', label: `${queue} تغییر در انتظار`, color: 'amber' };
    return { icon: 'ok', label: 'همگام', color: 'emerald' };
  })();

  return {
    state,
    lastSync,
    queue,
    busy,
    sync,
    status,
    isServerMode: getMode() === 'server',
  };
}
