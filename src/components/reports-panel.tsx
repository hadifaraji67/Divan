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

function getJalaliDate(d: Date) {
  const dateObj = d instanceof Date && !isNaN(d.getTime()) ? d : new Date(d);
  const [jy, jm, jd] = gregorianToJalali(dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate());
  return { y: jy, m: jm, d: jd };
}

export function ReportsPanel() {
  const invoices = useInvoiceStore((s) => s.invoices);
  const transactions = useInvoiceStore((s) => s.transactions);

  const currentYear = getJalaliDate(new Date()).y;
  const [year, setYear] = useState(currentYear);

  const years = useMemo(() => {
    const set = new Set<number>([currentYear]);
    invoices.forEach((i) => set.add(getJalaliDate(new Date(i.date)).y));
    transactions.forEach((t) => set.add(getJalaliDate(new Date(t.date)).y));
    return Array.from(set).sort((a, b) => b - a);
  }, [invoices, transactions, currentYear]);

  const monthlyData = useMemo(() => {
    const rows = JALALI_MONTHS.map((name) => ({ month: name, income: 0, expense: 0 }));

    invoices.forEach((inv) => {
      const j = getJalaliDate(new Date(inv.date));
      if (j.y !== year) return;
      const { total } = invoiceSums(inv);
      if (inv.direction === "sale") rows[j.m - 1].income += total;
      else rows[j.m - 1].expense += total;
    });

    transactions.forEach((t) => {
      const j = getJalaliDate(new Date(t.date));
      if (j.y !== year) return;
      if (t.type === "income") rows[j.m - 1].income += t.amount;
      else rows[j.m - 1].expense += t.amount;
    });

    return rows;
  }, [invoices, transactions, year]);

  const totals = useMemo(() => {
    return monthlyData.reduce(
      (acc, r) => ({ income: acc.income + r.income, expense: acc.expense + r.expense }),
      { income: 0, expense: 0 }
    );
  }, [monthlyData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">گزارش‌های مالی</h2>
        <div className="flex gap-2">
          {years.map((y) => (
            <Button
              key={y}
              variant={y === year ? "default" : "outline"}
              size="sm"
              onClick={() => setYear(y)}
            >
              سال {toFaDigits(y)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>مجموع درآمد سال {toFaDigits(year)}</CardDescription>
            <CardTitle className="text-emerald-600">{formatRial(totals.income)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>مجموع هزینه سال {toFaDigits(year)}</CardDescription>
            <CardTitle className="text-rose-600">{formatRial(totals.expense)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>سود / زیان ناخالص</CardDescription>
            <CardTitle className={totals.income - totals.expense >= 0 ? "text-emerald-600" : "text-rose-600"}>
              {formatRial(totals.income - totals.expense)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>نمودار درآمد و هزینه ماهانه</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatRial(value)} />
                <Legend />
                <Bar dataKey="income" name="درآمد" fill="#10b981" />
                <Bar dataKey="expense" name="هزینه" fill="#f43f5e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
