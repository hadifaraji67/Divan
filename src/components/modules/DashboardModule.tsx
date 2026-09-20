import React, { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Users, Package, FileText, Wallet,
  ArrowUpRight, ArrowDownRight, CreditCard, CheckSquare, AlertTriangle,
  Plus, ShoppingCart, UserPlus, Boxes, Clock, Calendar,
  BarChart3, Activity, Star,
} from 'lucide-react';
import { loadData } from '../../lib/storage';
import type { Contact, Product, Invoice, Payment, Cheque } from '../../types/models';
import { invoiceTotal } from '../../types/models';
import { useSettings, formatNum } from '../../lib/theme-context';
import { roundRial } from '../../types/models';
import { formatJalaliLong, todayJalali } from '../../lib/jalali';

interface Props {
  onNavigate: (view: any) => void;
}

export const DashboardModule: React.FC<Props> = ({ onNavigate }) => {
  const { settings } = useSettings();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cheques, setCheques] = useState<Cheque[]>([]);

  useEffect(() => {
    setContacts(loadData<Contact[]>('contacts', []));
    setProducts(loadData<Product[]>('products', []));
    setInvoices(loadData<Invoice[]>('invoices', []).filter(i => !i.void));
    setPayments(loadData<Payment[]>('payments', []).filter(p => !p.void));
    setCheques(loadData<Cheque[]>('cheques', []).filter(c => !c.void));
  }, []);

  const stats = useMemo(() => {
    const totalSales = invoices
      .filter(i => i.type === 'فروش')
      .reduce((s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost), 0);

    const totalPurchases = invoices
      .filter(i => i.type === 'خرید')
      .reduce((s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost), 0);

    const received = payments
      .filter(p => p.direction === 'دریافت')
      .reduce((s, p) => s + p.amount, 0);

    const paid = payments
      .filter(p => p.direction === 'پرداخت')
      .reduce((s, p) => s + p.amount, 0);

    const pendingCheques = cheques.filter(c => c.status === 'در جریان').length;
    const lowStock = products.filter(p => p.stock <= p.minStock).length;
    const dueSoon = cheques.filter(c => {
      if (c.status !== 'در جریان') return false;
      return true;
    }).length;

    const balance = received - paid;

    return {
      totalSales, totalPurchases, received, paid, balance,
      pendingCheques, lowStock, dueSoon,
      contactsCount: contacts.length,
      productsCount: products.length,
      invoicesCount: invoices.length,
    };
  }, [contacts, products, invoices, payments, cheques]);

  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 5);
  }, [invoices]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; total: number }>();
    invoices.forEach(inv => {
      if (inv.type !== 'فروش') return;
      inv.items.forEach(it => {
        const cur = map.get(it.productId) || { name: it.productName, qty: 0, total: 0 };
        cur.qty += it.quantity;
        cur.total += roundRial(it.quantity * it.unitPrice);
        map.set(it.productId, cur);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [invoices]);

  const monthlySales = useMemo(() => {
    const months = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
    const data = months.map(m => ({ month: m, total: 0 }));
    invoices.filter(i => i.type === 'فروش').forEach(inv => {
      const parts = inv.date.split('/');
      if (parts.length >= 2) {
        const m = Number(parts[1]);
        if (m >= 1 && m <= 12) {
          data[m - 1].total += invoiceTotal(inv.items, inv.discountPercent, inv.taxPercent, inv.shippingCost);
        }
      }
    });
    return data;
  }, [invoices]);

  const maxMonthly = Math.max(...monthlySales.map(m => m.total), 1);
  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);

  return (
    <div className="space-y-5" dir="rtl">

      {/* خوش‌آمد + میانبر */}
      <div className="relative overflow-hidden rounded-2xl p-5 md:p-6 bg-gradient-to-l from-indigo-600 via-indigo-500 to-violet-600 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs opacity-80 mb-1">
              <Star className="w-3.5 h-3.5" fill="currentColor" />
              {(() => { const t = todayJalali(); return formatJalaliLong(t.jy, t.jm, t.jd); })()}
            </div>
            <h2 className="text-lg md:text-xl font-bold">به دیوان خوش آمدید 🎉</h2>
            <p className="text-xs md:text-sm opacity-80 mt-1">
              {settings.storeName} — خلاصه عملکرد امروز شما ✨
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <QuickAction icon={FileText} label="فاکتور جدید" onClick={() => onNavigate('invoices')} />
            <QuickAction icon={UserPlus} label="مشتری جدید" onClick={() => onNavigate('contacts')} />
            <QuickAction icon={Boxes} label="کالای جدید" onClick={() => onNavigate('inventory')} />
          </div>
        </div>
      </div>

      {/* اعلان‌ها */}
      {(stats.lowStock > 0 || stats.pendingCheques > 0) && (
        <div className="flex flex-wrap gap-2">
          {stats.lowStock > 0 && (
            <button onClick={() => onNavigate('inventory')} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs hover:bg-amber-500/20 transition-colors">
              <AlertTriangle className="w-3.5 h-3.5" />
              {f(stats.lowStock)} کالا زیر حد موجودی
            </button>
          )}
          {stats.pendingCheques > 0 && (
            <button onClick={() => onNavigate('cheques')} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-700 dark:text-sky-400 text-xs hover:bg-sky-500/20 transition-colors">
              <CheckSquare className="w-3.5 h-3.5" />
              {f(stats.pendingCheques)} چک در جریان
            </button>
          )}
        </div>
      )}

      {/* کارت‌های آماری */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="فروش کل"
          value={f(stats.totalSales)}
          unit={settings.currency}
          icon={TrendingUp}
          color="emerald"
          trend={stats.totalSales > 0 ? 'up' : 'flat'}
        />
        <StatCard
          title="موجودی نقدی"
          value={f(stats.balance)}
          unit={settings.currency}
          icon={Wallet}
          color={stats.balance >= 0 ? 'indigo' : 'rose'}
          trend={stats.balance >= 0 ? 'up' : 'down'}
        />
        <StatCard
          title="مشتریان"
          value={f(stats.contactsCount)}
          unit="نفر"
          icon={Users}
          color="sky"
        />
        <StatCard
          title="کالاها"
          value={f(stats.productsCount)}
          unit="قلم"
          icon={Package}
          color="violet"
        />
      </div>

      {/* دو ستون: نمودار + پرفروش‌ها */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* نمودار فروش ماهانه */}
        <Card title="فروش ماهانه" icon={BarChart3}>
          {invoices.length === 0 ? (
            <EmptyState text="هنوز فروشی ثبت نشده" />
          ) : (
            <div className="space-y-2">
              <div className="flex items-end gap-1 h-40 pt-2">
                {monthlySales.map((m, i) => {
                  const h = (m.total / maxMonthly) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group" title={`${m.month}: ${f(m.total)} ${settings.currency}`}>
                      <div className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">
                        {m.total > 0 ? f(m.total / 1000000) + 'M' : ''}
                      </div>
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-indigo-400 hover:from-indigo-600 hover:to-indigo-500 transition-all cursor-pointer"
                        style={{ height: `${Math.max(h, 2)}%`, minHeight: '3px' }}
                      />
                      <div className="text-[9px] opacity-60 truncate w-full text-center">{m.month.slice(0, 3)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* پرفروش‌ترین کالاها */}
        <Card title="پرفروش‌ترین کالاها" icon={TrendingUp}>
          {topProducts.length === 0 ? (
            <EmptyState text="هنوز فروشی ثبت نشده" />
          ) : (
            <div className="space-y-2.5">
              {topProducts.map((p, i) => {
                const max = topProducts[0].total || 1;
                const w = (p.total / max) * 100;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold truncate">{p.name}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono shrink-0 mr-2">
                        {f(p.total)} {settings.currency}
                      </span>
                    </div>
                    <div className="h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-l from-indigo-500 to-violet-500 rounded-full transition-all"
                        style={{ width: `${w}%` }}
                      />
                    </div>
                    <div className="text-[10px] opacity-50">{f(p.qty)} عدد فروش</div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* دو ستون: آخرین فاکتورها + خلاصه مالی */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* آخرین فاکتورها */}
        <Card title="آخرین فاکتورها" icon={Clock} action={{ label: 'همه', onClick: () => onNavigate('invoices') }}>
          {recentInvoices.length === 0 ? (
            <EmptyState text="فاکتوری ثبت نشده" />
          ) : (
            <div className="divide-y divide-black/5 dark:divide-white/5 -mx-4 -my-2">
              {recentInvoices.map(inv => {
                const total = invoiceTotal(inv.items, inv.discountPercent, inv.taxPercent, inv.shippingCost);
                return (
                  <button
                    key={inv.id}
                    onClick={() => onNavigate('invoices')}
                    className="w-full flex items-center gap-3 p-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors text-right"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${inv.type === 'فروش' ? 'bg-emerald-500/10 text-emerald-600' : inv.type === 'خرید' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] opacity-60">{inv.number}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5">{inv.type}</span>
                      </div>
                      <div className="text-xs font-bold truncate mt-0.5">{inv.contactName || '—'}</div>
                    </div>
                    <div className="text-left shrink-0">
                      <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{f(total)}</div>
                      <div className="text-[10px] opacity-50">{inv.date}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* خلاصه مالی */}
        <Card title="خلاصه مالی" icon={Activity}>
          <div className="space-y-3">
            <FinanceRow
              icon={ArrowDownRight}
              label="دریافتی‌ها"
              value={f(stats.received)}
              currency={settings.currency}
              color="emerald"
            />
            <FinanceRow
              icon={ArrowUpRight}
              label="پرداختی‌ها"
              value={f(stats.paid)}
              currency={settings.currency}
              color="rose"
            />
            <div className="border-t border-black/5 dark:border-white/5 pt-3">
              <FinanceRow
                icon={Wallet}
                label="مانده صندوق"
                value={f(stats.balance)}
                currency={settings.currency}
                color={stats.balance >= 0 ? 'indigo' : 'rose'}
                bold
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-black/5 dark:border-white/5">
            <MiniStat label="کل فاکتورها" value={f(stats.invoicesCount)} />
            <MiniStat label="چک در جریان" value={f(stats.pendingCheques)} />
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ========== اجزای کمکی ========== */

const Card: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; action?: { label: string; onClick: () => void } }> = ({ title, icon: Icon, children, action }) => (
  <div className="rounded-2xl border bg-white dark:bg-slate-900/50 p-4" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      {action && (
        <button onClick={action.onClick} className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline">
          {action.label} ←
        </button>
      )}
    </div>
    {children}
  </div>
);

const StatCard: React.FC<{
  title: string; value: string; unit: string; icon: React.ElementType;
  color: 'emerald' | 'indigo' | 'sky' | 'violet' | 'rose' | 'amber';
  trend?: 'up' | 'down' | 'flat';
}> = ({ title, value, unit, icon: Icon, color, trend }) => {
  const colors = {
    emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400',
    indigo: 'from-indigo-500/10 to-indigo-500/5 text-indigo-600 dark:text-indigo-400',
    sky: 'from-sky-500/10 to-sky-500/5 text-sky-600 dark:text-sky-400',
    violet: 'from-violet-500/10 to-violet-500/5 text-violet-600 dark:text-violet-400',
    rose: 'from-rose-500/10 to-rose-500/5 text-rose-600 dark:text-rose-400',
    amber: 'from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400',
  };
  return (
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-3 md:p-4 ${colors[color]}`} style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] opacity-70 truncate">{title}</div>
          <div className="text-base md:text-lg font-bold mt-1.5 truncate" dir="ltr" style={{ textAlign: 'right' }}>
            {value}
          </div>
          <div className="text-[10px] opacity-60 mt-0.5">{unit}</div>
        </div>
        <div className="shrink-0">
          <Icon className="w-5 h-5 opacity-60" />
        </div>
      </div>
    </div>
  );
};

const FinanceRow: React.FC<{
  icon: React.ElementType; label: string; value: string; currency: string;
  color: 'emerald' | 'rose' | 'indigo'; bold?: boolean;
}> = ({ icon: Icon, label, value, currency, color, bold }) => {
  const colors = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    rose: 'text-rose-600 dark:text-rose-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
  };
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${colors[color]}`} />
        <span className={`text-xs ${bold ? 'font-bold' : 'opacity-70'}`}>{label}</span>
      </div>
      <div className={`text-sm ${bold ? 'font-bold' : 'font-medium'} ${colors[color]}`} dir="ltr">
        {value} <span className="text-[10px] opacity-60">{currency}</span>
      </div>
    </div>
  );
};

const MiniStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="text-center p-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.02]">
    <div className="text-[10px] opacity-60">{label}</div>
    <div className="text-sm font-bold mt-0.5">{value}</div>
  </div>
);

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div className="py-8 text-center text-xs opacity-40">{text}</div>
);

const QuickAction: React.FC<{ icon: React.ElementType; label: string; onClick: () => void }> = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-sm text-xs font-medium transition-colors"
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
  </button>
);

export default DashboardModule;
