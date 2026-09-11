import React, { useState } from 'react';
import { Account, JournalEntry } from '../types/accounting';
import { generateTrialBalance, generateBalanceSheet } from '../lib/reports';

interface Props {
  accounts: Account[];
  entries: JournalEntry[];
}

export const FinancialReports: React.FC<Props> = ({ accounts, entries }) => {
  const [activeTab, setActiveTab] = useState<'TRIAL' | 'BALANCE_SHEET'>('TRIAL');

  const trialBalance = generateTrialBalance(accounts, entries);
  const balanceSheet = generateBalanceSheet(accounts, entries);

  return (
    <div className="w-full dir-rtl text-right space-y-4">
      <div className="flex gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab('TRIAL')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            activeTab === 'TRIAL' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          تراز آزمایشی
        </button>
        <button
          onClick={() => setActiveTab('BALANCE_SHEET')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            activeTab === 'BALANCE_SHEET' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          ترازنامه
        </button>
      </div>

      {activeTab === 'TRIAL' ? (
        <div className="overflow-x-auto border rounded-xl bg-card">
          <table className="w-full text-sm text-center">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="p-3 text-right">کد</th>
                <th className="p-3 text-right">حساب</th>
                <th className="p-3">گردش بدهکار</th>
                <th className="p-3">گردش بستانکار</th>
                <th className="p-3">مانده بدهکار</th>
                <th className="p-3">مانده بستانکار</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {trialBalance.map((item) => (
                <tr key={item.accountCode} className="hover:bg-muted/30">
                  <td className="p-3 text-right font-mono">{item.accountCode}</td>
                  <td className="p-3 text-right">{item.accountName}</td>
                  <td className="p-3">{item.totalDebit.toLocaleString('fa-IR')}</td>
                  <td className="p-3">{item.totalCredit.toLocaleString('fa-IR')}</td>
                  <td className="p-3 font-semibold text-green-700">{item.debitBalance.toLocaleString('fa-IR')}</td>
                  <td className="p-3 font-semibold text-blue-700">{item.creditBalance.toLocaleString('fa-IR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* دارایی‌ها */}
          <div className="border rounded-xl p-4 bg-card space-y-3">
            <h4 className="font-bold border-b pb-2 text-primary">دارایی‌ها</h4>
            {balanceSheet.assets.map((a, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{a.accountName}</span>
                <span>{a.amount.toLocaleString('fa-IR')} تومان</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t font-bold text-base">
              <span>جمع دارایی‌ها:</span>
              <span>{balanceSheet.totalAssets.toLocaleString('fa-IR')} تومان</span>
            </div>
          </div>

          {/* بدهی‌ها و سرمایه */}
          <div className="border rounded-xl p-4 bg-card space-y-3">
            <h4 className="font-bold border-b pb-2 text-destructive">بدهی‌ها و حقوق صاحبان سهام</h4>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">بدهی‌ها:</span>
              {balanceSheet.liabilities.map((l, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{l.accountName}</span>
                  <span>{l.amount.toLocaleString('fa-IR')} تومان</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-2 border-t">
              <span className="text-xs font-semibold text-muted-foreground">حقوق صاحبان سهام:</span>
              {balanceSheet.equity.map((e, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{e.accountName}</span>
                  <span>{e.amount.toLocaleString('fa-IR')} تومان</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-2 border-t font-bold text-base">
              <span>جمع بدهی و سرمایه:</span>
              <span>{(balanceSheet.totalLiabilities + balanceSheet.totalEquity).toLocaleString('fa-IR')} تومان</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
