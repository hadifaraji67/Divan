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

export type Customer = {
  id: string;
  name: string;
  nationalId: string;
  economicCode: string;
  registrationNo: string;
  postalCode: string;
  phone: string;
  province: string;
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

export type Invoice = {
  id: string;
  number: number;
  date: string;
  customer: Customer;
  items: LineItem[];
  notes: string;
  createdAt: string;
};

export type Draft = {
  number: number;
  date: string;
  customer: Customer;
  items: LineItem[];
  notes: string;
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
  city: "تهران",
  address: "تهران، خیابان کارگر، بالاتر از میدان فوزیه، پاساژ شایان، پلاک ۳۴",
};

const seedProducts: Product[] = [];

const seedCustomers: Customer[] = [];

function newDraft(number: number): Draft {
  return {
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

type State = {
  seller: Seller;
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  nextInvoiceNumber: number;
  draft: Draft;
  viewingId: string | null;
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
  resetDraft: () => void;
  loadInvoice: (id: string) => void;
  saveInvoice: () => Invoice | null;
  removeInvoice: (id: string) => void;
  setViewingId: (id: string | null) => void;
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

export const useInvoiceStore = create<State>()(
  persist(
    (set, get) => ({
      seller: defaultSeller,
      products: seedProducts,
      customers: seedCustomers,
      invoices: [],
      nextInvoiceNumber: 1,
      draft: newDraft(1),
      viewingId: null,
      setSeller: (seller) => set({ seller }),
      addProduct: (p) => {
        const id = uid();
        set({ products: [{ ...p, id }, ...get().products] });
        return id;
      },
      updateProduct: (id, p) =>
        set({
          products: get().products.map((x) => (x.id === id ? { ...x, ...p } : x)),
        }),
      removeProduct: (id) =>
        set({ products: get().products.filter((x) => x.id !== id) }),
      addCustomer: (c) => {
        const id = uid();
        set({ customers: [{ ...c, id }, ...get().customers] });
        return id;
      },
      updateCustomer: (id, c) =>
        set({
          customers: get().customers.map((x) => (x.id === id ? { ...x, ...c } : x)),
        }),
      removeCustomer: (id) =>
        set({ customers: get().customers.filter((x) => x.id !== id) }),
      setDraftCustomer: (customer) =>
        set({ draft: { ...get().draft, customer } }),
      applyCustomer: (id) => {
        const c = get().customers.find((x) => x.id === id);
        if (c) set({ draft: { ...get().draft, customer: { ...c } } });
      },
      addDraftItem: (item) =>
        set({
          draft: {
            ...get().draft,
            items: [...get().draft.items, { ...item, id: uid() }],
          },
        }),
      updateDraftItem: (id, patch) =>
        set({
          draft: {
            ...get().draft,
            items: get().draft.items.map((x) => (x.id === id ? { ...x, ...patch } : x)),
          },
        }),
      removeDraftItem: (id) =>
        set({
          draft: {
            ...get().draft,
            items: get().draft.items.filter((x) => x.id !== id),
          },
        }),
      setDraftNotes: (notes) => set({ draft: { ...get().draft, notes } }),
      setDraftDate: (date) => set({ draft: { ...get().draft, date } }),
      resetDraft: () =>
        set({
          draft: newDraft(get().nextInvoiceNumber),
          viewingId: null,
        }),
      loadInvoice: (id) => {
        const inv = get().invoices.find((x) => x.id === id);
        if (!inv) return;
        set({
          viewingId: id,
          draft: {
            number: inv.number,
            date: inv.date,
            customer: { ...inv.customer },
            items: inv.items.map((i) => ({ ...i })),
            notes: inv.notes,
          },
        });
      },
      saveInvoice: () => {
        const { draft, invoices, viewingId, nextInvoiceNumber } = get();
        if (!draft.customer.name.trim() || draft.items.length === 0) return null;
        const now = new Date().toISOString();
        if (viewingId) {
          const updated: Invoice = {
            id: viewingId,
            number: draft.number,
            date: draft.date,
            customer: { ...draft.customer },
            items: draft.items.map((i) => ({ ...i })),
            notes: draft.notes,
            createdAt: invoices.find((i) => i.id === viewingId)?.createdAt ?? now,
          };
          set({
            invoices: invoices.map((i) => (i.id === viewingId ? updated : i)),
          });
          return updated;
        }
        const created: Invoice = {
          id: uid(),
          number: nextInvoiceNumber,
          date: draft.date,
          customer: { ...draft.customer },
          items: draft.items.map((i) => ({ ...i })),
          notes: draft.notes,
          createdAt: now,
        };
        set({
          invoices: [created, ...invoices],
          nextInvoiceNumber: nextInvoiceNumber + 1,
          draft: { ...draft, number: nextInvoiceNumber },
          viewingId: created.id,
        });
        return created;
      },
      removeInvoice: (id) =>
        set({
          invoices: get().invoices.filter((x) => x.id !== id),
          viewingId: get().viewingId === id ? null : get().viewingId,
        }),
      setViewingId: (viewingId) => set({ viewingId }),
    }),
    {
      name: "ansar-invoice-v2",
      skipHydration: true,
      partialize: (s) => ({
        seller: s.seller,
        products: s.products,
        customers: s.customers,
        invoices: s.invoices,
        nextInvoiceNumber: s.nextInvoiceNumber,
      }),
    },
  ),
);

if (typeof window !== "undefined") {
  void useInvoiceStore.persist.rehydrate();
}
