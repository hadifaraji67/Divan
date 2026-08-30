import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRial, gregorianToJalali, toFaDigits } from "@/lib/format";
import { invoiceSums, useInvoiceStore } from "@/lib/store";

const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export function ReportsPanel() {
  const invoices = useInvoiceStore((s) => s.invoices);
  const transactions = useInvoiceStore((s) => s.transactions);

  const currentYear = gregorianToJalali(new Date()).y;
  const [year, setYear] = useState(currentYear);

  const years = useMemo(() => {
    const set = new Set<number>([currentYear]);
    invoices.forEach((i) => set.add(gregorianToJalali(new Date(i.date)).y));
    transactions.forEach((t) => set.add(gregorianToJalali(new Date(t.date)).y));
    return Array.from(set).sort((a, b) => b - a);
  }, [invoices, transactions, currentYear]);

  const monthly = useMemo(() => {
    const rows = JALALI_MONTHS.map((name, idx) => ({
      month: name,
      m: idx + 1,
      income: 0,
      expense: 0,
    }));

    for (const inv of invoices) {
      if (inv.kind !== "invoice") continue;
      const j = gregorianToJalali(new Date(inv.date));
      if (j.y !== year) continue;
      rows[j.m - 1].income += invoiceSums(inv.items).payable;
    }
    for (const t of transactions) {
      const j = gregorianToJalali(new Date(t.date));
      if (j.y !== year) continue;
      if (t.type === "income") rows[j.m - 1].income += t.amount;
      else rows[j.m - 1].expense += t.amount;
    }
    return rows;
  }, [invoices, transactions, year]);

  const totals = monthly.reduce(
    (acc, r) => {
      acc.income += r.income;
      acc.expense += r.expense;
      return acc;
    },
    { income: 0, expense: 0 },
  );
  const profit = totals.income - totals.expense;

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>گزارش مالی</CardTitle>
              <CardDescription>فروش (فاکتور نهایی) + تراکنش‌های دستی</CardDescription>
            </div>
            <div className="flex items-center gap-1">
              {years.slice(0, 3).map((y) => (
                <Button key={y} size="sm" variant={y === year ? "default" : "outline"} onClick={() => setYear(y)}>
                  {toFaDigits(y)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" fontSize={11} interval={0} angle={-35} textAnchor="end" height={50} />
                <YAxis fontSize={11} tickFormatter={(v) => toFaDigits(v)} />
                <Tooltip
                  formatter={(value: number) => `${formatRial(value)} ریال`}
                  labelFormatter={(label) => label}
                />
                <Legend />
                <Bar dataKey="income" name="درآمد" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="هزینه" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-muted/70 p-3">
              <p className="text-xs text-muted-foreground">درآمد سال</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-emerald-600">
                {formatRial(totals.income)}
              </p>
            </div>
            <div className="rounded-xl bg-muted/70 p-3">
              <p className="text-xs text-muted-foreground">هزینه سال</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-rose-600">
                {formatRial(totals.expense)}
              </p>
            </div>
            <div className="rounded-xl bg-muted/70 p-3">
              <p className="text-xs text-muted-foreground">سود خالص</p>
              <p className={`mt-1 text-sm font-semibold tabular-nums ${profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {formatRial(profit)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
