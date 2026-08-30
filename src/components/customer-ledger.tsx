import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/field";
import { formatJalali, formatRial, parseAmount, toFaDigits } from "@/lib/format";
import { customerBalance, useInvoiceStore, type Customer, type PaymentDirection } from "@/lib/store";

export function CustomerLedger() {
  const customers = useInvoiceStore((s) => s.customers);
  const invoices = useInvoiceStore((s) => s.invoices);
  const payments = useInvoiceStore((s) => s.payments);
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      customers
        .map((c) => ({ customer: c, balance: customerBalance(invoices, payments, c.id) }))
        .sort((a, b) => b.balance - a.balance),
    [customers, invoices, payments],
  );

  const openCustomer = customers.find((c) => c.id === openId) ?? null;

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>دفتر بدهی و بستانکاری</CardTitle>
          <CardDescription>مبلغ مثبت یعنی مشتری بدهکار است</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">هنوز مشتری‌ای ثبت نشده.</p>
          ) : (
            rows.map((r) => (
              <button
                key={r.customer.id}
                onClick={() => setOpenId(r.customer.id)}
                className="flex items-center justify-between gap-3 rounded-xl bg-muted/70 p-3 text-right"
              >
                <div className="min-w-0">
                  <p className="font-medium">{r.customer.name}</p>
                  <p className="text-xs text-muted-foreground">{r.customer.phone || "—"}</p>
                </div>
                <span
                  className={`tabular-nums text-sm font-semibold ${
                    r.balance > 0 ? "text-rose-600" : r.balance < 0 ? "text-emerald-600" : "text-muted-foreground"
                  }`}
                >
                  {r.balance === 0
                    ? "تسویه"
                    : `${formatRial(Math.abs(r.balance))} ریال ${r.balance > 0 ? "بدهکار" : "بستانکار"}`}
                </span>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={!!openCustomer} onOpenChange={(v) => !v && setOpenId(null)}>
        <DialogContent>
          {openCustomer ? (
            <CustomerLedgerDetail customer={openCustomer} onClose={() => setOpenId(null)} />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CustomerLedgerDetail({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const invoices = useInvoiceStore((s) => s.invoices);
  const payments = useInvoiceStore((s) => s.payments);
  const addPayment = useInvoiceStore((s) => s.addPayment);
  const removePayment = useInvoiceStore((s) => s.removePayment);

  const [direction, setDirection] = useState<PaymentDirection>("receipt");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const balance = customerBalance(invoices, payments, customer.id);
  const customerPayments = payments
    .filter((p) => p.customerId === customer.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  function save() {
    const value = parseAmount(amount);
    if (value <= 0) {
      toast.error("مبلغ را وارد کنید");
      return;
    }
    addPayment({ customerId: customer.id, amount: value, direction, note, date: new Date().toISOString() });
    toast.success("ثبت شد");
    setAmount("");
    setNote("");
  }

  return (
    <div className="grid gap-4">
      <DialogHeader>
        <DialogTitle>{customer.name}</DialogTitle>
      </DialogHeader>

      <div className="rounded-xl bg-muted/70 p-3 text-center">
        <p className="text-xs text-muted-foreground">مانده حساب</p>
        <p
          className={`text-lg font-semibold tabular-nums ${
            balance > 0 ? "text-rose-600" : balance < 0 ? "text-emerald-600" : ""
          }`}
        >
          {balance === 0
            ? "تسویه"
            : `${formatRial(Math.abs(balance))} ریال ${balance > 0 ? "بدهکار" : "بستانکار"}`}
        </p>
      </div>

      <div className="grid gap-3">
        <div className="flex gap-2">
          <Button
            variant={direction === "receipt" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setDirection("receipt")}
          >
            دریافت از مشتری
          </Button>
          <Button
            variant={direction === "payment" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setDirection("payment")}
          >
            پرداخت به مشتری
          </Button>
        </div>
        <Field label="مبلغ (ریال)">
          <Input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={toFaDigits(0)} />
        </Field>
        <Field label="توضیحات (اختیاری)">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <Button onClick={save}>
          <Plus className="size-4" />
          ثبت تراکنش
        </Button>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-medium">تاریخچه تراکنش‌ها</p>
        {customerPayments.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">تراکنشی ثبت نشده.</p>
        ) : (
          customerPayments.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted/70 p-3">
              <div className="min-w-0">
                <p className="text-sm">{p.direction === "receipt" ? "دریافت" : "پرداخت"}{p.note ? ` — ${p.note}` : ""}</p>
                <p className="text-xs text-muted-foreground">{formatJalali(p.date)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="tabular-nums text-sm font-medium">{formatRial(p.amount)}</span>
                <Button variant="ghost" size="icon" aria-label="حذف" onClick={() => removePayment(p.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Button variant="outline" onClick={onClose}>
        بستن
      </Button>
    </div>
  );
}
