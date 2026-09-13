export interface Contact {
  id: string;
  code: string;
  type: 'حقیقی' | 'حقوقی';
  name: string;
  lastName?: string;
  companyName?: string;
  nationalId: string;
  mobile: string;
  phone?: string;
  email?: string;
  address?: string;
  roles: ('مشتری' | 'تامین‌کننده' | 'همکار' | 'پرسنل')[];
  creditLimit: number;
  notes?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  buyPrice: number;
  sellPrice: number;
  taxPercent: number;
  isActive: boolean;
  createdAt: string;
}

export interface InvoiceLine {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
}

export type InvoiceType = 'فروش' | 'پیش‌فاکتور' | 'خرید' | 'برگشت از فروش';

export interface Invoice {
  id: string;
  number: string;
  type: InvoiceType;
  date: string;
  dueDate?: string;
  contactId: string;
  contactName: string;
  items: InvoiceLine[];
  discountPercent: number;
  taxPercent: number;
  shippingCost: number;
  notes?: string;
  createdAt: string;
}

export type PaymentType = 'نقد' | 'کارت' | 'چک';

export interface Payment {
  id: string;
  invoiceId?: string;
  contactId: string;
  contactName: string;
  type: PaymentType;
  amount: number;
  date: string;
  refCode?: string;
  bankName?: string;
  chequeNumber?: string;
  chequeDueDate?: string;
  direction: 'دریافت' | 'پرداخت';
  notes?: string;
  createdAt: string;
}

export interface Cheque {
  id: string;
  contactId: string;
  contactName: string;
  bankName: string;
  chequeNumber: string;
  amount: number;
  dueDate: string;
  direction: 'دریافتی' | 'پرداختی';
  status: 'در جریان' | 'وصول شده' | 'برگشتی' | 'خرج شده';
  notes?: string;
  createdAt: string;
}

export interface JournalLine {
  id: string;
  accountId: string;
  description?: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  entryNumber: number;
  date: string;
  description: string;
  lines: JournalLine[];
  referenceType?: 'INVOICE' | 'PAYMENT' | 'MANUAL';
  referenceId?: string;
  createdAt: string;
}

export function invoiceSubtotal(items: InvoiceLine[]): number {
  return items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
}

export function invoiceDiscount(items: InvoiceLine[], discountPercent: number): number {
  return (invoiceSubtotal(items) * discountPercent) / 100;
}

export function invoiceTax(items: InvoiceLine[], discountPercent: number, taxPercent: number): number {
  const after = invoiceSubtotal(items) - invoiceDiscount(items, discountPercent);
  return (after * taxPercent) / 100;
}

export function invoiceTotal(items: InvoiceLine[], discountPercent: number, taxPercent: number, shipping: number): number {
  return invoiceSubtotal(items) - invoiceDiscount(items, discountPercent) + invoiceTax(items, discountPercent, taxPercent) + shipping;
}
