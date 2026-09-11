import { Account, JournalEntry, JournalLine } from '../types/accounting';
import { generateTrialBalance } from './reports';
import { isJournalEntryBalanced } from './accounting';

export interface IncomeStatementData {
  revenues: { accountName: string; amount: number }[];
  totalRevenue: number;
  expenses: { accountName: string; amount: number }[];
  totalExpense: number;
  netProfit: number; // سود یا زیان خالص
}

/**
 * محاسبه صورت سود و زیان (P&L)
 */
export const calculateIncomeStatement = (accounts: Account[], entries: JournalEntry[]): IncomeStatementData => {
  const trialBalance = generateTrialBalance(accounts, entries);

  const revenues: { accountName: string; amount: number }[] = [];
  const expenses: { accountName: string; amount: number }[] = [];

  let totalRevenue = 0;
  let totalExpense = 0;

  accounts.forEach((acc) => {
    const tbItem = trialBalance.find((item) => item.accountCode === acc.code);
    if (!tbItem) return;

    if (acc.type === 'REVENUE') {
      const amount = tbItem.creditBalance - tbItem.debitBalance;
      if (amount !== 0) {
        revenues.push({ accountName: acc.name, amount: Math.round(amount) });
        totalRevenue += amount;
      }
    } else if (acc.type === 'EXPENSE') {
      const amount = tbItem.debitBalance - tbItem.creditBalance;
      if (amount !== 0) {
        expenses.push({ accountName: acc.name, amount: Math.round(amount) });
        totalExpense += amount;
      }
    }
  });

  const netProfit = Math.round(totalRevenue - totalExpense);

  return {
    revenues,
    totalRevenue: Math.round(totalRevenue),
    expenses,
    totalExpense: Math.round(totalExpense),
    netProfit,
  };
};

/**
 * صدور سند اختتامیه / بستن سال مالی (بستن حساب‌های موقت درآمد و هزینه)
 */
export const createCloseFiscalYearEntry = (
  entryNumber: number,
  accounts: Account[],
  entries: JournalEntry[],
  retainedEarningsAccountId: string = '301' // حساب سود/زیان انباشته
): JournalEntry => {
  const trialBalance = generateTrialBalance(accounts, entries);
  const lines: JournalLine[] = [];
  const now = new Date().toISOString();

  // ۱. بدهکار کردن حساب‌های درآمدی جهت صفر شدن
  accounts.filter((a) => a.type === 'REVENUE').forEach((acc) => {
    const tb = trialBalance.find((t) => t.accountCode === acc.code);
    if (tb && tb.creditBalance > 0) {
      lines.push({
        id: `close_rev_${acc.id}_${Date.now()}`,
        accountId: acc.id,
        description: `بستن حساب درآمد ${acc.name}`,
        debit: tb.creditBalance,
        credit: 0,
      });
    }
  });

  // ۲. بستانکار کردن حساب‌های هزینه‌ای جهت صفر شدن
  accounts.filter((a) => a.type === 'EXPENSE').forEach((acc) => {
    const tb = trialBalance.find((t) => t.accountCode === acc.code);
    if (tb && tb.debitBalance > 0) {
      lines.push({
        id: `close_exp_${acc.id}_${Date.now()}`,
        accountId: acc.id,
        description: `بستن حساب هزینه ${acc.name}`,
        debit: 0,
        credit: tb.debitBalance,
      });
    }
  });

  const pAndL = calculateIncomeStatement(accounts, entries);

  // ۳. انتقال مابه‌التفاوت (سود/زیان خالص) به حساب سود انباشته
  if (pAndL.netProfit > 0) {
    lines.push({
      id: `close_profit_${Date.now()}`,
      accountId: retainedEarningsAccountId,
      description: 'انتقال سود خالص سال مالی به سود انباشته',
      debit: 0,
      credit: pAndL.netProfit,
    });
  } else if (pAndL.netProfit < 0) {
    lines.push({
      id: `close_loss_${Date.now()}`,
      accountId: retainedEarningsAccountId,
      description: 'انتقال زیان خالص سال مالی به سود انباشته',
      debit: Math.abs(pAndL.netProfit),
      credit: 0,
    });
  }

  if (!isJournalEntryBalanced(lines)) {
    throw new Error('خطا در تراز سند اختتامیه سال مالی.');
  }

  return {
    id: `je_close_${Date.now()}`,
    entryNumber,
    date: now.split('T')[0],
    description: 'سند اختتامیه و بستن حساب‌های موقت سال مالی',
    lines,
    referenceType: 'MANUAL',
    createdAt: now,
    updatedAt: now,
  };
};
