import React from 'react';
import type { TemplateProps } from './_helpers';
import { computeTotals, formatInvoiceDate, invoiceTitle, contactFullName } from './_helpers';
import { useSettings, formatNum } from '../../../lib/theme-context';

export const MinimalClean: React.FC<TemplateProps> = ({ invoice, contact }) => {
  const { settings } = useSettings();
  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);
  const totals = computeTotals(invoice);

  return (
    <div className="print-area bg-white text-slate-900 w-full mx-auto" style={{ maxWidth: '210mm', padding: '18mm' }}>
      <div className="flex items-baseline justify-between mb-12">
        <div>
          <div className="text-3xl font-light tracking-tight">{invoiceTitle(invoice)}</div>
          <div className="text-xs text-slate-400 mt-1">{settings.storeName || ''}</div>
        </div>
        <div className="text-right text-xs">
          <div className="text-slate-400">شماره</div>
          <div className="font-mono font-medium">{invoice.number}</div>
          <div className="text-slate-400 mt-2">تاریخ</div>
          <div className="font-mono">{formatInvoiceDate(invoice.date)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12 text-xs">
        <div>
          <div className="text-slate-400 mb-2 tracking-wider text-[10px]">از</div>
          <div className="font-medium">{settings.storeName || '—'}</div>
          {settings.storePhone && <div className="text-slate-500 mt-1">{settings.storePhone}</div>}
          {settings.storeAddress && <div className="text-slate-500 mt-1 leading-relaxed">{settings.storeAddress}</div>}
        </div>
        <div>
          <div className="text-slate-400 mb-2 tracking-wider text-[10px]">به</div>
          <div className="font-medium">{contactFullName(contact)}</div>
          {contact?.mobile && <div className="text-slate-500 mt-1 font-mono" dir="ltr">{contact.mobile}</div>}
          {contact?.address && <div className="text-slate-500 mt-1 leading-relaxed">{contact.address}</div>}
        </div>
      </div>

      <table className="w-full mb-8" style={{ fontSize: '11px' }}>
        <thead>
          <tr className="border-b border-slate-300">
            <th className="text-right py-2 font-medium text-slate-500 tracking-wider text-[10px]">شرح</th>
            <th className="text-center py-2 font-medium text-slate-500 tracking-wider text-[10px] w-16">تعداد</th>
            <th className="text-left py-2 font-medium text-slate-500 tracking-wider text-[10px] w-24">قیمت</th>
            <th className="text-left py-2 font-medium text-slate-500 tracking-wider text-[10px] w-24">مبلغ</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it, i) => {
            const lineTotal = (it.quantity || 0) * (it.unitPrice || 0);
            const discAmt = lineTotal * ((it.discountPercent || 0) / 100);
            const final = lineTotal - discAmt;
            return (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-2">{it.productName}</td>
                <td className="py-2 text-center text-slate-500 font-mono">{f(it.quantity)}</td>
                <td className="py-2 text-left text-slate-500 font-mono" dir="ltr">{f(it.unitPrice)}</td>
                <td className="py-2 text-left font-mono" dir="ltr">{f(final)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-end mb-12">
        <div className="w-64 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">جمع کل</span>
            <span className="font-mono" dir="ltr">{f(totals.subtotal)}</span>
          </div>
          {totals.discountAmount > 0 && settings.showDiscount && (
            <div className="flex justify-between">
              <span className="text-slate-500">تخفیف</span>
              <span className="font-mono" dir="ltr">- {f(totals.discountAmount)}</span>
            </div>
          )}
          {totals.taxAmount > 0 && settings.showTax && (
            <div className="flex justify-between">
              <span className="text-slate-500">مالیات</span>
              <span className="font-mono" dir="ltr">{f(totals.taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-3 border-t border-slate-300">
            <span className="font-medium">قابل پرداخت</span>
            <span className="font-mono font-bold text-base" dir="ltr">{f(totals.total)}</span>
          </div>
          <div className="text-[10px] text-slate-400 text-left" dir="ltr">{settings.currency}</div>
        </div>
      </div>

      {settings.printFooterText && (
        <div className="text-[10px] text-slate-400 text-center mt-12 pt-6 border-t border-slate-100">
          {settings.printFooterText}
        </div>
      )}
    </div>
  );
};

export default MinimalClean;
