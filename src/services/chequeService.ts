export interface Cheque {
  id: string;
  bankName: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'cleared' | 'bounced';
  payerName: string;
}

const CHEQUE_KEY = 'divan_cheques';

export const saveCheque = (cheque: Cheque) => {
  const existing: Cheque[] = JSON.parse(localStorage.getItem(CHEQUE_KEY) || '[]');
  existing.push(cheque);
  localStorage.setItem(CHEQUE_KEY, JSON.stringify(existing));
};

export const getCheques = (): Cheque[] => {
  return JSON.parse(localStorage.getItem(CHEQUE_KEY) || '[]');
};
