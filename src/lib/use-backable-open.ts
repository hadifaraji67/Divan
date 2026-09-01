import { useEffect, useRef } from "react";
import { pushNav } from "@/lib/nav-history";

/**
 * Makes the phone's hardware/gesture back button close an open
 * dialog/sidebar/menu instead of falling through and exiting the app.
 * Drop this into any component that owns an "isOpen" boolean for a
 * Dialog, drawer, or dropdown — it pushes one history entry while open
 * and pops it on close, from either direction (UI close button or the
 * back button), without needing to touch existing setOpen(true/false)
 * call sites.
 */
export function useBackableOpen(isOpen: boolean, onRequestClose: () => void) {
  const pushedRef = useRef(false);
  const closingFromPopRef = useRef(false);
  const onRequestCloseRef = useRef(onRequestClose);
  onRequestCloseRef.current = onRequestClose;

  useEffect(() => {
    function onPopState() {
      if (pushedRef.current) {
        pushedRef.current = false;
        closingFromPopRef.current = true;
        onRequestCloseRef.current();
      }
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (isOpen && !pushedRef.current) {
      pushNav({ modal: true });
      pushedRef.current = true;
    } else if (!isOpen && pushedRef.current) {
      pushedRef.current = false;
      if (closingFromPopRef.current) {
        closingFromPopRef.current = false;
      } else {
        window.history.back();
      }
    }
  }, [isOpen]);
}
