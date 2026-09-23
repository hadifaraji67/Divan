import { useEffect, useRef } from 'react';

const DRAFT_PREFIX = 'divan_draft_';

const SAVE_DEBOUNCE_MS = 800;

/**
 * Auto-save فرم‌ها به localStorage
 * - ذخیره debounce شده (هر ۸۰۰ms یکبار)
 * - بازیابی از draft
 * - پاک کردن بعد از ذخیره موفق
 *
 * استفاده:
 *   const { restoreDraft, clearDraft } = useFormDraft<Invoice>(
 *     'invoice',
 *     editing,
 *     showForm,
 *     (draft) => setEditing(draft)
 *   );
 */
export function useFormDraft<T>(
  key: string,
  data: T,
  isActive: boolean,
  onRestore: (draft: T) => void,
) {
  const timerRef = useRef<number | null>(null);
  const didRestoreRef = useRef(false);

  const storageKey = DRAFT_PREFIX + key;

  // بازیابی draft در اولین باز شدن فرم
  useEffect(() => {
    if (!isActive) {
      didRestoreRef.current = false;
      return;
    }
    if (didRestoreRef.current) return;

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const draft = JSON.parse(raw) as { data: T; savedAt: string };
        if (draft?.data) {
          onRestore(draft.data);
        }
      }
    } catch {
      // draft خراب — پاک کن
      localStorage.removeItem(storageKey);
    }

    didRestoreRef.current = true;
  }, [isActive, storageKey, onRestore]);

  // ذخیره debounce شده
  useEffect(() => {
    if (!isActive) return;

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ data, savedAt: new Date().toISOString() }),
        );
      } catch {
        // localStorage پر — بی‌خیال
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, isActive, storageKey]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // بی‌خیال
    }
  };

  const hasDraft = (): boolean => {
    try {
      return localStorage.getItem(storageKey) !== null;
    } catch {
      return false;
    }
  };

  return { clearDraft, hasDraft };
}
