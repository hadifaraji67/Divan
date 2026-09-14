import { useEffect, useRef } from 'react';

/**
 * سایدبار در RTL سمت راست است.
 * - باز کردن: سواپ از لبه راست به چپ
 * - بستن: سواپ از چپ به راست
 */
export function useEdgeSwipe(opts: {
  onOpenRight: () => void;
  onClose: () => void;
  isOpen: boolean;
  edge?: number;
}) {
  const { onOpenRight, onClose, isOpen, edge = 60 } = opts;
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const tracking = useRef(false);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      const x = t.clientX;
      const y = t.clientY;
      const w = window.innerWidth;

      if (isOpen) {
        // اگر سایدبار باز است، از هر جای صفحه شروع کن
        startX.current = x;
        startY.current = y;
        tracking.current = true;
      } else if (x > w - edge) {
        // از لبه راست (سایدبار RTL)
        startX.current = x;
        startY.current = y;
        tracking.current = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking.current || startX.current === null) return;
      const t = e.touches[0];
      const dx = t.clientX - startX.current;
      const dy = Math.abs(t.clientY - (startY.current || 0));

      // اگر عمودی حرکت زیاد بود، رهایش کن
      if (dy > 70) {
        tracking.current = false;
        return;
      }

      // باز کردن: از راست به چپ بکش
      if (!isOpen && dx < -50) {
        onOpenRight();
        tracking.current = false;
      }
      // بستن: از چپ به راست بکش
      else if (isOpen && dx > 50) {
        onClose();
        tracking.current = false;
      }
    };

    const onTouchEnd = () => {
      tracking.current = false;
      startX.current = null;
      startY.current = null;
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [onOpenRight, onClose, isOpen, edge]);
}
