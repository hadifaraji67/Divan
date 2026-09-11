import { Account, JournalEntry } from '../types/accounting';
import { isActiveRecord } from '../types/voiding';

export interface TrialBalanceItem {
  accountCode: string;
  accountName: string;
  totalDebit: number;
  totalCredit: number;
  debitBalance: number;  // مانده بدهکار
  creditBalance: number; // مانده بستانکار
}

export interface BalanceSheetData {
  assets: { accountName: string; amount: number }[];
  totalAssets: number;
  liabilities: { accountName: string; amount: number }[];
  totalLiabilities: number;
  equity: { accountName: string; amount: number }[];
  totalEquity: number;
}

/**
 * محاسبه تراز آزمایشی
 */
export const generateTrialBalance = (accounts: Account[], entries: JournalEntry[]): TrialBalanceItem[] => {
  const activeEntries = entries.filter(isActiveRecord);

  return accounts.map((acc) => {
    let totalDebit = 0;
    let totalCredit = 0;

    activeEntries.forEach((entry) => {
      entry.lines.forEach((line) => {
        if (line.accountId === acc.id) {
          totalDebit += line.debit || 0;
          totalCredit += line.credit || 0;
        }
      });
    });

    const net = totalDebit - totalCredit;

    return {
      accountCode: acc.code,
      accountName: acc.name,
      totalDebit: Math.round(totalDebit),
      totalCredit: Math.round(totalCredit),
      debitBalance: net > 0 ? Math.round(net) : 0,
      creditBalance: net < 0 ? Math.round(Math.abs(net)) : 0,
    };
  });
};

/**
 * محاسبه ترازنامه (معادله حسابداری: دارایی = بدهی + سرمایه)
 */
export const generateBalanceSheet = (accounts: Account[], entries: JournalEntry[]): BalanceSheetData => {
  const trialBalance = generateTrialBalance(accounts, entries);
  
  const assets: { accountName: string; amount: number }[] = [];
  const liabilities: { accountName: string; amount: number }[] = [];
  const equity: { accountName: string; amount: number }[] = [];

  let totalAssets = 0;
  let totalLiabilities = 0;
  let totalEquity = 0;

  accounts.forEach((acc) => {
    const tbItem = trialBalance.find((item) => item.accountCode === acc.code);
    if (!tbItem) return;

    const netBalance = tbItem.debitBalance - tbItem.creditBalance;

    if (acc.type === 'ASSET') {
      assets.push({ accountName: acc.name, amount: netBalance });
      totalAssets += netBalance;
    } else if (acc.type === 'LIABILITY') {
      const amount = Math.abs(netBalance);
      liabilities.push({ accountName: acc.name, amount });
      totalLiabilities += amount;
    } else if (acc.type === 'EQUITY') {
      const amount = Math.abs(netBalance);
      equity.push({ accountName: acc.name, amount });
      totalEquity += amount;
    }
  });

  return {
    assets,
    totalAssets: Math.round(totalAssets),
    liabilities,
    totalLiabilities: Math.round(totalLiabilities),
    equity,
    totalEquity: Math.round(totalEquity),
  };
};
