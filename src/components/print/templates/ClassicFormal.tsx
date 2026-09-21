import React from 'react';
import type { TemplateProps } from './_helpers';
import { computeTotals, formatInvoiceDate, invoiceTitle, contactFullName, contactAddress } from './_helpers';
import { useSettings, formatNum } from '../../../lib/theme-context';
import { InvoiceQRCode } from '../InvoiceQRCode';

/**
 * قالب رسمی — جداول کامل با خط‌کشی
 * مناسب: سازمانی، دولتی، رسمی
 */
export const ClassicFormal: React.FC<TemplateProps> = ({ invoice, contact, products = [] }) => {
  const { settings } = useSettings();
  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);
  const totals = computeTotals(invoice);
  const isA5 = settings.printPaper === 'A5';

  return (
    <div
      className="print-area bg-white text-slate-900 w-full shadow-2xl mx-auto"
      style={{
        maxWidth: isA5 ? '148mm' : '210mm',
        padding: isA5 ? '8mm' : '12mm',
      }}
    >
      {/* ═══ Header: لوگو + عنوان + شماره ═══ */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="w-24">
          {settings.printLogo && (
            <img src={settings.printLogo} alt="لوگو" className="max-w-full max-h-20 object-contain" />
          )}
        </div>
        <div className="flex-1 text-center">
          <h1 className="font-bold" style={{ fontSize: isA5 ? '13px' : '15px' }}>
            {invoiceTitle(invoice)}
          </h1>
          <div className="text-slate-500 mt-1" style={{ fontSize: isA5 ? '8px' : '9px' }}>
            {settings.storeName || 'فروشگاه'}
          </div>
        </div>
        <div className="w-32 text-left" style={{ fontSize: isA5 ? '8px' : '10px' }}>
          <div className="flex justify-between">
            <span className="text-slate-500">شماره:</span>
            <span className="font-mono font-bold">{invoice.number}</span>
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-slate-500">تاریخ:</span>
            <span className="font-mono">{formatInvoiceDate(invoice.date)}</span>
          </div>
        </div>
      </div>

      {/* ═══ اطلاعات فروشنده ═══ */}
      <table className="w-full mb-3" style={{ border: '1px solid #000', borderCollapse: 'collapse', fontSize: isA5 ? '7px' : '8px' }}>
        <tbody>
          <tr>
            <td className="p-1 font-bold" style={{ border: '1px solid #000', width: '15%', background: '#f5f5f5' }}>فروشنده:</td>
            <td className="p-1" style={{ border: '1px solid #000' }}>{settings.storeName || '—'}</td>
            <td className="p-1 font-bold" style={{ border: '1px solid #000', width: '15%', background: '#f5f5f5' }}>تلفن:</td>
            <td className="p-1 font-mono" style={{ border: '1px solid #000' }} dir="ltr">{settings.storePhone || '—'}</td>
          </tr>
          <tr>
            <td className="p-1 font-bold" style={{ border: '1px solid #000', background: '#f5f5f5' }}>نشانی:</td>
            <td className="p-1" colSpan={3} style={{ border: '1px solid #000' }}>{settings.storeAddress || '—'}</td>
          </tr>
          {(settings.storeNationalId || settings.storeRegistrationNumber) && (
            <tr>
              {settings.storeNationalId && (
                <>
                  <td className="p-1 font-bold" style={{ border: '1px solid #000', background: '#f5f5f5' }}>شناسه ملی:</td>
                  <td className="p-1 font-mono" style={{ border: '1px solid #000' }} dir="ltr">{settings.storeNationalId}</td>
                </>
              )}
              {settings.storeRegistrationNumber && (
                <>
                  <td className="p-1 font-bold" style={{ border: '1px solid #000', background: '#f5f5f5' }}>ش.ثبت:</td>
                  <td className="p-1 font-mono" style={{ border: '1px solid #000' }} dir="ltr">{settings.storeRegistrationNumber}</td>
                </>
              )}
            </tr>
          )}
        </tbody>
      </table>

      {/* ═══ اطلاعات خریدار ═══ */}
      <table className="w-full mb-3" style={{ border: '1px solid #000', borderCollapse: 'collapse', fontSize: isA5 ? '7px' : '8px' }}>
        <tbody>
          <tr>
            <td className="p-1 font-bold" style={{ border: '1px solid #000', width: '15%', background: '#f5f5f5' }}>خریدار:</td>
            <td className="p-1" style={{ border: '1px solid #000', width: '35%' }}>{contactFullName(contact)}</td>
            <td className="p-1 font-bold" style={{ border: '1px solid #000', width: '15%', background: '#f5f5f5' }}>تلفن:</td>
            <td className="p-1 font-mono" style={{ border: '1px solid #000', width: '35%' }} dir="ltr">{contact?.mobile || '—'}</td>
          </tr>
          <tr>
            <td className="p-1 font-bold" style={{ border: '1px solid #000', background: '#f5f5f5' }}>نشانی:</td>
            <td className="p-1" colSpan={3} style={{ border: '1px solid #000' }}>{contactAddress(contact)}</td>
          </tr>
          {contact?.nationalId && (
            <tr>
              <td className="p-1 font-bold" style={{ border: '1px solid #000', background: '#f5f5f5' }}>کد ملی:</td>
              <td className="p-1 font-mono" style={{ border: '1px solid #000' }} dir="ltr">{contact.nationalId}</td>
              <td className="p-1 font-bold" style={{ border: '1px solid #000', background: '#f5f5f5' }}>کد پستی:</td>
              <td className="p-1 font-mono" style={{ border: '1px solid #000' }} dir="ltr">{contact.postalCode || '—'}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ═══ جدول اقلام ═══ */}
      <table className="w-full mb-3" style={{ border: '1px solid #000', borderCollapse: 'collapse', fontSize: isA5 ? '7px' : '8px' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th className="p-1 font-bold" style={{ border: '1px solid #000', width: '5%' }}>#</th>
            <th className="p-1 font-bold" style={{ border: '1px solid #000', width: '35%' }}>شرح کالا / خدمات</th>
            <th className="p-1 font-bold" style={{ border: '1px solid #000', width: '10%' }}>تعداد</th>
            <th className="p-1 font-bold" style={{ border: '1px solid #000', width: '15%' }}>قیمت واحد</th>
            {settings.showDiscount && <th className="p-1 font-bold" style={{ border: '1px solid #000', width: '10%' }}>تخفیف</th>}
            <th className="p-1 font-bold" style={{ border: '1px solid #000', width: '15%' }}>جمع کل</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it, i) => {
            const lineTotal = (it.quantity || 0) * (it.unitPrice || 0);
            const discAmt = lineTotal * ((it.discountPercent || 0) / 100);
            const final = lineTotal - discAmt;
            return (
              <tr key={i}>
                <td className="p-1 text-center" style={{ border: '1px solid #000' }}>{f(i + 1)}</td>
                <td className="p-1" style={{ border: '1px solid #000' }}>
                  <div className="font-bold">{it.productName}</div>
                  {settings.showItemDescription && it.description && (
                    <div className="text-slate-500" style={{ fontSize: '0.85em' }}>{it.description}</div>
                  )}
                </td>
                <td className="p-1 text-center font-mono" style={{ border: '1px solid #000' }}>{f(it.quantity)} {it.unit}</td>
                <td className="p-1 text-left font-mono" style={{ border: '1px solid #000' }} dir="ltr">{f(it.unitPrice)}</td>
                {settings.showDiscount && (
                  <td className="p-1 text-left font-mono" style={{ border: '1px solid #000' }} dir="ltr">
                    {it.discountPercent ? `${f(it.discountPercent)}%` : '—'}
                  </td>
                )}
                <td className="p-1 text-left font-mono font-bold" style={{ border: '1px solid #000' }} dir="ltr">{f(final)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ═══ جمع‌بندی ═══ */}
      <div className="flex justify-between gap-4">
        <div className="flex-1">
          {settings.showQR && invoice.id && (
            <div className="flex items-start gap-2">
              <InvoiceQRCode invoice={invoice} size={isA5 ? 60 : 80} />
              <div className="text-slate-500" style={{ fontSize: isA5 ? '6px' : '7px' }}>
                <div className="font-bold">تأیید اصالت</div>
                <div>با اسکن QR</div>
              </div>
            </div>
          )}
          {settings.printFooterText && (
            <div className="mt-2 text-slate-600" style={{ fontSize: isA5 ? '7px' : '8px' }}>
              {settings.printFooterText}
            </div>
          )}
        </div>

        <table style={{ borderCollapse: 'collapse', fontSize: isA5 ? '8px' : '9px', minWidth: '50%' }}>
          <tbody>
            <tr>
              <td className="p-1 font-bold" style={{ border: '1px solid #000', background: '#f5f5f5' }}>جمع کل:</td>
              <td className="p-1 text-left font-mono" style={{ border: '1px solid #000' }} dir="ltr">{f(totals.subtotal)}</td>
            </tr>
            {totals.discountAmount > 0 && settings.showDiscount && (
              <tr>
                <td className="p-1 font-bold" style={{ border: '1px solid #000', background: '#f5f5f5' }}>تخفیف:</td>
                <td className="p-1 text-left font-mono text-rose-600" style={{ border: '1px solid #000' }} dir="ltr">- {f(totals.discountAmount)}</td>
              </tr>
            )}
            {totals.taxAmount > 0 && settings.showTax && (
              <tr>
                <td className="p-1 font-bold" style={{ border: '1px solid #000', background: '#f5f5f5' }}>مالیات ({f(invoice.taxPercent)}%):</td>
                <td className="p-1 text-left font-mono" style={{ border: '1px solid #000' }} dir="ltr">{f(totals.taxAmount)}</td>
              </tr>
            )}
            {totals.shipping > 0 && settings.showShipping && (
              <tr>
                <td className="p-1 font-bold" style={{ border: '1px solid #000', background: '#f5f5f5' }}>هزینه ارسال:</td>
                <td className="p-1 text-left font-mono" style={{ border: '1px solid #000' }} dir="ltr">{f(totals.shipping)}</td>
              </tr>
            )}
            <tr style={{ background: '#f0f0f0' }}>
              <td className="p-1 font-bold" style={{ border: '1px solid #000' }}>مبلغ قابل پرداخت:</td>
              <td className="p-1 text-left font-mono font-bold" style={{ border: '1px solid #000', fontSize: '1.15em' }} dir="ltr">
                {f(totals.total)} {settings.currency}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ═══ Footer: امضاها ═══ */}
      <div className="grid grid-cols-2 gap-6 mt-6" style={{ fontSize: isA5 ? '7px' : '8px' }}>
        <div className="text-center">
          <div className="text-slate-500 mb-8">مهر و امضای فروشنده</div>
          <div style={{ borderTop: '1px dashed #999' }} />
        </div>
        <div className="text-center">
          <div className="text-slate-500 mb-8">مهر و امضای خریدار</div>
          <div style={{ borderTop: '1px dashed #999' }} />
        </div>
      </div>
    </div>
  );
};

export default ClassicFormal;
