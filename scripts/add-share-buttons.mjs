import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/print/InvoicePrintPro.tsx';

if (!existsSync(file)) {
  console.log('❌ فایل پیدا نشد:', file);
  process.exit(1);
}

let src = readFileSync(file, 'utf8');
const log = [];

// import
if (!src.includes('invoice-share')) {
  const patterns = [
    "import { notify } from '../../lib/toast';",
    "import { notify } from '@/lib/toast';",
  ];
  for (const p of patterns) {
    if (src.includes(p)) {
      src = src.replace(p, p + "\nimport { buildInvoiceText, shareInvoiceWhatsApp, shareInvoiceSMS, shareInvoiceGeneric } from '../../lib/invoice-share';\nimport { MessageCircle, Send, Share2 } from 'lucide-react';");
      log.push('✅ import');
      break;
    }
  }
}

// تابع handleShare
if (!src.includes('handleShareWhatsApp')) {
  const match = src.match(/(\n\s*return \(\s*<)/);
  if (match && match.index) {
    const insertion = `
  const handleShareWhatsApp = async () => {
    if (!invoice) return;
    const text = buildInvoiceText(invoice, contact, settings?.storeName);
    await shareInvoiceWhatsApp(text, contact?.phone);
  };

  const handleShareSMS = async () => {
    if (!invoice) return;
    const text = buildInvoiceText(invoice, contact, settings?.storeName);
    await shareInvoiceSMS(text, contact?.phone);
  };

  const handleShareGeneric = async () => {
    if (!invoice) return;
    const text = buildInvoiceText(invoice, contact, settings?.storeName);
    await shareInvoiceGeneric(text);
  };
`;
    src = src.slice(0, match.index) + insertion + src.slice(match.index);
    log.push('✅ handleShare*');
  }
}

// دکمه‌ها — قبل از «چاپ» یا قبل از «بستن»
if (!src.includes('handleShareWhatsApp}')) {
  // پیدا کردن دکمه چاپ یا آخرین دکمه
  const printMatch = src.match(/(<button[^>]*onClick={\s*(?:handlePrint|window\.print|print)\s*}[\s\S]{0,500}?<\/button>)/);
  const target = printMatch ? printMatch[1] : null;

  const shareButtons = `<div className="flex gap-2 flex-wrap">
              <button onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#25D366] hover:bg-[#1da851] text-white text-xs font-bold rounded-lg">
                <MessageCircle className="w-3.5 h-3.5" /> واتساپ
              </button>
              <button onClick={handleShareSMS}
                className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg">
                <Send className="w-3.5 h-3.5" /> پیامک
              </button>
              <button onClick={handleShareGeneric}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold rounded-lg">
                <Share2 className="w-3.5 h-3.5" /> اشتراک
              </button>
            </div>
            ${target || ''}`;

  if (target) {
    src = src.replace(target, shareButtons);
    log.push('✅ دکمه‌های اشتراک');
  } else {
    log.push('⚠️ دکمه چاپ پیدا نشد — باید دستی چک شود');
  }
}

writeFileSync(file, src);
console.log(log.join('\n'));
