import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, FileText, RefreshCw } from 'lucide-react';
import { BarcodeScanner } from '../shared/BarcodeScanner';
import {
  parseInvoiceQRText,
  verifyInvoiceQR,
  type VerifyResult,
} from '../../lib/invoice-qr';
import { loadData } from '../../lib/storage';
import type { Invoice } from '../../types/models';
import { invoiceTotal } from '../../types/models';

interface Props {
  onClose: () => void;
}

export const InvoiceQRScanner: React.FC<Props> = ({ onClose }) => {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const handleDetected = (code: string) => {
    setScanning(false);

    // ۱. Parse QR
    const payload = parseInvoiceQRText(code);
    if (!payload) {
      setResult({
        valid: false,
        status: 'invalid-qr',
        message: 'این QR مربوط به فاکتور دیوان نیست',
      });
      return;
    }

    // ۲. پیدا کردن فاکتور در localStorage
    const invoices = loadData<Invoice[]>('invoices', []);
    const localInvoice = invoices.find((i) => i.id === payload.i) || null;

    // ۳. تأیید
    const verifyResult = verifyInvoiceQR(payload, localInvoice);
    setResult(verifyResult);
  };

  const handleRescan = () => {
    setScanning(true);
    setResult(null);
  };

  // ─── حالت اسکن ───
  if (scanning) {
    return (
      <BarcodeScanner
        onDetected={handleDetected}
        onClose={onClose}
      />
    );
  }

  // ─── حالت نتیجه ───
  const config = {
    verified: {
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-600',
      bg: 'from-emerald-500/10 to-teal-500/10',
      border: 'border-emerald-500/30',
      title: 'فاکتور معتبر است',
      subtitle: 'اطلاعات با نسخه اصلی مطابقت دارد',
    },
    tampered: {
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-600',
      bg: 'from-amber-500/10 to-orange-500/10',
      border: 'border-amber-500/30',
      title: 'فاکتور دستکاری شده!',
      subtitle: 'اطلاعات فاکتور تغییر کرده است',
    },
    'not-found': {
      icon: XCircle,
      color: 'from-rose-500 to-pink-600',
      bg: 'from-rose-500/10 to-pink-500/10',
      border: 'border-rose-500/30',
      title: 'فاکتور پیدا نشد',
      subtitle: 'این فاکتور در سیستم شما ثبت نشده',
    },
    'invalid-qr': {
      icon: XCircle,
      color: 'from-slate-500 to-slate-600',
      bg: 'from-slate-500/10 to-slate-500/10',
      border: 'border-slate-500/30',
      title: 'QR نامعتبر',
      subtitle: 'این QR مربوط به سیستم دیوان نیست',
    },
  };

  const c = result ? config[result.status] : config['invalid-qr'];
  const Icon = c.icon;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
          <div className="font-bold text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            تأیید فاکتور
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Result */}
        <div className={`p-6 text-center bg-gradient-to-br ${c.bg}`}>
          <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-xl mb-4`}>
            <Icon className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-lg font-bold mb-1">{c.title}</h2>
          <p className="text-xs opacity-70 mb-4">{result?.message || c.subtitle}</p>

          {/* Invoice Details */}
          {result?.invoice && (
            <div className="bg-white/60 dark:bg-slate-900/60 rounded-xl p-4 text-right space-y-2 mb-4">
              <DetailRow label="شماره" value={result.invoice.number || '—'} />
              <DetailRow label="تاریخ" value={result.invoice.date || '—'} />
              <DetailRow label="مشتری" value={result.invoice.contactName || '—'} />
              <DetailRow
                label="مبلغ"
                value={`${invoiceTotal(
                  result.invoice.items || [],
                  result.invoice.discountPercent || 0,
                  result.invoice.taxPercent || 0,
                  result.invoice.shippingCost || 0
                ).toLocaleString('fa-IR')} ریال`}
              />
              <DetailRow label="نوع" value={result.invoice.type || '—'} />
            </div>
          )}

          {/* Hash Info (اگر tampered) */}
          {result?.status === 'tampered' && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-700 dark:text-rose-400 leading-relaxed mb-4">
              ⚠️ اطلاعات فاکتور بعد از صدور تغییر کرده است.
              ممکن است فاکتور جعلی باشد.
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleRescan}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
              اسکن مجدد
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="opacity-60">{label}</span>
    <span className="font-bold">{value}</span>
  </div>
);

export default InvoiceQRScanner;
