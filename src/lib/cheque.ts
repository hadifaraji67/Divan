import { Cheque, ChequeStatus } from '../types/cheque';
import { JournalEntry, JournalLine } from '../types/accounting';
import { isJournalEntryBalanced } from './accounting';

/**
 * تغییر وضعیت چک و ایجاد سند حسابداری متناظر
 */
export const updateChequeStatus = (
  cheque: Cheque,
  newStatus: ChequeStatus,
  entryNumber: number,
  bankAccountId: string = '10102' // کد حساب پیش‌فرض بانک
): { updatedCheque: Cheque; journalEntry?: JournalEntry } => {
  const roundedAmount = Math.round(cheque.amount);
  const now = new Date().toISOString();

  const updatedCheque: Cheque = {
    ...cheque,
    status: newStatus,
    updatedAt: now,
  };

  let lines: JournalLine[] = [];
  let description = '';

  // ۱. وصول چک دریافتی (بانک بدهکار / اسناد دریافتنی بستانکار)
  if (cheque.type === 'RECEIVABLE' && newStatus === 'CLEARED') {
    description = `وصول چک دریافتی شماره ${cheque.chequeNumber} - ${cheque.bankName}`;
    lines = [
      { id: `cl_1_${Date.now()}`, accountId: bankAccountId, description, debit: roundedAmount, credit: 0 },
      { id: `cl_2_${Date.now()}`, accountId: '102', description, debit: 0, credit: roundedAmount },
    ];
  }
  // ۲. پاس شدن چک پرداختی (اسناد پرداختنی بدهکار / بانک بستانکار)
  else if (cheque.type === 'PAYABLE' && newStatus === 'CLEARED') {
    description = `پاس شدن چک پرداختی شماره ${cheque.chequeNumber} - ${cheque.bankName}`;
    lines = [
      { id: `cl_1_${Date.now()}`, accountId: '201', description, debit: roundedAmount, credit: 0 },
      { id: `cl_2_${Date.now()}`, accountId: bankAccountId, description, debit: 0, credit: roundedAmount },
    ];
  }

  // اگر سندی صادر شده باشد، تراز آن بررسی می‌شود
  if (lines.length > 0) {
    if (!isJournalEntryBalanced(lines)) {
      throw new Error('خطا در تراز سند حسابداری چک.');
    }

    const journalEntry: JournalEntry = {
      id: `je_chq_${Date.now()}`,
      entryNumber,
      date: now.split('T')[0],
      description,
      lines,
      referenceType: 'PAYMENT',
      referenceId: cheque.id,
      createdAt: now,
      updatedAt: now,
    };

    return { updatedCheque, journalEntry };
  }

  return { updatedCheque };
};
