import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  FileCheck2,
  Pencil,
  Plus,
  Printer,
  Save,
  Trash2,
  Users,
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
import { formatJalali, formatRial, lineTotals, parseAmount, toFaDigits } from "@/lib/format";
import {
  invoiceSums,
  useInvoiceStore,
  type Customer,
  type DocKind,
  type Invoice,
  type Product,
} from "@/lib/store";

export type View =
  | "home"
  | "quote"
  | "invoice"
  | "products"
  | "customers"
  | "history"
  | "finance"
  | "ledger"
  | "reports"
  | "settings";

const VIEW_TITLES: Record<Exclude<View, "home">, string> = {
  quote: "پیش‌فاکتور جدید",
  invoice: "فاکتور جدید",
  products: "کالاها",
  customers: "مشتریان",
  history: "سوابق اسناد",
  finance: "هزینه‌ها و درآمدها",
  ledger: "بدهی و بستانکاری",
  reports: "گزارش‌ها",
  settings: "مشخصات فروشنده",
};

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
  const [view, setView] = useState<View>("home");
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
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

  function printSheet(invoice: Invoice) {
    setPrintInvoice(invoice);
    setShouldPrint(true);
  }

  function navigate(next: View) {
    if (next === "quote" || next === "invoice") startNewDocument(next);
    setView(next);
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="no-print border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          {view === "home" ? (
            <>
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground">
                  سامانه جامع حسابداری
                </p>
                <h1 className="text-xl font-semibold text-balance">دیوان</h1>
              </div>
              <Badge variant="secondary">حسابداری شخصی</Badge>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" aria-label="بازگشت" onClick={() => setView("home")}>
                <ArrowRight className="size-5" />
              </Button>
              <h1 className="text-base font-semibold text-balance">{VIEW_TITLES[view]}</h1>
              <span className="size-9" />
            </>
          )}
        </div>
      </header>

      <main className="no-print mx-auto max-w-6xl px-4 py-5 pb-24">
        {view === "home" ? <HomeScreen onNavigate={navigate} /> : null}
        {view === "quote" || view === "invoice" ? (
          <Composer kind={view} onPrint={printSheet} onDone={() => setView("home")} />
        ) : null}
        {view === "products" ? <ProductManager /> : null}
        {view === "customers" ? <CustomerManager /> : null}
        {view === "history" ? (
          <HistoryPanel
            onOpen={(kind) => setView(kind)}
            onPrint={printSheet}
          />
        ) : null}
        {view === "finance" ? <FinancePanel /> : null}
        {view === "ledger" ? <CustomerLedger /> : null}
        {view === "reports" ? <ReportsPanel /> : null}
        {view === "settings" ? <SellerPanel /> : null}
      </main>

      {printInvoice ? (
        <div className="print-only">
          <InvoicePrint invoice={printInvoice} seller={seller} />
        </div>
      ) : null}
    </div>
  );
}

function Composer({
  kind,
  onPrint,
  onDone,
}: {
  kind: DocKind;
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
  const docLabel = kind === "quote" ? "پیش‌فاکتور" : "فاکتور";

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
      toast.error("نام مشتری و حداقل یک کالا لازم است");
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
              <Button variant="outline" onClick={() => startNewDocument(kind)}>
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
            <Field label="انتخاب مشتری ذخیره‌شده">
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
            <Field label="نام مشتری">
              <Input
                value={draft.customer.name}
                onChange={(e) => setDraftCustomer({ ...draft.customer, name: e.target.value })}
                placeholder="نام مشتری را وارد کنید"
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
                  toast.error("ابتدا نام مشتری را بنویسید");
                  return;
                }
                const id = addCustomer({ ...draft.customer });
                setDraftCustomer({ ...draft.customer, id });
                toast.success("مشتری در دفتر ذخیره شد");
              }}
            >
              <Users className="size-4" />
              ذخیره این مشتری
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
      toast.error("نام مشتری لازم است");
      return;
    }
    if (editing) {
      updateCustomer(editing, form);
      toast.success("مشتری به‌روز شد");
    } else {
      addCustomer(form);
      toast.success("مشتری اضافه شد");
    }
    setOpen(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>دفتر مشتریان</CardTitle>
            <CardDescription>نام و مشخصات خریدار را نگه دارید</CardDescription>
          </div>
          <Button onClick={openNew}>
            <Plus className="size-4" />
            مشتری جدید
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
            <DialogTitle>{editing ? "ویرایش مشتری" : "مشتری جدید"}</DialogTitle>
          </DialogHeader>
          <CustomerFields form={form} setForm={setForm} />
          <Button onClick={save}>ذخیره مشتری</Button>
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
      <Field label="نام مشتری">
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
  onOpen: (kind: DocKind) => void;
  onPrint: (invoice: Invoice) => void;
}) {
  const invoices = useInvoiceStore((s) => s.invoices);
  const loadInvoice = useInvoiceStore((s) => s.loadInvoice);
  const removeInvoice = useInvoiceStore((s) => s.removeInvoice);
  const convertQuoteToInvoice = useInvoiceStore((s) => s.convertQuoteToInvoice);
  const [filter, setFilter] = useState<"all" | DocKind>("all");

  const rows = invoices.filter((i) => filter === "all" || i.kind === filter);

  return (
    <Card>
      <CardHeader>
        <CardTitle>سوابق اسناد</CardTitle>
        <CardDescription>برای چاپ یا ویرایش، سند را باز کنید</CardDescription>
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            همه
          </Button>
          <Button size="sm" variant={filter === "quote" ? "default" : "outline"} onClick={() => setFilter("quote")}>
            پیش‌فاکتورها
          </Button>
          <Button size="sm" variant={filter === "invoice" ? "default" : "outline"} onClick={() => setFilter("invoice")}>
            فاکتورها
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
                    {inv.kind === "invoice" ? "فاکتور" : "پیش‌فاکتور"}
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
                    onOpen(inv.kind);
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

function SellerPanel() {
  const seller = useInvoiceStore((s) => s.seller);
  const setSeller = useInvoiceStore((s) => s.setSeller);
  return (
    <Card>
      <CardHeader>
        <CardTitle>مشخصات فروشنده</CardTitle>
        <CardDescription>این اطلاعات روی همه فاکتورها چاپ می‌شود</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Field label="نام فروشنده" >
          <Input value={seller.name} onChange={(e) => setSeller({ ...seller, name: e.target.value })} />
        </Field>
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
        <Field label="کدپستی">
          <Input
            value={seller.postalCode}
            onChange={(e) => setSeller({ ...seller, postalCode: e.target.value })}
          />
        </Field>
        <Field label="تلفن">
          <Input
            value={seller.phone}
            onChange={(e) => setSeller({ ...seller, phone: e.target.value })}
          />
        </Field>
        <Field label="کد رهگیری">
          <Input
            value={seller.trackingCode}
            onChange={(e) => setSeller({ ...seller, trackingCode: e.target.value })}
          />
        </Field>
        <Field label="نشانی" >
          <Input
            value={seller.address}
            onChange={(e) => setSeller({ ...seller, address: e.target.value })}
          />
        </Field>
        <div >
          <Button
            onClick={() => {
              setSeller({ ...seller });
              toast.success("مشخصات فروشنده ذخیره شد");
            }}
          >
            ذخیره مشخصات
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
