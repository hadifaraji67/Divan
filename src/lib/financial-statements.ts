import type { Account, JournalEntry, AccountType } from '../types/accounting';
import { loadData, saveData } from './storage';

/**
 * تراز آزمایشی از دفتر روزنامه
 */
export interface TrialBalanceRow {
  account: Account;
  debit: number;
  credit: number;
  balance: number;      // مانده (بدهکار مثبت، بستانکار منفی)
  balanceDebit: number;  // مانده بدهکار
  balanceCredit: number; // مانده بستانکار
}

export function getTrialBalance(accounts: Account[], entries: JournalEntry[]): TrialBalanceRow[] {
  const activeEntries = entries.filter(e => !e.void);

  return accounts.map(account => {
    let debit = 0;
    let credit = 0;

    for (const entry of activeEntries) {
      for (const line of entry.lines) {
        if (line.accountId === account.id) {
          debit += Number(line.debit) || 0;
          credit += Number(line.credit) || 0;
        }
      }
    }

    // مانده بر اساس ماهیت حساب
    const naturalDebit = ['ASSET', 'EXPENSE'].includes(account.type);
    const balance = naturalDebit ? (debit - credit) : (credit - debit);

    return {
      account,
      debit,
      credit,
      balance,
      balanceDebit: balance > 0 && naturalDebit ? balance : (balance > 0 && !naturalDebit ? 0 : Math.max(0, credit - debit)),
      balanceCredit: balance > 0 && !naturalDebit ? balance : (balance > 0 && naturalDebit ? 0 : Math.max(0, debit - credit)),
    };
  }).filter(row => row.debit > 0 || row.credit > 0); // فقط حساب‌های دارای گردش
}

/**
 * صورت سود و زیان از دفتر روزنامه
 */
export interface IncomeStatement {
  revenues: TrialBalanceRow[];
  expenses: TrialBalanceRow[];
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
}

export function getIncomeStatement(accounts: Account[], entries: JournalEntry[]): IncomeStatement {
  const trial = getTrialBalance(accounts, entries);

  const revenues = trial.filter(r => r.account.type === 'REVENUE');
  const expenses = trial.filter(r => r.account.type === 'EXPENSE');

  // درآمد: مانده بستانکار (کاهش‌دهنده‌ها را کم کن)
  const totalRevenue = revenues.reduce((s, r) => s + (r.credit - r.debit), 0);
  const totalExpense = expenses.reduce((s, r) => s + (r.debit - r.credit), 0);

  return {
    revenues,
    expenses,
    totalRevenue,
    totalExpense,
    netProfit: totalRevenue - totalExpense,
  };
}

/**
 * ترازنامه از دفتر روزنامه
 */
export interface BalanceSheet {
  assets: TrialBalanceRow[];
  liabilities: TrialBalanceRow[];
  equity: TrialBalanceRow[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  difference: number; // باید صفر باشد
}

export function getBalanceSheet(accounts: Account[], entries: JournalEntry[]): BalanceSheet {
  const trial = getTrialBalance(accounts, entries);

  const assets = trial.filter(r => r.account.type === 'ASSET');
  const liabilities = trial.filter(r => r.account.type === 'LIABILITY');
  const equity = trial.filter(r => r.account.type === 'EQUITY');

  const totalAssets = assets.reduce((s, r) => s + (r.debit - r.credit), 0);
  const totalLiabilities = liabilities.reduce((s, r) => s + (r.credit - r.debit), 0);
  const totalEquity = equity.reduce((s, r) => s + (r.credit - r.debit), 0);

  // سود و زیان جاری به حقوق صاحبان سهام اضافه می‌شود
  const income = getIncomeStatement(accounts, entries);
  const totalEquityWithProfit = totalEquity + income.netProfit;

  return {
    assets,
    liabilities,
    equity,
    totalAssets,
    totalLiabilities,
    totalEquity: totalEquityWithProfit,
    difference: totalAssets - (totalLiabilities + totalEquityWithProfit),
  };
}

/**
 * تعداد اسناد ثبت‌شده
 */
export function getEntriesStats(entries: JournalEntry[]) {
  const active = entries.filter(e => !e.void);
  return {
    total: entries.length,
    active: active.length,
    voided: entries.length - active.length,
    bySource: {
      invoice: active.filter(e => e.referenceType === 'INVOICE').length,
      payment: active.filter(e => e.referenceType === 'PAYMENT').length,
      manual: active.filter(e => e.referenceType === 'MANUAL' || !e.referenceType).length,
    },
  };
}

/**
 * بارگذاری اسناد از localStorage
 */
export function loadJournalEntries(): JournalEntry[] {
  return loadData<JournalEntry[]>('journal_entries', []);
}

export function saveJournalEntries(entries: JournalEntry[]): void {
  saveData('journal_entries', entries);
}
