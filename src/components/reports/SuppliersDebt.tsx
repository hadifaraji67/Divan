import React, { useEffect, useState, useMemo } from 'react';
import { Users, Download, TrendingDown, CheckCircle2 } from 'lucide-react';
import type { Contact, Invoice, Payment } from '../../types/models';
import { invoiceTotal } from '../../types/models';
import { loadData } from '../../lib/storage';
import { useSettings, formatNum } from '../../lib/theme-context';

export const SuppliersDebt: React.FC = () => {
  const { settings } = useSettings();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setContacts(loadData<Contact[]>('contacts', []));
    setInvoices(loadData<Invoice[]>('invoices', []));
    setPayments(loadData<Payment[]>('payments', []));
  }, []);

  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);

  const suppliers = useMemo(() => {
    return contacts
      .filter(c => c.roles.includes('تامین‌کننده'))
      .map(c => {
        const purchaseInvoices = invoices.filter(i => i.contactId === c.id && i.type === 'خرید');
        const total = purchaseInvoices.reduce((s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost), 0);
        const paid = payments.filter(p => p.contactId === c.id && p.direction === 'پرداخت').reduce((s, p) => s + p.amount, 0);
        const balance = total - paid;
        return {
          contact: c,
          total, paid, balance,
          count: purchaseInvoices.length,
          name: c.type === 'حقوقی' ? c.companyName || c.name : `${c.name} ${c.lastName || ''}`,
        };
      })
      .filter(s => s.total > 0 || s.balance > 0)
      .sort((a, b) => b.balance - a.balance);
  }, [contacts, invoices, payments]);

  const filtered = useMemo(() => {
    if (!search.trim()) return suppliers;
    const q = search.trim();
    return suppliers.filter(s => s.name.includes(q) || s.contact.mobile.includes(q));
  }, [suppliers, search]);

  const stats = useMemo(() => ({
    totalDebt: suppliers.reduce((s, x) => s + Math.max(0, x.balance), 0),
    totalPaid: suppliers.reduce((s, x) => s + x.paid, 0),
    suppliersCount: suppliers.length,
    settledCount: suppliers.filter(s => s.balance <= 0).length,
  }), [suppliers]);

  const exportCSV = () => {
    const rows = [
      ['تامین‌کننده', 'موبایل', 'تعداد فاکتور', 'کل خرید', 'پرداخت‌شده', 'مانده'],
      ...filtered.map(s => [s.name, s.contact.mobile, String(s.count), String(s.total), String(s.paid), String(s.balance)]),
    ];
    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `suppliers-debt-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat title="کل بدهی" value={f(stats.totalDebt)} unit={settings.currency} color="rose" />
        <Stat title="پرداخت‌شده" value={f(stats.totalPaid)} unit={settings.currency} color="emerald" />
        <Stat title="تامین‌کنندگان" value={f(stats.suppliersCount)} unit="نفر" color="indigo" />
        <Stat title="تسویه‌شده" value={f(stats.settledCount)} unit="نفر" color="sky" />
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجوی تامین‌کننده..."
          className="flex-1 min-w-[200px] p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-900" />
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg">
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-slate-900/50 overflow-hidden" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs opacity-40">
            {suppliers.length === 0 ? 'هیچ تامین‌کننده‌ای با خرید ثبت نشده' : 'چیزی پیدا نشد'}
          </div>
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {filtered.map(s => {
              const isSettled = s.balance <= 0;
              const progress = s.total > 0 ? (s.paid / s.total) * 100 : 0;
              return (
                <div key={s.contact.id} className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm truncate flex items-center gap-2">
                        {s.name}
                        {isSettled && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                      </div>
                      <div className="text-[11px] opacity-60 mt-0.5 flex flex-wrap gap-2">
                        <span>{s.contact.mobile}</span>
                        <span>{f(s.count)} فاکتور</span>
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <div className={`font-bold text-sm ${isSettled ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {f(Math.max(0, s.balance))}
                      </div>
                      <div className="text-[10px] opacity-60">{settings.currency}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[11px] mb-2">
                    <div className="flex justify-between"><span className="opacity-60">کل خرید:</span><b>{f(s.total)}</b></div>
                    <div className="flex justify-between"><span className="opacity-60">پرداخت:</span><b className="text-emerald-600">{f(s.paid)}</b></div>
                  </div>
                  <div className="h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-l from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const Stat: React.FC<{ title: string; value: string; unit: string; color: string }> = ({ title, value, unit, color }) => {
  const c: any = {
    rose: 'from-rose-500/10 to-rose-500/5 text-rose-600 dark:text-rose-400',
    emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400',
    indigo: 'from-indigo-500/10 to-indigo-500/5 text-indigo-600 dark:text-indigo-400',
    sky: 'from-sky-500/10 to-sky-500/5 text-sky-600 dark:text-sky-400',
  };
  return (
    <div className={`rounded-xl border p-4 bg-gradient-to-br ${c[color]}`} style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
      <div className="text-xs opacity-70 mb-1">{title}</div>
      <div className="text-base font-bold">{value}</div>
      <div className="text-[10px] opacity-60">{unit}</div>
    </div>
  );
};

export default SuppliersDebt;
