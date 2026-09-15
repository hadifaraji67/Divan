import React, { useEffect, useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Download, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { Invoice } from '../../types/models';
import { invoiceTotal, invoiceTypeLabel } from '../../types/models';
import { loadData } from '../../lib/storage';
import { useSettings, formatNum } from '../../lib/theme-context';

export const PurchaseSalesReport: React.FC = () => {
  const { settings } = useSettings();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [period, setPeriod] = useState<'all' | 'month' | 'quarter' | 'year'>('all');

  useEffect(() => { setInvoices(loadData<Invoice[]>('invoices', []).filter(i => !i.void)); }, []);
  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);

  const filtered = useMemo(() => {
    if (period === 'all') return invoices;
    const now = new Date();
    const cy = now.getFullYear() - 621;
    return invoices.filter(inv => {
      const parts = inv.date.split('/');
      if (parts.length < 3) return false;
      const toEn = (s: string) => s.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
      const y = Number(toEn(parts[0]));
      const m = Number(toEn(parts[1]));
      if (period === 'year') return y === cy;
      if (period === 'month') return y === cy && m === now.getMonth() + 1;
      if (period === 'quarter') {
        const q = Math.floor(now.getMonth() / 3) + 1;
        const iq = Math.floor((m - 1) / 3) + 1;
        return y === cy && q === iq;
      }
      return true;
    });
  }, [invoices, period]);

  const stats = useMemo(() => {
    const sum = (type: string) => filtered.filter(i => i.type === type)
      .reduce((s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost), 0);
    const sales = sum('فروش');
    const preSales = sum('پیش‌فاکتور فروش');
    const purchases = sum('خرید');
    const prePurchases = sum('پیش‌فاکتور خرید');
    const returns = sum('برگشت از فروش');
    return { sales, preSales, purchases, prePurchases, returns, profit: sales - purchases - returns };
  }, [filtered]);

  const monthly = useMemo(() => {
    const months = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
    const data = months.map(m => ({ month: m, sales: 0, purchases: 0 }));
    const toEn = (s: string) => s.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
    filtered.forEach(inv => {
      const p = inv.date.split('/');
      if (p.length < 2) return;
      const m = Number(toEn(p[1]));
      if (m < 1 || m > 12) return;
      const t = invoiceTotal(inv.items, inv.discountPercent, inv.taxPercent, inv.shippingCost);
      if (inv.type === 'فروش') data[m - 1].sales += t;
      else if (inv.type === 'خرید') data[m - 1].purchases += t;
    });
    return data;
  }, [filtered]);

  const maxVal = Math.max(...monthly.map(m => Math.max(m.sales, m.purchases)), 1);

  const exportCSV = () => {
    const rows = [
      ['ماه', 'فروش', 'خرید'],
      ...monthly.map(m => [m.month, String(m.sales), String(m.purchases)]),
      ['جمع', String(stats.sales), String(stats.purchases)],
    ];
    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `purchase-sales-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
          {([{ v: 'all', t: 'همه' }, { v: 'month', t: 'این ماه' }, { v: 'quarter', t: 'فصل' }, { v: 'year', t: 'سال' }] as const).map(o => (
            <button key={o.v} onClick={() => setPeriod(o.v)}
              className={`px-3 py-1.5 text-xs rounded-md ${period === o.v ? 'bg-white dark:bg-slate-700 shadow font-bold' : 'opacity-70'}`}>
              {o.t}
            </button>
          ))}
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg">
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card title="کل فروش" value={f(stats.sales)} unit={settings.currency} color="emerald" icon={ArrowDownRight} />
        <Card title="کل خرید" value={f(stats.purchases)} unit={settings.currency} color="rose" icon={ArrowUpRight} />
        <Card title="برگشت از فروش" value={f(stats.returns)} unit={settings.currency} color="amber" icon={TrendingDown} />
        <Card title="سود ناخالص" value={f(stats.profit)} unit={settings.currency} color={stats.profit >= 0 ? 'indigo' : 'rose'} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SubCard title="پیش‌فاکتور فروش" value={f(stats.preSales)} />
        <SubCard title="پیش‌فاکتور خرید" value={f(stats.prePurchases)} />
      </div>

      {/* نمودار مقایسه */}
      <div className="rounded-2xl border bg-white dark:bg-slate-900/50 p-4" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        <h3 className="text-sm font-bold mb-4">مقایسه خرید و فروش ماهانه</h3>
        <div className="flex items-end gap-1.5 h-52">
          {monthly.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 items-end" style={{ height: '100%' }}>
                <div className="flex-1 rounded-t bg-gradient-to-t from-emerald-500 to-emerald-400" style={{ height: `${(m.sales / maxVal) * 100}%`, minHeight: '2px' }} title={`فروش: ${f(m.sales)}`} />
                <div className="flex-1 rounded-t bg-gradient-to-t from-rose-500 to-rose-400" style={{ height: `${(m.purchases / maxVal) * 100}%`, minHeight: '2px' }} title={`خرید: ${f(m.purchases)}`} />
              </div>
              <div className="text-[9px] opacity-60 truncate w-full text-center">{m.month.slice(0, 4)}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-3 text-[11px]">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500" /> فروش</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500" /> خرید</span>
        </div>
      </div>
    </div>
  );
};

const Card: React.FC<{ title: string; value: string; unit: string; color: string; icon: any }> = ({ title, value, unit, color, icon: Icon }) => {
  const c: any = {
    emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400',
    rose: 'from-rose-500/10 to-rose-500/5 text-rose-600 dark:text-rose-400',
    amber: 'from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400',
    indigo: 'from-indigo-500/10 to-indigo-500/5 text-indigo-600 dark:text-indigo-400',
  };
  return (
    <div className={`rounded-xl border p-4 bg-gradient-to-br ${c[color]}`} style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
      <div className="flex justify-between items-start mb-1">
        <span className="text-xs opacity-70">{title}</span>
        <Icon className="w-4 h-4 opacity-60" />
      </div>
      <div className="text-base font-bold">{value}</div>
      <div className="text-[10px] opacity-60">{unit}</div>
    </div>
  );
};

const SubCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div className="rounded-xl border bg-white dark:bg-slate-900/50 p-3" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
    <div className="text-xs opacity-60 mb-1">{title}</div>
    <div className="text-sm font-bold">{value}</div>
  </div>
);

export default PurchaseSalesReport;
