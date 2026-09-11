import { VoidableEntity } from './voiding';

export type ChequeType = 'RECEIVABLE' | 'PAYABLE'; // دریافتی یا پرداختی

export type ChequeStatus =
  | 'PENDING'    // در جریان وصول / نزد صندوق
  | 'CLEARED'    // وصول شده
  | 'BOUNCED'    // برگشت خورده
  | 'PASSED'     // خرج شده (مخصوص چک‌های دریافتی)
  | 'CANCELLED'; // ابطال شده

export interface Cheque extends VoidableEntity {
  chequeNumber: string;    // شماره صیادی / شماره چک
  bankName: string;        // نام بانک صادرکننده
  accountNumber?: string;  // شماره حساب
  amount: number;          // مبلغ چک
  dueDate: string;         // تاریخ سررسید (YYYY-MM-DD)
  issueDate: string;       // تاریخ دریافت / صدور
  type: ChequeType;        // نوع چک
  status: ChequeStatus;    // وضعیت جاری
  partyId: string;         // صادرکننده یا دریافت‌کننده (شخص)
  description?: string;    // توضیحات
}
