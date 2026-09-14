import React, { useState } from 'react';
import {
  Palette, Type, Hash, DollarSign, Store, Save, RotateCcw,
  Sparkles, Layout, Phone, MapPin, Percent, Info, Check,
} from 'lucide-react';
import { useSettings, type Theme, type FontSize } from '../lib/theme-context';
import { APP_VERSION } from '../lib/update-service';

const ACCENTS = [
  { key: 'indigo', color: '#6366f1', label: 'بنفش' },
  { key: 'emerald', color: '#10b981', label: 'سبز' },
  { key: 'rose', color: '#f43f5e', label: 'قرمز' },
  { key: 'amber', color: '#f59e0b', label: 'طلایی' },
  { key: 'sky', color: '#0ea5e9', label: 'آبی' },
  { key: 'violet', color: '#8b5cf6', label: 'بنفش تیره' },
];

export const SettingsModule: React.FC = () => {
  const { settings, update, reset } = useSettings();
  const [saved, setSaved] = useState(false);

  const flash = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5" dir="rtl">
      {saved && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg shadow-lg text-sm animate-[fadeIn_0.2s_ease-out]">
          <Check className="w-4 h-4" /> ذخیره شد
        </div>
      )}

      {/* ظاهر */}
      <Section icon={<Palette className="w-4 h-4" />} title="ظاهر و تم">
        <Row label="حالت نمایش" hint="روشن، تیره یا مطابق سیستم">
          <div className="flex gap-1.5 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
            {([
              { v: 'light', t: 'روشن' },
              { v: 'dark', t: 'تیره' },
              { v: 'system', t: 'سیستم' },
            ] as const).map(o => (
              <button
                key={o.v}
                onClick={() => { update({ theme: o.v as Theme }); flash(); }}
                className={`px-3 py-1.5 text-xs rounded-md transition-all ${settings.theme === o.v ? 'bg-white dark:bg-slate-700 shadow font-bold' : 'opacity-70 hover:opacity-100'}`}
              >
                {o.t}
              </button>
            ))}
          </div>
        </Row>

        <Row label="رنگ اصلی" hint="رنگ برند نرم‌افزار">
          <div className="flex gap-2 flex-wrap">
            {ACCENTS.map(a => (
              <button
                key={a.key}
                onClick={() => { update({ accentColor: a.key }); flash(); }}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${settings.accentColor === a.key ? 'border-slate-800 dark:border-white ring-2 ring-offset-2 ring-offset-transparent' : 'border-transparent'}`}
                style={{ background: a.color }}
                title={a.label}
              />
            ))}
          </div>
        </Row>

        <Row label="اندازه فونت">
          <div className="flex gap-1.5 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
            {([
              { v: 'sm', t: 'کوچک' },
              { v: 'md', t: 'متوسط' },
              { v: 'lg', t: 'بزرگ' },
            ] as const).map(o => (
              <button
                key={o.v}
                onClick={() => { update({ fontSize: o.v as FontSize }); flash(); }}
                className={`px-3 py-1.5 text-xs rounded-md transition-all ${settings.fontSize === o.v ? 'bg-white dark:bg-slate-700 shadow font-bold' : 'opacity-70'}`}
              >
                {o.t}
              </button>
            ))}
          </div>
        </Row>

        <Row label="اعداد فارسی" hint="تبدیل خودکار اعداد به فارسی">
          <Toggle checked={settings.persianNumbers} onChange={(v) => { update({ persianNumbers: v }); flash(); }} />
        </Row>

        <Row label="انیمیشن‌ها" hint="جلوه‌های حرکتی رابط کاربری">
          <Toggle checked={settings.animationsEnabled} onChange={(v) => { update({ animationsEnabled: v }); flash(); }} />
        </Row>

        <Row label="حالت فشرده" hint="نمایش متراکم‌تر با فاصله کمتر">
          <Toggle checked={settings.compactMode} onChange={(v) => { update({ compactMode: v }); flash(); }} />
        </Row>
      </Section>

      {/* واحد پول */}
      <Section icon={<DollarSign className="w-4 h-4" />} title="پول و مالیات">
        <Row label="واحد پول">
          <div className="flex gap-1.5 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
            {(['ریال', 'تومان'] as const).map(c => (
              <button
                key={c}
                onClick={() => { update({ currency: c }); flash(); }}
                className={`px-3 py-1.5 text-xs rounded-md transition-all ${settings.currency === c ? 'bg-white dark:bg-slate-700 shadow font-bold' : 'opacity-70'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </Row>

        <Row label="درصد مالیات پیش‌فرض">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={settings.defaultTaxPercent}
              onChange={(e) => update({ defaultTaxPercent: Number(e.target.value) })}
              onBlur={flash}
              className="w-20 p-2 border rounded-lg text-sm text-center"
            />
            <Percent className="w-4 h-4 opacity-50" />
          </div>
        </Row>
      </Section>

      {/* اطلاعات فروشگاه */}
      <Section icon={<Store className="w-4 h-4" />} title="اطلاعات کسب‌وکار">
        <Row label="نام فروشگاه">
          <TextInput
            value={settings.storeName}
            onChange={(v) => update({ storeName: v })}
            onBlur={flash}
            icon={<Store className="w-3.5 h-3.5" />}
            placeholder="فروشگاه من"
          />
        </Row>
        <Row label="تلفن">
          <TextInput
            value={settings.storePhone}
            onChange={(v) => update({ storePhone: v })}
            onBlur={flash}
            icon={<Phone className="w-3.5 h-3.5" />}
            placeholder="۰۲۱-۱۲۳۴۵۶۷۸"
            ltr
          />
        </Row>
        <Row label="کد اقتصادی">
          <TextInput
            value={settings.storeEconomicCode}
            onChange={(v) => update({ storeEconomicCode: v })}
            onBlur={flash}
            icon={<Hash className="w-3.5 h-3.5" />}
            placeholder="۴۱۱۲۳۴۵۶۷۸۹"
            ltr
          />
        </Row>
        <Row label="آدرس">
          <TextInput
            value={settings.storeAddress}
            onChange={(v) => update({ storeAddress: v })}
            onBlur={flash}
            icon={<MapPin className="w-3.5 h-3.5" />}
            placeholder="تهران، خیابان..."
          />
        </Row>
      </Section>

      {/* درباره */}
      <Section icon={<Info className="w-4 h-4" />} title="درباره">
        <div className="text-xs space-y-1.5 leading-relaxed">
          <div className="flex justify-between"><span className="opacity-60">نام نرم‌افزار</span><b>دیوان</b></div>
          <div className="flex justify-between"><span className="opacity-60">نسخه</span><b>{APP_VERSION}</b></div>
          <div className="flex justify-between"><span className="opacity-60">سامانه</span><b>حسابداری و مدیریت کسب‌وکار</b></div>
        </div>
      </Section>

      {/* دکمه‌ها */}
      <div className="flex flex-wrap gap-3 justify-end">
        <button
          onClick={() => { if (confirm('همه تنظیمات به حالت اولیه برمی‌گردد. مطمئنی؟')) { reset(); flash(); } }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> بازنشانی
        </button>
        <button
          onClick={flash}
          className="flex items-center gap-2 px-5 py-2.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-colors"
        >
          <Save className="w-4 h-4" /> ذخیره
        </button>
      </div>

      <p className="text-center text-[11px] opacity-40 pt-2">
        تغییرات به‌صورت خودکار در مرورگر ذخیره می‌شوند
      </p>
    </div>
  );
};

/* ========== اجزای کمکی ========== */

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
    <div className="flex items-center gap-2 px-4 py-3 border-b bg-black/[0.02] dark:bg-white/[0.02]" style={{ borderColor: 'inherit' }}>
      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">{icon}</div>
      <h3 className="text-sm font-bold">{title}</h3>
    </div>
    <div className="p-4 space-y-4">{children}</div>
  </div>
);

const Row: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="min-w-0">
      <div className="text-sm font-medium">{label}</div>
      {hint && <div className="text-[11px] opacity-50 mt-0.5">{hint}</div>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
  >
    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? 'right-0.5' : 'right-5.5'}`} style={{ right: checked ? '2px' : '22px' }} />
  </button>
);

const TextInput: React.FC<{
  value: string; onChange: (v: string) => void; onBlur?: () => void;
  icon?: React.ReactNode; placeholder?: string; ltr?: boolean;
}> = ({ value, onChange, onBlur, icon, placeholder, ltr }) => (
  <div className="relative">
    {icon && <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50">{icon}</div>}
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      dir={ltr ? 'ltr' : 'rtl'}
      className={`w-full min-w-[180px] py-2 border rounded-lg text-sm ${icon ? 'pr-9 pl-3' : 'px-3'}`}
    />
  </div>
);

export default SettingsModule;
