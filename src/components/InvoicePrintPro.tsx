import React, { useEffect } from 'react';
import { X, Printer, Download } from 'lucide-react';
import type { Invoice, Contact } from '../types/models';
import { invoiceSubtotal, invoiceDiscount, invoiceTax, invoiceTotal } from '../types/models';
import { useSettings, formatNum } from '../lib/theme-context';

interface Props {
  invoice: Invoice;
  contact?: Contact;
  onClose: () => void;
}

export const InvoicePrintPro: React.FC<Props> = ({ invoice, contact, onClose }) => {
  const { settings } = useSettings();
  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const subtotal = invoiceSubtotal(invoice.items);
  const discount = invoiceDiscount(invoice.items, invoice.discountPercent);
  const tax = invoiceTax(invoice.items, invoice.discountPercent, invoice.taxPercent);
  const total = invoiceTotal(invoice.items, invoice.discountPercent, invoice.taxPercent, invoice.shippingCost);

  const docLabel = invoice.type === 'پیش‌فاکتور' ? 'پیش‌فاکتور' : invoice.type === 'خرید' ? 'فاکتور خرید' : invoice.type === 'برگشت از فروش' ? 'برگشت از فروش' : 'فاکتور فروش';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm overflow-y-auto" dir="rtl">
      {/* نوار ابزار */}
      <div className="no-print sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Printer className="w-4 h-4" />
          <span className="text-sm font-bold">پیش‌نمایش {docLabel}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> چاپ
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" /> بستن
          </button>
        </div>
      </div>

      {/* سند */}
      <div className="flex justify-center p-4 md:p-8">
        <div
          id="invoice-print-root"
          className="bg-white text-slate-900 w-full max-w-[210mm] shadow-2xl rounded-lg"
          style={{ minHeight: '297mm' }}
        >
          <div className="p-8 md:p-10 space-y-6">

            {/* سربرگ */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b-2 border-slate-900">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  د
                </div>
                <div>
                  <div className="text-lg font-bold">{settings.storeName || 'دیوان'}</div>
                  {settings.storePhone && <div className="text-xs text-slate-500 mt-0.5" dir="ltr">{settings.storePhone}</div>}
                  {settings.storeEconomicCode && <div className="text-xs text-slate-500">کد اقتصادی: {settings.storeEconomicCode}</div>}
                  {settings.storeAddress && <div className="text-xs text-slate-500 mt-0.5 max-w-xs">{settings.storeAddress}</div>}
                </div>
              </div>
              <div className="text-left">
                <div className="inline-block px-4 py-1.5 bg-slate-900 text-white text-sm font-bold rounded-lg">{docLabel}</div>
                <div className="mt-2 space-y-0.5 text-xs">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">شماره:</span>
                    <b className="font-mono">{f(Number(invoice.number.replace(/\D/g, '')) || 0)}</b>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">تاریخ:</span>
                    <b>{invoice.date}</b>
                  </div>
                  {invoice.dueDate && (
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">سررسید:</span>
                      <b>{invoice.dueDate}</b>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* طرفین */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500 font-bold mb-1.5">مشخصات خریدار</div>
                <div className="text-sm font-bold">{invoice.contactName || '—'}</div>
                {contact?.nationalId && (
                  <div className="text-xs text-slate-600 mt-1">کد ملی / شناسه: {contact.nationalId}</div>
                )}
                {contact?.mobile && (
                  <div className="text-xs text-slate-600 mt-0.5" dir="ltr">📞 {contact.mobile}</div>
                )}
                {contact?.address && (
                  <div className="text-xs text-slate-600 mt-1 leading-relaxed">{contact.address}</div>
                )}
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[11px] text-slate-500 font-bold mb-1.5">شرایط پرداخت</div>
                <div className="text-xs text-slate-700 leading-relaxed space-y-1">
                  <div>نوع سند: <b>{docLabel}</b></div>
                  <div>اقلام: <b>{f(invoice.items.length)} قلم</b></div>
                  <div>وضعیت: <b>{total > 0 ? 'در انتظار پرداخت' : 'تسویه'}</b></div>
                </div>
              </div>
            </div>

            {/* جدول اقلام */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-2.5 text-center w-10">#</th>
                    <th className="p-2.5 text-right">شرح کالا / خدمت</th>
                    <th className="p-2.5 text-center w-16">واحد</th>
                    <th className="p-2.5 text-center w-16">تعداد</th>
                    <th className="p-2.5 text-left w-24">قیمت واحد</th>
                    <th className="p-2.5 text-left w-24">جمع کل</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((it, i) => (
                    <tr key={i} className={i % 2 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="p-2.5 text-center text-slate-500">{f(i + 1)}</td>
                      <td className="p-2.5 font-medium">{it.productName}</td>
                      <td className="p-2.5 text-center text-slate-600">{it.unit}</td>
                      <td className="p-2.5 text-center">{f(it.quantity)}</td>
                      <td className="p-2.5 text-left font-mono">{f(it.unitPrice)}</td>
                      <td className="p-2.5 text-left font-mono font-bold">{f(it.quantity * it.unitPrice)}</td>
                    </tr>
                  ))}
                  {invoice.items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">قلمی ثبت نشده</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* جمع‌بندی */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-xs text-slate-600 leading-relaxed space-y-1">
                {invoice.notes && (
                  <>
                    <div className="font-bold text-slate-700 mb-1">یادداشت:</div>
                    <div>{invoice.notes}</div>
                  </>
                )}
              </div>
              <div className="space-y-1.5 text-xs">
                <SumRow label="جمع اقلام" value={f(subtotal)} currency={settings.currency} />
                {discount > 0 && (
                  <SumRow label={`تخفیف (${f(invoice.discountPercent)}%)`} value={`-${f(discount)}`} currency={settings.currency} color="rose" />
                )}
                {tax > 0 && (
                  <SumRow label={`مالیات (${f(invoice.taxPercent)}%)`} value={`+${f(tax)}`} currency={settings.currency} color="amber" />
                )}
                {invoice.shippingCost > 0 && (
                  <SumRow label="هزینه ارسال" value={`+${f(invoice.shippingCost)}`} currency={settings.currency} color="sky" />
                )}
                <div className="border-t-2 border-slate-900 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">قابل پرداخت</span>
                    <div className="text-left">
                      <div className="text-lg font-bold font-mono">{f(total)}</div>
                      <div className="text-[10px] text-slate-500">{settings.currency}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* پاورقی */}
            <div className="pt-6 mt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <div className="text-slate-500 mb-8">مهر و امضای فروشنده</div>
                <div className="border-t border-slate-300 pt-1 text-slate-400">فروشنده</div>
              </div>
              <div>
                <div className="text-slate-500 mb-8">مهر و امضای خریدار</div>
                <div className="border-t border-slate-300 pt-1 text-slate-400">خریدار</div>
              </div>
              <div className="flex flex-col items-center justify-end">
                <div className="text-[10px] text-slate-400 leading-relaxed">
                  این سند به‌صورت الکترونیکی توسط<br />
                  <b className="text-slate-600">نرم‌افزار دیوان</b> صادر شده است
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice-print-root, #invoice-print-root * { visibility: visible !important; }
          #invoice-print-root {
            position: absolute;
            inset: 0;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .no-print { display: none !important; }
          @page { size: A4; margin: 8mm; }
        }
      `}</style>
    </div>
  );
};

const SumRow: React.FC<{ label: string; value: string; currency: string; color?: 'rose' | 'amber' | 'sky' }> = ({ label, value, currency, color }) => {
  const c = color === 'rose' ? 'text-rose-600' : color === 'amber' ? 'text-amber-600' : color === 'sky' ? 'text-sky-600' : 'text-slate-700';
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-500">{label}:</span>
      <span className={`font-mono font-bold ${c}`} dir="ltr">
        {value} <span className="text-[10px] opacity-60">{currency}</span>
      </span>
    </div>
  );
};

export default InvoicePrintPro;
