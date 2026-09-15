import React, { useMemo, useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Download, Info } from 'lucide-react';
import type { Account } from '../../types/accounting';
import { getIncomeStatement, loadJournalEntries } from '../../lib/financial-statements';
import { DEFAULT_ACCOUNTS } from '../../lib/accounting';
import { loadData } from '../../lib/storage';
import { useSettings, formatNum } from '../../lib/theme-context';

export const ProfitLossReport: React.FC = () => {
  const { settings } = useSettings();
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    setEntries(loadJournalEntries());
  }, []);

  const f = (n: number) => formatNum(Math.round(Math.abs(n)), settings.persianNumbers);
  const signedF = (n: number) => {
    const sign = n < 0 ? '-' : '';
    return sign + formatNum(Math.round(Math.abs(n)), settings.persianNumbers);
  };

  const report = useMemo(() => getIncomeStatement(accounts, entries), [accounts, entries]);

  const hasData = report.totalRevenue > 0 || report.totalExpense > 0;

  const exportCSV = () => {
    const rows = [
      ['عنوان', 'مقدار (ریال)'],
      ['— درآمدها —', ''],
      ...report.revenues.map(r => [r.account.name, String(r.credit - r.debit)]),
      ['جمع درآمد', String(report.totalRevenue)],
      ['', ''],
      ['— هزینه‌ها —', ''],
      ...report.expenses.map(r => [r.account.name, String(r.debit - r.credit)]),
      ['جمع هزینه', String(report.totalExpense)],
      ['', ''],
      ['سود / زیان خالص', String(report.netProfit)],
    ];
    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `profit-loss-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold">صورت سود و زیان</h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
            از دفتر روزنامه
          </span>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg">
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
      </div>

      {!hasData && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            <b>هنوز سندی در دفتر روزنامه ثبت نشده.</b>
            <br />
            با صدور فاکتور یا ثبت پرداخت، اسناد حسابداری به‌طور خودکار ساخته می‌شوند.
            همچنین می‌توانید سند دستی از منوی «اسناد حسابداری» ثبت کنید.
          </div>
        </div>
      )}

      {/* خلاصه */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SummaryCard title="کل درآمد" value={f(report.totalRevenue)} unit={settings.currency} icon={TrendingUp} color="emerald" />
        <SummaryCard title="کل هزینه" value={f(report.totalExpense)} unit={settings.currency} icon={TrendingDown} color="rose" />
        <SummaryCard
          title="سود / زیان خالص"
          value={signedF(report.netProfit)}
          unit={settings.currency}
          icon={Wallet}
          color={report.netProfit >= 0 ? 'indigo' : 'rose'}
        />
      </div>

      {/* جدول تفصیلی */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border p-5" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        <h3 className="text-sm font-bold mb-4">جزئیات</h3>

        {/* درآمدها */}
        <div className="mb-4">
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2 pb-1 border-b border-emerald-500/20">
            درآمدها
          </div>
          {report.revenues.length === 0 ? (
            <div className="text-xs opacity-50 py-2 pr-4">درآمدی ثبت نشده</div>
          ) : (
            report.revenues.map(r => (
              <div key={r.account.id} className="flex justify-between items-center py-2 pr-4 border-b border-black/5 dark:border-white/5">
                <span className="text-sm">{r.account.code} — {r.account.name}</span>
                <span className="font-mono text-sm text-emerald-600" dir="ltr">
                  {f(r.credit - r.debit)} <span className="text-[10px] opacity-60">{settings.currency}</span>
                </span>
              </div>
            ))
          )}
          <div className="flex justify-between items-center py-2 pr-4 font-bold border-b-2 border-emerald-500/30">
            <span className="text-sm">جمع درآمدها</span>
            <span className="font-mono text-sm text-emerald-600" dir="ltr">
              {f(report.totalRevenue)} <span className="text-[10px] opacity-60">{settings.currency}</span>
            </span>
          </div>
        </div>

        {/* هزینه‌ها */}
        <div className="mb-4">
          <div className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-2 pb-1 border-b border-rose-500/20">
            هزینه‌ها
          </div>
          {report.expenses.length === 0 ? (
            <div className="text-xs opacity-50 py-2 pr-4">هزینه‌ای ثبت نشده</div>
          ) : (
            report.expenses.map(r => (
              <div key={r.account.id} className="flex justify-between items-center py-2 pr-4 border-b border-black/5 dark:border-white/5">
                <span className="text-sm">{r.account.code} — {r.account.name}</span>
                <span className="font-mono text-sm text-rose-600" dir="ltr">
                  {f(r.debit - r.credit)} <span className="text-[10px] opacity-60">{settings.currency}</span>
                </span>
              </div>
            ))
          )}
          <div className="flex justify-between items-center py-2 pr-4 font-bold border-b-2 border-rose-500/30">
            <span className="text-sm">جمع هزینه‌ها</span>
            <span className="font-mono text-sm text-rose-600" dir="ltr">
              {f(report.totalExpense)} <span className="text-[10px] opacity-60">{settings.currency}</span>
            </span>
          </div>
        </div>

        {/* نتیجه */}
        <div className={`p-3 rounded-lg flex justify-between items-center ${report.netProfit >= 0 ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-rose-500/5 border border-rose-500/20'}`}>
          <span className="font-bold">{report.netProfit >= 0 ? 'سود خالص دوره' : 'زیان خالص دوره'}</span>
          <span className={`font-mono text-lg font-bold ${report.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} dir="ltr">
            {signedF(report.netProfit)} <span className="text-[10px] opacity-60">{settings.currency}</span>
          </span>
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
