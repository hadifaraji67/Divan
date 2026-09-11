import { Account, JournalEntry, JournalLine } from '../types/accounting';
import { isActiveRecord } from '../types/voiding';

// درخت حساب‌های استاندارد پیش‌فرض برای کسب‌وکارها
export const DEFAULT_ACCOUNTS: Account[] = [
  // دارایی‌ها (1000)
  { id: '101', code: '101', name: 'موجودی نقد و بانک', type: 'ASSET', isSystem: true },
  { id: '10101', code: '10101', name: 'صندوق', type: 'ASSET', parentId: '101', isSystem: true },
  { id: '10102', code: '10102', name: 'بانک‌ها', type: 'ASSET', parentId: '101', isSystem: true },
  { id: '102', code: '102', name: 'حساب‌ها و اسناد دریافتنی (مشتریان)', type: 'ASSET', isSystem: true },
  { id: '103', code: '103', name: 'موجودی کالا (انبار)', type: 'ASSET', isSystem: true },
  
  // بدهی‌ها (2000)
  { id: '201', code: '201', name: 'حساب‌ها و اسناد پرداختنی (تامین‌کنندگان)', type: 'LIABILITY', isSystem: true },
  
  // درآمدها (4000)
  { id: '401', code: '401', name: 'درآمد حاصل از فروش', type: 'REVENUE', isSystem: true },
  
  // هزینه‌ها (5000)
  { id: '501', code: '501', name: 'بهای تمام شده کالای فروش رفته', type: 'EXPENSE', isSystem: true },
  { id: '502', code: '502', name: 'هزینه‌های عمومی و اداری', type: 'EXPENSE', isSystem: true },
];

/**
 * بررسی توازن سند حسابداری (مجموع بدهکار = مجموع بستانکار)
 */
export const isJournalEntryBalanced = (lines: JournalLine[]): boolean => {
  const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  return Math.round(totalDebit) === Math.round(totalCredit);
};

/**
 * صدور سند حسابداری اتوماتیک برای فاکتور فروش (اعتباری/نقدی)
 */
export const createInvoiceJournalEntry = (
  entryNumber: number,
  invoiceId: string,
  customerAccountId: string,
  totalAmount: number,
  date: string
): JournalEntry => {
  const roundedTotal = Math.round(totalAmount);

  const lines: JournalLine[] = [
    {
      id: `line_1_${Date.now()}`,
      accountId: customerAccountId || '102', // بدهکار: حساب مشتری
      description: `بدهکاری بابت فاکتور فروش شماره ${invoiceId}`,
      debit: roundedTotal,
      credit: 0,
    },
    {
      id: `line_2_${Date.now()}`,
      accountId: '401', // بستانکار: درآمد فروش
      description: `بستانکاری درآمد فروش فاکتور ${invoiceId}`,
      debit: 0,
      credit: roundedTotal,
    },
  ];

  if (!isJournalEntryBalanced(lines)) {
    throw new Error('خطا در توازن سند حسابداری: مجموع بدهکار و بستانکار برابر نیست.');
  }

  return {
    id: `je_${Date.now()}`,
    entryNumber,
    date,
    description: `سند اتوماتیک فاکتور فروش ${invoiceId}`,
    lines,
    referenceType: 'INVOICE',
    referenceId: invoiceId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * محاسبه گردش حساب (تراز بدهکار و بستانکار)
 */
export const calculateAccountBalance = (entries: JournalEntry[], accountId: string) => {
  let totalDebit = 0;
  let totalCredit = 0;

  entries.filter(isActiveRecord).forEach((entry) => {
    entry.lines.forEach((line) => {
      if (line.accountId === accountId) {
        totalDebit += line.debit || 0;
        totalCredit += line.credit || 0;
      }
    });
  });

  return {
    totalDebit: Math.round(totalDebit),
    totalCredit: Math.round(totalCredit),
    balance: Math.round(totalDebit - totalCredit),
  };
};
