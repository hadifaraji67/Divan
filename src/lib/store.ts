import { create } from "zustand";
import { persist } from "zustand/middleware";
import { lineTotals } from "./format";

export type Product = {
  id: string;
  code: string;
  name: string;
  unit: string;
  unitPrice: number;
};

/** A counterparty — can be a sales customer, a purchase supplier, or both. */
export type Customer = {
  id: string;
  name: string;
  nationalId: string;
  economicCode: string;
  registrationNo: string;
  postalCode: string;
  phone: string;
  province: string;
  county: string;
  city: string;
  address: string;
};

export type Seller = Customer & {
  trackingCode: string;
};

export type LineItem = {
  id: string;
  productId?: string;
  code: string;
  name: string;
  unit: string;
  qty: number;
  unitPrice: number;
  discount: number;
};

/** "quote" = پیش‌فاکتور (not yet a commitment), "invoice" = سند نهایی. */
export type DocKind = "quote" | "invoice";
/** "sale" = فروش به طرف‌حساب, "purchase" = خرید از طرف‌حساب. */
export type DocDirection = "sale" | "purchase";

export type Invoice = {
  id: string;
  kind: DocKind;
  direction: DocDirection;
  number: number;
  date: string;
  customer: Customer;
  items: LineItem[];
  notes: string;
  createdAt: string;
  /** Set on a quote once it has been converted — points at the resulting invoice. */
  convertedToId?: string;
  /** Set on an invoice that was created by converting a quote. */
  convertedFromId?: string;
};

export type Draft = {
  kind: DocKind;
  direction: DocDirection;
  number: number;
  date: string;
  customer: Customer;
  items: LineItem[];
  notes: string;
};

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  description: string;
  createdAt: string;
};

export type User = {
  id: string;
  username: string;
  password: string;
};

/** A cash movement against a party's balance — receipts reduce what they owe us. */
export type PaymentDirection = "receipt" | "payment";

export type Payment = {
  id: string;
  customerId: string;
  amount: number;
  date: string;
  direction: PaymentDirection;
  note: string;
  createdAt: string;
};

/** Manual warehouse movement — separate from invoices. */
export type StockDirection = "in" | "out";

export type StockMovement = {
  id: string;
  productId: string;
  direction: StockDirection;
  qty: number;
  date: string;
  note: string;
  createdAt: string;
};

const emptyCustomer = (): Customer => ({
  id: "",
  name: "",
  nationalId: "",
  economicCode: "",
  registrationNo: "",
  postalCode: "",
  phone: "",
  province: "",
  county: "",
  city: "",
  address: "",
});

export const defaultSeller: Seller = {
  id: "seller",
  name: "پیشگامان فناوری نوظهور",
  nationalId: "14011833339",
  economicCode: "14011833339",
  registrationNo: "40813",
  postalCode: "1894878583",
  trackingCode: "061764831900",
  phone: "09123333338",
  province: "تهران",
  county: "تهران",
  city: "تهران",
  address: "تهران، خیابان کارگر، بالاتر از میدان فوزیه، پاساژ شایان، پلاک ۳۴",
};

const seedProducts: Product[] = [];
const seedCustomers: Customer[] = [];

export const EXPENSE_CATEGORIES = ["اجاره", "حقوق", "خرید کالا", "قبوض", "حمل و نقل", "سایر"];
export const INCOME_CATEGORIES = ["فروش نقدی", "دریافتی از مشتری", "سایر درآمد"];

function newDraft(number: number, kind: DocKind, direction: DocDirection): Draft {
  return {
    kind,
    direction,
    number,
    date: new Date().toISOString(),
    customer: emptyCustomer(),
    items: [],
    notes: "",
  };
}

function uid() {
  return crypto.randomUUID();
}

function counterKey(kind: DocKind, direction: DocDirection) {
  return direction === "sale"
    ? kind === "quote"
      ? "nextSaleQuoteNumber"
      : "nextSaleInvoiceNumber"
    : kind === "quote"
      ? "nextPurchaseQuoteNumber"
      : "nextPurchaseInvoiceNumber";
}

type Counters = {
  nextSaleQuoteNumber: number;
  nextSaleInvoiceNumber: number;
  nextPurchaseQuoteNumber: number;
  nextPurchaseInvoiceNumber: number;
};

type State = Counters & {
  seller: Seller;
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  transactions: Transaction[];
  payments: Payment[];
  stockMovements: StockMovement[];
  draft: Draft;
  viewingId: string | null;
  hydrated: boolean;
  isAuthenticated: boolean;
  users: User[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (username: string, password: string) => boolean;
  removeUser: (id: string) => boolean;
  setSeller: (seller: Seller) => void;
  addProduct: (p: Omit<Product, "id">) => string;
  updateProduct: (id: string, p: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  addCustomer: (c: Omit<Customer, "id">) => string;
  updateCustomer: (id: string, c: Partial<Customer>) => void;
  removeCustomer: (id: string) => void;
  setDraftCustomer: (c: Customer) => void;
  applyCustomer: (id: string) => void;
  addDraftItem: (item: Omit<LineItem, "id">) => void;
  updateDraftItem: (id: string, patch: Partial<LineItem>) => void;
  removeDraftItem: (id: string) => void;
  setDraftNotes: (notes: string) => void;
  setDraftDate: (iso: string) => void;
  startNewDocument: (kind: DocKind, direction: DocDirection) => void;
  loadInvoice: (id: string) => void;
  saveInvoice: () => Invoice | null;
  removeInvoice: (id: string) => void;
  convertQuoteToInvoice: (id: string) => Invoice | null;
  setViewingId: (id: string | null) => void;
  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => void;
  removeTransaction: (id: string) => void;
  addPayment: (p: Omit<Payment, "id" | "createdAt">) => void;
  removePayment: (id: string) => void;
  addStockMovement: (m: Omit<StockMovement, "id" | "createdAt">) => void;
  removeStockMovement: (id: string) => void;
  exportData: () => string;
  importData: (json: string) => boolean;
};

export function invoiceSums(items: LineItem[]) {
  return items.reduce(
    (acc, item) => {
      const t = lineTotals(item.qty, item.unitPrice, item.discount);
      acc.amount += t.amount;
      acc.afterDiscount += t.afterDiscount;
      acc.vat += t.vat;
      acc.payable += t.payable;
      acc.discount += item.discount;
      acc.qty += item.qty;
      return acc;
    },
    { amount: 0, afterDiscount: 0, vat: 0, payable: 0, discount: 0, qty: 0 },
  );
}

/**
 * Net balance for a party (customer or supplier): sales invoices they owe us,
 * minus purchase invoices we owe them, minus receipts we got from them, plus
 * payments we made to them. Positive = they owe us. Negative = we owe them.
 */
export function partyBalance(invoices: Invoice[], payments: Payment[], partyId: string) {
  const sold = invoices
    .filter((i) => i.kind === "invoice" && i.direction === "sale" && i.customer.id === partyId)
    .reduce((sum, i) => sum + invoiceSums(i.items).payable, 0);
  const bought = invoices
    .filter((i) => i.kind === "invoice" && i.direction === "purchase" && i.customer.id === partyId)
    .reduce((sum, i) => sum + invoiceSums(i.items).payable, 0);
  const net = payments
    .filter((p) => p.customerId === partyId)
    .reduce((sum, p) => sum + (p.direction === "receipt" ? p.amount : -p.amount), 0);
  return sold - bought - net;
}

export function productStock(movements: StockMovement[], productId: string) {
  return movements
    .filter((m) => m.productId === productId)
    .reduce((sum, m) => sum + (m.direction === "in" ? m.qty : -m.qty), 0);
}

export const useInvoiceStore = create<State>()(
  persist(
    (set, get) => ({
      seller: defaultSeller,
      products: seedProducts,
      customers: seedCustomers,
      invoices: [],
      transactions: [],
      payments: [],
      stockMovements: [],
      nextSaleQuoteNumber: 1,
      nextSaleInvoiceNumber: 1,
      nextPurchaseQuoteNumber: 1,
      nextPurchaseInvoiceNumber: 1,
      draft: newDraft(1, "invoice", "sale"),
      viewingId: null,
      hydrated: false,
      isAuthenticated: false,
      users: [{ id: "admin", username: "admin", password: "admin" }],
      login: (username, password) => {
        const ok = get().users.some((u) => u.username === username && u.password === password);
        if (ok) set({ isAuthenticated: true });
        return ok;
      },
      logout: () => set({ isAuthenticated: false }),
      addUser: (username, password) => {
        const name = username.trim();
        if (!name || !password) return false;
        if (get().users.some((u) => u.username === name)) return false;
        set({ users: [...get().users, { id: uid(), username: name, password }] });
        return true;
      },
      removeUser: (id) => {
        if (get().users.length <= 1) return false;
        set({ users: get().users.filter((u) => u.id !== id) });
        return true;
      },
      setSeller: (seller) => set({ seller }),
      addProduct: (p) => {
        const id = uid();
        set({ products: [{ ...p, id }, ...get().products] });
        return id;
      },
      updateProduct: (id, p) =>
        set({ products: get().products.map((x) => (x.id === id ? { ...x, ...p } : x)) }),
      removeProduct: (id) => set({ products: get().products.filter((x) => x.id !== id) }),
      addCustomer: (c) => {
        const id = uid();
        set({ customers: [{ ...c, id }, ...get().customers] });
        return id;
      },
      updateCustomer: (id, c) =>
        set({ customers: get().customers.map((x) => (x.id === id ? { ...x, ...c } : x)) }),
      removeCustomer: (id) => set({ customers: get().customers.filter((x) => x.id !== id) }),
      setDraftCustomer: (customer) => set({ draft: { ...get().draft, customer } }),
      applyCustomer: (id) => {
        const c = get().customers.find((x) => x.id === id);
        if (c) set({ draft: { ...get().draft, customer: { ...c } } });
      },
      addDraftItem: (item) =>
        set({ draft: { ...get().draft, items: [...get().draft.items, { ...item, id: uid() }] } }),
      updateDraftItem: (id, patch) =>
        set({
          draft: {
            ...get().draft,
            items: get().draft.items.map((x) => (x.id === id ? { ...x, ...patch } : x)),
          },
        }),
      removeDraftItem: (id) =>
        set({ draft: { ...get().draft, items: get().draft.items.filter((x) => x.id !== id) } }),
      setDraftNotes: (notes) => set({ draft: { ...get().draft, notes } }),
      setDraftDate: (date) => set({ draft: { ...get().draft, date } }),
      startNewDocument: (kind, direction) => {
        const key = counterKey(kind, direction) as keyof Counters;
        set({ draft: newDraft(get()[key], kind, direction), viewingId: null });
      },
      loadInvoice: (id) => {
        const inv = get().invoices.find((x) => x.id === id);
        if (!inv) return;
        set({
          viewingId: id,
          draft: {
            kind: inv.kind,
            direction: inv.direction,
            number: inv.number,
            date: inv.date,
            customer: { ...inv.customer },
            items: inv.items.map((i) => ({ ...i })),
            notes: inv.notes,
          },
        });
      },
      saveInvoice: () => {
        const { draft, invoices, viewingId } = get();
        if (!draft.customer.name.trim() || draft.items.length === 0) return null;
        const now = new Date().toISOString();
        if (viewingId) {
          const existing = invoices.find((i) => i.id === viewingId);
          const updated: Invoice = {
            id: viewingId,
            kind: draft.kind,
            direction: draft.direction,
            number: draft.number,
            date: draft.date,
            customer: { ...draft.customer },
            items: draft.items.map((i) => ({ ...i })),
            notes: draft.notes,
            createdAt: existing?.createdAt ?? now,
            convertedToId: existing?.convertedToId,
            convertedFromId: existing?.convertedFromId,
          };
          set({ invoices: invoices.map((i) => (i.id === viewingId ? updated : i)) });
          return updated;
        }
        const key = counterKey(draft.kind, draft.direction) as keyof Counters;
        const number = get()[key];
        const created: Invoice = {
          id: uid(),
          kind: draft.kind,
          direction: draft.direction,
          number,
          date: draft.date,
          customer: { ...draft.customer },
          items: draft.items.map((i) => ({ ...i })),
          notes: draft.notes,
          createdAt: now,
        };
        set({
          invoices: [created, ...invoices],
          [key]: number + 1,
          draft: { ...draft, number: created.number },
          viewingId: created.id,
        } as Partial<State>);
        return created;
      },
      removeInvoice: (id) =>
        set({
          invoices: get().invoices.filter((x) => x.id !== id),
          viewingId: get().viewingId === id ? null : get().viewingId,
        }),
      convertQuoteToInvoice: (id) => {
        const { invoices } = get();
        const quote = invoices.find((x) => x.id === id && x.kind === "quote");
        if (!quote || quote.convertedToId) return null;
        const key = counterKey("invoice", quote.direction) as keyof Counters;
        const number = get()[key];
        const now = new Date().toISOString();
        const invoice: Invoice = {
          id: uid(),
          kind: "invoice",
          direction: quote.direction,
          number,
          date: now,
          customer: { ...quote.customer },
          items: quote.items.map((i) => ({ ...i })),
          notes: quote.notes,
          createdAt: now,
          convertedFromId: quote.id,
        };
        set({
          invoices: [
            invoice,
            ...invoices.map((x) => (x.id === id ? { ...x, convertedToId: invoice.id } : x)),
          ],
          [key]: number + 1,
        } as Partial<State>);
        return invoice;
      },
      setViewingId: (viewingId) => set({ viewingId }),
      addTransaction: (t) =>
        set({
          transactions: [
            { ...t, id: uid(), createdAt: new Date().toISOString() },
            ...get().transactions,
          ],
        }),
      removeTransaction: (id) =>
        set({ transactions: get().transactions.filter((x) => x.id !== id) }),
      addPayment: (p) =>
        set({
          payments: [{ ...p, id: uid(), createdAt: new Date().toISOString() }, ...get().payments],
        }),
      removePayment: (id) => set({ payments: get().payments.filter((x) => x.id !== id) }),
      addStockMovement: (m) =>
        set({
          stockMovements: [
            { ...m, id: uid(), createdAt: new Date().toISOString() },
            ...get().stockMovements,
          ],
        }),
      removeStockMovement: (id) =>
        set({ stockMovements: get().stockMovements.filter((x) => x.id !== id) }),
      exportData: () => {
        const s = get();
        const payload = {
          app: "divan",
          exportedAt: new Date().toISOString(),
          seller: s.seller,
          products: s.products,
          customers: s.customers,
          invoices: s.invoices,
          transactions: s.transactions,
          payments: s.payments,
          stockMovements: s.stockMovements,
          users: s.users,
          nextSaleQuoteNumber: s.nextSaleQuoteNumber,
          nextSaleInvoiceNumber: s.nextSaleInvoiceNumber,
          nextPurchaseQuoteNumber: s.nextPurchaseQuoteNumber,
          nextPurchaseInvoiceNumber: s.nextPurchaseInvoiceNumber,
        };
        return JSON.stringify(payload, null, 2);
      },
      importData: (json) => {
        try {
          const data = JSON.parse(json);
          if (!data || typeof data !== "object" || data.app !== "divan") return false;
          set({
            seller: data.seller ?? get().seller,
            products: data.products ?? [],
            customers: data.customers ?? [],
            invoices: data.invoices ?? [],
            transactions: data.transactions ?? [],
            payments: data.payments ?? [],
            stockMovements: data.stockMovements ?? [],
            users: data.users?.length ? data.users : get().users,
            nextSaleQuoteNumber: data.nextSaleQuoteNumber ?? 1,
            nextSaleInvoiceNumber: data.nextSaleInvoiceNumber ?? 1,
            nextPurchaseQuoteNumber: data.nextPurchaseQuoteNumber ?? 1,
            nextPurchaseInvoiceNumber: data.nextPurchaseInvoiceNumber ?? 1,
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "ansar-invoice-v3",
      skipHydration: true,
      partialize: (s) => ({
        seller: s.seller,
        products: s.products,
        customers: s.customers,
        invoices: s.invoices.map((i) => ({
          ...i,
          kind: i.kind ?? "invoice",
          direction: i.direction ?? "sale",
        })),
        transactions: s.transactions,
        payments: s.payments,
        stockMovements: s.stockMovements,
        nextSaleQuoteNumber: s.nextSaleQuoteNumber,
        nextSaleInvoiceNumber: s.nextSaleInvoiceNumber,
        nextPurchaseQuoteNumber: s.nextPurchaseQuoteNumber,
        nextPurchaseInvoiceNumber: s.nextPurchaseInvoiceNumber,
        isAuthenticated: s.isAuthenticated,
        users: s.users,
      }),
    },
  ),
);

const CURRENT_STORAGE_KEY = "ansar-invoice-v3";
const KNOWN_OLD_KEYS = ["ansar-invoice-v2", "ansar-invoice-v1", "ansar-invoice"];

function hasRealData(state: any): boolean {
  if (!state || typeof state !== "object") return false;
  return (
    (Array.isArray(state.invoices) && state.invoices.length > 0) ||
    (Array.isArray(state.products) && state.products.length > 0) ||
    (Array.isArray(state.customers) && state.customers.length > 0)
  );
}

/**
 * One-time recovery: earlier app versions used different localStorage key
 * names as the data model grew (ansar-invoice-v2 -> v3). Renaming the key
 * without migrating stranded anything saved under the old name — this finds
 * it and copies it forward, filling in fields the old shape didn't have.
 */
function migrateLegacyData() {
  try {
    const current = window.localStorage.getItem(CURRENT_STORAGE_KEY);
    if (current) {
      const parsed = JSON.parse(current);
      if (hasRealData(parsed?.state)) return; // already has data, nothing to do
    }

    let recovered: any = null;
    for (const key of KNOWN_OLD_KEYS) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (hasRealData(parsed?.state)) {
          recovered = parsed.state;
          break;
        }
      } catch {
        // ignore unparsable entries
      }
    }

    if (!recovered) {
      // Fallback: scan every localStorage key for anything shaped like our
      // state that the known names above didn't catch.
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key || key === CURRENT_STORAGE_KEY) continue;
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw);
          if (hasRealData(parsed?.state)) {
            recovered = parsed.state;
            break;
          }
        } catch {
          // ignore unparsable entries
        }
      }
    }

    if (!recovered) return;

    const migrated = {
      seller: recovered.seller ?? defaultSeller,
      products: recovered.products ?? [],
      customers: recovered.customers ?? [],
      invoices: (recovered.invoices ?? []).map((i: any) => ({
        ...i,
        kind: i.kind ?? "invoice",
        direction: i.direction ?? "sale",
      })),
      transactions: recovered.transactions ?? [],
      payments: recovered.payments ?? [],
      stockMovements: recovered.stockMovements ?? [],
      nextSaleQuoteNumber: recovered.nextSaleQuoteNumber ?? recovered.nextQuoteNumber ?? 1,
      nextSaleInvoiceNumber: recovered.nextSaleInvoiceNumber ?? recovered.nextInvoiceNumber ?? 1,
      nextPurchaseQuoteNumber: recovered.nextPurchaseQuoteNumber ?? 1,
      nextPurchaseInvoiceNumber: recovered.nextPurchaseInvoiceNumber ?? 1,
      isAuthenticated: false,
      users: recovered.users?.length ? recovered.users : [{ id: "admin", username: "admin", password: "admin" }],
    };

    window.localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify({ state: migrated, version: 0 }));
  } catch {
    // Recovery is best-effort — never block the app over it.
  }
}

if (typeof window !== "undefined") {
  migrateLegacyData();
  void useInvoiceStore.persist.rehydrate().then(() => {
    useInvoiceStore.setState({ hydrated: true });
  });
}
