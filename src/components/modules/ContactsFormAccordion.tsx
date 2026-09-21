import React, { useState } from 'react';
import { User, Phone, MapPin, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import type { Contact } from '../../types/models';

interface Props {
  editing: Contact;
  setEditing: (c: Contact) => void;
}

const SECTIONS = [
  { id: 'basic', label: 'اطلاعات پایه', icon: User, defaultOpen: true },
  { id: 'contact', label: 'اطلاعات تماس', icon: Phone, defaultOpen: true },
  { id: 'address', label: 'آدرس', icon: MapPin, defaultOpen: false },
  { id: 'business', label: 'اطلاعات تجاری', icon: Briefcase, defaultOpen: false },
];

export const ContactsFormAccordion: React.FC<Props> = ({ editing, setEditing }) => {
  const [openSections, setOpenSections] = useState<string[]>(['basic', 'contact']);

  const toggle = (id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const update = (patch: Partial<Contact>) => {
    setEditing({ ...editing, ...patch });
  };

  return (
    <div className="space-y-2">
      {SECTIONS.map((section) => {
        const Icon = section.icon;
        const isOpen = openSections.includes(section.id);

        return (
          <div
            key={section.id}
            className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Header */}
            <button
              type="button"
              onClick={() => toggle(section.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-right transition-colors ${
                isOpen
                  ? 'bg-indigo-500/5 border-b border-slate-200 dark:border-slate-700'
                  : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isOpen ? 'bg-indigo-500/20 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="flex-1 text-xs font-bold">{section.label}</span>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 opacity-50" />
              ) : (
                <ChevronDown className="w-4 h-4 opacity-50" />
              )}
            </button>

            {/* Content */}
            {isOpen && (
              <div className="p-3 space-y-3 animate-fade-in">
                {section.id === 'basic' && (
                  <>
                    <Field label="نوع شخص">
                      <select
                        value={editing.type || 'حقیقی'}
                        onChange={(e) => update({ type: e.target.value as any })}
                        className="w-full p-2 border rounded-lg text-sm"
                      >
                        <option value="حقیقی">حقیقی</option>
                        <option value="حقوقی">حقوقی (شرکت)</option>
                      </select>
                    </Field>

                    {editing.type === 'حقوقی' ? (
                      <>
                        <Field label="نام شرکت">
                          <input
                            value={editing.companyName || ''}
                            onChange={(e) => update({ companyName: e.target.value })}
                            className="w-full p-2 border rounded-lg text-sm"
                          />
                        </Field>
                        <Field label="نام نماینده">
                          <input
                            value={editing.name}
                            onChange={(e) => update({ name: e.target.value })}
                            className="w-full p-2 border rounded-lg text-sm"
                          />
                        </Field>
                      </>
                    ) : (
                      <>
                        <Field label="نام" required>
                          <input
                            value={editing.name}
                            onChange={(e) => update({ name: e.target.value })}
                            className="w-full p-2 border rounded-lg text-sm"
                          />
                        </Field>
                        <Field label="نام خانوادگی">
                          <input
                            value={editing.lastName || ''}
                            onChange={(e) => update({ lastName: e.target.value })}
                            className="w-full p-2 border rounded-lg text-sm"
                          />
                        </Field>
                      </>
                    )}

                    <Field label="کد ملی">
                      <input
                        value={editing.nationalId || ''}
                        onChange={(e) => update({ nationalId: e.target.value })}
                        className="w-full p-2 border rounded-lg text-sm font-mono"
                        dir="ltr"
                        placeholder="۱۰ رقم"
                      />
                    </Field>
                  </>
                )}

                {section.id === 'contact' && (
                  <>
                    <Field label="موبایل" required>
                      <input
                        value={editing.mobile || ''}
                        onChange={(e) => update({ mobile: e.target.value })}
                        className="w-full p-2 border rounded-lg text-sm font-mono"
                        dir="ltr"
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      />
                    </Field>

                    <Field label="تلفن ثابت">
                      <input
                        value={editing.phone || ''}
                        onChange={(e) => update({ phone: e.target.value })}
                        className="w-full p-2 border rounded-lg text-sm font-mono"
                        dir="ltr"
                        placeholder="۰۲۱۱۲۳۴۵۶۷۸"
                      />
                    </Field>

                    <Field label="ایمیل">
                      <input
                        type="email"
                        value={editing.email || ''}
                        onChange={(e) => update({ email: e.target.value })}
                        className="w-full p-2 border rounded-lg text-sm font-mono"
                        dir="ltr"
                      />
                    </Field>
                  </>
                )}

                {section.id === 'address' && (
                  <>
                    <Field label="آدرس">
                      <textarea
                        value={editing.address || ''}
                        onChange={(e) => update({ address: e.target.value })}
                        className="w-full p-2 border rounded-lg text-sm"
                        rows={3}
                      />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="شهر">
                        <input
                          value={editing.city || ''}
                          onChange={(e) => update({ city: e.target.value })}
                          className="w-full p-2 border rounded-lg text-sm"
                        />
                      </Field>
                      <Field label="کد پستی">
                        <input
                          value={editing.postalCode || ''}
                          onChange={(e) => update({ postalCode: e.target.value })}
                          className="w-full p-2 border rounded-lg text-sm font-mono"
                          dir="ltr"
                        />
                      </Field>
                    </div>
                  </>
                )}

                {section.id === 'business' && (
                  <>
                    <Field label="کد اقتصادی">
                      <input
                        value={editing.economicCode || ''}
                        onChange={(e) => update({ economicCode: e.target.value })}
                        className="w-full p-2 border rounded-lg text-sm font-mono"
                        dir="ltr"
                      />
                    </Field>

                    <Field label="شماره ثبت">
                      <input
                        value={editing.registrationNumber || ''}
                        onChange={(e) => update({ registrationNumber: e.target.value })}
                        className="w-full p-2 border rounded-lg text-sm font-mono"
                        dir="ltr"
                      />
                    </Field>

                    <Field label="یادداشت">
                      <textarea
                        value={editing.notes || ''}
                        onChange={(e) => update({ notes: e.target.value })}
                        className="w-full p-2 border rounded-lg text-sm"
                        rows={2}
                      />
                    </Field>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({
  label,
  required,
  children,
}) => (
  <label className="block">
    <span className="text-xs font-bold block mb-1.5">
      {label}
      {required && <span className="text-rose-500 mr-1">*</span>}
    </span>
    {children}
  </label>
);

export default ContactsFormAccordion;
