import React, { useEffect, useState, useMemo } from 'react';
import { Star, Crown, Award, TrendingUp, Users, Gift } from 'lucide-react';
import type { Invoice, Contact, Payment } from '../../types/models';
import { invoiceTotal } from '../../types/models';
import { loadData } from '../../lib/storage';
import { useSettings, formatNum } from '../../lib/theme-context';

export type CustomerLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'vip';

interface CustomerStats {
  contact: Contact;
  totalPurchase: number;
  invoiceCount: number;
  paid: number;
  lastPurchase?: string;
  level: CustomerLevel;
  points: number;
  discountPercent: number;
}

const LEVELS: Record<CustomerLevel, { title: string; color: string; icon: any; min: number; discount: number }> = {
  bronze: { title: 'برنزی', color: 'from-amber-600 to-amber-700', icon: Award, min: 0, discount: 0 },
  silver: { title: 'نقره‌ای', color: 'from-slate-400 to-slate-500', icon: Award, min: 10000000, discount: 2 },
  gold: { title: 'طلایی', color: 'from-amber-400 to-yellow-500', icon: Crown, min: 50000000, discount: 5 },
  platinum: { title: 'پلاتینیوم', color: 'from-cyan-400 to-sky-500', icon: Crown, min: 100000000, discount: 8 },
  vip: { title: 'VIP', color: 'from-violet-500 to-purple-600', icon: Star, min: 300000000, discount: 12 },
};

function getLevel(total: number): CustomerLevel {
  if (total >= LEVELS.vip.min) return 'vip';
  if (total >= LEVELS.platinum.min) return 'platinum';
  if (total >= LEVELS.gold.min) return 'gold';
  if (total >= LEVELS.silver.min) return 'silver';
  return 'bronze';
}

export const CustomerClub: React.FC = () => {
  const { settings } = useSettings();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<CustomerLevel | 'all'>('all');

  useEffect(() => {
    setContacts(loadData<Contact[]>('contacts', []));
    setInvoices(loadData<Invoice[]>('invoices', []));
    setPayments(loadData<Payment[]>('payments', []));
  }, []);

  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);

  const customers: CustomerStats[] = useMemo(() => {
    return contacts
      .filter(c => c.roles.includes('مشتری'))
      .map(c => {
        const custInvoices = invoices.filter(i => i.contactId === c.id && i.type === 'فروش');
        const totalPurchase = custInvoices.reduce((s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost), 0);
        const paid = payments.filter(p => p.contactId === c.id && p.direction === 'دریافت').reduce((s, p) => s + p.amount, 0);
        const level = getLevel(totalPurchase);
        const points = Math.floor(totalPurchase / 100000); // هر ۱۰۰ هزار ریال = ۱ امتیاز
        return {
          contact: c,
          totalPurchase,
          invoiceCount: custInvoices.length,
          paid,
          lastPurchase: custInvoices.length > 0 ? custInvoices[0].date : undefined,
          level,
          points,
          discountPercent: LEVELS[level].discount,
        };
      })
      .sort((a, b) => b.totalPurchase - a.totalPurchase);
  }, [contacts, invoices, payments]);

  const filtered = filter === 'all' ? customers : customers.filter(c => c.level === filter);

  const levelCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    customers.forEach(c => { counts[c.level] = (counts[c.level] || 0) + 1; });
    return counts;
  }, [customers]);

  return (
    <div className="space-y-4" dir="rtl">
      {/* کارت‌های سطح */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {(Object.keys(LEVELS) as CustomerLevel[]).map(lvl => {
          const L = LEVELS[lvl];
          const Icon = L.icon;
          const isActive = filter === lvl;
          return (
            <button
              key={lvl}
              onClick={() => setFilter(isActive ? 'all' : lvl)}
              className={`p-3 rounded-xl border text-center transition-all bg-gradient-to-br ${L.color} text-white ${
                isActive ? 'ring-2 ring-offset-2 ring-offset-transparent scale-[1.02]' : 'opacity-90'
              }`}
              style={{ borderColor: 'transparent' }}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs font-bold">{L.title}</div>
              <div className="text-lg font-bold mt-0.5">{f(levelCounts[lvl] || 0)}</div>
              <div className="text-[10px] opacity-80">{f(L.discount)}٪ تخفیف</div>
            </button>
          );
        })}
      </div>

      {filter !== 'all' && (
        <button onClick={() => setFilter('all')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
          ← نمایش همه
        </button>
      )}

      {/* جدول */}
      <div className="rounded-2xl border bg-white dark:bg-slate-900/50 overflow-hidden" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs opacity-40">مشتری‌ای در این سطح نیست</div>
        ) : (
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {filtered.map((c, i) => {
              const L = LEVELS[c.level];
              const Icon = L.icon;
              return (
                <div key={c.contact.id} className="p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${L.color} text-white flex items-center justify-center shrink-0 relative`}>
                      <Icon className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center border border-slate-200 dark:border-slate-700">
                        {f(i + 1)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">
                        {c.contact.type === 'حقوقی' ? c.contact.companyName || c.contact.name : `${c.contact.name} ${c.contact.lastName || ''}`}
                      </div>
                      <div className="text-[11px] opacity-60 flex flex-wrap gap-3 mt-0.5">
                        <span>{f(c.invoiceCount)} فاکتور</span>
                        <span>امتیاز: <b className="text-amber-600">{f(c.points)}</b></span>
                        <span>تخفیف: <b className="text-emerald-600">{f(c.discountPercent)}٪</b></span>
                        {c.lastPurchase && <span>آخرین خرید: {c.lastPurchase}</span>}
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <div className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{f(c.totalPurchase)}</div>
                      <div className="text-[10px] opacity-50">{settings.currency}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* راهنما */}
      <div className="rounded-2xl border bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-4" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Gift className="w-4 h-4 text-indigo-500" /> سطوح باشگاه مشتریان
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
          {(Object.keys(LEVELS) as CustomerLevel[]).map(lvl => {
            const L = LEVELS[lvl];
            return (
              <div key={lvl} className="p-2 rounded-lg bg-white/60 dark:bg-slate-900/40">
                <div className="font-bold">{L.title}</div>
                <div className="opacity-60 mt-0.5">از {f(L.min / 1000000)}M</div>
                <div className="text-emerald-600 font-bold mt-1">{f(L.discount)}٪ تخفیف</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomerClub;
