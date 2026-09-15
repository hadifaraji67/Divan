import React, { useEffect } from 'react';
import { X, Printer, Image as ImageIcon, Share2 } from 'lucide-react';
import type { Invoice, Contact, Product } from '../../types/models';
import { invoiceTotal } from '../../types/models';
import { useSettings, formatNum } from '../../lib/theme-context';
import { notify } from '../../lib/toast';
import { roundRial, calculateLineTotal } from '../../lib/format';

interface Props {
  invoice: Invoice;
  contact?: Contact;
  products?: Product[];
  onClose: () => void;
}

export const InvoicePrintPro: React.FC<Props> = ({ invoice, contact, products = [], onClose }) => {
  const { settings } = useSettings();
  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);
  const [saving, setSaving] = React.useState(false);

  const saveAsImage = async () => {
    setSaving(true);
    const loadingToast = notify.loading('در حال ساخت تصویر...');
    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = document.querySelector('.print-area') as HTMLElement;
      if (!element) {
        notify.dismiss(loadingToast);
        notify.error('عنصر فاکتور پیدا نشد');
        setSaving(false);
        return;
      }

      // به‌طور موقت مخفی کردن عناصر no-print
      const noPrintEls = document.querySelectorAll('.no-print') as NodeListOf<HTMLElement>;
      const originalDisplays: string[] = [];
      noPrintEls.forEach((el, i) => {
        originalDisplays[i] = el.style.display;
        el.style.display = 'none';
      });

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // برگرداندن نمایش
      noPrintEls.forEach((el, i) => {
        el.style.display = originalDisplays[i] || '';
      });

      // تبدیل به blob
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png', 0.95)
      );

      if (!blob) {
        notify.dismiss(loadingToast);
        notify.error('خطا در ساخت تصویر');
        setSaving(false);
        return;
      }

      // بررسی پشتیبانی از Web Share API
      const file = new File([blob], `invoice-${invoice.number}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        // در موبایل: به اشتراک گذاری (ذخیره، ارسال به تلگرام، واتساپ و...)
        notify.dismiss(loadingToast);
        try {
          await navigator.share({
            files: [file],
            title: `فاکتور ${invoice.number}`,
            text: `فاکتور ${invoice.type} شماره ${invoice.number}`,
          });
        } catch (err: any) {
          if (err?.name !== 'AbortError') {
            // اگر اشتراک‌گذاری لغو شد، دانلود کن
            downloadBlob(blob, invoice.number);
          }
        }
      } else {
        // در دسکتاپ یا مرورگر بدون پشتیبانی: دانلود
        notify.dismiss(loadingToast);
        downloadBlob(blob, invoice.number);
        notify.success('تصویر فاکتور ذخیره شد');
      }
    } catch (err) {
      console.error('[saveAsImage]', err);
      notify.dismiss(loadingToast);
      notify.error('خطا در ساخت تصویر');
    } finally {
      setSaving(false);
    }
  };

  const downloadBlob = (blob: Blob, invoiceNumber: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoiceNumber}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const isFormal = settings.printMode === 'formal';
  const isThermal = settings.printPaper === 'thermal80' || settings.printPaper === 'thermal58';
  const isA5 = settings.printPaper === 'A5';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm overflow-y-auto" dir="rtl">
      {/* نوار ابزار */}
      <div className="no-print sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Printer className="w-4 h-4" />
          <span className="text-sm font-bold">
            پیش‌نمایش فاکتور — {settings.printPaper} {isFormal ? 'رسمی' : 'غیررسمی'}
          </span>
        </div>
        <div className="flex gap-1.5 md:gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-2.5 md:px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">چاپ</span>
          </button>
          <button
            onClick={saveAsImage}
            disabled={saving}
            className="flex items-center gap-1.5 px-2.5 md:px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold rounded-lg"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="hidden md:inline">در حال ساخت...</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">ذخیره عکس</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-2.5 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex justify-center p-2 md:p-6">
        {isFormal && !isThermal ? (
          <FormalInvoice invoice={invoice} contact={contact} products={products} isA5={isA5} />
        ) : isThermal ? (
          <ThermalReceipt invoice={invoice} contact={contact} />
        ) : (
          <SimpleInvoice invoice={invoice} contact={contact} />
        )}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { position: absolute; inset: 0; box-shadow: none !important; border-radius: 0 !important; }
          .no-print { display: none !important; }
          @page { size: ${isA5 ? 'A5' : 'A4'}; margin: 6mm; }
        }
      `}</style>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ۱. فاکتور رسمی مالیاتی (استاندارد ایران)
   ═══════════════════════════════════════════════════════════════ */
const FormalInvoice: React.FC<{ invoice: Invoice; contact?: Contact; products: Product[]; isA5: boolean }> = ({ invoice, contact, products, isA5 }) => {
  const { settings } = useSettings();
  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);
  const fs = (n: number) => f(n);

  const docTitle = invoice.type === 'خرید' ? 'فاکتور خرید کالا و خدمات' :
                   invoice.type === 'برگشت از فروش' ? 'برگشت از فروش کالا و خدمات' :
                   invoice.type === 'پیش‌فاکتور فروش' ? 'پیش‌فاکتور فروش کالا و خدمات' :
                   'فاکتور فروش کالا و خدمات';

  // محاسبات
  const items = invoice.items.map((it, i) => {
    const product = products.find(p => p.id === it.productId);
    const calc = calculateLineTotal(it.quantity, it.unitPrice, it.discountPercent, it.taxPercent);
    const totalBeforeDiscount = calc.total;
    const discountAmount = calc.discount;
    const afterDiscount = totalBeforeDiscount - discountAmount;
    const taxAmount = calc.tax;
    const grandTotal = afterDiscount + taxAmount;
    return {
      rowNum: i + 1,
      code: product?.sku || it.productCode || '',
      name: it.productName,
      desc: it.description || product?.description || '',
      qty: it.quantity,
      unit: it.unit,
      unitPrice: it.unitPrice,
      total: totalBeforeDiscount,
      discount: discountAmount,
      afterDiscount,
      tax: taxAmount,
      grandTotal,
    };
  });

  const totals = items.reduce((acc, it) => ({
    total: acc.total + it.total,
    discount: acc.discount + it.discount,
    afterDiscount: acc.afterDiscount + it.afterDiscount,
    tax: acc.tax + it.tax,
    grandTotal: acc.grandTotal + it.grandTotal,
  }), { total: 0, discount: 0, afterDiscount: 0, tax: 0, grandTotal: 0 });

  // تبدیل عدد به حروف
  const numberToPersianWords = (num: number): string => {
    if (num === 0) return 'صفر';
    const ones = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
    const teens = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
    const tens = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
    const hundreds = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
    const scales = ['', ' هزار', ' میلیون', ' میلیارد', ' بیلیون'];

    let result = '';
    let scaleIdx = 0;
    while (num > 0) {
      const chunk = num % 1000;
      if (chunk > 0) {
        let chunkStr = '';
        const h = Math.floor(chunk / 100);
        const rem = chunk % 100;
        if (h > 0) chunkStr += hundreds[h];
        if (rem > 0) {
          if (chunkStr) chunkStr += ' و ';
          if (rem < 10) chunkStr += ones[rem];
          else if (rem < 20) chunkStr += teens[rem - 10];
          else {
            const t = Math.floor(rem / 10);
            const o = rem % 10;
            chunkStr += tens[t];
            if (o > 0) chunkStr += ' و ' + ones[o];
          }
        }
        if (result) result = chunkStr + scales[scaleIdx] + ' و ' + result;
        else result = chunkStr + scales[scaleIdx];
      }
      num = Math.floor(num / 1000);
      scaleIdx++;
    }
    return result;
  };

  const grandTotalWords = numberToPersianWords(totals.grandTotal);

  return (
    <div
      className="print-area bg-white text-slate-900 w-full shadow-2xl"
      style={{
        maxWidth: isA5 ? '148mm' : '210mm',
        minHeight: isA5 ? '210mm' : '297mm',
        padding: isA5 ? '6mm' : '8mm',
        fontSize: isA5 ? '8px' : '10px',
        fontFamily: 'Vazirmatn, Tahoma, sans-serif',
      }}
    >
      {/* هدر - لوگو + عنوان + شماره/تاریخ */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="w-24">
          {settings.printLogo && (
            <img src={settings.printLogo} alt="لوگو" className="max-w-full max-h-20 object-contain" />
          )}
        </div>
        <div className="flex-1 text-center">
          <h1 className="font-bold" style={{ fontSize: isA5 ? '13px' : '15px' }}>{docTitle}</h1>
        </div>
        <div className="w-32 text-left" style={{ fontSize: isA5 ? '8px' : '10px' }}>
          <div className="flex justify-between gap-2 mb-0.5">
            <span>شماره فاکتور:</span>
            <b className="font-mono">{f(Number(invoice.number.replace(/\D/g, '')) || 0)}</b>
          </div>
          <div className="flex justify-between gap-2">
            <span>تاریخ:</span>
            <b>{invoice.date}</b>
          </div>
        </div>
      </div>

      {/* جدول اصلی */}
      <table
        className="w-full border-collapse"
        style={{ border: '1px solid #000', fontSize: isA5 ? '7.5px' : '9px' }}
      >
        <tbody>
          {/* مشخصات فروشنده */}
          <tr>
            <td colSpan={4} className="text-center font-bold py-1" style={{ border: '1px solid #000', background: '#f5f5f5' }}>
              مشخصات فروشنده
            </td>
          </tr>
          <tr>
            <td className="p-1.5" style={{ border: '1px solid #000', width: '15%' }}>
              نام شخص حقیقی / حقوقی :
            </td>
            <td className="p-1.5" style={{ border: '1px solid #000', width: '35%' }}>
              {settings.storeLegalName || settings.storeName || '—'}
            </td>
            <td className="p-1.5" style={{ border: '1px solid #000', width: '15%' }}>
              شماره اقتصادی :
            </td>
            <td className="p-1.5 font-mono" style={{ border: '1px solid #000', width: '35%' }} dir="ltr">
              {settings.storeEconomicCode || '—'}
            </td>
          </tr>
          <tr>
            <td className="p-1.5" style={{ border: '1px solid #000' }}>
              نشانی کامل : استان
            </td>
            <td className="p-1.5" style={{ border: '1px solid #000' }}>
              {settings.storeAddress || '—'}
            </td>
            <td className="p-1.5" style={{ border: '1px solid #000' }}>
              کدپستی ده رقمی :
            </td>
            <td className="p-1.5 font-mono" style={{ border: '1px solid #000' }} dir="ltr">
              {settings.storePostalCode || '—'}
            </td>
          </tr>
          <tr>
            <td className="p-1.5" style={{ border: '1px solid #000' }}>
              شناسه (کد) ملی :
            </td>
            <td className="p-1.5 font-mono" style={{ border: '1px solid #000' }} dir="ltr">
              {settings.storeNationalId || '—'}
            </td>
            <td className="p-1.5" style={{ border: '1px solid #000' }}>
              شماره ثبت :
            </td>
            <td className="p-1.5 font-mono" style={{ border: '1px solid #000' }} dir="ltr">
              {settings.storeRegistrationNumber || '—'}
            </td>
          </tr>
          <tr>
            <td className="p-1.5" style={{ border: '1px solid #000' }}>
              تلفن / فکس :
            </td>
            <td colSpan={3} className="p-1.5 font-mono" style={{ border: '1px solid #000' }} dir="ltr">
              {settings.storePhone || '—'} {settings.storeFax && ` / ${settings.storeFax}`}
            </td>
          </tr>

          {/* مشخصات خریدار */}
          <tr>
            <td colSpan={4} className="text-center font-bold py-1" style={{ border: '1px solid #000', background: '#f5f5f5' }}>
              مشخصات خریدار
            </td>
          </tr>
          <tr>
            <td className="p-1.5" style={{ border: '1px solid #000' }}>
              نام شخص حقیقی / حقوقی :
            </td>
            <td className="p-1.5" style={{ border: '1px solid #000' }}>
              {contact?.type === 'حقوقی' ? contact.companyName || invoice.contactName : invoice.contactName}
            </td>
            <td className="p-1.5" style={{ border: '1px solid #000' }}>
              شماره اقتصادی :
            </td>
            <td className="p-1.5 font-mono" style={{ border: '1px solid #000' }} dir="ltr">
              {contact?.economicCode || '—'}
            </td>
          </tr>
          <tr>
            <td className="p-1.5" style={{ border: '1px solid #000' }}>
              نشانی کامل : استان
            </td>
            <td className="p-1.5" style={{ border: '1px solid #000' }}>
              {contact ? [contact.province, contact.county, contact.city].filter(Boolean).join(' - ') || contact.address || '—' : '—'}
            </td>
            <td className="p-1.5" style={{ border: '1px solid #000' }}>
              کدپستی ده رقمی :
            </td>
            <td className="p-1.5 font-mono" style={{ border: '1px solid #000' }} dir="ltr">
              {contact?.postalCode || '—'}
            </td>
          </tr>
          <tr>
            <td className="p-1.5" style={{ border: '1px solid #000' }}>
              شناسه (کد) ملی :
            </td>
            <td className="p-1.5 font-mono" style={{ border: '1px solid #000' }} dir="ltr">
              {contact?.nationalId || '—'}
            </td>
            <td className="p-1.5" style={{ border: '1px solid #000' }}>
              شماره ثبت :
            </td>
            <td className="p-1.5 font-mono" style={{ border: '1px solid #000' }} dir="ltr">
              {contact?.registrationNumber || '—'}
            </td>
          </tr>
          <tr>
            <td className="p-1.5" style={{ border: '1px solid #000' }}>
              تلفن / فکس :
            </td>
            <td colSpan={3} className="p-1.5 font-mono" style={{ border: '1px solid #000' }} dir="ltr">
              {contact?.mobile || '—'} {contact?.phone && ` / ${contact.phone}`}
            </td>
          </tr>

          {/* مشخصات کالا و خدمات */}
          <tr>
            <td colSpan={11} className="text-center font-bold py-1" style={{ border: '1px solid #000', background: '#f5f5f5' }}>
              مشخصات کالا یا خدمات
            </td>
          </tr>
        </tbody>
      </table>

      {/* جدول اقلام */}
      <table className="w-full border-collapse" style={{ border: '1px solid #000', borderTop: 'none', fontSize: isA5 ? '7px' : '8.5px' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th className="p-1 font-bold" style={{ border: '1px solid #000', width: '3%' }}>ردیف</th>
            <th className="p-1 font-bold" style={{ border: '1px solid #000', width: '7%' }}>کد کالا</th>
            <th className="p-1 font-bold" style={{ border: '1px solid #000', width: '22%' }}>شرح کالا یا خدمات</th>
            <th className="p-1 font-bold" style={{ border: '1px solid #000', width: '5%' }}>تعداد / مقدار</th>
            <th className="p-1 font-bold" style={{ border: '1px solid #000', width: '6%' }}>واحد اندازه‌گیری</th>
            <th className="p-1 font-bold" style={{ border: '1px solid #000', width: '11%' }}>مبلغ واحد (ریال)</th>
            <th className="p-1 font-bold" style={{ border: '1px solid #000', width: '11%' }}>مبلغ کل (ریال)</th>
            <th className="p-1 font-bold" style={{ border: '1px solid #000', width: '9%' }}>تخفیف (ریال)</th>
            <th className="p-1 font-bold" style={{ border: '1px solid #000', width: '11%' }}>مبلغ کل پس از تخفیف (ریال)</th>
            <th className="p-1 font-bold" style={{ border: '1px solid #000', width: '10%' }}>جمع مالیات و عوارض (ریال)</th>
            <th className="p-1 font-bold" style={{ border: '1px solid #000', width: '11%' }}>جمع مبلغ کل بعلاوه جمع مالیات و عوارض (ریال)</th>
          </tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.rowNum}>
              <td className="p-1 text-center" style={{ border: '1px solid #000' }}>{f(it.rowNum)}</td>
              <td className="p-1 text-center font-mono" style={{ border: '1px solid #000' }} dir="ltr">{it.code}</td>
              <td className="p-1" style={{ border: '1px solid #000' }}>
                {it.name}
                {settings.showItemDescription && it.desc && (
                  <div style={{ fontSize: '7px', color: '#666', marginTop: '2px' }}>{it.desc}</div>
                )}
              </td>
              <td className="p-1 text-center" style={{ border: '1px solid #000' }}>{f(it.qty)}</td>
              <td className="p-1 text-center" style={{ border: '1px solid #000' }}>{it.unit}</td>
              <td className="p-1 text-left font-mono" style={{ border: '1px solid #000' }} dir="ltr">{f(it.unitPrice)}</td>
              <td className="p-1 text-left font-mono" style={{ border: '1px solid #000' }} dir="ltr">{f(it.total)}</td>
              <td className="p-1 text-left font-mono" style={{ border: '1px solid #000' }} dir="ltr">{it.discount > 0 ? f(it.discount) : '۰'}</td>
              <td className="p-1 text-left font-mono" style={{ border: '1px solid #000' }} dir="ltr">{f(it.afterDiscount)}</td>
              <td className="p-1 text-left font-mono" style={{ border: '1px solid #000' }} dir="ltr">{f(it.tax)}</td>
              <td className="p-1 text-left font-mono font-bold" style={{ border: '1px solid #000' }} dir="ltr">{f(it.grandTotal)}</td>
            </tr>
          ))}
          {/* جمع کل */}
          <tr style={{ background: '#f5f5f5', fontWeight: 'bold' }}>
            <td colSpan={3} className="p-1 text-center" style={{ border: '1px solid #000' }}>جمع کل</td>
            <td className="p-1 text-center" style={{ border: '1px solid #000' }}>
              {f(items.reduce((s, it) => s + it.qty, 0))}
            </td>
            <td className="p-1" style={{ border: '1px solid #000' }}></td>
            <td className="p-1" style={{ border: '1px solid #000' }}></td>
            <td className="p-1 text-left font-mono" style={{ border: '1px solid #000' }} dir="ltr">{f(totals.total)}</td>
            <td className="p-1 text-left font-mono" style={{ border: '1px solid #000' }} dir="ltr">{f(totals.discount)}</td>
            <td className="p-1 text-left font-mono" style={{ border: '1px solid #000' }} dir="ltr">{f(totals.afterDiscount)}</td>
            <td className="p-1 text-left font-mono" style={{ border: '1px solid #000' }} dir="ltr">{f(totals.tax)}</td>
            <td className="p-1 text-left font-mono" style={{ border: '1px solid #000' }} dir="ltr">{f(totals.grandTotal)}</td>
          </tr>
        </tbody>
      </table>

      {/* شرایط و توضیحات */}
      <table className="w-full border-collapse" style={{ border: '1px solid #000', borderTop: 'none', fontSize: isA5 ? '7.5px' : '9px' }}>
        <tbody>
          <tr>
            <td className="p-1.5 font-bold align-top" style={{ border: '1px solid #000', width: '12%', height: '60px' }}>
              شرایط و نحوه فروش :
            </td>
            <td className="p-1.5 align-top" style={{ border: '1px solid #000', width: '38%' }}>
              {invoice.paymentTerms || ''}
            </td>
            <td className="p-1.5 font-bold align-top" style={{ border: '1px solid #000', width: '12%' }}>
              توضیحات :
            </td>
            <td className="p-1.5 align-top" style={{ border: '1px solid #000', width: '38%' }}>
              {invoice.notes || ''}
            </td>
          </tr>
        </tbody>
      </table>

      {/* جمع کل به حروف */}
      <div
        className="text-center font-bold py-1.5"
        style={{ border: '1px solid #000', borderTop: 'none', background: '#f9f9f9', fontSize: isA5 ? '8px' : '10px' }}
      >
        جمع مبلغ کل فاکتور به حروف: <span style={{ fontStyle: 'italic' }}>{grandTotalWords} ریال</span>
      </div>

      {/* مهر و امضا */}
      {settings.showStamp && (
        <table className="w-full border-collapse" style={{ border: '1px solid #000', borderTop: 'none', fontSize: isA5 ? '8px' : '10px' }}>
          <tbody>
            <tr>
              <td className="p-2 text-center" style={{ border: '1px solid #000', width: '50%', height: '70px', verticalAlign: 'top' }}>
                مهر و امضا فروشنده :
              </td>
              <td className="p-2 text-center" style={{ border: '1px solid #000', width: '50%', height: '70px', verticalAlign: 'top' }}>
                مهر و امضا خریدار :
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* پاصفحه */}
      {settings.printFooterText && (
        <div className="text-center mt-2 opacity-60" style={{ fontSize: isA5 ? '7px' : '8px' }}>
          {settings.printFooterText}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ۲. فاکتور ساده (غیررسمی)
   ═══════════════════════════════════════════════════════════════ */
const SimpleInvoice: React.FC<{ invoice: Invoice; contact?: Contact }> = ({ invoice, contact }) => {
  const { settings } = useSettings();
  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);

  const subtotal = roundRial(invoice.items.reduce((s, it) => s + roundRial(it.quantity * it.unitPrice), 0));
  const discount = roundRial((subtotal * invoice.discountPercent) / 100);
  const tax = roundRial(((subtotal - discount) * invoice.taxPercent) / 100);
  const total = subtotal - discount + tax + invoice.shippingCost;

  const docLabel = invoice.type === 'پیش‌فاکتور فروش' ? 'پیش‌فاکتور' : invoice.type === 'خرید' ? 'فاکتور خرید' : invoice.type === 'برگشت از فروش' ? 'برگشت از فروش' : 'فاکتور فروش';
  const accent = '#4f46e5';

  return (
    <div
      className="print-area bg-white text-slate-900 w-full max-w-[210mm] shadow-2xl rounded-lg p-8 md:p-10 space-y-6"
      style={{ minHeight: '297mm' }}
    >
      {/* سربرگ */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b-2" style={{ borderColor: accent }}>
        <div className="flex items-start gap-3">
          {settings.printLogo ? (
            <img src={settings.printLogo} alt="logo" className="w-14 h-14 object-contain rounded-xl" />
          ) : (
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg" style={{ background: accent }}>د</div>
          )}
          <div>
            <div className="text-lg font-bold">{settings.storeName || 'دیوان'}</div>
            {settings.storePhone && <div className="text-xs text-slate-500 mt-0.5" dir="ltr">{settings.storePhone}</div>}
            {settings.storeAddress && <div className="text-xs text-slate-500 mt-0.5 max-w-xs">{settings.storeAddress}</div>}
          </div>
        </div>
        <div className="text-left">
          <div className="inline-block px-4 py-1.5 text-white text-sm font-bold rounded-lg" style={{ background: accent }}>{docLabel}</div>
          <div className="mt-2 space-y-0.5 text-xs">
            <div className="flex justify-between gap-4"><span className="text-slate-500">شماره:</span><b className="font-mono">{f(Number(invoice.number.replace(/\D/g, '')) || 0)}</b></div>
            <div className="flex justify-between gap-4"><span className="text-slate-500">تاریخ:</span><b>{invoice.date}</b></div>
          </div>
        </div>
      </div>

      {settings.printHeaderText && (
        <div className="text-center text-sm text-slate-600">{settings.printHeaderText}</div>
      )}

      {/* مشتری */}
      <div className="p-4 bg-slate-50 rounded-lg border">
        <div className="text-[11px] text-slate-500 font-bold mb-1.5">مشخصات خریدار</div>
        <div className="text-sm font-bold">{invoice.contactName || '—'}</div>
        {contact?.mobile && <div className="text-xs text-slate-600 mt-0.5" dir="ltr">📞 {contact.mobile}</div>}
        {contact?.address && <div className="text-xs text-slate-600 mt-1">{contact.address}</div>}
      </div>

      {/* جدول اقلام */}
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="text-white" style={{ background: accent }}>
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
              <td className="p-2.5 text-left font-mono font-bold">{f(roundRial(it.quantity * it.unitPrice))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* جمع‌بندی */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-xs text-slate-600">
          {invoice.notes && (<><div className="font-bold text-slate-700 mb-1">یادداشت:</div><div>{invoice.notes}</div></>)}
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between"><span className="text-slate-500">جمع اقلام:</span><span className="font-mono font-bold">{f(subtotal)}</span></div>
          {settings.showDiscount && discount > 0 && (
            <div className="flex justify-between text-rose-600"><span>تخفیف ({f(invoice.discountPercent)}%):</span><span className="font-mono font-bold">-{f(discount)}</span></div>
          )}
          {settings.showTax && tax > 0 && (
            <div className="flex justify-between text-amber-600"><span>مالیات ({f(invoice.taxPercent)}%):</span><span className="font-mono font-bold">+{f(tax)}</span></div>
          )}
          {settings.showShipping && invoice.shippingCost > 0 && (
            <div className="flex justify-between text-sky-600"><span>هزینه ارسال:</span><span className="font-mono font-bold">+{f(invoice.shippingCost)}</span></div>
          )}
          <div className="border-t-2 pt-2 mt-2" style={{ borderColor: accent }}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">قابل پرداخت</span>
              <span className="text-lg font-bold font-mono" style={{ color: accent }}>{f(total)} <span className="text-[10px] opacity-60">{settings.currency}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* مهر و امضا */}
      {settings.showStamp && (
        <div className="pt-6 mt-6 border-t grid grid-cols-3 gap-4 text-center text-xs">
          <div><div className="text-slate-500 mb-8">مهر و امضای فروشنده</div><div className="border-t pt-1 text-slate-400">فروشنده</div></div>
          <div><div className="text-slate-500 mb-8">مهر و امضای خریدار</div><div className="border-t pt-1 text-slate-400">خریدار</div></div>
          <div className="flex items-end justify-center"><div className="text-[10px] text-slate-400">صادر شده توسط نرم‌افزار دیوان</div></div>
        </div>
      )}

      {settings.printFooterText && (
        <div className="text-center text-xs text-slate-500 pt-4">{settings.printFooterText}</div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ۳. رسید حرارتی
   ═══════════════════════════════════════════════════════════════ */
const ThermalReceipt: React.FC<{ invoice: Invoice; contact?: Contact }> = ({ invoice, contact }) => {
  const { settings } = useSettings();
  const f = (n: number) => formatNum(Math.round(n), settings.persianNumbers);
  const width = settings.printPaper === 'thermal58' ? '58mm' : '80mm';

  const subtotal = roundRial(invoice.items.reduce((s, it) => s + roundRial(it.quantity * it.unitPrice), 0));
  const discount = roundRial((subtotal * invoice.discountPercent) / 100);
  const tax = roundRial(((subtotal - discount) * invoice.taxPercent) / 100);
  const total = subtotal - discount + tax + invoice.shippingCost;

  return (
    <div className="print-area bg-white text-black p-3 font-mono" style={{ width, fontSize: '11px' }}>
      <div className="text-center mb-2">
        <div className="font-bold" style={{ fontSize: '14px' }}>{settings.storeName || 'فروشگاه'}</div>
        {settings.storePhone && <div style={{ fontSize: '10px' }}>{settings.storePhone}</div>}
        {settings.storeAddress && <div style={{ fontSize: '9px' }}>{settings.storeAddress}</div>}
      </div>
      <div className="border-t border-dashed border-black my-1" />
      <div className="flex justify-between" style={{ fontSize: '10px' }}>
        <span>شماره: {f(Number(invoice.number.replace(/\D/g, '')) || 0)}</span>
        <span>{invoice.date}</span>
      </div>
      {contact?.mobile && <div style={{ fontSize: '10px' }}>مشتری: {contact.mobile}</div>}
      <div className="border-t border-dashed border-black my-1" />
      <div>{invoice.contactName}</div>
      <div className="border-t border-dashed border-black my-1" />
      {invoice.items.map((it, i) => (
        <div key={i} className="mb-1">
          <div className="font-bold">{it.productName}</div>
          <div className="flex justify-between" style={{ fontSize: '10px' }}>
            <span>{f(it.quantity)} × {f(it.unitPrice)}</span>
            <span className="font-bold">{f(roundRial(it.quantity * it.unitPrice))}</span>
          </div>
        </div>
      ))}
      <div className="border-t border-dashed border-black my-1" />
      <div className="flex justify-between"><span>جمع:</span><span>{f(subtotal)}</span></div>
      {discount > 0 && <div className="flex justify-between"><span>تخفیف:</span><span>-{f(discount)}</span></div>}
      {tax > 0 && <div className="flex justify-between"><span>مالیات:</span><span>+{f(tax)}</span></div>}
      <div className="border-t-2 border-black my-1" />
      <div className="flex justify-between font-bold" style={{ fontSize: '14px' }}>
        <span>قابل پرداخت:</span>
        <span>{f(total)}</span>
      </div>
      <div className="border-t border-dashed border-black my-1" />
      <div className="text-center" style={{ fontSize: '10px' }}>{settings.printFooterText}</div>
    </div>
  );
};

export default InvoicePrintPro;
