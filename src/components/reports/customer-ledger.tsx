import React, { useEffect, useState, useMemo } from 'react';
import { BookOpen, Search, Download, TrendingUp, TrendingDown, Wallet, X } from 'lucide-react';
import type { Contact, Invoice, Payment } from '../../types/models';
import { invoiceTotal } from '../../types/models';
import { loadData } from '../../lib/storage';
import { useSettings, formatNum } from '../../lib/theme-context';

interface LedgerRow {
  date: string;
  description: string;
  type: 'invoice' | 'payment' | 'return';
  debit: number;   // بدهکار (طلب ما)
  credit: number;  // بستانکار (پرداخت)
  balance: number; // مانده تجمعی
  ref?: string;
}

export const CustomerLedger: React.FC = () => {
  const { settings } = useSettings();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const c = loadData<Contact[]>('contacts', []);
    setContacts(c);
    setInvoices(loadData<Invoice[]>('invoices', []));
    setPayments(loadData<Payment[]>('payments', []));
    if (c.length > 0) setSelectedId(c[0].id);
  }, []);

  const f = (n: number) => formatNum(Math.round(Math.abs(n)), settings.persianNumbers);

  const selected = contacts.find(c => c.id === selectedId);

  const ledger: LedgerRow[] = useMemo(() => {
    if (!selected) return [];

    const rows: Omit<LedgerRow, 'balance'>[] = [];

    // فاکتورها
    invoices.filter(i => i.contactId === selected.id).forEach(inv => {
      const t = invoiceTotal(inv.items, inv.discountPercent, inv.taxPercent, inv.shippingCost);
      if (inv.type === 'فروش') {
        rows.push({ date: inv.date, description: `فاکتور فروش ${inv.number}`, type: 'invoice', debit: t, credit: 0, ref: inv.number });
      } else if (inv.type === 'برگشت از فروش') {
        rows.push({ date: inv.date, description: `برگشت از فروش ${inv.number}`, type: 'return', debit: 0, credit: t, ref: inv.number });
      } else if (inv.type === 'خرید') {
        rows.push({ date: inv.date, description: `فاکتور خرید ${inv.number}`, type: 'invoice', debit: 0, credit: t, ref: inv.number });
      }
    });

    // پرداخت‌ها
    payments.filter(p => p.contactId === selected.id).forEach(p => {
      rows.push({
        date: p.date,
        description: `${p.direction === 'دریافت' ? 'دریافت' : 'پرداخت'} ${p.type}${p.refCode ? ' — ' + p.refCode : ''}`,
        type: 'payment',
        debit: p.direction === 'پرداخت' ? p.amount : 0,
        credit: p.direction === 'دریافت' ? p.amount : 0,
        ref: p.refCode,
      });
    });

    // مرتب‌سازی بر اساس تاریخ
    rows.sort((a, b) => a.date.localeCompare(b.date));

    // محاسبه مانده تجمعی
    let balance = 0;
    return rows.map(r => {
      balance += r.debit - r.credit;
      return { ...r, balance };
    });
  }, [selected, invoices, payments]);

  const stats = useMemo(() => {
    if (ledger.length === 0) return { debit: 0, credit: 0, balance: 0 };
    const last = ledger[ledger.length - 1];
    return {
      debit: ledger.reduce((s, r) => s + r.debit, 0),
      credit: ledger.reduce((s, r) => s + r.credit, 0),
      balance: last.balance,
    };
  }, [ledger]);

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.trim();
    return contacts.filter(c =>
      c.name.includes(q) || c.lastName?.includes(q) || c.companyName?.includes(q) || c.mobile.includes(q)
    );
  }, [contacts, search]);

  const exportCSV = () => {
    if (!selected) return;
    const rows = [
      [`دفتر معین: ${selected.name} ${selected.lastName || ''}`],
      ['تاریخ', 'شرح', 'بدهکار', 'بستانکار', 'مانده'],
      ...ledger.map(r => [r.date, r.description, String(r.debit), String(r.credit), String(r.balance)]),
      ['', 'جمع', String(stats.debit), String(stats.credit), String(stats.balance)],
    ];
    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ledger-${selected.id}-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* انتخاب شخص */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی شخص..."
            className="w-full pr-10 pl-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-slate-900" />
        </div>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
          className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-900">
          {filteredContacts.map(c => (
            <option key={c.id} value={c.id}>
              {c.type === 'حقوقی' ? c.companyName || c.name : `${c.name} ${c.lastName || ''}`} — {c.mobile}
            </option>
          ))}
        </select>
      </div>

      {/* خلاصه */}
      {selected && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <SummaryCard title="جمع بدهکار" value={f(stats.debit)} unit={settings.currency} color="rose" icon={TrendingUp} />
            <SummaryCard title="جمع بستانکار" value={f(stats.credit)} unit={settings.currency} color="emerald" icon={TrendingDown} />
            <SummaryCard
              title="مانده"
              value={f(stats.balance)}
              unit={settings.currency}
              color={stats.balance > 0 ? 'rose' : stats.balance < 0 ? 'emerald' : 'slate'}
              icon={Wallet}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs opacity-60">
              {stats.balance > 0 ? '🔴 مشتری بدهکار است' : stats.balance < 0 ? '🟢 مشتری بستانکار است' : '⚪ تسویه'}
            </div>
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>

          {/* جدول گردش */}
          <div className="rounded-2xl border bg-white dark:bg-slate-900/50 overflow-hidden" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
            {ledger.length === 0 ? (
              <div className="p-12 text-center text-xs opacity-40">هیچ گردشی برای این شخص ثبت نشده</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-xs">
                    <tr>
                      <th className="p-3 text-right">تاریخ</th>
                      <th className="p-3 text-right">شرح</th>
                      <th className="p-3 text-left">بدهکار</th>
                      <th className="p-3 text-left">بستانکار</th>
                      <th className="p-3 text-left">مانده</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {ledger.map((r, i) => (
                      <tr key={i} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                        <td className="p-3 text-xs whitespace-nowrap">{r.date}</td>
                        <td className="p-3 text-xs">{r.description}</td>
                        <td className="p-3 text-left font-mono text-xs text-rose-600">
                          {r.debit > 0 ? f(r.debit) : '—'}
                        </td>
                        <td className="p-3 text-left font-mono text-xs text-emerald-600">
                          {r.credit > 0 ? f(r.credit) : '—'}
                        </td>
                        <td className={`p-3 text-left font-mono text-xs font-bold ${r.balance > 0 ? 'text-rose-600' : r.balance < 0 ? 'text-emerald-600' : ''}`}>
                          {f(r.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const SummaryCard: React.FC<{ title: string; value: string; unit: string; color: string; icon: any }> = ({ title, value, unit, color, icon: Icon }) => {
  const c: any = {
    rose: 'from-rose-500/10 to-rose-500/5 text-rose-600 dark:text-rose-400',
    emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400',
    slate: 'from-slate-500/10 to-slate-500/5 text-slate-600 dark:text-slate-400',
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

export default CustomerLedger;
