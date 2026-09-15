import React, { useEffect, useState, useMemo } from 'react';
import { MapPin, TrendingUp, Users, Download } from 'lucide-react';
import type { Invoice, Contact } from '../../types/models';
import { invoiceTotal } from '../../types/models';
import { loadData } from '../../lib/storage';
import { useSettings, formatNum } from '../../lib/theme-context';

export const RegionalReport: React.FC = () => {
  const { settings } = useSettings();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groupBy, setGroupBy] = useState<'province' | 'county' | 'city'>('province');

  useEffect(() => {
    setInvoices(loadData<Invoice[]>('invoices', []));
    setContacts(loadData<Contact[]>('contacts', []));
  }, []);

  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);

  const data = useMemo(() => {
    const map = new Map<string, { name: string; count: number; total: number; customers: Set<string> }>();
    invoices.filter(i => i.type === 'فروش').forEach(inv => {
      const c = contacts.find(x => x.id === inv.contactId);
      const region = c?.[groupBy] || 'نامشخص';
      const cur = map.get(region) || { name: region, count: 0, total: 0, customers: new Set<string>() };
      cur.count += 1;
      cur.total += invoiceTotal(inv.items, inv.discountPercent, inv.taxPercent, inv.shippingCost);
      cur.customers.add(inv.contactId);
      map.set(region, cur);
    });
    return Array.from(map.values())
      .map(v => ({ ...v, customerCount: v.customers.size }))
      .sort((a, b) => b.total - a.total);
  }, [invoices, contacts, groupBy]);

  const maxTotal = Math.max(...data.map(d => d.total), 1);
  const grandTotal = data.reduce((s, d) => s + d.total, 0);

  const exportCSV = () => {
    const rows = [
      ['منطقه', 'تعداد فاکتور', 'تعداد مشتری', 'مبلغ فروش'],
      ...data.map(d => [d.name, String(d.count), String(d.customerCount), String(d.total)]),
    ];
    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `regional-report-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
          {([
            { v: 'province', t: 'استان' },
            { v: 'county', t: 'شهرستان' },
            { v: 'city', t: 'شهر' },
          ] as const).map(o => (
            <button key={o.v} onClick={() => setGroupBy(o.v)}
              className={`px-3 py-1.5 text-xs rounded-md ${groupBy === o.v ? 'bg-white dark:bg-slate-700 shadow font-bold' : 'opacity-70'}`}>
              {o.t}
            </button>
          ))}
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg">
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
      </div>

      {/* خلاصه */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="rounded-xl border bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 p-4" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
          <div className="text-xs opacity-70 mb-1">کل فروش</div>
          <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{f(grandTotal)}</div>
          <div className="text-[10px] opacity-60">{settings.currency}</div>
        </div>
        <div className="rounded-xl border bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-4" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
          <div className="text-xs opacity-70 mb-1">تعداد مناطق</div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{f(data.length)}</div>
        </div>
        <div className="rounded-xl border bg-gradient-to-br from-sky-500/10 to-sky-500/5 p-4 col-span-2 md:col-span-1" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
          <div className="text-xs opacity-70 mb-1">کل مشتریان فعال</div>
          <div className="text-lg font-bold text-sky-600 dark:text-sky-400">
            {f(new Set(invoices.filter(i => i.type === 'فروش').map(i => i.contactId)).size)}
          </div>
        </div>
      </div>

      {/* جدول */}
      <div className="rounded-2xl border bg-white dark:bg-slate-900/50 overflow-hidden" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        {data.length === 0 ? (
          <div className="p-12 text-center text-xs opacity-40">هنوز فروشی ثبت نشده</div>
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {data.map((d, i) => {
              const w = (d.total / maxTotal) * 100;
              return (
                <div key={d.name} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                        {f(i + 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {d.name}
                        </div>
                        <div className="text-[11px] opacity-60 mt-0.5">
                          {f(d.count)} فاکتور • {f(d.customerCount)} مشتری
                        </div>
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400">{f(d.total)}</div>
                      <div className="text-[10px] opacity-60">{settings.currency}</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-l from-indigo-500 to-violet-500 rounded-full transition-all" style={{ width: `${w}%` }} />
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

export default RegionalReport;
