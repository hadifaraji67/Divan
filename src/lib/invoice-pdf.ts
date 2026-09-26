/**
 * ساخت PDF واقعی از فاکتور (برای ایمیل/اشتراک‌گذاری فایل)
 * از همون عنصر DOM رندرشده در پیش‌نمایش چاپ (.print-area) استفاده می‌کند
 */
import { notify } from './toast';
import type { Invoice } from '../types/models';

/**
 * تبدیل یک عنصر DOM (پیش‌نمایش فاکتور) به فایل PDF
 */
export async function generateInvoicePdfBlob(element: HTMLElement): Promise<Blob | null> {
  try {
    const [html2canvasModule, jsPDFModule] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);
    const html2canvas = html2canvasModule.default;
    const { jsPDF } = jsPDFModule;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png', 0.95);

    // تبدیل پیکسل (با احتساب scale:2 بالا) به میلی‌متر برای اندازه‌ی واقعی PDF
    const pxToMm = (px: number) => (px * 25.4) / (96 * 2);
    const widthMm = pxToMm(canvas.width);
    const heightMm = pxToMm(canvas.height);

    const pdf = new jsPDF({
      orientation: widthMm > heightMm ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [widthMm, heightMm],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, widthMm, heightMm);
    return pdf.output('blob');
  } catch (err) {
    console.error('[invoice-pdf] generate error:', err);
    return null;
  }
}

export function invoicePdfFileName(invoice: Invoice): string {
  const safeNumber = String(invoice.number || 'invoice').replace(/[^\w\u0600-\u06FF-]/g, '_');
  return `invoice-${safeNumber}-${Date.now()}.pdf`;
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * ارسال فاکتور به‌صورت PDF از طریق ایمیل
 * - در مرورگرها/اپ‌هایی که Web Share از فایل پشتیبانی می‌کند: شیت اشتراک‌گذاری باز می‌شود
 *   و کاربر جیمیل/آوت‌لوک/هر اپ ایمیل نصب‌شده را انتخاب می‌کند (فایل پیوست می‌شود)
 * - در غیر این صورت: PDF دانلود می‌شود و یک ایمیل با متن آماده باز می‌شود
 *   (پیوست باید دستی توسط کاربر اضافه شود — mailto امکان پیوست خودکار ندارد)
 */
export async function emailInvoicePdf(
  element: HTMLElement,
  invoice: Invoice,
  emailTo?: string,
  bodyText?: string,
): Promise<boolean> {
  const blob = await generateInvoicePdfBlob(element);
  if (!blob) {
    notify.error('ساخت PDF ناموفق بود');
    return false;
  }

  const fileName = invoicePdfFileName(invoice);
  const file = new File([blob], fileName, { type: 'application/pdf' });
  const shareText = bodyText || `فاکتور ${invoice.type} شماره ${invoice.number}`;

  if (typeof navigator !== 'undefined' && (navigator as any).canShare?.({ files: [file] })) {
    try {
      await (navigator as any).share({
        files: [file],
        title: `فاکتور ${invoice.number}`,
        text: shareText,
      });
      return true;
    } catch (err: any) {
      if (err?.name === 'AbortError') return false;
      // اگر اشتراک با فایل شکست خورد، به مسیر دانلود+mailto زیر ادامه بده
    }
  }

  downloadBlob(blob, fileName);

  const subject = encodeURIComponent(`فاکتور ${invoice.number}`);
  const body = encodeURIComponent(
    `${shareText}\n\nفایل PDF فاکتور دانلود شد — لطفاً آن را از پوشه دانلود به این ایمیل پیوست کنید.`
  );
  window.location.href = `mailto:${emailTo || ''}?subject=${subject}&body=${body}`;

  notify.info('PDF دانلود شد — به ایمیل باز شده پیوست کنید');
  return true;
}
