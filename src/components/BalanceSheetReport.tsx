import React, { useMemo, useEffect, useState } from 'react';
import { Download, Scale } from 'lucide-react';
import type { Invoice, Product, Payment, Cheque, Contact } from '../types/models';
import { invoiceTotal } from '../types/models';
import { loadData } from '../lib/storage';
import { useSettings, formatNum } from '../lib/theme-context';

export const BalanceSheetReport: React.FC = () => {
  const { settings } = useSettings();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    setInvoices(loadData<Invoice[]>('invoices', []));
    setProducts(loadData<Product[]>('products', []));
    setPayments(loadData<Payment[]>('payments', []));
    setCheques(loadData<Cheque[]>('cheques', []));
    setContacts(loadData<Contact[]>('contacts', []));
  }, []);

  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);

  const report = useMemo(() => {
    // دارایی‌ها
    const cash = payments
      .filter(p => p.direction === 'دریافت' && p.type === 'نقد')
      .reduce((s, p) => s + p.amount, 0)
      - payments.filter(p => p.direction === 'پرداخت' && p.type === 'نقد').reduce((s, p) => s + p.amount, 0);

    const inventory = products.reduce((s, p) => s + p.stock * p.buyPrice, 0);

    // حساب‌های دریافتنی (مانده بدهی مشتریان)
    const receivable = contacts.reduce((sum, c) => {
      const sales = invoices.filter(i => i.contactId === c.id && (i.type === 'فروش' || i.type === 'پیش‌فاکتور فروش'));
      const total = sales.reduce((s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost), 0);
      const paid = payments
        .filter(p => p.contactId === c.id && p.direction === 'دریافت')
        .reduce((s, p) => s + p.amount, 0);
      return sum + Math.max(0, total - paid);
    }, 0);

    const chequesInHand = cheques
      .filter(c => c.direction === 'دریافتی' && c.status === 'در جریان')
      .reduce((s, c) => s + c.amount, 0);

    const totalAssets = cash + inventory + receivable + chequesInHand;

    // بدهی‌ها
    const payable = contacts.reduce((sum, c) => {
      const purchases = invoices.filter(i => i.contactId === c.id && i.type === 'خرید');
      const total = purchases.reduce((s, i) => s + invoiceTotal(i.items, i.discountPercent, i.taxPercent, i.shippingCost), 0);
      const paid = payments
        .filter(p => p.contactId === c.id && p.direction === 'پرداخت')
        .reduce((s, p) => s + p.amount, 0);
      return sum + Math.max(0, total - paid);
    }, 0);

    const chequesOut = cheques
      .filter(c => c.direction === 'پرداختی' && c.status === 'در جریان')
      .reduce((s, c) => s + c.amount, 0);

    // مالیات فروش
    let taxPayable = 0;
    invoices.filter(i => i.type === 'فروش').forEach(inv => {
      inv.items.forEach(it => {
        const price = it.quantity * it.unitPrice;
        taxPayable += (price * it.taxPercent) / 100;
      });
    });

    const totalLiabilities = payable + chequesOut + taxPayable;

    // حقوق صاحبان سهام
    const totalEquity = totalAssets - totalLiabilities;

    return {
      cash, inventory, receivable, chequesInHand, totalAssets,
      payable, chequesOut, taxPayable, totalLiabilities,
      totalEquity,
    };
  }, [invoices, products, payments, cheques, contacts]);

  const Row: React.FC<{ label: string; value: number; bold?: boolean; color?: string }> = ({ label, value, bold, color }) => (
    <div className={`flex justify-between items-center py-2 border-b border-black/5 dark:border-white/5 ${bold ? 'font-bold' : ''}`}>
      <span className={`text-sm ${bold ? '' : 'opacity-80'}`}>{label}</span>
      <span className={`font-mono text-sm ${color || ''}`} dir="ltr">
        {f(value)} <span className="text-[10px] opacity-60">{settings.currency}</span>
      </span>
    </div>
  );

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-bold">ترازنامه</h2>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${Math.abs(report.totalAssets - report.totalLiabilities - report.totalEquity) < 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {Math.abs(report.totalAssets - report.totalLiabilities - report.totalEquity) < 100 ? '✓ متوازن' : '✗ نامتوازن'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* دارایی‌ها */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border p-5" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-indigo-500">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Scale className="w-4 h-4 text-indigo-500" />
            </div>
            <h3 className="font-bold text-sm">دارایی‌ها</h3>
          </div>

          <Row label="موجودی نقدی" value={report.cash} color="text-emerald-600" />
          <Row label="موجودی انبار" value={report.inventory} color="text-emerald-600" />
          <Row label="حساب‌های دریافتنی" value={report.receivable} color="text-emerald-600" />
          <Row label="چک‌های دریافتی نزد صندوق" value={report.chequesInHand} color="text-emerald-600" />

          <div className="mt-3 pt-3 border-t-2 border-indigo-500">
            <Row label="جمع دارایی‌ها" value={report.totalAssets} bold color="text-indigo-600" />
          </div>
        </div>

        {/* بدهی‌ها و حقوق صاحبان */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border p-5" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-rose-500">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <Scale className="w-4 h-4 text-rose-500" />
            </div>
            <h3 className="font-bold text-sm">بدهی‌ها و حقوق صاحبان سهام</h3>
          </div>

          <div className="text-xs opacity-60 mb-2">بدهی‌ها</div>
          <Row label="حساب‌های پرداختنی" value={report.payable} color="text-rose-600" />
          <Row label="چک‌های پرداختی" value={report.chequesOut} color="text-rose-600" />
          <Row label="مالیات قابل پرداخت" value={report.taxPayable} color="text-rose-600" />
          <Row label="جمع بدهی‌ها" value={report.totalLiabilities} bold color="text-rose-600" />

          <div className="text-xs opacity-60 mt-4 mb-2">حقوق صاحبان سهام</div>
          <Row label="سرمایه / اندوخته" value={report.totalEquity} color="text-indigo-600" bold />

          <div className="mt-3 pt-3 border-t-2 border-rose-500">
            <Row label="جمع بدهی + حقوق" value={report.totalLiabilities + report.totalEquity} bold color="text-rose-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheetReport;
