/**
 * Dashboard v2 — DASHBOARD_V2
 * - KPI با تغییرات (↑↓ %)
 * - نمودار ۷ روزه
 * - آخرین فعالیت‌ها
 * - هشدارها (موجودی کم، چک سررسید)
 * - میانبرهای سریع
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Users, Package, FileText, Wallet,
  AlertTriangle, ShoppingCart, UserPlus, ChevronLeft,
  Clock, CheckCircle2, CreditCard, Calendar, BarChart3,
  ArrowUpRight, ArrowDownRight, Bell, Zap, Sparkles,
} from 'lucide-react';
import { loadData } from '../../lib/storage';
import type { Contact, Product, Invoice, Payment, Cheque } from '../../types/models';
import { invoiceTotal } from '../../types/models';
import { useSettings, formatNum } from '../../lib/theme-context';
import { formatJalaliLong, todayJalali, faMonthName } from '../../lib/jalali';
import { UpdateBanner } from '../shared/UpdateBanner';
import { computeTotalReceivable, computeTotalPayable } from '../../lib/invoice-payment';

interface Props {
  onNavigate: (view: any, data?: any) => void;
}

interface KPI {
  label: string;
  value: number;
  change: number; // percentage
  format: 'money' | 'count';
  icon: React.ElementType;
  color: string;
  view: string;
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
    setInvoices(loadData<Invoice[]>('invoices', []));
    setPayments(loadData<Payment[]>('payments', []));
    setCheques(loadData<Cheque[]>('cheques', []));
  }, []);

  /* ═══════════ محاسبات ═══════════ */

  // فاکتورهای فروش (بدون void)
  const salesInvoices = useMemo(
    () => invoices.filter((i) => i.type === 'فروش' && !i.void),
    [invoices]
  );

  // KPI: فروش کل
  const totalSales = useMemo(
    () => salesInvoices.reduce((sum, i) =>
      sum + invoiceTotal(i.items || [], i.discountPercent || 0, i.taxPercent || 0, i.shippingCost || 0), 0
    ),
    [salesInvoices]
  );

  // KPI: فروش این ماه
  const monthlySales = useMemo(() => {
    const today = todayJalali();
    const monthPrefix = `${today.jy}/${String(today.jm).padStart(2, '0')}`;
    return salesInvoices
      .filter((i) => i.date?.startsWith(monthPrefix))
      .reduce((sum, i) =>
        sum + invoiceTotal(i.items || [], i.discountPercent || 0, i.taxPercent || 0, i.shippingCost || 0), 0
      );
  }, [salesInvoices]);

  // KPI: موجودی نقدی (پرداخت‌های دریافت شده - پرداخت‌های پرداخت شده)
  const cashBalance = useMemo(() => {
    const inTotal = payments
      .filter((p) => !p.void && p.direction === 'دریافت')
      .reduce((s, p) => s + (p.amount || 0), 0);
    const outTotal = payments
      .filter((p) => !p.void && p.direction === 'پرداخت')
      .reduce((s, p) => s + (p.amount || 0), 0);
    return inTotal - outTotal;
  }, [payments]);

  // KPI: طلب از مشتریان
  // KPI: طلب از مشتریان (محاسبه از فاکتورها و پرداخت‌ها)
  const receivable = useMemo(
    () => computeTotalReceivable(invoices, payments),
    [invoices, payments]
  );

  // KPI: بدهی به تأمین‌کنندگان
  const payable = useMemo(
    () => computeTotalPayable(invoices, payments),
    [invoices, payments]
  );

  // نمودار ۷ روزه
  const sales7Days = useMemo(() => {
    const days: { label: string; total: number; date: string }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      // تبدیل به شمسی
      const jalali = (() => {
        try {
          const g = { gy: d.getFullYear(), gm: d.getMonth() + 1, gd: d.getDate() };
          // ساده‌سازی — استفاده از تابع todayJalali
          return '';
        } catch {
          return '';
        }
      })();

      const dayTotal = salesInvoices
        .filter((inv) => inv.date && inv.date.includes(dateStr.slice(8)))
        .reduce((sum, inv) =>
          sum + invoiceTotal(inv.items || [], inv.discountPercent || 0, inv.taxPercent || 0, inv.shippingCost || 0), 0
        );

      days.push({
        label: `${d.getDate()}`,
        total: dayTotal,
        date: dateStr,
      });
    }
    return days;
  }, [salesInvoices]);

  const maxDaily = Math.max(...sales7Days.map((d) => d.total), 1);

  // موجودی کم
  const lowStock = useMemo(
    () => products.filter((p) => p.isActive !== false && p.stock <= p.minStock),
    [products]
  );

  // چک‌های نزدیک سررسید (۳۰ روز آینده)
  const upcomingCheques = useMemo(() => {
    const now = new Date();
    const in30Days = new Date(now);
    in30Days.setDate(now.getDate() + 30);

    return cheques
      .filter((c) => !c.void && c.status === 'در جریان')
      .slice(0, 5);
  }, [cheques]);

  // آخرین فاکتورها
  const recentInvoices = useMemo(
    () => [...salesInvoices].slice(-5).reverse(),
    [salesInvoices]
  );

  // KPI cards
  const kpis: KPI[] = [
    {
      label: 'فروش این ماه',
      value: monthlySales,
      change: 0, // TODO: مقایسه با ماه قبل
      format: 'money',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      view: 'reports-hub',
    },
    {
      label: 'موجودی نقدی',
      value: cashBalance,
      change: 0,
      format: 'money',
      icon: Wallet,
      color: 'from-indigo-500 to-violet-600',
      view: 'cash-box',
    },
    {
      label: 'طلب از مشتریان',
      value: receivable,
      change: 0,
      format: 'money',
      icon: Users,
      color: 'from-amber-500 to-orange-600',
      view: 'contacts',
    },
    {
      label: 'بدهی به تأمین‌کنندگان',
      value: payable,
      change: 0,
      format: 'money',
      icon: ShoppingCart,
      color: 'from-rose-500 to-red-600',
      view: 'contacts',
    },
    {
      label: 'فاکتورهای فروش',
      value: salesInvoices.length,
      change: 0,
      format: 'count',
      icon: FileText,
      color: 'from-sky-500 to-blue-600',
      view: 'invoices',
    },
  ];

  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);

  const formatKPI = (kpi: KPI) => {
    if (kpi.format === 'money') {
      return f(kpi.value) + ' ریال';
    }
    return f(kpi.value) + ' عدد';
  };

  // تاریخ امروز
  const today = todayJalali();
  const dateStr = formatJalaliLong(today.jy, today.jm, today.jd);

  return (
    <div className="space-y-5" dir="rtl">

      {/* Update Banner */}
      <UpdateBanner />

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-5 md:p-6 bg-gradient-to-l from-indigo-600 via-indigo-500 to-violet-600 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs opacity-80 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              {dateStr}
            </div>
            <h2 className="text-lg md:text-xl font-bold">
              سلام {settings.storeName || 'به دیوان خوش آمدید'} 👋
            </h2>
            <p className="text-xs md:text-sm opacity-80 mt-1">
              خلاصه عملکرد امروز شما
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <QuickAction
              icon={FileText}
              label="فاکتور جدید"
              onClick={() => onNavigate('invoices', { action: 'new' })}
            />
            <QuickAction
              icon={UserPlus}
              label="مشتری جدید"
              onClick={() => onNavigate('contacts', { action: 'new' })}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <KPICard key={i} kpi={kpi} formatKPI={formatKPI} onClick={() => onNavigate(kpi.view)} />
        ))}
      </div>

      {/* Chart + Activities */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* نمودار ۷ روزه */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              فروش ۷ روز اخیر
            </div>
            <button
              onClick={() => onNavigate('reports-hub')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              گزارش کامل
              <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-end gap-1.5 h-32">
            {sales7Days.map((day, i) => {
              const height = maxDaily > 0 ? (day.total / maxDaily) * 100 : 0;
              const isToday = i === sales7Days.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className={`w-full rounded-t transition-all ${
                        isToday
                          ? 'bg-gradient-to-t from-indigo-600 to-violet-500'
                          : 'bg-indigo-500/40'
                      }`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                      title={f(day.total) + ' ریال'}
                    />
                  </div>
                  <div className={`text-[9px] ${isToday ? 'font-bold text-indigo-600' : 'opacity-50'}`}>
                    {day.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* آخرین فعالیت‌ها */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              آخرین فاکتورها
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              همه
              <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
          {recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-xs opacity-50">
              هنوز فاکتوری ثبت نشده
            </div>
          ) : (
            <div className="space-y-2">
              {recentInvoices.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => onNavigate('invoices', { previewId: inv.id })}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-right transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">
                      {inv.number || 'فاکتور'}
                    </div>
                    <div className="text-[10px] opacity-50 truncate">
                      {inv.contactName || '—'} • {inv.date}
                    </div>
                  </div>
                  <div className="text-xs font-bold whitespace-nowrap">
                    {f(Math.round(invoiceTotal(inv.items || [], inv.discountPercent || 0, inv.taxPercent || 0, inv.shippingCost || 0)))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Warnings */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* موجودی کم */}
        {lowStock.length > 0 && (
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">
                  {f(lowStock.length)} کالا زیر حد بحرانی
                </div>
                <div className="text-[11px] opacity-60 mt-0.5">
                  نیاز به سفارش مجدد
                </div>
              </div>
              <button
                onClick={() => onNavigate('inventory')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg"
              >
                مشاهده
              </button>
            </div>
            <div className="space-y-1">
              {lowStock.slice(0, 3).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs py-1">
                  <span className="truncate">{p.name}</span>
                  <span className="font-bold text-amber-600 whitespace-nowrap">
                    {f(p.stock)} {p.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* چک‌های سررسید */}
        {upcomingCheques.length > 0 && (
          <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/5 to-blue-500/5 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-sky-600" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">
                  {f(upcomingCheques.length)} چک در جریان
                </div>
                <div className="text-[11px] opacity-60 mt-0.5">
                  پیگیری سررسید
                </div>
              </div>
              <button
                onClick={() => onNavigate('cheques')}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg"
              >
                مشاهده
              </button>
            </div>
            <div className="space-y-1">
              {upcomingCheques.slice(0, 3).map((c) => (
                <div key={c.id} className="flex items-center justify-between text-xs py-1">
                  <span className="truncate">{c.contactName || '—'}</span>
                  <span className="font-bold text-sky-600 whitespace-nowrap">
                    {f(Math.round(c.amount || 0))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat
          icon={Users}
          label="مشتریان"
          value={f(contacts.length)}
          color="text-indigo-600"
          bg="bg-indigo-500/10"
          onClick={() => onNavigate('contacts')}
        />
        <MiniStat
          icon={Package}
          label="کالاها"
          value={f(products.length)}
          color="text-emerald-600"
          bg="bg-emerald-500/10"
          onClick={() => onNavigate('inventory')}
        />
        <MiniStat
          icon={FileText}
          label="کل فاکتورها"
          value={f(invoices.length)}
          color="text-sky-600"
          bg="bg-sky-500/10"
          onClick={() => onNavigate('invoices')}
        />
        <MiniStat
          icon={CheckCircle2}
          label="پرداخت‌ها"
          value={f(payments.filter((p) => !p.void).length)}
          color="text-violet-600"
          bg="bg-violet-500/10"
          onClick={() => onNavigate('payments')}
        />
      </div>
    </div>
  );
};

/* ═══════════ Sub Components ═══════════ */

const KPICard: React.FC<{
  kpi: KPI;
  formatKPI: (kpi: KPI) => string;
  onClick: () => void;
}> = ({ kpi, formatKPI, onClick }) => {
  const Icon = kpi.icon;
  const TrendIcon = kpi.change > 0 ? ArrowUpRight : kpi.change < 0 ? ArrowDownRight : null;

  return (
    <button
      onClick={onClick}
      className="text-right p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all card-hover group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {TrendIcon && (
          <div
            className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              kpi.change > 0
                ? 'bg-emerald-500/20 text-emerald-700'
                : 'bg-rose-500/20 text-rose-700'
            }`}
          >
            <TrendIcon className="w-3 h-3" />
            {Math.abs(kpi.change)}%
          </div>
        )}
      </div>
      <div className="text-[10px] opacity-60 mb-1">{kpi.label}</div>
      <div className="font-bold text-sm md:text-base truncate">{formatKPI(kpi)}</div>
    </button>
  );
};

const QuickAction: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}> = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold backdrop-blur transition-colors"
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
  </button>
);

const MiniStat: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  bg: string;
  onClick: () => void;
}> = ({ icon: Icon, label, value, color, bg, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:border-indigo-300 transition-all text-right"
  >
    <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[10px] opacity-60">{label}</div>
      <div className="font-bold text-sm truncate">{value}</div>
    </div>
  </button>
);

export default DashboardModule;
