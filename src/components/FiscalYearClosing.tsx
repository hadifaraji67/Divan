import React from 'react';
import { Account, JournalEntry } from '../types/accounting';
import { calculateIncomeStatement } from '../lib/closing';

interface Props {
  accounts: Account[];
  entries: JournalEntry[];
  onCloseFiscalYear: () => void;
}

export const FiscalYearClosing: React.FC<Props> = ({ accounts, entries, onCloseFiscalYear }) => {
  const pAndL = calculateIncomeStatement(accounts, entries);

  return (
    <div className="w-full dir-rtl text-right space-y-4">
      <h3 className="text-lg font-bold">صورت سود و زیان (P&L) و بستن سال مالی</h3>

      <div className="border rounded-xl p-4 bg-card space-y-4">
        {/* درآمدها */}
        <div>
          <h4 className="font-semibold text-green-700 border-b pb-1">درآمدها</h4>
          {pAndL.revenues.map((r, i) => (
            <div key={i} className="flex justify-between text-sm py-1">
              <span>{r.accountName}</span>
              <span>{r.amount.toLocaleString('fa-IR')} تومان</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-sm border-t pt-1">
            <span>جمع کل درآمدها:</span>
            <span>{pAndL.totalRevenue.toLocaleString('fa-IR')} تومان</span>
          </div>
        </div>

        {/* هزینه‌ها */}
        <div>
          <h4 className="font-semibold text-red-700 border-b pb-1">هزینه‌ها</h4>
          {pAndL.expenses.map((e, i) => (
            <div key={i} className="flex justify-between text-sm py-1">
              <span>{e.accountName}</span>
              <span>{e.amount.toLocaleString('fa-IR')} تومان</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-sm border-t pt-1">
            <span>جمع کل هزینه‌ها:</span>
            <span>{pAndL.totalExpense.toLocaleString('fa-IR')} تومان</span>
          </div>
        </div>

        {/* سود / زیان خالص */}
        <div className={`p-3 rounded-lg flex justify-between font-bold text-base ${
          pAndL.netProfit >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <span>{pAndL.netProfit >= 0 ? 'سود خالص دوره:' : 'زیان خالص دوره:'}</span>
          <span>{Math.abs(pAndL.netProfit).toLocaleString('fa-IR')} تومان</span>
        </div>

        <button
          onClick={onCloseFiscalYear}
          className="w-full py-2.5 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:opacity-90"
        >
          صدور سند اختتامیه و بستن سال مالی
        </button>
      </div>
    </div>
  );
};
