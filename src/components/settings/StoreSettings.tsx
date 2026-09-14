import React, { useState } from 'react';
import { Store, MapPin, Percent, Check, Building2 } from 'lucide-react';
import { useSettings } from '../../lib/theme-context';
import { notify } from '../../lib/toast';

export const StoreSettings: React.FC = () => {
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

      <Section icon={<Building2 className="w-4 h-4" />} title="اطلاعات قانونی" color="emerald">
        <Row label="نام قانونی (رسمی)" hint="برای فاکتور رسمی مالیاتی">
          <TextInput value={settings.storeLegalName || ''} onChange={(v) => update({ storeLegalName: v })} onBlur={flash} placeholder="شرکت نمونه" />
        </Row>
        <Row label="نام فروشگاه" hint="نام تجاری">
          <TextInput value={settings.storeName} onChange={(v) => update({ storeName: v })} onBlur={flash} placeholder="فروشگاه من" />
        </Row>
        <Row label="شماره اقتصادی">
          <TextInput value={settings.storeEconomicCode} onChange={(v) => update({ storeEconomicCode: v })} onBlur={flash} placeholder="۴۱۱۲۳۴۵۶۷۸۹" ltr />
        </Row>
        <Row label="شناسه (کد) ملی">
          <TextInput value={settings.storeNationalId || ''} onChange={(v) => update({ storeNationalId: v })} onBlur={flash} placeholder="۱۰ رقمی" ltr />
        </Row>
        <Row label="شماره ثبت">
          <TextInput value={settings.storeRegistrationNumber || ''} onChange={(v) => update({ storeRegistrationNumber: v })} onBlur={flash} placeholder="۱۲۳۴۵" ltr />
        </Row>
      </Section>

      <Section icon={<MapPin className="w-4 h-4" />} title="تماس و آدرس" color="emerald">
        <Row label="تلفن">
          <TextInput value={settings.storePhone} onChange={(v) => update({ storePhone: v })} onBlur={flash} placeholder="۰۲۱-۱۲۳۴۵۶۷۸" ltr />
        </Row>
        <Row label="فکس">
          <TextInput value={settings.storeFax || ''} onChange={(v) => update({ storeFax: v })} onBlur={flash} placeholder="۰۲۱-۱۲۳۴۵۶۷۸" ltr />
        </Row>
        <Row label="کد پستی ۱۰ رقمی">
          <TextInput value={settings.storePostalCode || ''} onChange={(v) => update({ storePostalCode: v })} onBlur={flash} placeholder="۱۲۳۴۵۶۷۸۹۰" ltr />
        </Row>
        <Row label="آدرس">
          <TextInput value={settings.storeAddress} onChange={(v) => update({ storeAddress: v })} onBlur={flash} placeholder="تهران، خیابان..." />
        </Row>
      </Section>

      <Section icon={<Percent className="w-4 h-4" />} title="مالیات" color="emerald">
        <Row label="درصد مالیات پیش‌فرض" hint="روی فاکتورهای جدید اعمال می‌شود">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={settings.defaultTaxPercent}
              onChange={(e) => update({ defaultTaxPercent: Number(e.target.value) })}
              onBlur={flash}
              className="w-24 p-2.5 border rounded-lg text-sm text-center"
              dir="ltr"
            />
            <Percent className="w-4 h-4 opacity-50" />
          </div>
        </Row>
      </Section>
    </div>
  );
};

const Section: React.FC<{ icon: React.ReactNode; title: string; color?: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="rounded-2xl border bg-white dark:bg-slate-900/50 overflow-hidden" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
    <div className="flex items-center gap-2 px-4 py-3 border-b bg-black/[0.02] dark:bg-white/[0.02]" style={{ borderColor: 'inherit' }}>
      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">{icon}</div>
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
    <div className="shrink-0 w-full md:w-auto">{children}</div>
  </div>
);

const TextInput: React.FC<{ value: string; onChange: (v: string) => void; onBlur?: () => void; placeholder?: string; ltr?: boolean }> = ({ value, onChange, onBlur, placeholder, ltr }) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onBlur={onBlur}
    placeholder={placeholder}
    dir={ltr ? 'ltr' : 'rtl'}
    className="w-full md:w-64 py-2 px-3 border rounded-lg text-sm"
  />
);

export default StoreSettings;
