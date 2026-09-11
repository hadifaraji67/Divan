import { VoidableEntity } from './voiding';

// انواع حساب در استاندارد حسابداری
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

// ۱. تعریف حساب (کدینگ)
export interface Account {
  id: string;
  code: string;           // کد حساب (مثلا 10101)
  name: string;           // نام حساب (مثلا صندوق مرکزی)
  type: AccountType;      // ماهیت حساب
  parentId?: string | null; // کد حساب والد جهت ساختار درختی (کل -> معین -> تفصیلی)
  isSystem?: boolean;     // حساب سیستمی غیرقابل حذف
}

// ۲. آیتم‌های سطر سند (بدهکار / بستانکار)
export interface JournalLine {
  id: string;
  accountId: string;      // لینک به کد حساب
  description?: string;   // شرح سطر
  debit: number;          // مبلغ بدهکار
  credit: number;         // مبلغ بستانکار
}

// ۳. سند حسابداری (Journal Entry)
export interface JournalEntry extends VoidableEntity {
  entryNumber: number;    // شماره سند
  date: string;           // تاریخ سند
  description: string;    // شرح کلی سند
  lines: JournalLine[];   // سطرهای بدهکار و بستانکار
  referenceType?: 'INVOICE' | 'PAYMENT' | 'MANUAL'; // منشا سند
  referenceId?: string;   // آیدی فاکتور یا تراکنش مربوطه
}
