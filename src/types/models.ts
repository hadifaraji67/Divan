// ═══════════════════════════════════════════════
// تایپ پایه برای موجودیت‌های قابل باطل کردن
// ═══════════════════════════════════════════════
export interface Voidable {
  void?: boolean;
  voidedAt?: string;
  voidedReason?: string;
}

export interface Contact {
  id: string;
  code: string;
  type: 'حقیقی' | 'حقوقی';
  name: string;
  lastName?: string;
  companyName?: string;
  nationalId: string;
  registrationNumber?: string;
  mobile: string;
  phone?: string;
  email?: string;
  address?: string;
  province?: string;
  county?: string;
  city?: string;
  postalCode?: string;
  roles: ('مشتری' | 'تامین‌کننده' | 'همکار' | 'پرسنل')[];
  favorite?: boolean;
  creditLimit: number;
  economicCode?: string;
  website?: string;
  birthDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category: string;
  subCategory?: string;
  brand?: string;
  unit: string;
  stock: number;
  minStock: number;
  buyPrice: number;
  wholesalePrice?: number;
  sellPrice: number;
  taxPercent: number;
  taxId?: string;
  warehouseName?: string;
  location?: string;
  isActive: boolean;
  favorite?: boolean;
  createdAt: string;
}

export interface InvoiceLine {
  productId: string;
  productCode?: string;
  productName: string;
  description?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
}

export interface Attachment {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  /** فقط در اپ نیتیو (Capacitor) پر می‌شود — مسیر فایل واقعی روی دیسک */
  path?: string;
  /** فقط در اپ نیتیو — کدام Directory استفاده شده (DATA/EXTERNAL/DOCUMENTS) */
  directory?: string;
  /** فقط در وب/PWA پر می‌شود — چون فایل‌سیستم واقعی در دسترس نیست، خود فایل به‌صورت data URL نگه‌داری می‌شود */
  data?: string;
}

export type InvoiceType =
  | 'فروش'
  | 'پیش‌فاکتور فروش'
  | 'خرید'
  | 'پیش‌فاکتور خرید'
  | 'برگشت از فروش'
  | 'مرجوعی به تامین‌کننده';

export const INVOICE_TYPES: { value: InvoiceType; label: string; role: 'مشتری' | 'تامین‌کننده'; effect: 'decrease' | 'increase' | 'none' }[] = [
  { value: 'فروش', label: 'فاکتور فروش', role: 'مشتری', effect: 'decrease' },
  { value: 'پیش‌فاکتور فروش', label: 'پیش‌فاکتور فروش', role: 'مشتری', effect: 'none' },
  { value: 'خرید', label: 'فاکتور خرید', role: 'تامین‌کننده', effect: 'increase' },
  { value: 'پیش‌فاکتور خرید', label: 'پیش‌فاکتور خرید', role: 'تامین‌کننده', effect: 'none' },
  { value: 'برگشت از فروش', label: 'برگشت از فروش', role: 'مشتری', effect: 'increase' },
  { value: 'مرجوعی به تامین‌کننده', label: 'مرجوعی به تامین‌کننده', role: 'تامین‌کننده', effect: 'decrease' },
];

export function invoiceTypeLabel(type: InvoiceType): string {
  return INVOICE_TYPES.find(t => t.value === type)?.label || type;
}

export function invoiceTypeEffect(type: InvoiceType): 'decrease' | 'increase' | 'none' {
  return INVOICE_TYPES.find(t => t.value === type)?.effect || 'none';
}

export function invoiceTypeRole(type: InvoiceType): 'مشتری' | 'تامین‌کننده' {
  return INVOICE_TYPES.find(t => t.value === type)?.role || 'مشتری';
}

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
  warehouseName?: string;
  salesPerson?: string;
  paymentTerms?: string;
  notes?: string;
  attachments?: Attachment[];
  createdAt: string;
  void?: boolean;
  voidedAt?: string;
  voidedReason?: string;
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
  void?: boolean;
  voidedAt?: string;
  voidedReason?: string;
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
  void?: boolean;
  voidedAt?: string;
  voidedReason?: string;
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
  void?: boolean;
  voidedAt?: string;
  voidedReason?: string;
}

/**
 * رند به نزدیک‌ترین ریال صحیح (بدون اعشار)
 */
export const roundRial = (n: number): number => Math.round(Number(n) || 0);

/**
 * جمع اقلام — رند در هر خط
 */
export function invoiceSubtotal(items: InvoiceLine[]): number {
  return roundRial(items.reduce((sum, it) => sum + roundRial(it.quantity * it.unitPrice), 0));
}

/**
 * تخفیف — رند شده
 */
export function invoiceDiscount(items: InvoiceLine[], discountPercent: number): number {
  return roundRial((invoiceSubtotal(items) * Number(discountPercent || 0)) / 100);
}

/**
 * مالیات — رند شده
 */
export function invoiceTax(items: InvoiceLine[], discountPercent: number, taxPercent: number): number {
  const after = invoiceSubtotal(items) - invoiceDiscount(items, discountPercent);
  return roundRial((after * Number(taxPercent || 0)) / 100);
}

/**
 * مبلغ نهایی — رند شده
 */
export function invoiceTotal(items: InvoiceLine[], discountPercent: number, taxPercent: number, shipping: number): number {
  const subtotal = invoiceSubtotal(items);
  const discount = invoiceDiscount(items, discountPercent);
  const tax = invoiceTax(items, discountPercent, taxPercent);
  const ship = roundRial(Number(shipping) || 0);
  return roundRial(subtotal - discount + tax + ship);
}


// ═══════════════════════════════════════════════
// توابع کمکی برای فیلتر کردن آیتم‌های باطل‌شده
// ═══════════════════════════════════════════════

/** فقط آیتم‌های فعال (باطل‌نشده) */
export function filterActive<T extends { void?: boolean }>(items: T[]): T[] {
  return items.filter(item => !item.void);
}

/** فقط آیتم‌های باطل‌شده */
export function filterVoided<T extends { void?: boolean }>(items: T[]): T[] {
  return items.filter(item => item.void);
}
