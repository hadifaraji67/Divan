import { useInvoiceStore } from "@/lib/store";
import { loadAppState, saveAppState } from "@/lib/app-state-sync";

/**
 * Phase 3 of the sync plan: mirrors the same fields already saved to
 * localStorage (see store.ts's `partialize`) up to the Postgres app_state
 * row, debounced, and pulls the latest snapshot down once per session so a
 * second device picks up changes made elsewhere. Deliberately simple
 * "last write wins" — fine for one business used from a small number of
 * devices that aren't editing at the exact same moment; it is not a
 * conflict-resolving sync.
 */
const SYNCED_KEYS = [
  "seller",
  "products",
  "customers",
  "invoices",
  "transactions",
  "payments",
  "stockMovements",
  "nextSaleQuoteNumber",
  "nextSaleInvoiceNumber",
  "nextPurchaseQuoteNumber",
  "nextPurchaseInvoiceNumber",
  "smsBankSenders",
  "autoLockMinutes",
  "lowStockThreshold",
] as const;

type SyncedState = Pick<ReturnType<typeof useInvoiceStore.getState>, (typeof SYNCED_KEYS)[number]>;

function snapshot(state: ReturnType<typeof useInvoiceStore.getState>): SyncedState {
  const out = {} as SyncedState;
  for (const key of SYNCED_KEYS) {
    (out as Record<string, unknown>)[key] = state[key];
  }
  return out;
}

let unsubscribe: (() => void) | null = null;
let saveTimer: number | null = null;
let running = false;

export async function startServerSync() {
  if (running) return;
  running = true;

  try {
    const remote = await loadAppState();
    if (remote && remote.data && typeof remote.data === "object") {
      useInvoiceStore.setState(remote.data as Partial<SyncedState>);
    }
  } catch (err) {
    console.error("[sync] failed to load remote state:", err);
  }

  unsubscribe = useInvoiceStore.subscribe((state) => {
    if (saveTimer) window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      void saveAppState({ data: snapshot(state) }).catch((err) => {
        console.error("[sync] failed to save remote state:", err);
      });
    }, 1500);
  });
}

export function stopServerSync() {
  running = false;
  unsubscribe?.();
  unsubscribe = null;
  if (saveTimer) {
    window.clearTimeout(saveTimer);
    saveTimer = null;
  }
}
