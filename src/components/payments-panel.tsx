import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatJalali, formatRial, parseAmount, toFaDigits } from "@/lib/format";
import { useInvoiceStore, type PaymentDirection } from "@/lib/store";
import { useBackableOpen } from "@/lib/use-backable-open";

export function PaymentsPanel() {
  const customers = useInvoiceStore((s) => s.customers);
  const payments = useInvoiceStore((s) => s.payments);
  const addPayment = useInvoiceStore((s) => s.addPayment);
  const removePayment = useInvoiceStore((s) => s.removePayment);

  const [open, setOpen] = useState(false);
  useBackableOpen(open, () => setOpen(false));
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [direction, setDirection] = useState<PaymentDirection>("receipt");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  function openNew(dir: PaymentDirection) {
    setDirection(dir);
    setCustomerId(customers[0]?.id ?? "");
    setAmount("");
    setNote("");
    setOpen(true);
  }

  function save() {
    if (!customerId) {
      toast.error("ابتدا یک طرف‌حساب اضافه کنید");
      return;
    }
    const value = parseAmount(amount);
    if (value <= 0) {
      toast.error("مبلغ را وارد کنید");
      return;
    }
    addPayment({ customerId, amount: value, direction, note, date: new Date().toISOString() });
    toast.success("ثبت شد");
    setOpen(false);
  }

  return (
    <div className="grid gap-4">
      <div className="flex gap-2">
        <Button className="flex-1" onClick={() => openNew("receipt")}>
          <ArrowUpCircle className="size-4" />
          دریافت وجه
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => openNew("payment")}>
          <ArrowDownCircle className="size-4" />
          پرداخت وجه
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>دریافت و پرداخت</CardTitle>
          <CardDescription>همه‌ی تراکنش‌های نقدی با طرف‌حساب‌ها</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {payments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">تراکنشی ثبت نشده.</p>
          ) : (
            payments.map((p) => {
              const customer = customers.find((c) => c.id === p.customerId);
              return (
                <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted/70 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {p.direction === "receipt" ? "دریافت از" : "پرداخت به"} {customer?.name ?? "طرف‌حساب حذف‌شده"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatJalali(p.date)}
                      {p.note ? ` — ${p.note}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`tabular-nums text-sm font-medium ${
                        p.direction === "receipt" ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {p.direction === "receipt" ? "+" : "−"}
                      {formatRial(p.amount)}
                    </span>
                    <Button variant="ghost" size="icon" aria-label="حذف" onClick={() => removePayment(p.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{direction === "receipt" ? "دریافت وجه" : "پرداخت وجه"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Field label="طرف‌حساب">
              <select
                className="flex h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="مبلغ (ریال)">
              <Input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={toFaDigits(0)} />
            </Field>
            <Field label="توضیحات (اختیاری)">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <Button onClick={save}>
              <Plus className="size-4" />
              ثبت
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
