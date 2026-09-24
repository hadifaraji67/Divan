import { useState, useCallback, useMemo } from 'react';

/**
 * Hook مشترک برای انتخاب گروهی
 *
 * استفاده:
 *   const bulk = useBulkSelect(invoices, (i) => i.id);
 *   bulk.selected  // Set<string>
 *   bulk.toggle(id)
 *   bulk.toggleAll()
 *   bulk.clear()
 *   bulk.isSelected(id)
 *   bulk.selectedItems  // T[]
 */
export function useBulkSelect<T>(
  items: T[],
  getId: (item: T) => string,
) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      if (prev.size === items.length && items.length > 0) {
        return new Set();
      }
      return new Set(items.map(getId));
    });
  }, [items, getId]);

  const clear = useCallback(() => {
    setSelected(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => selected.has(id),
    [selected],
  );

  const selectedItems = useMemo(
    () => items.filter((it) => selected.has(getId(it))),
    [items, selected, getId],
  );

  const allSelected = items.length > 0 && selected.size === items.length;
  const someSelected = selected.size > 0 && !allSelected;
  const count = selected.size;

  return {
    selected,
    selectedItems,
    count,
    allSelected,
    someSelected,
    toggle,
    toggleAll,
    clear,
    isSelected,
  };
}
