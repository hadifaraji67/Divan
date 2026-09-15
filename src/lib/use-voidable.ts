import { useState, useCallback } from 'react';
import { loadData, saveData } from './storage';

interface VoidableItem {
  id: string;
  void?: boolean;
  voidedAt?: string;
  voidedReason?: string;
}

/**
 * هوک برای مدیریت باطل کردن / بازگردانی
 */
export function useVoidable<T extends VoidableItem>(key: string, initial: T[] = []) {
  const [items, setItems] = useState<T[]>(() => loadData<T[]>(key, initial));

  const refresh = useCallback(() => {
    setItems(loadData<T[]>(key, []));
  }, [key]);

  const persist = useCallback((updated: T[]) => {
    saveData(key, updated);
    setItems(updated);
  }, [key]);

  const voidOne = useCallback((id: string, reason?: string) => {
    const updated = items.map(item =>
      item.id === id
        ? { ...item, void: true, voidedAt: new Date().toISOString(), voidedReason: reason }
        : item
    );
    persist(updated);
  }, [items, persist]);

  const restore = useCallback((id: string) => {
    const updated = items.map(item =>
      item.id === id
        ? { ...item, void: false, voidedAt: undefined, voidedReason: undefined }
        : item
    );
    persist(updated);
  }, [items, persist]);

  const active = items.filter(i => !i.void);
  const voided = items.filter(i => i.void);

  return {
    items,
    active,
    voided,
    voidOne,
    restore,
    refresh,
    persist,
  };
}
