import React, { useState } from 'react';
import {
  Printer, FileText, Image, Palette, Stamp, QrCode,
  Eye, Save, RotateCcw, Upload, X, Check,
  Layers, Type, AlignRight, ListChecks,
} from 'lucide-react';
import { useSettings, type PrintPaper, type PrintMode } from '../lib/theme-context';
import { notify } from '../lib/toast';

const ACCENTS = [
  { key: 'slate', color: '#0f172a', label: 'مشکی' },
  { key: 'indigo', color: '#4f46e5', label: 'بنفش' },
  { key: 'emerald', color: '#10b981', label: 'سبز' },
  { key: 'rose', color: '#e11d48', label: 'قرمز' },
  { key: 'amber', color: '#f59e0b', label: 'طلایی' },
  { key: 'sky', color: '#0284c7', label: 'آبی' },
];

const PAPERS: { key: PrintPaper; label: string; desc: string; icon: React.ElementType }[] = [
  { key: 'A4', label: 'A4', desc: '۲۱۰ × ۲۹۷ mm', icon: FileText },
  { key: 'A5', label: 'A5', desc: '۱۴۸ × ۲۱۰ mm', icon: FileText },
  { key: 'thermal80', label: 'حرارتی ۸۰mm', desc: 'رسید فروشگاهی', icon: Printer },
  { key: 'thermal58', label: 'حرارتی ۵۸mm', desc: 'رسید کوچک', icon: Printer },
];

export const PrintSettings: React.FC = () => {
  const { settings, update } = useSettings();
  const [saved, setSaved] = useState(false);

  const flash = () => {
    setSaved(true);
    notify.success('تنظیمات چاپ ذخیره شد');
    setTimeout(() => setSaved(false), 1500);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      notify.error('حجم لوگو باید کمتر از ۵۰۰ کیلوبایت باشد');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      update({ printLogo: reader.result as string });
      notify.success('لوگو بارگذاری شد');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4" dir="rtl">

      {saved && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg shadow-lg text-sm animate-[fadeIn_0.2s_ease-out]">
          <Check className="w-4 h-4" /> ذخیره شد
        </div>
      )}

      {/* اندازه کاغذ */}
      <Section icon={FileText} title="اندازه کاغذ">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PAPERS.map(p => {
            const Icon = p.icon;
            const active = settings.printPaper === p.key;
            return (
              <button
                key={p.key}
                onClick={() => { update({ printPaper: p.key }); flash(); }}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  active
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
              >
                <Icon className={`w-5 h-5 mx-auto mb-1.5 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <div className={`text-sm font-bold ${active ? 'text-indigo-700 dark:text-indigo-400' : ''}`}>{p.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* نوع فاکتور */}
      <Section icon={Layers} title="نوع فاکتور">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { update({ printMode: 'formal' }); flash(); }}
            className={`p-3 rounded-xl border-2 text-right transition-all ${
              settings.printMode === 'formal'
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="font-bold text-sm mb-1">📋 رسمی</div>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              با کد اقتصادی، شناسه مالیاتی، مهر و امضا — مناسب دارایی
            </div>
          </button>
          <button
            onClick={() => { update({ printMode: 'informal' }); flash(); }}
            className={`p-3 rounded-xl border-2 text-right transition-all ${
              settings.printMode === 'informal'
                ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="font-bold text-sm mb-1">📄 غیررسمی</div>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              بدون مهر و کد اقتصادی — مناسب مشتری عادی
            </div>
          </button>
        </div>
      </Section>

      {/* رنگ فاکتور */}
      <Section icon={Palette} title="رنگ اصلی فاکتور">
        <div className="flex flex-wrap gap-2">
          {ACCENTS.map(a => (
            <button
              key={a.key}
              onClick={() => { update({ printAccentColor: a.key }); flash(); }}
              className={`relative w-12 h-12 rounded-xl border-2 transition-transform hover:scale-105 ${
                settings.printAccentColor === a.key
                  ? 'border-slate-800 dark:border-white ring-2 ring-offset-2 ring-offset-transparent'
                  : 'border-transparent'
              }`}
              style={{ background: a.color }}
              title={a.label}
            >
              {settings.printAccentColor === a.key && (
                <Check className="absolute inset-0 m-auto w-5 h-5 text-white" />
              )}
            </button>
          ))}
        </div>
      </Section>

      {/* لوگو */}
      <Section icon={Image} title="لوگو فروشگاه">
        <div className="flex flex-wrap items-center gap-4">
          {settings.printLogo ? (
            <div className="relative">
              <img
                src={settings.printLogo}
                alt="لوگو"
                className="w-24 h-24 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-white p-2"
              />
              <button
                onClick={() => update({ printLogo: undefined })}
                className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors">
              <Upload className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-[10px] text-slate-500">آپلود</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          )}
          <div className="flex-1 text-xs text-slate-500 leading-relaxed">
            تصویر لوگو در سربرگ فاکتور نمایش داده می‌شود.
            <br />
            فرمت PNG یا JPG، حداکثر ۵۰۰ کیلوبایت.
          </div>
        </div>
      </Section>

      {/* متن‌های فاکتور */}
      <Section icon={Type} title="متن‌های فاکتور">
        <Field label="متن سربرگ (بالای فاکتور)">
          <input
            value={settings.printHeaderText}
            onChange={(e) => update({ printHeaderText: e.target.value })}
            onBlur={flash}
            placeholder="مثلاً: فروشگاه لوازم خانگی"
            className="w-full p-2.5 border rounded-lg text-sm"
          />
        </Field>
        <Field label="متن پاصفحه (پایین فاکتور)">
          <input
            value={settings.printFooterText}
            onChange={(e) => update({ printFooterText: e.target.value })}
            onBlur={flash}
            placeholder="از خرید شما سپاسگزاریم"
            className="w-full p-2.5 border rounded-lg text-sm"
          />
        </Field>
      </Section>

      {/* نمایش عناصر */}
      <Section icon={ListChecks} title="نمایش عناصر در فاکتور">
        <Toggle label="مهر و امضا" desc="نمایش بخش مهر و امضا در پایین" checked={settings.showStamp} onChange={(v) => { update({ showStamp: v }); flash(); }} icon={Stamp} />
        <Toggle label="QR کد" desc="نمایش QR کد فاکتور (اختیاری)" checked={settings.showQR} onChange={(v) => { update({ showQR: v }); flash(); }} icon={QrCode} />
        <Toggle label="توضیحات کالا" desc="نمایش توضیحات هر کالا زیر نام آن" checked={settings.showItemDescription} onChange={(v) => { update({ showItemDescription: v }); flash(); }} icon={AlignRight} />
        <Toggle label="تخفیف" desc="نمایش ردیف تخفیف در جمع‌بندی" checked={settings.showDiscount} onChange={(v) => { update({ showDiscount: v }); flash(); }} icon={FileText} />
        <Toggle label="مالیات" desc="نمایش ردیف مالیات در جمع‌بندی" checked={settings.showTax} onChange={(v) => { update({ showTax: v }); flash(); }} icon={FileText} />
        <Toggle label="هزینه ارسال" desc="نمایش ردیف هزینه ارسال" checked={settings.showShipping} onChange={(v) => { update({ showShipping: v }); flash(); }} icon={FileText} />
      </Section>

      {/* پیش‌نمایش */}
      <Section icon={Eye} title="پیش‌نمایش زنده">
        <PrintPreview />
      </Section>

      {/* دکمه بازنشانی */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            if (confirm('تنظیمات چاپ به حالت اولیه برگردد؟')) {
              update({
                printPaper: 'A4',
                printMode: 'informal',
                printAccentColor: 'indigo',
                printLogo: undefined,
                printHeaderText: '',
                printFooterText: 'از خرید شما سپاسگزاریم',
                showStamp: true,
                showQR: true,
                showItemDescription: true,
                showDiscount: true,
                showTax: true,
                showShipping: true,
              });
              notify.success('بازنشانی شد');
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg"
        >
          <RotateCcw className="w-4 h-4" /> بازنشانی چاپ
        </button>
      </div>
    </div>
  );
};

/* ========== پیش‌نمایش ========== */
const PrintPreview: React.FC = () => {
  const { settings } = useSettings();
  const accent = ACCENTS.find(a => a.key === settings.printAccentColor)?.color || '#4f46e5';

  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
      <div className="bg-slate-100 dark:bg-slate-800 p-2 text-center text-[10px] text-slate-500">
        پیش‌نمایش {settings.printPaper} — {settings.printMode === 'formal' ? 'رسمی' : 'غیررسمی'}
      </div>
      <div className="p-4 bg-slate-200 dark:bg-slate-900 flex justify-center">
        <div
          className="bg-white text-slate-900 shadow-lg"
          style={{
            width: settings.printPaper === 'A5' ? '220px' : settings.printPaper.startsWith('thermal') ? '160px' : '300px',
            padding: settings.printPaper.startsWith('thermal') ? '12px' : '16px',
            fontSize: '9px',
            aspectRatio: settings.printPaper === 'A4' ? '210/297' : settings.printPaper === 'A5' ? '148/210' : undefined,
          }}
        >
          {/* سربرگ */}
          <div className="flex justify-between items-start pb-2 border-b-2 mb-2" style={{ borderColor: accent }}>
            <div className="flex items-center gap-2">
              {settings.printLogo ? (
                <img src={settings.printLogo} alt="logo" className="w-8 h-8 object-contain" />
              ) : (
                <div className="w-8 h-8 rounded flex items-center justify-center text-white font-bold" style={{ background: accent }}>
                  د
                </div>
              )}
              <div>
                <div className="font-bold" style={{ fontSize: '10px' }}>{settings.storeName || 'فروشگاه'}</div>
                {settings.storePhone && <div className="text-[8px] text-slate-500">{settings.storePhone}</div>}
              </div>
            </div>
            <div className="text-left">
              <div className="font-bold text-white px-2 py-0.5 rounded text-[8px]" style={{ background: accent }}>
                فاکتور فروش
              </div>
              <div className="text-[8px] mt-1">شماره: ۱۰۰۱</div>
              <div className="text-[8px]">تاریخ: ۱۴۰۵/۰۶/۲۳</div>
            </div>
          </div>

          {settings.printHeaderText && (
            <div className="text-center text-[8px] mb-2 text-slate-600">{settings.printHeaderText}</div>
          )}

          {/* مشتری */}
          <div className="text-[8px] mb-2 p-1.5 bg-slate-50 rounded">
            <b>مشتری:</b> علی محمدی
          </div>

          {/* جدول */}
          <table className="w-full text-[8px] mb-2" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: accent, color: 'white' }}>
                <th className="p-1 text-right">کالا</th>
                <th className="p-1">تعداد</th>
                <th className="p-1 text-left">قیمت</th>
                <th className="p-1 text-left">جمع</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td className="p-1">
                  کالای نمونه
                  {settings.showItemDescription && <div className="text-[6px] text-slate-400">توضیحات</div>}
                </td>
                <td className="p-1 text-center">۲</td>
                <td className="p-1 text-left">۸۰۰,۰۰۰</td>
                <td className="p-1 text-left font-bold">۱,۶۰۰,۰۰۰</td>
              </tr>
            </tbody>
          </table>

          {/* جمع‌بندی */}
          <div className="text-[8px] space-y-0.5">
            {settings.showDiscount && <div className="flex justify-between"><span>تخفیف:</span><span>۵٪</span></div>}
            {settings.showTax && <div className="flex justify-between"><span>مالیات:</span><span>۹٪</span></div>}
            {settings.showShipping && <div className="flex justify-between"><span>ارسال:</span><span>۵۰,۰۰۰</span></div>}
            <div className="flex justify-between pt-1 mt-1 border-t font-bold" style={{ borderColor: accent, color: accent }}>
              <span>قابل پرداخت:</span>
              <span>۱,۷۲۲,۰۰۰</span>
            </div>
          </div>

          {/* پاصفحه */}
          {settings.showStamp && (
            <div className="mt-3 pt-2 border-t grid grid-cols-2 gap-2 text-[7px] text-center text-slate-400">
              <div>مهر فروشنده</div>
              <div>امضای خریدار</div>
            </div>
          )}

          {settings.printFooterText && (
            <div className="text-center text-[7px] text-slate-500 mt-2">{settings.printFooterText}</div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========== اجزای کمکی ========== */
const Section: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
  <div className="rounded-2xl border bg-white dark:bg-slate-900/50 overflow-hidden" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
    <div className="flex items-center gap-2 px-4 py-3 border-b bg-black/[0.02] dark:bg-white/[0.02]" style={{ borderColor: 'inherit' }}>
      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-sm font-bold">{title}</h3>
    </div>
    <div className="p-4 space-y-3">{children}</div>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1 font-medium">{label}</span>
    {children}
  </label>
);

const Toggle: React.FC<{ label: string; desc: string; checked: boolean; onChange: (v: boolean) => void; icon?: React.ElementType }> = ({ label, desc, checked, onChange, icon: Icon }) => (
  <div className="flex items-center justify-between gap-3 py-1">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {Icon && <Icon className="w-4 h-4 text-slate-400 shrink-0" />}
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] opacity-50 mt-0.5">{desc}</div>
      </div>
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
    >
      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ right: checked ? '2px' : '22px' }} />
    </button>
  </div>
);

export default PrintSettings;
