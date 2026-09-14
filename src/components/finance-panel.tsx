import React, { useEffect, useState, useMemo } from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Download, Landmark, ArrowDownRight, ArrowUpRight, Activity } from 'lucide-react';
import type { Invoice, Payment, Cheque } from '../types/models';
import { invoiceTotal } from '../types/models';
import { loadData } from '../lib/storage';
import { useSettings, formatNum } from '../lib/theme-context';

export const FinancePanel: React.FC = () => {
  const { settings } = useSettings();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cheques, setCheques] = useState<Cheque[]>([]);

  useEffect(() => {
    setInvoices(loadData<Invoice[]>('invoices', []));
    setPayments(loadData<Payment[]>('payments', []));
    setCheques(loadData<Cheque[]>('cheques', []));
  }, []);

  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);

  const stats = useMemo(() => {
    const sales = invoices.filter(i => i.type === 'فروش');
    const purchases = invoices.filter(i => i.type === 'خرید');
    const salesTotal = sales.reduce((s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost), 0);
    const purchaseTotal = purchases.reduce((s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost), 0);
    const received = payments.filter(p => p.direction === 'دریافت').reduce((s, p) => s + p.amount, 0);
    const paid = payments.filter(p => p.direction === 'پرداخت').reduce((s, p) => s + p.amount, 0);

    const pendingChequesIn = cheques.filter(c => c.direction === 'دریافتی' && c.status === 'در جریان').reduce((s, c) => s + c.amount, 0);
    const pendingChequesOut = cheques.filter(c => c.direction === 'پرداختی' && c.status === 'در جریان').reduce((s, c) => s + c.amount, 0);

    // پرداخت‌ها بر اساس نوع
    const byType = {
      'نقد': payments.filter(p => p.type === 'نقد').reduce((s, p) => s + p.amount, 0),
      'کارت': payments.filter(p => p.type === 'کارت').reduce((s, p) => s + p.amount, 0),
      'چک': payments.filter(p => p.type === 'چک').reduce((s, p) => s + p.amount, 0),
    };

    return {
      salesTotal, purchaseTotal, received, paid,
      cashBalance: received - paid,
      pendingChequesIn, pendingChequesOut,
      byType,
      invoiceCount: invoices.length,
    };
  }, [invoices, payments, cheques]);

  // نمودار ورود/خروج روزانه (آخرین ۱۵ روز)
  const dailyFlow = useMemo(() => {
    const map = new Map<string, { in: number; out: number }>();
    payments.forEach(p => {
      const cur = map.get(p.date) || { in: 0, out: 0 };
      if (p.direction === 'دریافت') cur.in += p.amount;
      else cur.out += p.amount;
      map.set(p.date, cur);
    });
    const entries = Array.from(map.entries()).slice(-15);
    return entries;
  }, [payments]);

  const maxFlow = Math.max(...dailyFlow.flatMap(([, v]) => [v.in, v.out]), 1);

  const exportCSV = () => {
    const rows = [
      ['شاخص', 'مقدار (ریال)'],
      ['فروش کل', String(stats.salesTotal)],
      ['خرید کل', String(stats.purchaseTotal)],
      ['دریافتی نقدی', String(stats.received)],
      ['پرداختی نقدی', String(stats.paid)],
      ['مانده صندوق', String(stats.cashBalance)],
      ['چک‌های دریافتی در جریان', String(stats.pendingChequesIn)],
      ['چک‌های پرداختی در جریان', String(stats.pendingChequesOut)],
    ];
    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `finance-panel-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-end">
        <button onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg">
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
      </div>

      {/* کارت اصلی موجودی */}
      <div className="rounded-2xl bg-gradient-to-l from-indigo-600 via-indigo-500 to-violet-600 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs opacity-80 mb-1">
            <Landmark className="w-3.5 h-3.5" />
            موجودی نقدی فعلی
          </div>
          <div className="text-3xl font-bold">{f(stats.cashBalance)}</div>
          <div className="text-xs opacity-80 mt-1">{settings.currency}</div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-[10px] opacity-80"><ArrowDownRight className="w-3 h-3" /> کل دریافتی</div>
              <div className="text-sm font-bold mt-1">{f(stats.received)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-[10px] opacity-80"><ArrowUpRight className="w-3 h-3" /> کل پرداختی</div>
              <div className="text-sm font-bold mt-1">{f(stats.paid)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* کارت‌های مالی */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="فروش کل" value={f(stats.salesTotal)} color="emerald" icon={TrendingUp} />
        <StatCard title="خرید کل" value={f(stats.purchaseTotal)} color="rose" icon={TrendingDown} />
        <StatCard title="چک‌های دریافتی" value={f(stats.pendingChequesIn)} color="sky" icon={Activity} />
        <StatCard title="چک‌های پرداختی" value={f(stats.pendingChequesOut)} color="amber" icon={Activity} />
      </div>

      {/* پرداخت‌ها بر اساس نوع */}
      <div className="rounded-2xl border bg-white dark:bg-slate-900/50 p-4" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        <h3 className="text-sm font-bold mb-4">پرداخت‌ها بر اساس نوع</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(stats.byType).map(([k, v]) => {
            const total = Object.values(stats.byType).reduce((a, b) => a + b, 0);
            const pct = total > 0 ? (v / total) * 100 : 0;
            return (
              <div key={k} className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="currentColor" strokeOpacity="0.1" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.915" fill="transparent" className="text-indigo-500" strokeWidth="3"
                      strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset="0" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{f(pct)}%</div>
                </div>
                <div className="text-xs font-bold">{k}</div>
                <div className="text-[10px] opacity-60 mt-0.5">{f(v)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* نمودار جریان نقدی */}
      {dailyFlow.length > 0 && (
        <div className="rounded-2xl border bg-white dark:bg-slate-900/50 p-4" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
          <h3 className="text-sm font-bold mb-4">جریان نقدی اخیر</h3>
          <div className="flex items-end gap-1.5 h-40">
            {dailyFlow.map(([date, v], i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group" title={`${date}: در ${f(v.in)} / خرج ${f(v.out)}`}>
                <div className="w-full flex gap-0.5 items-end" style={{ height: '100%' }}>
                  <div className="flex-1 rounded-t bg-gradient-to-t from-emerald-500 to-emerald-400" style={{ height: `${(v.in / maxFlow) * 100}%`, minHeight: '2px' }} />
                  <div className="flex-1 rounded-t bg-gradient-to-t from-rose-500 to-rose-400" style={{ height: `${(v.out / maxFlow) * 100}%`, minHeight: '2px' }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-3 text-[11px]">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500" /> دریافتی</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500" /> پرداختی</span>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; color: string; icon: any }> = ({ title, value, color, icon: Icon }) => {
  const c: any = {
    emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400',
    rose: 'from-rose-500/10 to-rose-500/5 text-rose-600 dark:text-rose-400',
    sky: 'from-sky-500/10 to-sky-500/5 text-sky-600 dark:text-sky-400',
    amber: 'from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400',
  };
  return (
    <div className={`rounded-xl border p-4 bg-gradient-to-br ${c[color]}`} style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
      <div className="flex justify-between items-start mb-1">
        <span className="text-xs opacity-70">{title}</span>
        <Icon className="w-4 h-4 opacity-60" />
      </div>
      <div className="text-base font-bold">{value}</div>
    </div>
  );
};

export default FinancePanel;
