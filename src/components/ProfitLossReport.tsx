import React, { useMemo, useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Download } from 'lucide-react';
import type { Invoice, Product } from '../types/models';
import { invoiceTotal } from '../types/models';
import { loadData } from '../lib/storage';
import { useSettings, formatNum } from '../lib/theme-context';

export const ProfitLossReport: React.FC = () => {
  const { settings } = useSettings();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setInvoices(loadData<Invoice[]>('invoices', []));
    setProducts(loadData<Product[]>('products', []));
  }, []);

  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);

  const report = useMemo(() => {
    const sales = invoices.filter(i => i.type === 'فروش');
    const purchases = invoices.filter(i => i.type === 'خرید');
    const returns = invoices.filter(i => i.type === 'برگشت از فروش');

    let revenue = 0;
    let cogs = 0;

    sales.forEach(inv => {
      inv.items.forEach(it => {
        revenue += it.quantity * it.unitPrice;
        const p = products.find(x => x.id === it.productId);
        cogs += (p?.buyPrice || 0) * it.quantity;
      });
    });

    const grossProfit = revenue - cogs;
    const purchaseCost = purchases.reduce((s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost), 0);
    const returnCost = returns.reduce((s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost), 0);
    const netProfit = grossProfit - returnCost;

    const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    // مالیات فروش
    let salesTax = 0;
    sales.forEach(inv => {
      inv.items.forEach(it => {
        const price = it.quantity * it.unitPrice;
        salesTax += (price * it.taxPercent) / 100;
      });
    });

    return {
      revenue, cogs, grossProfit, purchaseCost, returnCost, netProfit, margin, salesTax,
      salesCount: sales.length,
      purchaseCount: purchases.length,
    };
  }, [invoices, products]);

  const exportCSV = () => {
    const rows = [
      ['عنوان', 'مقدار (ریال)'],
      ['درآمد فروش', String(report.revenue)],
      ['بهای تمام‌شده کالای فروش‌رفته', String(report.cogs)],
      ['سود ناخالص', String(report.grossProfit)],
      ['برگشت از فروش', String(report.returnCost)],
      ['سود خالص', String(report.netProfit)],
      ['حاشیه سود (%)', report.margin.toFixed(2)],
      ['مالیات فروش', String(report.salesTax)],
    ];
    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `profit-loss-${Date.now()}.csv`;
    a.click();
  };

  const Row: React.FC<{ label: string; value: number; bold?: boolean; color?: 'emerald' | 'rose' | 'indigo'; indent?: boolean }> = ({ label, value, bold, color, indent }) => {
    const c = color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : color === 'rose' ? 'text-rose-600 dark:text-rose-400' : color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' : '';
    return (
      <div className={`flex justify-between items-center py-2.5 border-b border-black/5 dark:border-white/5 ${indent ? 'pr-4' : ''}`}>
        <span className={`text-sm ${bold ? 'font-bold' : 'opacity-80'}`}>{label}</span>
        <span className={`font-mono ${bold ? 'text-base font-bold' : 'text-sm'} ${c}`} dir="ltr">
          {f(value)} <span className="text-[10px] opacity-60">{settings.currency}</span>
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-bold">صورت سود و زیان</h2>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg">
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
      </div>

      {/* خلاصه */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SummaryCard title="درآمد کل" value={f(report.revenue)} unit={settings.currency} icon={TrendingUp} color="emerald" />
        <SummaryCard title="سود ناخالص" value={f(report.grossProfit)} unit={settings.currency} icon={Wallet} color="indigo" />
        <SummaryCard
          title="سود خالص"
          value={f(report.netProfit)}
          unit={settings.currency}
          icon={report.netProfit >= 0 ? TrendingUp : TrendingDown}
          color={report.netProfit >= 0 ? 'emerald' : 'rose'}
        />
      </div>

      {/* جدول صورت سود و زیان */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border p-5" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        <h3 className="text-sm font-bold mb-4">صورت سود و زیان دوره</h3>

        <Row label="درآمد فروش" value={report.revenue} color="emerald" bold />
        <Row label="کسر: بهای تمام‌شده کالای فروش‌رفته" value={-report.cogs} color="rose" indent />
        <Row label="سود ناخالص" value={report.grossProfit} bold color={report.grossProfit >= 0 ? 'indigo' : 'rose'} />

        <div className="h-3" />
        <Row label="کسر: برگشت از فروش" value={-report.returnCost} color="rose" indent />
        <Row label="سود عملیاتی" value={report.netProfit} bold color={report.netProfit >= 0 ? 'indigo' : 'rose'} />

        <div className="h-3" />
        <Row label="مالیات فروش (بدهی)" value={report.salesTax} color="rose" indent />

        <div className="mt-4 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20 flex justify-between items-center">
          <span className="text-xs opacity-70">حاشیه سود ناخالص</span>
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400" dir="ltr">
            {report.margin.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* آمار */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900/50" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
          <div className="text-xs opacity-60">تعداد فاکتور فروش</div>
          <div className="text-lg font-bold mt-1">{f(report.salesCount)}</div>
        </div>
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900/50" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
          <div className="text-xs opacity-60">تعداد فاکتور خرید</div>
          <div className="text-lg font-bold mt-1">{f(report.purchaseCount)}</div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{ title: string; value: string; unit: string; icon: React.ElementType; color: 'emerald' | 'indigo' | 'rose' }> = ({ title, value, unit, icon: Icon, color }) => {
  const c = {
    emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400',
    indigo: 'from-indigo-500/10 to-indigo-500/5 text-indigo-600 dark:text-indigo-400',
    rose: 'from-rose-500/10 to-rose-500/5 text-rose-600 dark:text-rose-400',
  }[color];
  return (
    <div className={`rounded-xl border p-4 bg-gradient-to-br ${c}`} style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
      <div className="flex justify-between items-start mb-2">
        <div className="text-xs opacity-70">{title}</div>
        <Icon className="w-4 h-4 opacity-60" />
      </div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] opacity-60 mt-0.5">{unit}</div>
    </div>
  );
};

export default ProfitLossReport;
