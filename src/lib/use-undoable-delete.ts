/**
 * Undo برای حذف — به کاربر ۶ ثانیه فرصت بازگردانی می‌دهد
 */
import { useCallback, useRef } from 'react';
import { toast } from 'sonner';

export interface UndoableDeleteOptions<T> {
  onDelete: (item: T) => void;
  onRestore: (item: T) => void;
  getLabel?: (item: T) => string;
  timeout?: number;
}

export function useUndoableDelete<T>(options: UndoableDeleteOptions<T>) {
  const { onDelete, onRestore, getLabel, timeout = 6000 } = options;
  const pendingRef = useRef<{ item: T; timer: ReturnType<typeof setTimeout> } | null>(null);

  const deleteWithUndo = useCallback(
    (item: T) => {
      // اگر قبلاً حذفی در جریان بود، آن را نهایی کن
      if (pendingRef.current) {
        clearTimeout(pendingRef.current.timer);
        pendingRef.current = null;
      }

      // حذف
      onDelete(item);

      const label = getLabel ? getLabel(item) : 'آیتم';

      const timer = setTimeout(() => {
        pendingRef.current = null;
      }, timeout);

      pendingRef.current = { item, timer };

      toast.success(`${label} حذف شد`, {
        duration: timeout,
        action: {
          label: 'بازگردانی',
          onClick: () => {
            if (pendingRef.current?.item === item) {
              clearTimeout(pendingRef.current.timer);
              pendingRef.current = null;
            }
            onRestore(item);
            toast.success('بازگردانی شد');
          },
        },
      });
    },
    [onDelete, onRestore, getLabel, timeout]
  );

  return deleteWithUndo;
}
