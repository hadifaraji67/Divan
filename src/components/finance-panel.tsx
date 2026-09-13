import { useMemo, useState } from "react";
import { Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
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
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  useInvoiceStore,
  type TransactionType,
} from "@/lib/store";
import { useBackableOpen } from "@/lib/use-backable-open";

function emptyForm(type: TransactionType) {
  return {
    type,
    category: type === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
    amount: "",
    description: "",
  };
}

export function FinancePanel() {
  const transactions = useInvoiceStore((s) => s.transactions);
  const addTransaction = useInvoiceStore((s) => s.addTransaction);
  const removeTransaction = useInvoiceStore((s) => s.removeTransaction);
  const restoreTransaction = useInvoiceStore((s) => s.restoreTransaction);
  const [open, setOpen] = useState(false);
  useBackableOpen(open, () => setOpen(false));
  const [form, setForm] = useState(emptyForm("expense"));
  const [showArchived, setShowArchived] = useState(false);

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.void) return acc;
        if (t.type === "income") acc.income += t.amount;
        else acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0 },
    );
  }, [transactions]);

  const visibleTransactions = transactions.filter((t) => (showArchived ? !!t.void : !t.void));

  function openNew(type: TransactionType) {
    setForm(emptyForm(type));
    setOpen(true);
  }

  function save() {
    const amount = parseAmount(form.amount);
    if (amount <= 0) {
      toast.error("مبلغ را وارد کنید");
      return;
    }
    addTransaction({
      type: form.type,
      category: form.category,
      amount,
      description: form.description,
      date: new Date().toISOString(),
    });
    toast.success(form.type === "income" ? "درآمد ثبت شد" : "هزینه ثبت شد");
    setOpen(false);
  }

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="grid gap-1 p-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <TrendingUp className="size-4" />
              <span className="text-xs">جمع درآمد</span>
            </div>
            <p className="text-lg font-semibold tabular-nums">{formatRial(totals.income)} ریال</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-1 p-4">
            <div className="flex items-center gap-2 text-rose-600">
              <TrendingDown className="size-4" />
              <span className="text-xs">جمع هزینه</span>
            </div>
            <p className="text-lg font-semibold tabular-nums">{formatRial(totals.expense)} ریال</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1" onClick={() => openNew("income")}>
          <Plus className="size-4" />
          ثبت درآمد
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => openNew("expense")}>
          <Plus className="size-4" />
          ثبت هزینه
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>تراکنش‌ها</CardTitle>
              <CardDescription>آخرین هزینه‌ها و درآمدهای ثبت‌شده</CardDescription>
            </div>
            <Button size="sm" variant={showArchived ? "default" : "outline"} onClick={() => setShowArchived((v) => !v)}>
              {showArchived ? "فعال‌ها" : "آرشیو"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2">
          {visibleTransactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {showArchived ? "تراکنش باطل‌شده‌ای وجود ندارد." : "تراکنشی ثبت نشده است."}
            </p>
          ) : (
            visibleTransactions.map((t) => (
              <div
                key={t.id}
                className="flex items-start justify-between gap-3 rounded-xl bg-muted/70 p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {t.category}
                    {t.description ? ` — ${t.description}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatJalali(t.date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`tabular-nums text-sm font-medium ${
                      t.type === "income" ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {t.type === "income" ? "+" : "−"}
                    {formatRial(t.amount)}
                  </span>
                  {t.void ? (
                    <Button variant="ghost" size="sm" onClick={() => restoreTransaction(t.id)}>
                      بازگردانی
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="ابطال"
                      onClick={() => removeTransaction(t.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.type === "income" ? "ثبت درآمد" : "ثبت هزینه"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Field label="دسته‌بندی">
              <select
                className="flex h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {(form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="مبلغ (ریال)">
              <Input
                inputMode="numeric"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder={toFaDigits(0)}
              />
            </Field>
            <Field label="توضیحات (اختیاری)">
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </Field>
            <Button onClick={save}>ذخیره</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
