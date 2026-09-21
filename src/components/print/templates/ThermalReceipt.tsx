import React from 'react';
import type { TemplateProps } from './_helpers';
import { computeTotals, formatInvoiceDate, invoiceTitle, contactFullName } from './_helpers';
import { useSettings, formatNum } from '../../../lib/theme-context';

export const ThermalReceipt: React.FC<TemplateProps> = ({ invoice, contact }) => {
  const { settings } = useSettings();
  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);
  const totals = computeTotals(invoice);
  const width = settings.printPaper === 'thermal58' ? '58mm' : '80mm';

  return (
    <div className="print-area bg-white text-black mx-auto" style={{ width, maxWidth: width, padding: '3mm', fontFamily: 'monospace' }}>
      <div className="text-center border-b border-dashed border-black pb-2 mb-2">
        <div className="font-bold text-sm">{settings.storeName || 'فروشگاه'}</div>
        {settings.storePhone && <div className="text-[10px]">تلفن: {settings.storePhone}</div>}
        {settings.storeAddress && <div className="text-[9px] mt-1">{settings.storeAddress}</div>}
      </div>

      <div className="text-center my-2 border-b border-dashed border-black pb-2">
        <div className="font-bold text-xs">{invoiceTitle(invoice)}</div>
        <div className="text-[10px] mt-1">شماره: {invoice.number}</div>
        <div className="text-[10px]">تاریخ: {formatInvoiceDate(invoice.date)}</div>
      </div>

      <div className="mb-2 text-[10px]">
        <div>خریدار: {contactFullName(contact)}</div>
        {contact?.mobile && <div dir="ltr" className="text-left">📱 {contact.mobile}</div>}
      </div>

      <div className="border-t border-b border-dashed border-black py-1 my-2">
        <div className="flex justify-between text-[10px] font-bold">
          <span>کالا</span>
          <span>مبلغ</span>
        </div>
      </div>

      <div className="space-y-1 mb-2">
        {invoice.items.map((it, i) => {
          const lineTotal = (it.quantity || 0) * (it.unitPrice || 0);
          const discAmt = lineTotal * ((it.discountPercent || 0) / 100);
          const final = lineTotal - discAmt;
          return (
            <div key={i} className="text-[10px] border-b border-dotted border-gray-400 pb-1">
              <div className="font-bold">{f(i + 1)}. {it.productName}</div>
              <div className="flex justify-between text-[9px]">
                <span>{f(it.quantity)} {it.unit} × {f(it.unitPrice)}</span>
                <span className="font-mono" dir="ltr">{f(final)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-dashed border-black pt-2 mt-2 text-[10px]">
        <div className="flex justify-between">
          <span>جمع کل:</span>
          <span className="font-mono" dir="ltr">{f(totals.subtotal)}</span>
        </div>
        {totals.discountAmount > 0 && settings.showDiscount && (
          <div className="flex justify-between">
            <span>تخفیف:</span>
            <span className="font-mono" dir="ltr">-{f(totals.discountAmount)}</span>
          </div>
        )}
        {totals.taxAmount > 0 && settings.showTax && (
          <div className="flex justify-between">
            <span>مالیات:</span>
            <span className="font-mono" dir="ltr">{f(totals.taxAmount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t border-black">
          <span>قابل پرداخت:</span>
          <span className="font-mono" dir="ltr">{f(totals.total)}</span>
        </div>
        <div className="text-center text-[9px] mt-1">{settings.currency}</div>
      </div>

      <div className="text-center text-[9px] mt-4 pt-2 border-t border-dashed border-black">
        <div>تعداد اقلام: {f(totals.itemCount)} | تعداد کل: {f(totals.totalQty)}</div>
        {settings.printFooterText && <div className="mt-1">{settings.printFooterText}</div>}
        <div className="mt-2">🙏 از خرید شما سپاسگزاریم</div>
      </div>
    </div>
  );
};

export default ThermalReceipt;
