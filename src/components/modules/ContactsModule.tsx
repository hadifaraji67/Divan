import React, { useState, useEffect, useMemo } from 'react';
import { Building2, Edit, MapPin, Phone, Plus, Search, Trash2, User, Users, X } from 'lucide-react';
import type { Contact } from '../../types/models';
import { loadData, saveData, genId } from '../../lib/storage';
import { notify } from '../../lib/toast';
import { EmptyState } from '../shared/EmptyState';
import { RBACGate } from '../shared/RBACGate';
import { ContactsFormAccordion } from './ContactsFormAccordion';
import { validateMobile, validatePhone, validateEmail, validateNationalId, validatePostalCode } from '../../lib/validation';
import { useUndoableDelete } from '../../lib/use-undoable-delete';
import { CONTACT_COLUMNS } from '../../lib/import';
import { LocationSelector } from '../shared/LocationSelector';
import { computeContactBalance } from '../../lib/invoice-payment';
import type { Invoice, Payment } from '../../types/models';

const emptyContact = (): Contact => ({
  id: '', code: '', type: 'حقیقی', name: '', lastName: '', companyName: '',
  nationalId: '', mobile: '', phone: '', email: '', address: '',
  province: '', county: '', city: '', postalCode: '',
  economicCode: '', website: '', birthDate: '',
  roles: ['مشتری'], creditLimit: 0, notes: '', createdAt: '',
});

export const ContactsModule: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Contact>(emptyContact());

  useEffect(() => {
    setContacts(loadData<Contact[]>('contacts', []));
    setInvoices(loadData<Invoice[]>('invoices', []));
    setPayments(loadData<Payment[]>('payments', []));
  }, []);

  useEffect(() => {
    saveData('contacts', contacts);
  }, [contacts]);

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.trim();
    return contacts.filter(c =>
      c.name.includes(q) || c.lastName?.includes(q) || c.companyName?.includes(q) ||
      c.mobile.includes(q) || c.nationalId.includes(q) || c.code.includes(q)
    );
  }, [contacts, search]);

  const balanceMap = useMemo(() => {
    const map: Record<string, { receivable: number; payable: number; net: number }> = {};
    for (const ct of contacts) {
      map[ct.id] = computeContactBalance(ct.id, invoices, payments);
    }
    return map;
  }, [contacts, invoices, payments]);

  const openNew = () => {
    const c = emptyContact();
    c.id = genId();
    c.code = `C-${(contacts.length + 1).toString().padStart(4, '0')}`;
    c.createdAt = new Date().toISOString();
    setEditing(c);
    setShowForm(true);
  };

  const openEdit = (c: Contact) => {
    setEditing({ ...c });
    setShowForm(true);
  };

  const handleSave = () => {
    // ─── اعتبارسنجی ───
    if (!editing.name?.trim()) {
      notify.warning('نام الزامی است');
      return;
    }

    const mobileCheck = validateMobile(editing.mobile || '');
    if (!mobileCheck.valid) {
      notify.warning(mobileCheck.error || 'موبایل نامعتبر');
      return;
    }

    const phoneCheck = validatePhone(editing.phone || '');
    if (!phoneCheck.valid) {
      notify.warning(phoneCheck.error || 'تلفن نامعتبر');
      return;
    }

    const emailCheck = validateEmail(editing.email || '');
    if (!emailCheck.valid) {
      notify.warning(emailCheck.error || 'ایمیل نامعتبر');
      return;
    }

    const nationalCheck = validateNationalId(editing.nationalId || '');
    if (!nationalCheck.valid) {
      notify.warning(nationalCheck.error || 'کد ملی نامعتبر');
      return;
    }

    // ─── نرمال‌سازی ───
    const normalized = {
      ...editing,
      mobile: mobileCheck.normalized || editing.mobile,
      phone: phoneCheck.normalized || editing.phone,
      email: emailCheck.normalized || editing.email,
    };

    setContacts(prev => {
      const exists = prev.find(c => c.id === normalized.id);
      return exists
        ? prev.map(c => c.id === normalized.id ? normalized : c)
        : [...prev, normalized];
    });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('آیا از حذف این شخص مطمئن هستید؟')) return;
    setContacts(prev => prev.filter(c => c.id !== id));
  };



  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو: نام، موبایل، کد ملی، کد..."
            className="w-full pr-10 pl-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
          <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg"
        >
          <Plus className="w-4 h-4" /> شخص جدید
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-3 bg-slate-50 border-b text-xs text-slate-600">
          مجموع: {contacts.length} شخص — نمایش: {filtered.length}
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            {contacts.length === 0 ? 'هنوز شخصی ثبت نشده — روی «شخص جدید» بزن' : 'چیزی پیدا نشد'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((c) => (
              <div key={c.id} className="p-4 hover:bg-slate-50 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    {c.type === 'حقوقی' ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-slate-800 truncate">
                      {c.type === 'حقوقی' ? c.companyName || c.name : `${c.name} ${c.lastName || ''}`}
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap gap-3 mt-1">
                      <span className="font-mono">{c.code}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.mobile}</span>
                      {(c.city || c.province) && <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3" />{[c.province, c.county, c.city].filter(Boolean).join(' / ')}</span>}
                    </div>
                    <div className="flex gap-1 mt-1.5">
                      {c.roles.map(r => (
                        <span key={r} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {(() => {
                  const b = balanceMap[c.id];
                  if (!b) return null;
                  const { net } = b;
                  if (net === 0) return (
                    <div className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 text-slate-500 font-mono">
                      تسویه
                    </div>
                  );
                  const isReceivable = net > 0;
                  return (
                    <div className={`text-xs px-3 py-1.5 rounded-lg font-bold font-mono ${isReceivable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
                      title={isReceivable ? 'طلب از مشتری' : 'بدهی به تأمین‌کننده'}>
                      {isReceivable ? '↑' : '↓'} {Math.abs(net).toLocaleString('fa-IR')}
                    </div>
                  );
                })()}
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600" title="ویرایش">
                    <Edit className="w-4 h-4" />
                  </button>
                  <RBACGate permission="contact.delete"><button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600" title="حذف">
                    <Trash2 className="w-4 h-4" />
                  </button></RBACGate>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-3 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-3 md:my-8" dir="rtl">
            <div className="flex justify-between items-center p-4 border-b bg-white dark:bg-slate-900 rounded-t-2xl">
              <h3 className="font-bold text-base">{contacts.find(c => c.id === editing.id) ? 'ویرایش شخص' : 'شخص جدید'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">نوع شخص</span>
                <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm">
                  <option value="حقیقی">حقیقی</option>
                  <option value="حقوقی">حقوقی</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">کد</span>
                <input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
              </label>

              {editing.type === 'حقوقی' ? (
                <label className="block md:col-span-2">
                  <span className="text-xs text-slate-600 block mb-1">نام شرکت *</span>
                  <input value={editing.companyName || ''} onChange={(e) => setEditing({ ...editing, companyName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
                </label>
              ) : (
                <>
                  <label className="block">
                    <span className="text-xs text-slate-600 block mb-1">نام *</span>
                    <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
                  </label>
                  <label className="block">
                    <span className="text-xs text-slate-600 block mb-1">نام خانوادگی</span>
                    <input value={editing.lastName || ''} onChange={(e) => setEditing({ ...editing, lastName: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
                  </label>
                </>
              )}

              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">کد ملی</span>
                <input value={editing.nationalId} onChange={(e) => setEditing({ ...editing, nationalId: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>

              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">موبایل *</span>
                <input value={editing.mobile} onChange={(e) => setEditing({ ...editing, mobile: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>

              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">تلفن</span>
                <input value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>

              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">سقف اعتبار (ریال)</span>
                <input type="number" value={editing.creditLimit} onChange={(e) => setEditing({ ...editing, creditLimit: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>

              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">ایمیل</span>
                <input type="email" value={editing.email || ''} onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>

              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">کد اقتصادی</span>
                <input value={editing.economicCode || ''} onChange={(e) => setEditing({ ...editing, economicCode: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>

              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">وب‌سایت</span>
                <input value={editing.website || ''} onChange={(e) => setEditing({ ...editing, website: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" placeholder="https://" />
              </label>

              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">تاریخ تولد / تأسیس</span>
                <input value={editing.birthDate || ''} onChange={(e) => setEditing({ ...editing, birthDate: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" placeholder="۱۳۷۰/۰۱/۰۱" />
              </label>

              <div className="md:col-span-2">
                <LocationSelector
                  province={editing.province || ''}
                  county={editing.county || ''}
                  city={editing.city || ''}
                  onChange={(v: any) => setEditing({ ...editing, ...v })}
                />
              </div>

              <label className="block md:col-span-2">
                <span className="text-xs text-slate-600 block mb-1">آدرس کامل</span>
                <input value={editing.address || ''} onChange={(e) => setEditing({ ...editing, address: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                  placeholder="خیابان، کوچه، پلاک..." />
              </label>

              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">کد پستی</span>
                <input value={editing.postalCode || ''} onChange={(e) => setEditing({ ...editing, postalCode: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr"
                  placeholder="۱۰ رقم" maxLength={10} />
              </label>

              <div className="md:col-span-2">
                <span className="text-xs text-slate-600 block mb-2">نقش‌ها</span>
                <div className="flex flex-wrap gap-3">
                  {(['مشتری', 'تامین‌کننده', 'همکار', 'پرسنل'] as const).map(r => (
                    <label key={r} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editing.roles.includes(r)}
                        onChange={(e) => {
                          const roles = e.target.checked
                            ? [...editing.roles, r]
                            : editing.roles.filter(x => x !== r);
                          setEditing({ ...editing, roles });
                        }}
                      />
                      {r}
                    </label>
                  ))}
                </div>
              </div>

              <label className="block md:col-span-2">
                <span className="text-xs text-slate-600 block mb-1">یادداشت</span>
                <textarea value={editing.notes || ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" rows={2} />
              </label>
            </div>

            <div className="p-4 border-t flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">لغو</button>
              <button onClick={handleSave} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg">ذخیره</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsModule;
