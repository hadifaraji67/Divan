import React, { useMemo, useEffect, useState } from 'react';
import { Scale, Info, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import type { Account } from '../../types/accounting';
import { getBalanceSheet, loadJournalEntries } from '../../lib/financial-statements';
import { DEFAULT_ACCOUNTS } from '../../lib/accounting';
import { useSettings, formatNum } from '../../lib/theme-context';

export const BalanceSheetReport: React.FC = () => {
  const { settings } = useSettings();
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    setEntries(loadJournalEntries());
  }, []);

  const f = (n: number) => formatNum(Math.round(Math.abs(n)), settings.persianNumbers);

  const report = useMemo(() => getBalanceSheet(accounts, entries), [accounts, entries]);

  const hasData = report.totalAssets > 0 || report.totalLiabilities > 0 || report.totalEquity > 0;
  const isBalanced = Math.abs(report.difference) < 100;

  const exportCSV = () => {
    const rows = [
      ['ترازنامه', ''],
      ['— دارایی‌ها —', ''],
      ...report.assets.map(a => [a.account.name, String(a.debit - a.credit)]),
      ['جمع دارایی‌ها', String(report.totalAssets)],
      ['', ''],
      ['— بدهی‌ها —', ''],
      ...report.liabilities.map(l => [l.account.name, String(l.credit - l.debit)]),
      ['جمع بدهی‌ها', String(report.totalLiabilities)],
      ['', ''],
      ['— حقوق صاحبان سهام —', ''],
      ...report.equity.map(e => [e.account.name, String(e.credit - e.debit)]),
      ['جمع حقوق', String(report.totalEquity)],
      ['', ''],
      ['جمع بدهی و حقوق', String(report.totalLiabilities + report.totalEquity)],
    ];
    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `balance-sheet-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold">ترازنامه</h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
            از دفتر روزنامه
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasData && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${isBalanced ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'}`}>
              {isBalanced ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {isBalanced ? 'متوازن' : `اختلاف: ${f(report.difference)}`}
            </div>
          )}
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {!hasData && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            <b>هنوز سندی در دفتر روزنامه ثبت نشده.</b>
            <br />
            با صدور فاکتور یا ثبت پرداخت، اسناد حسابداری خودکار ساخته می‌شوند.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* دارایی‌ها */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border p-5" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-indigo-500">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Scale className="w-4 h-4 text-indigo-500" />
            </div>
            <h3 className="font-bold text-sm">دارایی‌ها</h3>
          </div>

          {report.assets.length === 0 ? (
            <div className="text-xs opacity-40 py-4 text-center">دارایی ثبت نشده</div>
          ) : (
            report.assets.map(a => (
              <Row
                key={a.account.id}
                label={`${a.account.code} — ${a.account.name}`}
                value={a.debit - a.credit}
                color="text-emerald-600"
              />
            ))
          )}

          <div className="mt-3 pt-3 border-t-2 border-indigo-500">
            <Row label="جمع دارایی‌ها" value={report.totalAssets} bold color="text-indigo-600" />
          </div>
        </div>

        {/* بدهی‌ها و حقوق صاحبان */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border p-5" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-rose-500">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <Scale className="w-4 h-4 text-rose-500" />
            </div>
            <h3 className="font-bold text-sm">بدهی‌ها و حقوق صاحبان سهام</h3>
          </div>

          <div className="text-xs opacity-60 mb-2">بدهی‌ها</div>
          {report.liabilities.length === 0 ? (
            <div className="text-xs opacity-40 py-2 pr-4">بدهی ثبت نشده</div>
          ) : (
            report.liabilities.map(l => (
              <Row
                key={l.account.id}
                label={`${l.account.code} — ${l.account.name}`}
                value={l.credit - l.debit}
                color="text-rose-600"
              />
            ))
          )}
          <Row label="جمع بدهی‌ها" value={report.totalLiabilities} bold color="text-rose-600" />

          <div className="text-xs opacity-60 mt-4 mb-2">حقوق صاحبان سهام</div>
          {report.equity.length === 0 ? (
            <div className="text-xs opacity-40 py-2 pr-4">حقوقی ثبت نشده</div>
          ) : (
            report.equity.map(e => (
              <Row
                key={e.account.id}
                label={`${e.account.code} — ${e.account.name}`}
                value={e.credit - e.debit}
                color="text-indigo-600"
              />
            ))
          )}
          <Row label="جمع حقوق" value={report.totalEquity} bold color="text-indigo-600" />

          <div className="mt-3 pt-3 border-t-2 border-rose-500">
            <Row label="جمع بدهی + حقوق" value={report.totalLiabilities + report.totalEquity} bold color="text-rose-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: number; bold?: boolean; color?: string }> = ({ label, value, bold, color }) => {
  const { settings } = useSettings();
  const f = (n: number) => formatNum(Math.round(Math.abs(n)), settings.persianNumbers);
  return (
    <div className={`flex justify-between items-center py-2 border-b border-black/5 dark:border-white/5 ${bold ? 'font-bold' : ''}`}>
      <span className={`text-sm ${bold ? '' : 'opacity-80'}`}>{label}</span>
      <span className={`font-mono text-sm ${color || ''}`} dir="ltr">
        {f(value)} <span className="text-[10px] opacity-60">{settings.currency}</span>
      </span>
    </div>
  );
};

export default BalanceSheetReport;
