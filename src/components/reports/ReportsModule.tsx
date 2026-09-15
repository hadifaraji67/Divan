import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3, TrendingUp, Users, Package, Wallet, Download,
  Calendar, Filter, PieChart, ArrowUpRight, ArrowDownRight, Activity,
} from 'lucide-react';
import type { Contact, Product, Invoice, Payment, Cheque } from '../../types/models';
import { invoiceTotal } from '../../types/models';
import { loadData } from '../../lib/storage';
import { useSettings, formatNum } from '../../lib/theme-context';

type Tab = 'sales' | 'products' | 'customers' | 'profit' | 'inventory';

export const ReportsModule: React.FC<{ defaultTab?: 'sales' | 'products' | 'customers' | 'profit' | 'inventory' }> = ({ defaultTab }) => {
  const { settings } = useSettings();
  const [tab, setTab] = useState<Tab>(defaultTab || 'sales');
  const [range, setRange] = useState<'all' | 'month' | 'quarter' | 'year'>('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cheques, setCheques] = useState<Cheque[]>([]);

  useEffect(() => {
    setInvoices(loadData<Invoice[]>('invoices', []));
    setContacts(loadData<Contact[]>('contacts', []));
    setProducts(loadData<Product[]>('products', []));
    setPayments(loadData<Payment[]>('payments', []));
    setCheques(loadData<Cheque[]>('cheques', []));
  }, []);

  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);

  const filtered = useMemo(() => {
    const now = new Date();
    return invoices.filter(inv => {
      if (range === 'all') return true;
      const parts = inv.date.split('/');
      if (parts.length < 3) return true;
      const y = Number(parts[0]), m = Number(parts[1]);
      const cy = now.getFullYear() - 621;
      if (range === 'year') return y === cy;
      if (range === 'month') return y === cy && m === now.getMonth() + 1;
      if (range === 'quarter') {
        const q = Math.floor((now.getMonth()) / 3) + 1;
        const invQ = Math.floor((m - 1) / 3) + 1;
        return y === cy && invQ === q;
      }
      return true;
    });
  }, [invoices, range]);

  const data = useMemo(() => {
    const sales = filtered.filter(i => i.type === 'فروش');
    const purchases = filtered.filter(i => i.type === 'خرید');

    const salesTotal = sales.reduce((s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost), 0);
    const purchaseTotal = purchases.reduce((s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost), 0);

    const received = payments.filter(p => p.direction === 'دریافت').reduce((s, p) => s + p.amount, 0);
    const paid = payments.filter(p => p.direction === 'پرداخت').reduce((s, p) => s + p.amount, 0);

    // سود تخمینی: فروش - بهای تمام‌شده
    let cogs = 0;
    sales.forEach(inv => {
      inv.items.forEach(it => {
        const p = products.find(x => x.id === it.productId);
        cogs += (p?.buyPrice || 0) * it.quantity;
      });
    });
    const grossProfit = salesTotal - cogs;

    // پرفروش‌ترین کالاها
    const prodMap = new Map<string, { name: string; qty: number; revenue: number; cost: number }>();
    sales.forEach(inv => {
      inv.items.forEach(it => {
        const cur = prodMap.get(it.productId) || { name: it.productName, qty: 0, revenue: 0, cost: 0 };
        const prod = products.find(p => p.id === it.productId);
        cur.qty += it.quantity;
        cur.revenue += it.quantity * it.unitPrice;
        cur.cost += (prod?.buyPrice || 0) * it.quantity;
        prodMap.set(it.productId, cur);
      });
    });
    const topProducts = Array.from(prodMap.values()).sort((a, b) => b.revenue - a.revenue);

    // مشتریان برتر
    const custMap = new Map<string, { name: string; count: number; total: number; paid: number }>();
    sales.forEach(inv => {
      const c = custMap.get(inv.contactId) || { name: inv.contactName, count: 0, total: 0, paid: 0 };
      c.count += 1;
      c.total += invoiceTotal(inv.items, inv.discountPercent, inv.taxPercent, inv.shippingCost);
      custMap.set(inv.contactId, c);
    });
    payments.filter(p => p.direction === 'دریافت').forEach(p => {
      const c = custMap.get(p.contactId);
      if (c) c.paid += p.amount;
    });
    const topCustomers = Array.from(custMap.values()).sort((a, b) => b.total - a.total);

    // فروش ماهانه
    const months = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
    const monthly = months.map(m => ({ month: m, total: 0, count: 0 }));
    sales.forEach(inv => {
      const p = inv.date.split('/');
      if (p.length >= 2) {
        const m = Number(p[1]);
        if (m >= 1 && m <= 12) {
          monthly[m - 1].total += invoiceTotal(inv.items, inv.discountPercent, inv.taxPercent, inv.shippingCost);
          monthly[m - 1].count += 1;
        }
      }
    });

    return { salesTotal, purchaseTotal, received, paid, cogs, grossProfit, topProducts, topCustomers, monthly, salesCount: sales.length };
  }, [filtered, products, payments]);

  const maxMonthly = Math.max(...data.monthly.map(m => m.total), 1);

  const exportCSV = () => {
    let rows: string[][] = [];
    if (tab === 'sales') {
      rows = [['ماه', 'تعداد فاکتور', 'مبلغ فروش']];
      data.monthly.forEach(m => rows.push([m.month, String(m.count), String(m.total)]));
    } else if (tab === 'products') {
      rows = [['کالا', 'تعداد فروش', 'درآمد', 'سود']];
      data.topProducts.forEach(p => rows.push([p.name, String(p.qty), String(p.revenue), String(p.revenue - p.cost)]));
    } else if (tab === 'customers') {
      rows = [['مشتری', 'تعداد فاکتور', 'مجموع خرید', 'پرداخت شده']];
      data.topCustomers.forEach(c => rows.push([c.name, String(c.count), String(c.total), String(c.paid)]));
    } else if (tab === 'profit') {
      rows = [['عنوان', 'مقدار'], ['فروش کل', String(data.salesTotal)], ['بهای تمام‌شده', String(data.cogs)], ['سود ناخالص', String(data.grossProfit)]];
    } else {
      rows = [['کالا', 'موجودی', 'حد هشدار', 'ارزش']];
      products.forEach(p => rows.push([p.name, String(p.stock), String(p.minStock), String(p.stock * p.buyPrice)]));
    }
    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `divan-report-${tab}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5" dir="rtl">

      {/* فیلترها */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
          {([
            { v: 'all', t: 'همه' },
            { v: 'month', t: 'این ماه' },
            { v: 'quarter', t: 'فصل' },
            { v: 'year', t: 'سال' },
          ] as const).map(o => (
            <button key={o.v} onClick={() => setRange(o.v)}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${range === o.v ? 'bg-white dark:bg-slate-700 shadow font-bold' : 'opacity-70'}`}>
              {o.t}
            </button>
          ))}
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg">
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
      </div>

      {/* تب‌ها */}
      <div className="flex flex-wrap gap-1 border-b border-black/5 dark:border-white/10 pb-1">
        {([
          { v: 'sales', t: 'فروش', i: TrendingUp },
          { v: 'products', t: 'کالاها', i: Package },
          { v: 'customers', t: 'مشتریان', i: Users },
          { v: 'profit', t: 'سود و زیان', i: Wallet },
          { v: 'inventory', t: 'موجودی', i: BarChart3 },
        ] as const).map(o => {
          const Icon = o.i;
          const active = tab === o.v;
          return (
            <button key={o.v} onClick={() => setTab(o.v as Tab)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-t-lg transition-all ${active ? 'font-bold border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'opacity-60 hover:opacity-100'}`}>
              <Icon className="w-3.5 h-3.5" /> {o.t}
            </button>
          );
        })}
      </div>

      {/* محتوا */}
      {tab === 'sales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPI title="کل فروش" value={f(data.salesTotal)} unit={settings.currency} color="emerald" />
            <KPI title="کل خرید" value={f(data.purchaseTotal)} unit={settings.currency} color="rose" />
            <KPI title="دریافتی" value={f(data.received)} unit={settings.currency} color="indigo" />
            <KPI title="تعداد فاکتور" value={f(data.salesCount)} unit="عدد" color="sky" />
          </div>
          <div className="rounded-2xl border bg-white dark:bg-slate-900/50 p-4" style={{ borderColor: 'var(--border-c,#e2e8f0)' }}>
            <h3 className="text-sm font-bold mb-4">نمودار فروش ماهانه</h3>
            <div className="flex items-end gap-1.5 h-56">
              {data.monthly.map((m, i) => {
                const h = (m.total / maxMonthly) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group" title={`${m.month}: ${f(m.total)}`}>
                    <div className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      {m.total > 0 ? f(m.total / 1000000) + 'M' : ''}
                    </div>
                    <div className="w-full rounded-t bg-gradient-to-t from-indigo-500 to-indigo-400"
                      style={{ height: `${Math.max(h, 2)}%`, minHeight: '4px' }} />
                    <div className="text-[10px] opacity-60 truncate w-full text-center">{m.month.slice(0, 4)}</div>
                    <div className="text-[9px] opacity-40">{m.count > 0 ? f(m.count) : ''}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'products' && (
        <Table
          headers={['کالا', 'تعداد فروش', 'درآمد', 'سود تخمینی']}
          rows={data.topProducts.map(p => [
            p.name,
            f(p.qty) + ' عدد',
            f(p.revenue) + ' ' + settings.currency,
            <span key={p.name} className="text-emerald-600 dark:text-emerald-400 font-bold">{f(p.revenue - p.cost)} {settings.currency}</span>,
          ])}
          empty="هنوز فروشی ثبت نشده"
        />
      )}

      {tab === 'customers' && (
        <Table
          headers={['مشتری', 'تعداد فاکتور', 'مجموع خرید', 'پرداخت شده', 'مانده']}
          rows={data.topCustomers.map(c => [
            c.name,
            f(c.count),
            f(c.total) + ' ' + settings.currency,
            <span key={c.name} className="text-emerald-600 dark:text-emerald-400">{f(c.paid)}</span>,
            <span key={c.name + 'b'} className={c.total - c.paid > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}>
              {f(Math.max(0, c.total - c.paid))}
            </span>,
          ])}
          empty="هنوز مشتری‌ای خرید نکرده"
        />
      )}

      {tab === 'profit' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <KPI title="فروش کل" value={f(data.salesTotal)} unit={settings.currency} color="indigo" big />
          <KPI title="بهای تمام‌شده" value={f(data.cogs)} unit={settings.currency} color="amber" big />
          <KPI title="سود ناخالص" value={f(data.grossProfit)} unit={settings.currency} color={data.grossProfit >= 0 ? 'emerald' : 'rose'} big />
          <div className="md:col-span-3 rounded-2xl border bg-white dark:bg-slate-900/50 p-4" style={{ borderColor: 'var(--border-c,#e2e8f0)' }}>
            <div className="flex justify-between items-center text-sm py-2 border-b border-black/5 dark:border-white/5">
              <span className="opacity-70">حاشیه سود</span>
              <b className={data.grossProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {data.salesTotal > 0 ? f((data.grossProfit / data.salesTotal) * 100) : '۰'}%
              </b>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-black/5 dark:border-white/5">
              <span className="opacity-70">دریافتی نقدی</span>
              <b className="text-emerald-600">{f(data.received)} {settings.currency}</b>
            </div>
            <div className="flex justify-between items-center text-sm py-2">
              <span className="opacity-70">پرداختی نقدی</span>
              <b className="text-rose-600">{f(data.paid)} {settings.currency}</b>
            </div>
          </div>
        </div>
      )}

      {tab === 'inventory' && (
        <Table
          headers={['کالا', 'موجودی', 'حد هشدار', 'ارزش انبار']}
          rows={products.map(p => [
            p.name,
            <span key={p.id} className={p.stock <= p.minStock ? 'text-amber-600 font-bold' : ''}>{f(p.stock)} {p.unit}</span>,
            f(p.minStock),
            f(p.stock * p.buyPrice) + ' ' + settings.currency,
          ])}
          empty="کالایی ثبت نشده"
        />
      )}
    </div>
  );
};

const KPI: React.FC<{ title: string; value: string; unit: string; color: 'emerald'|'rose'|'indigo'|'sky'|'amber'; big?: boolean }> = ({ title, value, unit, color, big }) => {
  const colors = {
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5',
    rose: 'text-rose-600 dark:text-rose-400 bg-rose-500/5',
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/5',
    sky: 'text-sky-600 dark:text-sky-400 bg-sky-500/5',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-500/5',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`} style={{ borderColor: 'var(--border-c,#e2e8f0)' }}>
      <div className="text-[11px] opacity-70">{title}</div>
      <div className={`${big ? 'text-lg' : 'text-base'} font-bold mt-1`}>{value}</div>
      <div className="text-[10px] opacity-50 mt-0.5">{unit}</div>
    </div>
  );
};

const Table: React.FC<{ headers: string[]; rows: React.ReactNode[][]; empty: string }> = ({ headers, rows, empty }) => (
  <div className="rounded-2xl border bg-white dark:bg-slate-900/50 overflow-hidden" style={{ borderColor: 'var(--border-c,#e2e8f0)' }}>
    {rows.length === 0 ? (
      <div className="p-12 text-center text-xs opacity-40">{empty}</div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-xs opacity-70">
            <tr>{headers.map((h, i) => <th key={i} className="p-3 text-right font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                {r.map((c, j) => <td key={j} className="p-3">{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default ReportsModule;
