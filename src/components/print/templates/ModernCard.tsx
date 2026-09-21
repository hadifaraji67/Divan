import React from 'react';
import type { TemplateProps } from './_helpers';
import { computeTotals, formatInvoiceDate, invoiceTitle, contactFullName, contactAddress } from './_helpers';
import { useSettings, formatNum } from '../../../lib/theme-context';
import { InvoiceQRCode } from '../InvoiceQRCode';

export const ModernCard: React.FC<TemplateProps> = ({ invoice, contact }) => {
  const { settings } = useSettings();
  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);
  const totals = computeTotals(invoice);
  const accent = settings.printAccentColor || 'indigo';

  const accentMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
    slate:   { bg: '#0f172a', text: '#0f172a', border: '#cbd5e1', light: '#f1f5f9' },
    indigo:  { bg: '#4f46e5', text: '#4338ca', border: '#c7d2fe', light: '#eef2ff' },
    emerald: { bg: '#10b981', text: '#047857', border: '#a7f3d0', light: '#ecfdf5' },
    rose:    { bg: '#e11d48', text: '#be123c', border: '#fecdd3', light: '#fff1f2' },
    amber:   { bg: '#f59e0b', text: '#b45309', border: '#fde68a', light: '#fffbeb' },
    sky:     { bg: '#0284c7', text: '#0369a1', border: '#bae6fd', light: '#f0f9ff' },
  };
  const c = accentMap[accent] || accentMap.indigo;

  return (
    <div className="print-area bg-white text-slate-800 w-full mx-auto shadow-2xl" style={{ maxWidth: '210mm', padding: '14mm' }}>
      <div className="rounded-2xl p-6 mb-6 flex items-center justify-between" style={{ background: c.bg, color: 'white' }}>
        <div className="flex items-center gap-4">
          {settings.printLogo ? (
            <div className="bg-white rounded-xl p-2 w-16 h-16 flex items-center justify-center">
              <img src={settings.printLogo} alt="logo" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl" style={{ background: 'rgba(255,255,255,0.2)' }}>📄</div>
          )}
          <div>
            <div className="text-sm opacity-80">{settings.storeName || 'فروشگاه'}</div>
            <div className="text-2xl font-bold mt-1">{invoiceTitle(invoice)}</div>
          </div>
        </div>
        <div className="text-left">
          <div className="text-xs opacity-80">شماره</div>
          <div className="font-mono text-lg font-bold mt-1">{invoice.number}</div>
          <div className="text-xs opacity-80 mt-2">تاریخ</div>
          <div className="font-mono text-sm">{formatInvoiceDate(invoice.date)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl p-4 border-2" style={{ borderColor: c.border, background: c.light }}>
          <div className="font-bold text-sm mb-2" style={{ color: c.text }}>🏢 فروشنده</div>
          <div className="space-y-1 text-xs">
            <div className="font-bold text-slate-900">{settings.storeName || '—'}</div>
            {settings.storePhone && <div className="text-slate-600">📞 {settings.storePhone}</div>}
            {settings.storeAddress && <div className="text-slate-600">{settings.storeAddress}</div>}
          </div>
        </div>
        <div className="rounded-xl p-4 border-2" style={{ borderColor: c.border, background: c.light }}>
          <div className="font-bold text-sm mb-2" style={{ color: c.text }}>👤 خریدار</div>
          <div className="space-y-1 text-xs">
            <div className="font-bold text-slate-900">{contactFullName(contact)}</div>
            {contact?.mobile && <div className="text-slate-600 font-mono" dir="ltr">📱 {contact.mobile}</div>}
            {contact?.address && <div className="text-slate-600">{contactAddress(contact)}</div>}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1 w-8 rounded-full" style={{ background: c.bg }} />
          <div className="font-bold text-sm" style={{ color: c.text }}>اقلام فاکتور ({f(invoice.items.length)})</div>
        </div>
        <div className="space-y-2">
          {invoice.items.map((it, i) => {
            const lineTotal = (it.quantity || 0) * (it.unitPrice || 0);
            const discAmt = lineTotal * ((it.discountPercent || 0) / 100);
            const final = lineTotal - discAmt;
            return (
              <div key={i} className="rounded-xl p-3 border flex items-center gap-3" style={{ borderColor: '#e2e8f0', background: '#fafafa' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: c.bg }}>{f(i + 1)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{it.productName}</div>
                  {it.description && <div className="text-[10px] text-slate-500">{it.description}</div>}
                </div>
                <div className="text-xs text-slate-500 text-center">
                  <div className="font-mono">{f(it.quantity)} {it.unit}</div>
                  <div className="font-mono text-[10px]">× {f(it.unitPrice)}</div>
                </div>
                <div className="text-left min-w-[80px]">
                  <div className="font-bold font-mono text-sm" style={{ color: c.text }} dir="ltr">{f(final)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="col-span-2 space-y-3">
          {settings.showQR && (
            <div className="rounded-xl p-3 border-2 flex items-center gap-3" style={{ borderColor: c.border, background: c.light }}>
              <InvoiceQRCode invoice={invoice} size={70} />
              <div className="text-[10px] text-slate-600">
                <div className="font-bold" style={{ color: c.text }}>تأیید اصالت</div>
              </div>
            </div>
          )}
          {settings.printFooterText && <div className="text-[10px] text-slate-500">{settings.printFooterText}</div>}
        </div>
        <div className="col-span-3 rounded-xl p-4" style={{ background: c.light, border: '2px solid ' + c.border }}>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-600">جمع کل</span><span className="font-mono" dir="ltr">{f(totals.subtotal)}</span></div>
            {totals.discountAmount > 0 && settings.showDiscount && (
              <div className="flex justify-between"><span className="text-slate-600">تخفیف</span><span className="font-mono text-rose-600" dir="ltr">- {f(totals.discountAmount)}</span></div>
            )}
            {totals.taxAmount > 0 && settings.showTax && (
              <div className="flex justify-between"><span className="text-slate-600">مالیات</span><span className="font-mono" dir="ltr">{f(totals.taxAmount)}</span></div>
            )}
            <div className="h-px my-2" style={{ background: c.border }} />
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm" style={{ color: c.text }}>قابل پرداخت</span>
              <span className="font-mono font-bold text-lg" style={{ color: c.text }} dir="ltr">{f(totals.total)}</span>
            </div>
            <div className="text-left text-[10px] text-slate-500" dir="ltr">{settings.currency}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 pt-4 mt-2" style={{ borderTop: '2px dashed ' + c.border }}>
        <div className="text-center">
          <div className="text-[10px] text-slate-500 mb-10">مهر و امضای فروشنده</div>
          <div className="h-px" style={{ background: c.border }} />
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-500 mb-10">مهر و امضای خریدار</div>
          <div className="h-px" style={{ background: c.border }} />
        </div>
      </div>
    </div>
  );
};

export default ModernCard;
