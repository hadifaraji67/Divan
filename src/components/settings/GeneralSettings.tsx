import React, { useState } from 'react';
import { Palette, Hash, RotateCcw, Check, Info, DollarSign } from 'lucide-react';
import { useSettings, type Theme, type FontSize } from '../../lib/theme-context';
import { notify } from '../../lib/toast';
import { APP_VERSION } from '../../lib/update-service';

const ACCENTS = [
  { key: 'indigo', color: '#6366f1', label: 'بنفش' },
  { key: 'emerald', color: '#10b981', label: 'سبز' },
  { key: 'rose', color: '#f43f5e', label: 'قرمز' },
  { key: 'amber', color: '#f59e0b', label: 'طلایی' },
  { key: 'sky', color: '#0ea5e9', label: 'آبی' },
  { key: 'violet', color: '#8b5cf6', label: 'بنفش تیره' },
];

export const GeneralSettings: React.FC = () => {
  const { settings, update } = useSettings();
  const [saved, setSaved] = useState(false);
  const flash = () => { setSaved(true); notify.success('ذخیره شد'); setTimeout(() => setSaved(false), 1200); };

  return (
    <div className="max-w-3xl mx-auto space-y-4" dir="rtl">
      {saved && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg shadow-lg text-sm">
          <Check className="w-4 h-4" /> ذخیره شد
        </div>
      )}

      <Section icon={<Palette className="w-4 h-4" />} title="ظاهر و تم" color="indigo">
        <Row label="حالت نمایش" hint="روشن، تیره یا مطابق سیستم">
          <Segmented
            options={[{ v: 'light', t: 'روشن' }, { v: 'dark', t: 'تیره' }, { v: 'system', t: 'سیستم' }]}
            value={settings.theme}
            onChange={(v) => { update({ theme: v as Theme }); flash(); }}
          />
        </Row>
        <Row label="رنگ اصلی" hint="رنگ برند نرم‌افزار">
          <div className="flex gap-2 flex-wrap">
            {ACCENTS.map(a => (
              <button key={a.key} onClick={() => { update({ accentColor: a.key }); flash(); }}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${settings.accentColor === a.key ? 'border-slate-800 dark:border-white' : 'border-transparent'}`}
                style={{ background: a.color }} title={a.label} />
            ))}
          </div>
        </Row>
        <Row label="اندازه فونت">
          <Segmented
            options={[{ v: 'sm', t: 'کوچک' }, { v: 'md', t: 'متوسط' }, { v: 'lg', t: 'بزرگ' }]}
            value={settings.fontSize}
            onChange={(v) => { update({ fontSize: v as FontSize }); flash(); }}
          />
        </Row>
      </Section>

      <Section icon={<Hash className="w-4 h-4" />} title="نمایش و تجربه" color="indigo">
        <Row label="اعداد فارسی" hint="تبدیل خودکار اعداد به فارسی">
          <Toggle checked={settings.persianNumbers} onChange={(v) => { update({ persianNumbers: v }); flash(); }} />
        </Row>
        <Row label="انیمیشن‌ها">
          <Toggle checked={settings.animationsEnabled} onChange={(v) => { update({ animationsEnabled: v }); flash(); }} />
        </Row>
        <Row label="حالت فشرده" hint="نمایش متراکم‌تر">
          <Toggle checked={settings.compactMode} onChange={(v) => { update({ compactMode: v }); flash(); }} />
        </Row>
      </Section>

      <Section icon={<DollarSign className="w-4 h-4" />} title="واحد پول" color="indigo">
        <Row label="واحد پول" hint="در همه مبالغ نمایش داده می‌شود">
          <Segmented
            options={[{ v: 'ریال', t: 'ریال' }, { v: 'تومان', t: 'تومان' }]}
            value={settings.currency}
            onChange={(v) => { update({ currency: v as 'ریال' | 'تومان' }); flash(); }}
          />
        </Row>
      </Section>

      <Section icon={<Info className="w-4 h-4" />} title="درباره" color="indigo">
        <div className="text-xs space-y-2">
          <div className="flex justify-between"><span className="opacity-60">نام نرم‌افزار</span><b>دیوان</b></div>
          <div className="flex justify-between"><span className="opacity-60">نسخه</span><b>{APP_VERSION}</b></div>
          <div className="flex justify-between"><span className="opacity-60">سامانه</span><b>حسابداری و مدیریت کسب‌وکار</b></div>
        </div>
      </Section>

      <div className="flex justify-end">
        <button onClick={() => {
          if (confirm('تنظیمات ظاهری به حالت اولیه برگردد؟')) {
            update({ theme: 'light', fontSize: 'md', persianNumbers: true, currency: 'ریال', accentColor: 'indigo', animationsEnabled: true, compactMode: false });
            notify.success('بازنشانی شد');
          }
        }} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg">
          <RotateCcw className="w-4 h-4" /> بازنشانی ظاهر
        </button>
      </div>
    </div>
  );
};

/* ===== اجزای کمکی ===== */
const Section: React.FC<{ icon: React.ReactNode; title: string; color?: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="rounded-2xl border bg-white dark:bg-slate-900/50 overflow-hidden" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
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
  <button type="button" onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
    <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all" style={{ right: checked ? '2px' : '22px' }} />
  </button>
);

const Segmented: React.FC<{ options: { v: string; t: string }[]; value: string; onChange: (v: string) => void }> = ({ options, value, onChange }) => (
  <div className="flex gap-1.5 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
    {options.map(o => (
      <button key={o.v} onClick={() => onChange(o.v)}
        className={`px-3 py-1.5 text-xs rounded-md transition-all ${value === o.v ? 'bg-white dark:bg-slate-700 shadow font-bold' : 'opacity-70'}`}>
        {o.t}
      </button>
    ))}
  </div>
);

export default GeneralSettings;
