import React, { useState, useEffect } from 'react';
import { 
  Plus, Users, Edit, X, Package, AlertTriangle, 
  Printer, Download, FileText, CheckCircle, Search, Trash2, ArrowRightLeft, DollarSign, Calendar
} from 'lucide-react';

// === Interfaces ===
export interface AdvancedProduct {
  id: string;
  sku: string;
  barcode?: string;
  taxId?: string;
  name: string;
  brand?: string;
  category: string;
  mainUnit: string;
  warehouseName: string;
  location: string;
  stock: number;
  reservedStock: number;
  minStock: number;
  lastBuyPrice: number;
  avgBuyPrice: number;
  sellPrice: number;
  taxPercent: number;
  productType: 'کالای خریدی' | 'کالای ساختنی' | 'خدمات';
  isActive: boolean;
}

export interface AdvancedContact {
  id: string;
  code: string;
  personType: 'حقیقی' | 'حقوقی';
  roles: ('مشتری' | 'تامین‌کننده' | 'همکار' | 'پرسنل')[];
  name: string;
  lastName?: string;
  companyName?: string;
  nationalId: string;
  economicCode?: string;
  mobile: string;
  phone?: string;
  address?: string;
  creditLimit: number;
  isActive: boolean;
}

export interface InvoiceItem {
  productId: string;
  sku: string;
  taxId?: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  buyPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalPrice: number;
}

export interface PaymentDetail {
  type: 'cash' | 'pos' | 'cheque';
  amount: number;
  refCode?: string;
  bankName?: string;
  chequeNumber?: string;
  dueDate?: string;
}

export interface AdvancedInvoice {
  id: string;
  invoiceNumber: string;
  taxInvoiceId?: string;
  type: 'فاکتور فروش' | 'پیش‌فاکتور' | 'فاکتور خرید' | 'برگشت از فروش';
  contactId: string;
  contactName: string;
  contactNationalId: string;
  contactMobile: string;
  contactAddress?: string;
  date: string;
  dueDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  shippingCost: number;
  grandTotal: number;
  payments: PaymentDetail[];
  paidAmount: number;
  remainingAmount: number;
  status: 'پرداخت شده' | 'پیشنویس' | 'بدهکار';
  notes?: string;
}

export const InvoiceApp: React.FC = () => {
  const [theme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<'invoices' | 'inventory' | 'contacts'>('invoices');

  // App Data State
  const [products, setProducts] = useState<AdvancedProduct[]>(() => JSON.parse(localStorage.getItem('divan_products_v2') || '[]'));
  const [contacts, setContacts] = useState<AdvancedContact[]>(() => JSON.parse(localStorage.getItem('divan_contacts_v2') || '[]'));
  const [invoices, setInvoices] = useState<AdvancedInvoice[]>(() => JSON.parse(localStorage.getItem('divan_invoices_v2') || '[]'));

  useEffect(() => { localStorage.setItem('divan_invoices_v2', JSON.stringify(invoices)); }, [invoices]);

  // Invoice Modal / Form State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);

  // Form Header State
  const [invType, setInvType] = useState<'فاکتور فروش' | 'پیش‌فاکتور' | 'فاکتور خرید' | 'برگشت از فروش'>('فاکتور فروش');
  const [invNumber, setInvNumber] = useState('');
  const [invTaxId, setInvTaxId] = useState('');
  const [invDate, setInvDate] = useState('1405/06/23');
  const [invDueDate, setInvDueDate] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [invNotes, setInvNotes] = useState('');
  const [shippingCost, setShippingCost] = useState<number>(0);

  // Items State
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

  // Item Addition Form State
  const [selectedProdId, setSelectedProdId] = useState('');
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [itemDiscount, setItemDiscount] = useState<number>(0);

  // Payments State
  const [payments, setPayments] = useState<PaymentDetail[]>([]);
  const [payType, setPayType] = useState<'cash' | 'pos' | 'cheque'>('cash');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payRef, setPayRef] = useState('');
  const [payBank, setPayBank] = useState('');

  // Print Preview Modal State
  const [previewInvoice, setPreviewInvoice] = useState<AdvancedInvoice | null>(null);

  const handleOpenInvoiceModal = (inv?: AdvancedInvoice) => {
    if (inv) {
      setEditingInvoiceId(inv.id);
      setInvType(inv.type);
      setInvNumber(inv.invoiceNumber);
      setInvTaxId(inv.taxInvoiceId || '');
      setInvDate(inv.date);
      setInvDueDate(inv.dueDate || '');
      setSelectedContactId(inv.contactId);
      setInvoiceItems(inv.items);
      setShippingCost(inv.shippingCost || 0);
      setPayments(inv.payments || []);
      setInvNotes(inv.notes || '');
    } else {
      setEditingInvoiceId(null);
      setInvType('فاکتور فروش');
      setInvNumber(`INV-${1000 + invoices.length + 1}`);
      setInvTaxId('');
      setInvDate(new Date().toLocaleDateString('fa-IR'));
      setInvDueDate('');
      setSelectedContactId(contacts[0]?.id || '');
      setInvoiceItems([]);
      setShippingCost(0);
      setPayments([]);
      setInvNotes('');
    }
    setShowInvoiceModal(true);
  };

  const handleAddItem = () => {
    const prod = products.find(p => p.id === selectedProdId);
    if (!prod || itemQty <= 0) return;

    const discountAmount = (itemPrice * itemQty * itemDiscount) / 100;
    const priceAfterDiscount = (itemPrice * itemQty) - discountAmount;
    const taxAmount = (priceAfterDiscount * prod.taxPercent) / 100;
    const totalPrice = priceAfterDiscount + taxAmount;

    const newItem: InvoiceItem = {
      productId: prod.id,
      sku: prod.sku,
      taxId: prod.taxId,
      productName: prod.name,
      unit: prod.mainUnit,
      quantity: itemQty,
      unitPrice: itemPrice,
      buyPrice: prod.lastBuyPrice,
      discountPercent: itemDiscount,
      discountAmount,
      taxPercent: prod.taxPercent,
      taxAmount,
      totalPrice
    };

    setInvoiceItems([...invoiceItems, newItem]);
    setSelectedProdId('');
    setItemQty(1);
    setItemPrice(0);
    setItemDiscount(0);
  };

  const handleRemoveItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const handleAddPayment = () => {
    if (payAmount <= 0) return;
    setPayments([...payments, { type: payType, amount: payAmount, refCode: payRef, bankName: payBank }]);
    setPayAmount(0);
    setPayRef('');
    setPayBank('');
  };

  // Calculations
  const subtotal = invoiceItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const totalDiscount = invoiceItems.reduce((acc, item) => acc + item.discountAmount, 0);
  const totalTax = invoiceItems.reduce((acc, item) => acc + item.taxAmount, 0);
  const grandTotal = subtotal - totalDiscount + totalTax + Number(shippingCost || 0);
  const paidAmount = payments.reduce((acc, p) => acc + p.amount, 0);
  const remainingAmount = grandTotal - paidAmount;

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const contact = contacts.find(c => c.id === selectedContactId);
    if (!contact || invoiceItems.length === 0) return;

    const newInvoice: AdvancedInvoice = {
      id: editingInvoiceId || Date.now().toString(),
      invoiceNumber: invNumber,
      taxInvoiceId: invTaxId,
      type: invType,
      contactId: contact.id,
      contactName: `${contact.name} ${contact.lastName || ''}`,
      contactNationalId: contact.nationalId,
      contactMobile: contact.mobile,
      contactAddress: contact.address,
      date: invDate,
      dueDate: invDueDate,
      items: invoiceItems,
      subtotal,
      totalDiscount,
      totalTax,
      shippingCost,
      grandTotal,
      payments,
      paidAmount,
      remainingAmount,
      status: remainingAmount <= 0 ? 'پرداخت شده' : 'بدهکار',
      notes: invNotes
    };

    if (editingInvoiceId) {
      setInvoices(invoices.map(i => i.id === editingInvoiceId ? newInvoice : i));
    } else {
      setInvoices([newInvoice, ...invoices]);
    }

    setShowInvoiceModal(false);
  };

  const convertPreInvoiceToSale = (inv: AdvancedInvoice) => {
    const updated = { ...inv, type: 'فاکتور فروش' as const, invoiceNumber: `INV-${1000 + invoices.length + 1}` };
    setInvoices(invoices.map(i => i.id === inv.id ? updated : i));
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
          <button onClick={() => setActiveTab('invoices')} className={`w-full text-right p-2.5 rounded-lg ${activeTab === 'invoices' ? 'bg-indigo-600 text-white font-bold' : ''}`}>مدیریت فاکتورها</button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full text-right p-2.5 rounded-lg ${activeTab === 'inventory' ? 'bg-indigo-600 text-white font-bold' : ''}`}>انبارداری و کالاها</button>
          <button onClick={() => setActiveTab('contacts')} className={`w-full text-right p-2.5 rounded-lg ${activeTab === 'contacts' ? 'bg-indigo-600 text-white font-bold' : ''}`}>طرف حساب‌ها (اشخاص)</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 space-y-6">
        <header className="flex justify-between items-center border-b pb-4">
          <h1 className="text-xl font-bold text-indigo-500">سیستم صدور و مدیریت جامع فاکتورها</h1>
          <button onClick={() => handleOpenInvoiceModal()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> صدور فاکتور جدید
          </button>
        </header>

        {/* Invoices List */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`p-4 border rounded-xl ${bgCard}`}>
                <p className="text-xs text-slate-400">تعداد کل فاکتورها</p>
                <p className="text-lg font-bold text-indigo-400 mt-1">{invoices.length} فاکتور</p>
              </div>
              <div className={`p-4 border rounded-xl ${bgCard}`}>
                <p className="text-xs text-slate-400">مجموع فروش کل</p>
                <p className="text-lg font-bold text-emerald-400 mt-1">
                  {invoices.filter(i => i.type === 'فاکتور فروش').reduce((acc, i) => acc + i.grandTotal, 0).toLocaleString()} ریال
                </p>
              </div>
              <div className={`p-4 border rounded-xl ${bgCard}`}>
                <p className="text-xs text-slate-400">مطالبات (بدهکاران)</p>
                <p className="text-lg font-bold text-rose-400 mt-1">
                  {invoices.reduce((acc, i) => acc + i.remainingAmount, 0).toLocaleString()} ریال
                </p>
              </div>
              <div className={`p-4 border rounded-xl ${bgCard}`}>
                <p className="text-xs text-slate-400">پیش‌فاکتورها</p>
                <p className="text-lg font-bold text-amber-400 mt-1">
                  {invoices.filter(i => i.type === 'پیش‌فاکتور').length} عدد
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invoices.map((inv) => (
                <div key={inv.id} className={`p-4 border rounded-xl flex flex-col justify-between space-y-3 ${bgCard}`}>
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-mono">{inv.invoiceNumber}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${
                        inv.type === 'فاکتور فروش' ? 'bg-emerald-500/10 text-emerald-400' :
                        inv.type === 'پیش‌فاکتور' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>{inv.type}</span>
                    </div>
                    <h3 className="font-bold text-sm mt-2 text-indigo-300">{inv.contactName}</h3>
                    <p className="text-xs text-slate-400 mt-1">تاریخ: {inv.date} | اقلام: {inv.items.length} کالا</p>
                    <div className="flex justify-between items-center text-xs mt-2 p-2 bg-slate-950/40 rounded border border-slate-800">
                      <span>مبلغ کل: <strong className="text-indigo-400">{inv.grandTotal.toLocaleString()} ریال</strong></span>
                      <span>مانده: <strong className={inv.remainingAmount > 0 ? "text-rose-400" : "text-emerald-400"}>{inv.remainingAmount.toLocaleString()}</strong></span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                    <button onClick={() => setPreviewInvoice(inv)} className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-lg flex items-center gap-1">
                      <Printer className="w-3.5 h-3.5" /> مشاهده / چاپ
                    </button>
                    {inv.type === 'پیش‌فاکتور' && (
                      <button onClick={() => convertPreInvoiceToSale(inv)} className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded-lg flex items-center gap-1">
                        <ArrowRightLeft className="w-3.5 h-3.5" /> تبدیل به فروش
                      </button>
                    )}
                    <button onClick={() => handleOpenInvoiceModal(inv)} className="p-1.5 text-slate-400 hover:bg-slate-500/10 rounded-lg flex items-center gap-1">
                      <Edit className="w-3.5 h-3.5" /> ویرایش
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoice Creation / Edition Modal */}
        {showInvoiceModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className={`w-full max-w-5xl border rounded-2xl p-6 space-y-6 my-8 ${bgCard}`}>
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-lg text-indigo-400">{editingInvoiceId ? 'ویرایش فاکتور' : 'صدور فاکتور جدید (کامل)'}</h3>
                <button onClick={() => setShowInvoiceModal(false)}><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSaveInvoice} className="space-y-6">
                {/* 1. سربرگ فاکتور */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">نوع فاکتور</label>
                    <select value={invType} onChange={(e: any) => setInvType(e.target.value)} className={`w-full p-2.5 border rounded-lg text-xs ${bgInput}`}>
                      <option value="فاکتور فروش">فاکتور فروش</option>
                      <option value="پیش‌فاکتور">پیش‌فاکتور</option>
                      <option value="فاکتور خرید">فاکتور خرید</option>
                      <option value="برگشت از فروش">برگشت از فروش</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">شماره فاکتور</label>
                    <input type="text" value={invNumber} onChange={e => setInvNumber(e.target.value)} className={`w-full p-2.5 border rounded-lg text-xs ${bgInput}`} required />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">تاریخ صدور</label>
                    <input type="text" value={invDate} onChange={e => setInvDate(e.target.value)} className={`w-full p-2.5 border rounded-lg text-xs ${bgInput}`} required />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">انتخاب طرف حساب (مشتری)</label>
                    <select value={selectedContactId} onChange={e => setSelectedContactId(e.target.value)} className={`w-full p-2.5 border rounded-lg text-xs ${bgInput}`} required>
                      <option value="">-- انتخاب کنید --</option>
                      {contacts.map(c => (
                        <option key={c.id} value={c.id}>{c.name} {c.lastName} ({c.mobile})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. افزودن اقلام به فاکتور */}
                <div className="space-y-3 p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 border-r-2 border-indigo-500 pr-2">افزودن کالا / خدمت به فاکتور</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <select value={selectedProdId} onChange={e => {
                      setSelectedProdId(e.target.value);
                      const p = products.find(prod => prod.id === e.target.value);
                      if (p) setItemPrice(p.sellPrice);
                    }} className={`p-2 border rounded-lg text-xs ${bgInput}`}>
                      <option value="">-- انتخاب کالا --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (موجودی: {p.stock})</option>
                      ))}
                    </select>
                    <input type="number" value={itemQty || ''} onChange={e => setItemQty(Number(e.target.value))} placeholder="تعداد / مقدار" className={`p-2 border rounded-lg text-xs ${bgInput}`} />
                    <input type="number" value={itemPrice || ''} onChange={e => setItemPrice(Number(e.target.value))} placeholder="قیمت واحد (فی)" className={`p-2 border rounded-lg text-xs ${bgInput}`} />
                    <input type="number" value={itemDiscount || ''} onChange={e => setItemDiscount(Number(e.target.value))} placeholder="درصد تخفیف" className={`p-2 border rounded-lg text-xs ${bgInput}`} />
                    <button type="button" onClick={handleAddItem} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                      <Plus className="w-4 h-4" /> افزودن سطر
                    </button>
                  </div>

                  {/* جدول اقلام ثبت شده */}
                  {invoiceItems.length > 0 && (
                    <div className="overflow-x-auto mt-3">
                      <table className="w-full text-xs text-right border-collapse">
                        <thead>
                          <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                            <th className="p-2">کالا</th>
                            <th className="p-2">تعداد</th>
                            <th className="p-2">قیمت واحد</th>
                            <th className="p-2">تخفیف</th>
                            <th className="p-2">مالیات</th>
                            <th className="p-2">جمع نهایی</th>
                            <th className="p-2 text-center">حذف</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceItems.map((item, index) => (
                            <tr key={index} className="border-b border-slate-800/60">
                              <td className="p-2 font-bold text-indigo-300">{item.productName}</td>
                              <td className="p-2">{item.quantity} {item.unit}</td>
                              <td className="p-2">{item.unitPrice.toLocaleString()}</td>
                              <td className="p-2">{item.discountAmount.toLocaleString()} ({item.discountPercent}%)</td>
                              <td className="p-2">{item.taxAmount.toLocaleString()}</td>
                              <td className="p-2 font-bold text-emerald-400">{item.totalPrice.toLocaleString()}</td>
                              <td className="p-2 text-center">
                                <button type="button" onClick={() => handleRemoveItem(index)} className="text-rose-400 hover:text-rose-300"><Trash2 className="w-4 h-4" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 3. نحوه تسویه و پرداخت‌ها */}
                <div className="space-y-3 p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 border-r-2 border-indigo-500 pr-2">ثبت دریافتی / پرداخت</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <select value={payType} onChange={(e: any) => setPayType(e.target.value)} className={`p-2 border rounded-lg text-xs ${bgInput}`}>
                      <option value="cash">نقدی</option>
                      <option value="pos">کارتخوان / واریز به حساب</option>
                      <option value="cheque">چک</option>
                    </select>
                    <input type="number" value={payAmount || ''} onChange={e => setPayAmount(Number(e.target.value))} placeholder="مبلغ دریافتی" className={`p-2 border rounded-lg text-xs ${bgInput}`} />
                    <input type="text" value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="شماره پیگیری / صیادی" className={`p-2 border rounded-lg text-xs ${bgInput}`} />
                    <button type="button" onClick={handleAddPayment} className="p-2 bg-slate-800 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-bold">افزودن پرداخت</button>
                  </div>
                  {payments.length > 0 && (
                    <div className="space-y-1">
                      {payments.map((p, i) => (
                        <p key={i} className="text-[11px] text-slate-400 bg-slate-900 p-1.5 rounded border border-slate-800 flex justify-between">
                          <span>روش: {p.type === 'cash' ? 'نقدی' : p.type === 'pos' ? 'کارتخوان' : 'چک'} - کد پیگیری: {p.refCode || '-'}</span>
                          <strong className="text-emerald-400">{p.amount.toLocaleString()} ریال</strong>
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. خلاصه محاسبات مالی فاکتور */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
                  <div className="space-y-2">
                    <div>
                      <label className="text-slate-400 block mb-1">هزینه حمل و نقل (ریال)</label>
                      <input type="number" value={shippingCost || ''} onChange={e => setShippingCost(Number(e.target.value))} className={`w-full p-2 border rounded-lg ${bgInput}`} />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">توضیحات و یادداشت فاکتور</label>
                      <input type="text" value={invNotes} onChange={e => setInvNotes(e.target.value)} placeholder="شرایط تسویه، نحوه ارسال و..." className={`w-full p-2 border rounded-lg ${bgInput}`} />
                    </div>
                  </div>
                  <div className="space-y-1.5 text-left flex flex-col justify-center">
                    <p className="flex justify-between text-slate-400"><span>جمع اولیه اقلام:</span> <span>{subtotal.toLocaleString()} ریال</span></p>
                    <p className="flex justify-between text-rose-400"><span>مجموع تخفیفات:</span> <span>({totalDiscount.toLocaleString()}) ریال</span></p>
                    <p className="flex justify-between text-slate-400"><span>مجموع مالیات ارزش افزوده:</span> <span>{totalTax.toLocaleString()} ریال</span></p>
                    <p className="flex justify-between text-indigo-400 font-bold text-sm border-t border-slate-800 pt-1"><span>مبلغ نهایی فاکتور:</span> <span>{grandTotal.toLocaleString()} ریال</span></p>
                    <p className="flex justify-between text-emerald-400"><span>مجموع دریافتی:</span> <span>{paidAmount.toLocaleString()} ریال</span></p>
                    <p className="flex justify-between text-rose-400 font-bold"><span>مانده بدهکاری:</span> <span>{remainingAmount.toLocaleString()} ریال</span></p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button type="button" onClick={() => setShowInvoiceModal(false)} className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold">انصراف</button>
                  <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold">ذخیره و ثبت نهایی فاکتور</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invoice Printable View Modal */}
        {previewInvoice && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white text-slate-900 w-full max-w-3xl rounded-2xl p-8 space-y-6 my-8 font-sans">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{previewInvoice.type}</h2>
                  <p className="text-xs text-slate-500 mt-1">شماره: {previewInvoice.invoiceNumber} | تاریخ: {previewInvoice.date}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => window.print()} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg flex items-center gap-1"><Printer className="w-4 h-4" /> چاپ فاکتور</button>
                  <button onClick={() => setPreviewInvoice(null)} className="px-3 py-1.5 bg-slate-200 text-slate-800 text-xs font-bold rounded-lg"><X className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Printable Content */}
              <div className="space-y-4 text-xs">
                <div className="border p-3 rounded-lg flex justify-between bg-slate-50">
                  <div>
                    <p className="font-bold">خریدار / طرف حساب:</p>
                    <p className="text-sm font-bold text-indigo-900 mt-1">{previewInvoice.contactName}</p>
                    <p className="text-slate-600 mt-1">کد/شناسه ملی: {previewInvoice.contactNationalId}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-slate-600">شماره همراه: {previewInvoice.contactMobile}</p>
                    <p className="text-slate-600 mt-1">آدرس: {previewInvoice.contactAddress || '-'}</p>
                  </div>
                </div>

                <table className="w-full border-collapse border text-right">
                  <thead>
                    <tr className="bg-slate-100 border-b">
                      <th className="p-2 border">ردیف</th>
                      <th className="p-2 border">شرح کالا / خدمت</th>
                      <th className="p-2 border">تعداد</th>
                      <th className="p-2 border">قیمت واحد</th>
                      <th className="p-2 border">تخفیف</th>
                      <th className="p-2 border">مالیات</th>
                      <th className="p-2 border">مبلغ کل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewInvoice.items.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2 border text-center">{idx + 1}</td>
                        <td className="p-2 border font-bold">{item.productName}</td>
                        <td className="p-2 border">{item.quantity} {item.unit}</td>
                        <td className="p-2 border">{item.unitPrice.toLocaleString()}</td>
                        <td className="p-2 border">{item.discountAmount.toLocaleString()}</td>
                        <td className="p-2 border">{item.taxAmount.toLocaleString()}</td>
                        <td className="p-2 border font-bold">{item.totalPrice.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-between items-start border-t pt-4">
                  <div className="w-1/2 space-y-1">
                    <p className="font-bold">توضیحات فاکتور:</p>
                    <p className="text-slate-600">{previewInvoice.notes || 'فاقد توضیحات تکمیلی.'}</p>
                  </div>
                  <div className="w-1/2 space-y-1 text-left">
                    <p className="flex justify-between"><span>جمع کل اقلام:</span> <span>{previewInvoice.subtotal.toLocaleString()} ریال</span></p>
                    <p className="flex justify-between text-rose-600"><span>تخفیف:</span> <span>({previewInvoice.totalDiscount.toLocaleString()}) ریال</span></p>
                    <p className="flex justify-between"><span>مالیات ارزش افزوده:</span> <span>{previewInvoice.totalTax.toLocaleString()} ریال</span></p>
                    <p className="flex justify-between"><span>هزینه حمل:</span> <span>{(previewInvoice.shippingCost || 0).toLocaleString()} ریال</span></p>
                    <p className="flex justify-between font-bold text-sm border-t pt-1 text-indigo-900"><span>مبلغ قابل پرداخت:</span> <span>{previewInvoice.grandTotal.toLocaleString()} ریال</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InvoiceApp;
