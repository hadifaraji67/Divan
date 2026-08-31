import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookUser,
  FileCheck2,
  LogOut,
  Menu,
  MoreVertical,
  Package,
  PackageSearch,
  Pencil,
  Plus,
  Printer,
  Save,
  Settings as SettingsIcon,
  Trash2,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Field } from "@/components/field";
import { InvoicePrint } from "@/components/invoice-print";
import { HomeScreen } from "@/components/home-screen";
import { FinancePanel } from "@/components/finance-panel";
import { CustomerLedger } from "@/components/customer-ledger";
import { ReportsPanel } from "@/components/reports-panel";
import { InventoryPanel } from "@/components/inventory-panel";
import { PaymentsPanel } from "@/components/payments-panel";
import { SettingsHub, type SettingsView } from "@/components/settings-hub";
import { LoginScreen } from "@/components/login-screen";
import { APP_VERSION } from "@/lib/version";
import { formatJalali, formatRial, lineTotals, parseAmount, toFaDigits } from "@/lib/format";
import {
  invoiceSums,
  useInvoiceStore,
  type Customer,
  type DocDirection,
  type DocKind,
  type Invoice,
  type Product,
} from "@/lib/store";

export type View =
  | "home"
  | "sale-quote"
  | "sale-invoice"
  | "purchase-quote"
  | "purchase-invoice"
  | "products"
  | "parties"
  | "history"
  | "finance"
  | "ledger"
  | "payments"
  | "inventory"
  | "reports"
  | "settings"
  | "settings-business"
  | "settings-invoice"
  | "settings-software";

const DOC_VIEWS: Record<string, { kind: DocKind; direction: DocDirection }> = {
  "sale-quote": { kind: "quote", direction: "sale" },
  "sale-invoice": { kind: "invoice", direction: "sale" },
  "purchase-quote": { kind: "quote", direction: "purchase" },
  "purchase-invoice": { kind: "invoice", direction: "purchase" },
};

function docView(kind: DocKind, direction: DocDirection): View {
  return `${direction}-${kind}` as View;
}

const VIEW_TITLES: Record<Exclude<View, "home">, string> = {
  "sale-quote": "پیش‌فاکتور فروش",
  "sale-invoice": "فاکتور فروش",
  "purchase-quote": "پیش‌فاکتور خرید",
  "purchase-invoice": "فاکتور خرید",
  products: "کالا و خدمات",
  parties: "طرف حساب‌ها",
  history: "سوابق اسناد",
  finance: "هزینه‌ها و درآمدها",
  ledger: "بدهی و بستانکاری",
  payments: "دریافت و پرداخت",
  inventory: "ورود و خروج کالا",
  reports: "گزارش‌ها",
  settings: "تنظیمات",
  "settings-business": "نام کسب‌وکار",
  "settings-invoice": "تنظیمات فاکتور",
  "settings-software": "تنظیمات نرم‌افزار",
};

const SIDEBAR_ITEMS: { view: View; title: string; icon: typeof Users }[] = [
  { view: "parties", title: "طرف حساب‌ها", icon: BookUser },
  { view: "products", title: "کالا و خدمات", icon: Package },
  { view: "inventory", title: "ورود و خروج کالا", icon: PackageSearch },
  { view: "payments", title: "دریافت و پرداخت", icon: Wallet },
  { view: "ledger", title: "بدهی و بستانکاری", icon: BookUser },
  { view: "finance", title: "هزینه‌ها و درآمدها", icon: Wallet },
  { view: "reports", title: "گزارش‌ها", icon: BarChart3 },
  { view: "history", title: "سوابق اسناد", icon: Printer },
  { view: "settings", title: "تنظیمات", icon: SettingsIcon },
];

const emptyProduct = (): Omit<Product, "id"> => ({
  code: "",
  name: "",
  unit: "عدد",
  unitPrice: 0,
});

const emptyCustomer = (): Omit<Customer, "id"> => ({
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

export function InvoiceApp() {
  const isAuthenticated = useInvoiceStore((s) => s.isAuthenticated);
  const logout = useInvoiceStore((s) => s.logout);
  const [view, setView] = useState<View>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [printFormat, setPrintFormat] = useState<"A4" | "A5">("A4");
  const [pendingPrint, setPendingPrint] = useState<Invoice | null>(null);
  const [shouldPrint, setShouldPrint] = useState(false);
  const seller = useInvoiceStore((s) => s.seller);
  const startNewDocument = useInvoiceStore((s) => s.startNewDocument);

  useEffect(() => {
    void useInvoiceStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!shouldPrint || !printInvoice) return;
    const id = window.setTimeout(() => {
      window.print();
      setShouldPrint(false);
    }, 50);
    return () => window.clearTimeout(id);
  }, [shouldPrint, printInvoice]);

  // Make the phone's back button/gesture navigate inside the app instead of
  // closing it: every screen change pushes a history entry, and going back
  // just pops to the previous one.
  useEffect(() => {
    window.history.replaceState({ view: "home" }, "");
    function onPopState(e: PopStateEvent) {
      setSidebarOpen(false);
      setMenuOpen(false);
      setView((e.state?.view as View | undefined) ?? "home");
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function goTo(next: View) {
    window.history.pushState({ view: next }, "");
    setView(next);
  }

  function goBack() {
    window.history.back();
  }

  function requestPrint(invoice: Invoice) {
    setPendingPrint(invoice);
  }

  function runPrint(format: "A4" | "A5") {
    if (!pendingPrint) return;
    setPrintFormat(format);
    setPrintInvoice(pendingPrint);
    setPendingPrint(null);
    setShouldPrint(true);
  }

  function navigate(next: View) {
    const doc = DOC_VIEWS[next];
    if (doc) startNewDocument(doc.kind, doc.direction);
    goTo(next);
    setSidebarOpen(false);
  }

  if (!isAuthenticated) return <LoginScreen />;

  const doc = DOC_VIEWS[view];

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="no-print border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-1">
            {view === "home" ? null : (
              <Button variant="ghost" size="icon" aria-label="بازگشت" onClick={goBack}>
                <ArrowRight className="size-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" aria-label="منو" onClick={() => setSidebarOpen(true)}>
              <Menu className="size-5" />
            </Button>
          </div>
          {view === "home" ? (
            <div className="text-center">
              <p className="text-xs font-medium tracking-wide text-muted-foreground">سامانه جامع حسابداری</p>
              <h1 className="text-xl font-semibold text-balance">دیوان</h1>
            </div>
          ) : (
            <h1 className="text-base font-semibold text-balance">{VIEW_TITLES[view]}</h1>
          )}
          <div className="relative flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="گزینه‌های بیشتر"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MoreVertical className="size-5" />
            </Button>
            {menuOpen ? (
              <>
                <button
                  aria-label="بستن"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute left-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-rose-600 hover:bg-muted"
                  >
                    <LogOut className="size-4" />
                    خروج
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {sidebarOpen ? (
        <div className="no-print fixed inset-0 z-50">
          <button
            aria-label="بستن منو"
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex h-full w-72 max-w-[80vw] flex-col bg-card px-3 py-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between px-2">
              <span className="font-semibold">منوی دیوان</span>
              <Button variant="ghost" size="icon" aria-label="بستن" onClick={() => setSidebarOpen(false)}>
                <X className="size-5" />
              </Button>
            </div>
            <nav className="grid gap-1">
              <button
                onClick={() => {
                  goTo("home");
                  setSidebarOpen(false);
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-muted"
              >
                <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Menu className="size-4" />
                </span>
                صفحه اصلی
              </button>
              {SIDEBAR_ITEMS.map((it) => (
                <button
                  key={it.view}
                  onClick={() => navigate(it.view)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-muted"
                >
                  <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <it.icon className="size-4" />
                  </span>
                  {it.title}
                </button>
              ))}
            </nav>
            <p className="mt-auto pt-4 text-center text-xs text-muted-foreground">نسخه {APP_VERSION}</p>
          </aside>
        </div>
      ) : null}

      <main className="no-print mx-auto max-w-6xl px-4 py-5 pb-24">
        {view === "home" ? <HomeScreen onNavigate={navigate} /> : null}
        {doc ? (
          <Composer
            kind={doc.kind}
            direction={doc.direction}
            onPrint={requestPrint}
            onDone={() => goTo("home")}
          />
        ) : null}
        {view === "products" ? <ProductManager /> : null}
        {view === "parties" ? <CustomerManager /> : null}
        {view === "history" ? (
          <HistoryPanel onOpen={(kind, direction) => goTo(docView(kind, direction))} onPrint={requestPrint} />
        ) : null}
        {view === "finance" ? <FinancePanel /> : null}
        {view === "ledger" ? <CustomerLedger /> : null}
        {view === "payments" ? <PaymentsPanel /> : null}
        {view === "inventory" ? <InventoryPanel /> : null}
        {view === "reports" ? <ReportsPanel /> : null}
        {view === "settings" ? (
          <SettingsHub onOpen={(v: SettingsView) => goTo(`settings-${v}` as View)} />
        ) : null}

        {view === "settings-business" ? <BusinessSettingsPanel /> : null}
        {view === "settings-invoice" ? <InvoiceSettingsPanel /> : null}
        {view === "settings-software" ? <SoftwareSettingsPanel /> : null}
      </main>

      {printInvoice ? (
        <div className={`print-only ${printFormat === "A5" ? "format-a5" : ""}`}>
          <InvoicePrint invoice={printInvoice} seller={seller} format={printFormat} />
        </div>
      ) : null}

      <Dialog open={!!pendingPrint} onOpenChange={(v) => !v && setPendingPrint(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>قالب چاپ</DialogTitle>
            <DialogDescription>اندازه‌ی کاغذ را برای چاپ یا خروجی PDF انتخاب کنید</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => runPrint("A4")}
              className="rounded-xl border border-border p-4 text-center hover:bg-muted"
            >
              <p className="font-semibold">A4</p>
              <p className="text-xs text-muted-foreground">استاندارد</p>
            </button>
            <button
              onClick={() => runPrint("A5")}
              className="rounded-xl border border-border p-4 text-center hover:bg-muted"
            >
              <p className="font-semibold">A5</p>
              <p className="text-xs text-muted-foreground">کوچک</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Composer({
  kind,
  direction,
  onPrint,
  onDone,
}: {
  kind: DocKind;
  direction: DocDirection;
  onPrint: (invoice: Invoice) => void;
  onDone: () => void;
}) {
  const draft = useInvoiceStore((s) => s.draft);
  const products = useInvoiceStore((s) => s.products);
  const customers = useInvoiceStore((s) => s.customers);
  const viewingId = useInvoiceStore((s) => s.viewingId);
  const setDraftCustomer = useInvoiceStore((s) => s.setDraftCustomer);
  const applyCustomer = useInvoiceStore((s) => s.applyCustomer);
  const addDraftItem = useInvoiceStore((s) => s.addDraftItem);
  const updateDraftItem = useInvoiceStore((s) => s.updateDraftItem);
  const removeDraftItem = useInvoiceStore((s) => s.removeDraftItem);
  const setDraftNotes = useInvoiceStore((s) => s.setDraftNotes);
  const saveInvoice = useInvoiceStore((s) => s.saveInvoice);
  const startNewDocument = useInvoiceStore((s) => s.startNewDocument);
  const convertQuoteToInvoice = useInvoiceStore((s) => s.convertQuoteToInvoice);
  const addCustomer = useInvoiceStore((s) => s.addCustomer);
  const addProduct = useInvoiceStore((s) => s.addProduct);
  const docLabel = (kind === "quote" ? "پیش‌فاکتور" : "فاکتور") + " " + (direction === "sale" ? "فروش" : "خرید");

  const [itemOpen, setItemOpen] = useState(false);
  const [itemForm, setItemForm] = useState({
    productId: "",
    code: "",
    name: "",
    unit: "عدد",
    qty: "1",
    unitPrice: "",
    discount: "0",
    saveToCatalog: true,
  });

  const sums = useMemo(() => invoiceSums(draft.items), [draft.items]);

  function pickProduct(id: string) {
    const p = products.find((x) => x.id === id);
    if (!p) {
      setItemForm((f) => ({ ...f, productId: "", name: "", code: "", unitPrice: "" }));
      return;
    }
    setItemForm((f) => ({
      ...f,
      productId: p.id,
      code: p.code,
      name: p.name,
      unit: p.unit,
      unitPrice: String(p.unitPrice),
    }));
  }

  function submitItem() {
    const name = itemForm.name.trim();
    const qty = parseAmount(itemForm.qty);
    const unitPrice = parseAmount(itemForm.unitPrice);
    if (!name || qty <= 0) {
      toast.error("نام کالا و تعداد را وارد کنید");
      return;
    }
    let productId = itemForm.productId || undefined;
    if (itemForm.saveToCatalog && !productId) {
      productId = addProduct({
        code: itemForm.code.trim(),
        name,
        unit: itemForm.unit.trim() || "عدد",
        unitPrice,
      });
    }
    addDraftItem({
      productId,
      code: itemForm.code.trim(),
      name,
      unit: itemForm.unit.trim() || "عدد",
      qty,
      unitPrice,
      discount: parseAmount(itemForm.discount),
    });
    setItemForm({
      productId: "",
      code: "",
      name: "",
      unit: "عدد",
      qty: "1",
      unitPrice: "",
      discount: "0",
      saveToCatalog: true,
    });
    setItemOpen(false);
    toast.success("کالا به فاکتور اضافه شد");
  }

  function persist() {
    const inv = saveInvoice();
    if (!inv) {
      toast.error("نام طرف‌حساب و حداقل یک کالا لازم است");
      return null;
    }
    toast.success(`${docLabel} ${toFaDigits(inv.number)} ذخیره شد`);
    return inv;
  }

  function convertToInvoice() {
    if (!viewingId) return;
    const saved = saveInvoice();
    const id = saved?.id ?? viewingId;
    const invoice = convertQuoteToInvoice(id);
    if (!invoice) {
      toast.error("این پیش‌فاکتور قبلاً به فاکتور تبدیل شده است");
      return;
    }
    toast.success(`فاکتور ${toFaDigits(invoice.number)} ساخته شد`);
    onDone();
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>
                {viewingId ? `ویرایش ${docLabel}` : `صدور ${docLabel}`}{" "}
                <span className="tabular-nums">{toFaDigits(draft.number)}</span>
              </CardTitle>
              <CardDescription>تاریخ {formatJalali(draft.date)}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => startNewDocument(kind, direction)}>
                {docLabel} تازه
              </Button>
              <Button variant="secondary" onClick={() => void persist()}>
                <Save className="size-4" />
                ذخیره
              </Button>
              {kind === "quote" ? (
                <Button variant="secondary" onClick={convertToInvoice}>
                  <FileCheck2 className="size-4" />
                  تبدیل به فاکتور
                </Button>
              ) : null}
              <Button
                onClick={() => {
                  const inv = persist();
                  if (inv) onPrint(inv);
                }}
              >
                <Printer className="size-4" />
                چاپ / PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3">
            <Field label="انتخاب طرف‌حساب ذخیره‌شده">
              <select
                className="flex h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
                value={draft.customer.id}
                onChange={(e) => {
                  if (e.target.value) applyCustomer(e.target.value);
                }}
              >
                <option value="">انتخاب کنید یا نام را بنویسید</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="نام طرف‌حساب">
              <Input
                value={draft.customer.name}
                onChange={(e) => setDraftCustomer({ ...draft.customer, name: e.target.value })}
                placeholder="نام طرف‌حساب را وارد کنید"
              />
            </Field>
            <Field label="شناسه ملی">
              <Input
                value={draft.customer.nationalId}
                onChange={(e) =>
                  setDraftCustomer({ ...draft.customer, nationalId: e.target.value })
                }
              />
            </Field>
            <Field label="شماره اقتصادی">
              <Input
                value={draft.customer.economicCode}
                onChange={(e) =>
                  setDraftCustomer({ ...draft.customer, economicCode: e.target.value })
                }
              />
            </Field>
            <Field label="تلفن">
              <Input
                value={draft.customer.phone}
                onChange={(e) => setDraftCustomer({ ...draft.customer, phone: e.target.value })}
              />
            </Field>
            <Field label="شهر">
              <Input
                value={draft.customer.city}
                onChange={(e) => setDraftCustomer({ ...draft.customer, city: e.target.value })}
              />
            </Field>
            <Field label="نشانی کامل" >
              <Input
                value={draft.customer.address}
                onChange={(e) => setDraftCustomer({ ...draft.customer, address: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                if (!draft.customer.name.trim()) {
                  toast.error("ابتدا نام طرف‌حساب را بنویسید");
                  return;
                }
                const id = addCustomer({ ...draft.customer });
                setDraftCustomer({ ...draft.customer, id });
                toast.success("طرف‌حساب در دفتر ذخیره شد");
              }}
            >
              <Users className="size-4" />
              ذخیره این طرف‌حساب
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>کالاها و خدمات</CardTitle>
              <CardDescription>از فهرست انتخاب کنید یا کالای جدید بسازید</CardDescription>
            </div>
            <Button onClick={() => setItemOpen(true)}>
              <Plus className="size-4" />
              افزودن کالا
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          {draft.items.length === 0 ? (
            <p className="rounded-xl bg-muted px-4 py-8 text-center text-sm text-muted-foreground">
              هنوز کالایی اضافه نشده. دکمه «افزودن کالا» را بزنید.
            </p>
          ) : (
            <ul className="grid gap-2">
              {draft.items.map((item, i) => {
                const t = lineTotals(item.qty, item.unitPrice, item.discount);
                return (
                  <li
                    key={item.id}
                    className="grid gap-2 rounded-xl bg-muted/70 p-3"
                  >
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {toFaDigits(i + 1)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        کد {toFaDigits(item.code || "—")} · {toFaDigits(item.qty)} {item.unit} ·{" "}
                        {formatRial(item.unitPrice)} ریال
                      </p>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <Input
                          inputMode="numeric"
                          aria-label="تعداد"
                          value={item.qty}
                          onChange={(e) =>
                            updateDraftItem(item.id, { qty: parseAmount(e.target.value) })
                          }
                        />
                        <Input
                          inputMode="numeric"
                          aria-label="قیمت واحد"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateDraftItem(item.id, { unitPrice: parseAmount(e.target.value) })
                          }
                        />
                        <Input
                          inputMode="numeric"
                          aria-label="تخفیف"
                          value={item.discount}
                          onChange={(e) =>
                            updateDraftItem(item.id, { discount: parseAmount(e.target.value) })
                          }
                        />
                      </div>
                      <p className="mt-1 text-sm tabular-nums">
                        قابل پرداخت: {formatRial(t.payable)} ریال
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="حذف کالا"
                      onClick={() => removeDraftItem(item.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="grid gap-1 rounded-xl bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex justify-between text-sm">
              <span>جمع پس از تخفیف</span>
              <span className="tabular-nums">{formatRial(sums.afterDiscount)} ریال</span>
            </div>
            <div className="flex justify-between text-sm opacity-80">
              <span>مالیات ارزش افزوده ۹٪</span>
              <span className="tabular-nums">{formatRial(sums.vat)} ریال</span>
            </div>
            <div className="mt-1 flex justify-between text-base font-semibold">
              <span>جمع قابل پرداخت</span>
              <span className="tabular-nums">{formatRial(sums.payable)} ریال</span>
            </div>
          </div>

          <Field label="توضیحات فاکتور">
            <Textarea
              value={draft.notes}
              onChange={(e) => setDraftNotes(e.target.value)}
              placeholder="شرایط و نحوه فروش"
            />
          </Field>
        </CardContent>
      </Card>

      <Dialog open={itemOpen} onOpenChange={setItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>افزودن کالا به فاکتور</DialogTitle>
            <DialogDescription>
              از کالاهای ذخیره‌شده انتخاب کنید یا نام کالای جدید را بنویسید.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Field label="از فهرست کالاها">
              <select
                className="flex h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
                value={itemForm.productId}
                onChange={(e) => pickProduct(e.target.value)}
              >
                <option value="">کالای جدید</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="نام کالا">
              <Input
                value={itemForm.name}
                onChange={(e) => setItemForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="نام کالا یا خدمت"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="کد کالا">
                <Input
                  value={itemForm.code}
                  onChange={(e) => setItemForm((f) => ({ ...f, code: e.target.value }))}
                />
              </Field>
              <Field label="واحد">
                <Input
                  value={itemForm.unit}
                  onChange={(e) => setItemForm((f) => ({ ...f, unit: e.target.value }))}
                />
              </Field>
              <Field label="تعداد">
                <Input
                  inputMode="numeric"
                  value={itemForm.qty}
                  onChange={(e) => setItemForm((f) => ({ ...f, qty: e.target.value }))}
                />
              </Field>
              <Field label="قیمت واحد (ریال)">
                <Input
                  inputMode="numeric"
                  value={itemForm.unitPrice}
                  onChange={(e) => setItemForm((f) => ({ ...f, unitPrice: e.target.value }))}
                />
              </Field>
              <Field label="تخفیف (ریال)" className="col-span-2">
                <Input
                  inputMode="numeric"
                  value={itemForm.discount}
                  onChange={(e) => setItemForm((f) => ({ ...f, discount: e.target.value }))}
                />
              </Field>
            </div>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={itemForm.saveToCatalog}
                onChange={(e) =>
                  setItemForm((f) => ({ ...f, saveToCatalog: e.target.checked }))
                }
              />
              ذخیره در فهرست کالاها
            </label>
            <Button onClick={submitItem}>افزودن به فاکتور</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductManager() {
  const products = useInvoiceStore((s) => s.products);
  const addProduct = useInvoiceStore((s) => s.addProduct);
  const updateProduct = useInvoiceStore((s) => s.updateProduct);
  const removeProduct = useInvoiceStore((s) => s.removeProduct);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct());

  function openNew() {
    setEditing(null);
    setForm(emptyProduct());
    setOpen(true);
  }
  function openEdit(p: Product) {
    setEditing(p.id);
    setForm({ code: p.code, name: p.name, unit: p.unit, unitPrice: p.unitPrice });
    setOpen(true);
  }
  function save() {
    if (!form.name.trim()) {
      toast.error("نام کالا لازم است");
      return;
    }
    if (editing) {
      updateProduct(editing, form);
      toast.success("کالا به‌روز شد");
    } else {
      addProduct(form);
      toast.success("کالا اضافه شد");
    }
    setOpen(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>فهرست کالاها</CardTitle>
            <CardDescription>کالاهای پرکاربرد را یک‌بار تعریف کنید</CardDescription>
          </div>
          <Button onClick={openNew}>
            <Plus className="size-4" />
            کالای جدید
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2">
        {products.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">کالایی ثبت نشده است.</p>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className="flex items-start justify-between gap-3 rounded-xl bg-muted/70 p-3"
            >
              <div className="min-w-0">
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  کد {toFaDigits(p.code || "—")} · {formatRial(p.unitPrice)} ریال / {p.unit}
                </p>
              </div>
              <div className="flex">
                <Button variant="ghost" size="icon" aria-label="ویرایش" onClick={() => openEdit(p)}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="حذف"
                  onClick={() => removeProduct(p.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "ویرایش کالا" : "کالای جدید"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Field label="نام کالا">
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="کد">
                <Input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                />
              </Field>
              <Field label="واحد">
                <Input
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                />
              </Field>
            </div>
            <Field label="قیمت واحد (ریال)">
              <Input
                inputMode="numeric"
                value={form.unitPrice || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unitPrice: parseAmount(e.target.value) }))
                }
              />
            </Field>
            <Button onClick={save}>ذخیره کالا</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function CustomerManager() {
  const customers = useInvoiceStore((s) => s.customers);
  const addCustomer = useInvoiceStore((s) => s.addCustomer);
  const updateCustomer = useInvoiceStore((s) => s.updateCustomer);
  const removeCustomer = useInvoiceStore((s) => s.removeCustomer);
  const applyCustomer = useInvoiceStore((s) => s.applyCustomer);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCustomer());

  function openNew() {
    setEditing(null);
    setForm(emptyCustomer());
    setOpen(true);
  }
  function openEdit(c: Customer) {
    setEditing(c.id);
    const { id: _id, ...rest } = c;
    setForm(rest);
    setOpen(true);
  }
  function save() {
    if (!form.name.trim()) {
      toast.error("نام طرف‌حساب لازم است");
      return;
    }
    if (editing) {
      updateCustomer(editing, form);
      toast.success("طرف‌حساب به‌روز شد");
    } else {
      addCustomer(form);
      toast.success("طرف‌حساب اضافه شد");
    }
    setOpen(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>دفتر طرف‌حساب‌ها</CardTitle>
            <CardDescription>نام و مشخصات طرف‌حساب را نگه دارید</CardDescription>
          </div>
          <Button onClick={openNew}>
            <Plus className="size-4" />
            طرف‌حساب جدید
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2">
        {customers.map((c) => (
          <div
            key={c.id}
            className="flex items-start justify-between gap-3 rounded-xl bg-muted/70 p-3"
          >
            <div className="min-w-0">
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">
                {c.city || "—"} · {toFaDigits(c.phone || "—")}
              </p>
            </div>
            <div className="flex">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  applyCustomer(c.id);
                  toast.success("روی فاکتور جاری قرار گرفت");
                }}
              >
                انتخاب
              </Button>
              <Button variant="ghost" size="icon" aria-label="ویرایش" onClick={() => openEdit(c)}>
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="حذف"
                onClick={() => removeCustomer(c.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "ویرایش طرف‌حساب" : "طرف‌حساب جدید"}</DialogTitle>
          </DialogHeader>
          <CustomerFields form={form} setForm={setForm} />
          <Button onClick={save}>ذخیره طرف‌حساب</Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function CustomerFields({
  form,
  setForm,
}: {
  form: Omit<Customer, "id">;
  setForm: (fn: (f: Omit<Customer, "id">) => Omit<Customer, "id">) => void;
}) {
  return (
    <div className="grid gap-3">
      <Field label="نام طرف‌حساب">
        <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="شناسه ملی">
          <Input
            value={form.nationalId}
            onChange={(e) => setForm((f) => ({ ...f, nationalId: e.target.value }))}
          />
        </Field>
        <Field label="شماره اقتصادی">
          <Input
            value={form.economicCode}
            onChange={(e) => setForm((f) => ({ ...f, economicCode: e.target.value }))}
          />
        </Field>
        <Field label="تلفن">
          <Input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </Field>
        <Field label="شهر">
          <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
        </Field>
      </div>
      <Field label="نشانی">
        <Input
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
      </Field>
    </div>
  );
}

function HistoryPanel({
  onOpen,
  onPrint,
}: {
  onOpen: (kind: DocKind, direction: DocDirection) => void;
  onPrint: (invoice: Invoice) => void;
}) {
  const invoices = useInvoiceStore((s) => s.invoices);
  const loadInvoice = useInvoiceStore((s) => s.loadInvoice);
  const removeInvoice = useInvoiceStore((s) => s.removeInvoice);
  const convertQuoteToInvoice = useInvoiceStore((s) => s.convertQuoteToInvoice);
  const [kindFilter, setKindFilter] = useState<"all" | DocKind>("all");
  const [dirFilter, setDirFilter] = useState<"all" | DocDirection>("all");

  const rows = invoices.filter(
    (i) =>
      (kindFilter === "all" || i.kind === kindFilter) &&
      (dirFilter === "all" || i.direction === dirFilter),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>سوابق اسناد</CardTitle>
        <CardDescription>برای چاپ یا ویرایش، سند را باز کنید</CardDescription>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button size="sm" variant={kindFilter === "all" ? "default" : "outline"} onClick={() => setKindFilter("all")}>
            همه
          </Button>
          <Button size="sm" variant={kindFilter === "quote" ? "default" : "outline"} onClick={() => setKindFilter("quote")}>
            پیش‌فاکتورها
          </Button>
          <Button size="sm" variant={kindFilter === "invoice" ? "default" : "outline"} onClick={() => setKindFilter("invoice")}>
            فاکتورها
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={dirFilter === "all" ? "default" : "outline"} onClick={() => setDirFilter("all")}>
            فروش و خرید
          </Button>
          <Button size="sm" variant={dirFilter === "sale" ? "default" : "outline"} onClick={() => setDirFilter("sale")}>
            فروش
          </Button>
          <Button size="sm" variant={dirFilter === "purchase" ? "default" : "outline"} onClick={() => setDirFilter("purchase")}>
            خرید
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2">
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">هنوز سندی ذخیره نشده.</p>
        ) : (
          rows.map((inv) => (
            <div
              key={inv.id}
              className="flex items-start justify-between gap-3 rounded-xl bg-muted/70 p-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={inv.kind === "invoice" ? "default" : "secondary"}>
                    {inv.kind === "invoice" ? "فاکتور" : "پیش‌فاکتور"} {inv.direction === "sale" ? "فروش" : "خرید"}
                  </Badge>
                  {inv.convertedToId ? <Badge variant="outline">تبدیل شده</Badge> : null}
                </div>
                <p className="mt-1 font-medium">
                  {toFaDigits(inv.number)} — {inv.customer.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatJalali(inv.date)} · {formatRial(invoiceSums(inv.items).payable)} ریال
                </p>
              </div>
              <div className="flex flex-wrap justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    loadInvoice(inv.id);
                    onOpen(inv.kind, inv.direction);
                  }}
                >
                  ویرایش
                </Button>
                {inv.kind === "quote" && !inv.convertedToId ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="تبدیل به فاکتور"
                    onClick={() => {
                      const created = convertQuoteToInvoice(inv.id);
                      if (created) toast.success(`فاکتور ${toFaDigits(created.number)} ساخته شد`);
                    }}
                  >
                    <FileCheck2 className="size-4" />
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="چاپ"
                  onClick={() => onPrint(inv)}
                >
                  <Printer className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="حذف"
                  onClick={() => removeInvoice(inv.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function BusinessSettingsPanel() {
  const seller = useInvoiceStore((s) => s.seller);
  const setSeller = useInvoiceStore((s) => s.setSeller);
  return (
    <Card>
      <CardHeader>
        <CardTitle>نام کسب‌وکار</CardTitle>
        <CardDescription>این اطلاعات روی همه اسناد چاپ می‌شود</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Field label="نام کسب‌وکار">
          <Input value={seller.name} onChange={(e) => setSeller({ ...seller, name: e.target.value })} />
        </Field>
        <Field label="تلفن">
          <Input value={seller.phone} onChange={(e) => setSeller({ ...seller, phone: e.target.value })} />
        </Field>
        <Field label="شهر">
          <Input value={seller.city} onChange={(e) => setSeller({ ...seller, city: e.target.value })} />
        </Field>
        <Field label="کدپستی">
          <Input
            value={seller.postalCode}
            onChange={(e) => setSeller({ ...seller, postalCode: e.target.value })}
          />
        </Field>
        <Field label="نشانی">
          <Input value={seller.address} onChange={(e) => setSeller({ ...seller, address: e.target.value })} />
        </Field>
        <div>
          <Button
            onClick={() => {
              setSeller({ ...seller });
              toast.success("مشخصات کسب‌وکار ذخیره شد");
            }}
          >
            ذخیره
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InvoiceSettingsPanel() {
  const seller = useInvoiceStore((s) => s.seller);
  const setSeller = useInvoiceStore((s) => s.setSeller);
  return (
    <Card>
      <CardHeader>
        <CardTitle>تنظیمات فاکتور</CardTitle>
        <CardDescription>کدهای رسمی که در سربرگ فاکتور چاپ می‌شود</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Field label="شناسه ملی">
          <Input
            value={seller.nationalId}
            onChange={(e) => setSeller({ ...seller, nationalId: e.target.value })}
          />
        </Field>
        <Field label="شماره اقتصادی">
          <Input
            value={seller.economicCode}
            onChange={(e) => setSeller({ ...seller, economicCode: e.target.value })}
          />
        </Field>
        <Field label="شماره ثبت">
          <Input
            value={seller.registrationNo}
            onChange={(e) => setSeller({ ...seller, registrationNo: e.target.value })}
          />
        </Field>
        <Field label="کد رهگیری">
          <Input
            value={seller.trackingCode}
            onChange={(e) => setSeller({ ...seller, trackingCode: e.target.value })}
          />
        </Field>
        <div>
          <Button
            onClick={() => {
              setSeller({ ...seller });
              toast.success("تنظیمات فاکتور ذخیره شد");
            }}
          >
            ذخیره
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SoftwareSettingsPanel() {
  const users = useInvoiceStore((s) => s.users);
  const addUser = useInvoiceStore((s) => s.addUser);
  const removeUser = useInvoiceStore((s) => s.removeUser);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function save() {
    if (!username.trim() || !password) {
      toast.error("نام کاربری و رمز عبور را وارد کنید");
      return;
    }
    const ok = addUser(username.trim(), password);
    if (!ok) {
      toast.error("این نام کاربری قبلاً ثبت شده است");
      return;
    }
    toast.success("کاربر اضافه شد");
    setUsername("");
    setPassword("");
  }

  function remove(id: string, name: string) {
    const ok = removeUser(id);
    if (!ok) {
      toast.error("باید حداقل یک کاربر باقی بماند");
      return;
    }
    toast.success(`${name} حذف شد`);
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>کاربران</CardTitle>
          <CardDescription>افرادی که می‌توانند وارد برنامه شوند</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-xl bg-muted/70 p-3">
              <span className="font-medium">{u.username}</span>
              <Button variant="ghost" size="icon" aria-label="حذف کاربر" onClick={() => remove(u.id, u.username)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>افزودن کاربر</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Field label="نام کاربری">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </Field>
          <Field label="رمز عبور">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Button onClick={save}>
            <Plus className="size-4" />
            افزودن کاربر
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">نسخه‌ی برنامه: {APP_VERSION}</p>
    </div>
  );
}
