import React, { useState, useEffect } from 'react';
import { 
  Menu, Plus, FileText, ShoppingCart, Users, CreditCard, 
  Settings, Database, Lock, User, LogOut, Sun, Moon, Trash2, 
  Printer, AlertTriangle, Download, TrendingUp, Calendar, CheckSquare, Shield,
  Building, Phone, MapPin, DollarSign, Tag, Edit, Save, X
} from 'lucide-react';

// === Detailed Contact Interface ===
export interface BankAccount {
  bankName: string;
  accountNumber: string;
  cardNumber: string;
  sheba: string;
}

export interface AdvancedContact {
  id: string;
  code: string;
  personType: 'حقیقی' | 'حقوقی';
  roles: ('مشتری' | 'تامین‌کننده' | 'همکار' | 'پرسنل')[];
  name: string;
  lastName?: string;
  companyName?: string;
  nationalId: string; // کد ملی یا شناسه ملی
  economicCode?: string; // کد اقتصادی
  registrationNumber?: string; // شماره ثبت
  mobile: string;
  phone?: string;
  email?: string;
  postalCode?: string;
  address?: string;
  deliveryAddress?: string;
  creditLimit: number; // سقف اعتبار ریالی
  paymentTermsDays: number; // مهلت تسویه (روز)
  defaultDiscountPercent: number;
  bankAccounts: BankAccount[];
  group: string;
  isActive: boolean;
  notes?: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
}

interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  buyPrice: number;
  discount: number;
  tax: number;
  total: number;
}

interface Invoice {
  id: string;
  type: 'فاکتور فروش' | 'پیش‌فاکتور' | 'فاکتور خرید';
  customerName: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  totalProfit: number;
  status: 'پرداخت شده' | 'پیشنویس' | 'بدهکار';
}

interface Cheque {
  id: string;
  contactName: string;
  amount: number;
  dueDate: string;
  bankName: string;
  chequeNumber: string;
  type: 'دریافتی' | 'پرداختی';
  status: 'در جریان' | 'پاس شده' | 'برگشتی';
}

interface AppUser {
  id: string;
  username: string;
  role: 'مدیر کل' | 'فروشنده' | 'انباردار';
}

export const InvoiceApp: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>({ id: '1', username: 'مدیر سیستم', role: 'مدیر کل' });
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'contacts' | 'inventory' | 'cheques' | 'reports'>('contacts');

  // App Data
  const [products, setProducts] = useState<Product[]>(() => JSON.parse(localStorage.getItem('divan_products') || '[]'));
  const [contacts, setContacts] = useState<AdvancedContact[]>(() => JSON.parse(localStorage.getItem('divan_contacts_v2') || '[]'));
  const [invoices, setInvoices] = useState<Invoice[]>(() => JSON.parse(localStorage.getItem('divan_invoices') || '[]'));
  const [cheques, setCheques] = useState<Cheque[]>(() => JSON.parse(localStorage.getItem('divan_cheques') || '[]'));

  useEffect(() => { localStorage.setItem('divan_contacts_v2', JSON.stringify(contacts)); }, [contacts]);

  // Modal / Form state for Advanced Contact
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  // Form Fields
  const [formCode, setFormCode] = useState('');
  const [formPersonType, setFormPersonType] = useState<'حقیقی' | 'حقوقی'>('حقیقی');
  const [formRoles, setFormRoles] = useState<('مشتری' | 'تامین‌کننده' | 'همکار' | 'پرسنل')[]>(['مشتری']);
  const [formName, setFormName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formCompanyName, setFormCompanyName] = useState('');
  const [formNationalId, setFormNationalId] = useState('');
  const [formEconomicCode, setFormEconomicCode] = useState('');
  const [formRegistrationNumber, setFormRegistrationNumber] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPostalCode, setFormPostalCode] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formDeliveryAddress, setFormDeliveryAddress] = useState('');
  const [formCreditLimit, setFormCreditLimit] = useState<number>(0);
  const [formPaymentTermsDays, setFormPaymentTermsDays] = useState<number>(0);
  const [formDefaultDiscountPercent, setFormDefaultDiscountPercent] = useState<number>(0);
  const [formGroup, setFormGroup] = useState('عمومی');
  const [formNotes, setFormNotes] = useState('');

  // Bank Account State for Form
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [sheba, setSheba] = useState('');
  const [bankList, setBankList] = useState<BankAccount[]>([]);

  const handleAddBank = () => {
    if (!bankName || !accountNumber) return;
    setBankList([...bankList, { bankName, accountNumber, cardNumber, sheba }]);
    setBankName(''); setAccountNumber(''); setCardNumber(''); setSheba('');
  };

  const handleOpenContactModal = (contact?: AdvancedContact) => {
    if (contact) {
      setEditingContactId(contact.id);
      setFormCode(contact.code);
      setFormPersonType(contact.personType);
      setFormRoles(contact.roles);
      setFormName(contact.name);
      setFormLastName(contact.lastName || '');
      setFormCompanyName(contact.companyName || '');
      setFormNationalId(contact.nationalId);
      setFormEconomicCode(contact.economicCode || '');
      setFormRegistrationNumber(contact.registrationNumber || '');
      setFormMobile(contact.mobile);
      setFormPhone(contact.phone || '');
      setFormEmail(contact.email || '');
      setFormPostalCode(contact.postalCode || '');
      setFormAddress(contact.address || '');
      setFormDeliveryAddress(contact.deliveryAddress || '');
      setFormCreditLimit(contact.creditLimit);
      setFormPaymentTermsDays(contact.paymentTermsDays);
      setFormDefaultDiscountPercent(contact.defaultDiscountPercent);
      setFormGroup(contact.group);
      setFormNotes(contact.notes || '');
      setBankList(contact.bankAccounts || []);
    } else {
      setEditingContactId(null);
      setFormCode(`100${contacts.length + 1}`);
      setFormPersonType('حقیقی');
      setFormRoles(['مشتری']);
      setFormName(''); setFormLastName(''); setFormCompanyName('');
      setFormNationalId(''); setFormEconomicCode(''); setFormRegistrationNumber('');
      setFormMobile(''); setFormPhone(''); setFormEmail(''); setFormPostalCode('');
      setFormAddress(''); setFormDeliveryAddress('');
      setFormCreditLimit(0); setFormPaymentTermsDays(0); setFormDefaultDiscountPercent(0);
      setFormGroup('عمومی'); setFormNotes(''); setBankList([]);
    }
    setShowContactModal(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formMobile || !formNationalId) return;

    const newContact: AdvancedContact = {
      id: editingContactId || Date.now().toString(),
      code: formCode,
      personType: formPersonType,
      roles: formRoles,
      name: formName,
      lastName: formLastName,
      companyName: formCompanyName,
      nationalId: formNationalId,
      economicCode: formEconomicCode,
      registrationNumber: formRegistrationNumber,
      mobile: formMobile,
      phone: formPhone,
      email: formEmail,
      postalCode: formPostalCode,
      address: formAddress,
      deliveryAddress: formDeliveryAddress,
      creditLimit: formCreditLimit,
      paymentTermsDays: formPaymentTermsDays,
      defaultDiscountPercent: formDefaultDiscountPercent,
      bankAccounts: bankList,
      group: formGroup,
      isActive: true,
      notes: formNotes,
    };

    if (editingContactId) {
      setContacts(contacts.map(c => c.id === editingContactId ? newContact : c));
    } else {
      setContacts([newContact, ...contacts]);
    }

    setShowContactModal(false);
  };

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800';
  const bgCard = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const bgInput = isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900';

  return (
    <div className={`flex h-screen w-screen overflow-hidden dir-rtl font-sans ${bgMain}`}>
      {/* Sidebar */}
      <aside className={`w-64 border-l p-4 flex flex-col ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="text-xl font-bold text-center py-3 border-b border-slate-800/40 text-indigo-500">نرم‌افزار دیوان</div>
        <nav className="flex-1 space-y-1 mt-4 text-sm">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full text-right p-2.5 rounded-lg ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white font-bold' : ''}`}>داشبورد</button>
          <button onClick={() => setActiveTab('contacts')} className={`w-full text-right p-2.5 rounded-lg ${activeTab === 'contacts' ? 'bg-indigo-600 text-white font-bold' : ''}`}>طرف حساب‌ها (اشخاص)</button>
          <button onClick={() => setActiveTab('invoices')} className={`w-full text-right p-2.5 rounded-lg ${activeTab === 'invoices' ? 'bg-indigo-600 text-white font-bold' : ''}`}>فاکتورها</button>
          <button onClick={() => setActiveTab('cheques')} className={`w-full text-right p-2.5 rounded-lg ${activeTab === 'cheques' ? 'bg-indigo-600 text-white font-bold' : ''}`}>چک‌ها</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 space-y-6">
        <header className="flex justify-between items-center border-b pb-4">
          <h1 className="text-xl font-bold text-indigo-500">مدیریت جامع طرف حساب‌ها (اشخاص)</h1>
          <button onClick={() => handleOpenContactModal()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> تعریف طرف حساب جدید
          </button>
        </header>

        {/* Contacts List */}
        {activeTab === 'contacts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((c) => (
              <div key={c.id} className={`p-4 border rounded-xl flex flex-col justify-between space-y-3 ${bgCard}`}>
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-mono">کد: {c.code}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${c.personType === 'حقیقی' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{c.personType}</span>
                  </div>
                  <h3 className="font-bold text-sm mt-2 text-indigo-300">{c.name} {c.lastName} {c.companyName ? `(${c.companyName})` : ''}</h3>
                  <p className="text-xs text-slate-400 mt-1">کد/شناسه ملی: {c.nationalId} | کد اقتصادی: {c.economicCode || ' ثبت نشده '}</p>
                  <p className="text-xs text-slate-400 mt-1">همراه: {c.mobile} | تلفن: {c.phone || '-'}</p>
                  <p className="text-xs text-slate-400 mt-1">سقف اعتبار: {c.creditLimit.toLocaleString()} ریال</p>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500">گروه: {c.group}</span>
                  <button onClick={() => handleOpenContactModal(c)} className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-lg text-xs flex items-center gap-1">
                    <Edit className="w-3.5 h-3.5" /> ویرایش
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Form for Advanced Contact */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className={`w-full max-w-4xl border rounded-2xl p-6 space-y-6 my-8 ${bgCard}`}>
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-lg text-indigo-400">{editingContactId ? 'ویرایش طرف حساب' : 'تعریف طرف حساب جدید (کامل)'}</h3>
                <button onClick={() => setShowContactModal(false)}><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSaveContact} className="space-y-6">
                {/* 1. اطلاعات عمومی */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 border-r-2 border-indigo-500 pr-2">۱. اطلاعات شناسه و عمومی</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input type="text" value={formCode} onChange={e => setFormCode(e.target.value)} placeholder="کد اختصاصی" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} required />
                    <select value={formPersonType} onChange={(e: any) => setFormPersonType(e.target.value)} className={`p-2.5 border rounded-lg text-xs ${bgInput}`}>
                      <option value="حقیقی">شخص حقیقی</option>
                      <option value="حقوقی">شخص حقوقی (شرکت)</option>
                    </select>
                    <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder={formPersonType === 'حقیقی' ? "نام" : "نام شرکت"} className={`p-2.5 border rounded-lg text-xs ${bgInput}`} required />
                    {formPersonType === 'حقیقی' && (
                      <input type="text" value={formLastName} onChange={e => setFormLastName(e.target.value)} placeholder="نام خانوادگی" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    )}
                    <input type="text" value={formGroup} onChange={e => setFormGroup(e.target.value)} placeholder="گروه (مثلاً: مشتریان عمده)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                  </div>
                </div>

                {/* 2. اطلاعات قانونی و مالیاتی */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 border-r-2 border-indigo-500 pr-2">۲. اطلاعات هویتی و مالیاتی (سامانه مودیان)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" value={formNationalId} onChange={e => setFormNationalId(e.target.value)} placeholder="کد ملی / شناسه ملی" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} required />
                    <input type="text" value={formEconomicCode} onChange={e => setFormEconomicCode(e.target.value)} placeholder="شماره / کد اقتصادی (۱۲ رقم)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    <input type="text" value={formRegistrationNumber} onChange={e => setFormRegistrationNumber(e.target.value)} placeholder="شماره ثبت (برای شرکت‌ها)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                  </div>
                </div>

                {/* 3. اطلاعات تماس و آدرس */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 border-r-2 border-indigo-500 pr-2">۳. اطلاعات تماس و نشانی</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" value={formMobile} onChange={e => setFormMobile(e.target.value)} placeholder="شماره همراه اصلی" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} required />
                    <input type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="تلفن ثابت" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    <input type="text" value={formPostalCode} onChange={e => setFormPostalCode(e.target.value)} placeholder="کد پستی (۱۰ رقمی)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    <input type="text" value={formAddress} onChange={e => setFormAddress(e.target.value)} placeholder="نشانی دقیق دفتر/منزل" className={`p-2.5 border rounded-lg text-xs md:col-span-3 ${bgInput}`} />
                    <input type="text" value={formDeliveryAddress} onChange={e => setFormDeliveryAddress(e.target.value)} placeholder="آدرس دوم / محل تحویل بار" className={`p-2.5 border rounded-lg text-xs md:col-span-3 ${bgInput}`} />
                  </div>
                </div>

                {/* 4. تنظیمات مالی و اعتباری */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 border-r-2 border-indigo-500 pr-2">۴. تنظیمات مالی و شرایط تسویه</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="number" value={formCreditLimit || ''} onChange={e => setFormCreditLimit(Number(e.target.value))} placeholder="سقف اعتبار ریالی" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    <input type="number" value={formPaymentTermsDays || ''} onChange={e => setFormPaymentTermsDays(Number(e.target.value))} placeholder="مهلت تسویه نسیه (روز)" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                    <input type="number" value={formDefaultDiscountPercent || ''} onChange={e => setFormDefaultDiscountPercent(Number(e.target.value))} placeholder="درصد تخفیف پایه" className={`p-2.5 border rounded-lg text-xs ${bgInput}`} />
                  </div>
                </div>

                {/* 5. حساب‌های بانکی */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 border-r-2 border-indigo-500 pr-2">۵. اطلاعات حساب‌های بانکی</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="نام بانک" className={`p-2 border rounded-lg text-xs ${bgInput}`} />
                    <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="شماره حساب" className={`p-2 border rounded-lg text-xs ${bgInput}`} />
                    <input type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="شماره کارت" className={`p-2 border rounded-lg text-xs ${bgInput}`} />
                    <button type="button" onClick={handleAddBank} className="p-2 bg-slate-800 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-bold">افزودن حساب</button>
                  </div>
                  {bankList.length > 0 && (
                    <div className="space-y-1">
                      {bankList.map((b, i) => (
                        <p key={i} className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-800">
                          بانک {b.bankName} - شماره حساب: {b.accountNumber} - کارت: {b.cardNumber || '-'}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button type="button" onClick={() => setShowContactModal(false)} className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold">انصراف</button>
                  <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold">ذخیره طرف حساب</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InvoiceApp;
