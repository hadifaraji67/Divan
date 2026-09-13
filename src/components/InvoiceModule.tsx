import React, { useState, useEffect } from 'react';
import { Plus, Edit, Printer, Trash2, X, Menu, Package, Users, FileText } from 'lucide-react';

export interface InvoiceItem {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
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
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: 'فاکتور فروش' | 'پیش‌فاکتور' | 'فاکتور خرید' | 'برگشت از فروش';
  contactId: string;
  contactName: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  shippingCost: number;
  grandTotal: number;
  payments: PaymentDetail[];
  paidAmount: number;
  remainingAmount: number;
  status: 'پرداخت شده' | 'بدهکار';
  notes?: string;
}

export const InvoiceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'inventory' | 'contacts'>('invoices');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [invoices, setInvoices] = useState<Invoice[]>(() => 
    JSON.parse(localStorage.getItem('divan_invoices_v3') || '[]')
  );
  const [products] = useState<any[]>(() => JSON.parse(localStorage.getItem('divan_products_v2') || '[]'));
  const [contacts] = useState<any[]>(() => JSON.parse(localStorage.getItem('divan_contacts_v2') || '[]'));

  useEffect(() => {
    localStorage.setItem('divan_invoices_v3', JSON.stringify(invoices));
  }, [invoices]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [invType, setInvType] = useState<'فاکتور فروش' | 'پیش‌فاکتور' | 'فاکتور خرید' | 'برگشت از فروش'>('فاکتور فروش');
  const [invNumber, setInvNumber] = useState('');
  const [invDate, setInvDate] = useState('1405/06/23');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [invNotes, setInvNotes] = useState('');

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedProdId, setSelectedProdId] = useState('');
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [itemDiscount, setItemDiscount] = useState<number>(0);

  const [payments, setPayments] = useState<PaymentDetail[]>([]);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const handleOpenModal = (inv?: Invoice) => {
    if (inv) {
      setEditingId(inv.id);
      setInvType(inv.type);
      setInvNumber(inv.invoiceNumber);
      setInvDate(inv.date);
      setSelectedContactId(inv.contactId);
      setItems(inv.items);
      setShippingCost(inv.shippingCost);
      setPayments(inv.payments);
      setInvNotes(inv.notes || '');
    } else {
      setEditingId(null);
      setInvType('فاکتور فروش');
      setInvNumber(`INV-${1000 + invoices.length + 1}`);
      setInvDate(new Date().toLocaleDateString('fa-IR'));
      setSelectedContactId(contacts[0]?.id || '');
      setItems([]);
      setShippingCost(0);
      setPayments([]);
      setInvNotes('');
    }
    setShowModal(true);
  };

  const handleAddItem = () => {
    const prod = products.find(p => p.id === selectedProdId);
    if (!prod || itemQty <= 0) return;

    const discountAmount = (itemPrice * itemQty * itemDiscount) / 100;
    const priceAfterDiscount = (itemPrice * itemQty) - discountAmount;
    const taxAmount = (priceAfterDiscount * (prod.taxPercent || 10)) / 100;
    const totalPrice = priceAfterDiscount + taxAmount;

    setItems([...items, {
      productId: prod.id,
      productName: prod.name || prod.title,
      unit: prod.mainUnit || 'عدد',
      quantity: itemQty,
      unitPrice: itemPrice,
      discountPercent: itemDiscount,
      discountAmount,
      taxPercent: prod.taxPercent || 10,
      taxAmount,
      totalPrice
    }]);

    setSelectedProdId('');
    setItemQty(1);
    setItemPrice(0);
    setItemDiscount(0);
  };

  const subtotal = items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0);
  const totalDiscount = items.reduce((acc, i) => acc + i.discountAmount, 0);
  const totalTax = items.reduce((acc, i) => acc + i.taxAmount, 0);
  const grandTotal = subtotal - totalDiscount + totalTax + Number(shippingCost || 0);
  const paidAmount = payments.reduce((acc, p) => acc + p.amount, 0);
  const remainingAmount = grandTotal - paidAmount;

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const contact = contacts.find(c => c.id === selectedContactId);

    const newInv: Invoice = {
      id: editingId || Date.now().toString(),
      invoiceNumber: invNumber,
      type: invType,
      contactId: selectedContactId,
      contactName: contact ? (contact.name + ' ' + (contact.lastName || '')) : 'نامشخص',
      date: invDate,
      items,
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

    if (editingId) {
      setInvoices(invoices.map(i => i.id === editingId ? newInv : i));
    } else {
      setInvoices([newInv, ...invoices]);
    }

    setShowModal(false);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-slate-950 text-slate-100 font-sans dir-rtl">
      {/* هدر بالایی در حالت موبایل */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <h1 className="text-base font-bold text-indigo-400">نرم‌افزار دیوان</h1>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* منوی کناری (Sidebar) کشویی */}
      <aside className={`
        fixed md:static inset-y-0 right-0 z-40 w-64 bg-slate-900 border-l border-slate-800 p-4 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:block text-lg font-bold text-center py-4 border-b border-slate-800 text-indigo-500">
          نرم‌افزار دیوان
        </div>

        <nav className="flex-1 space-y-2 mt-4 text-xs">
          <button
            onClick={() => { setActiveTab('invoices'); setIsSidebarOpen(false); }}
            className={`w-full text-right p-3 rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === 'invoices' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800'
            }`}>
            <FileText className="w-4 h-4" /> مدیریت فاکتورها
          </button>
          <button
            onClick={() => { setActiveTab('inventory'); setIsSidebarOpen(false); }}
            className={`w-full text-right p-3 rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === 'inventory' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800'
            }`}>
            <Package className="w-4 h-4" /> انبارداری و کالاها
          </button>
          <button
            onClick={() => { setActiveTab('contacts'); setIsSidebarOpen(false); }}
            className={`w-full text-right p-3 rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === 'contacts' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800'
            }`}>
            <Users className="w-4 h-4" /> طرف حساب‌ها (اشخاص)
          </button>
        </nav>
      </aside>

      {/* اوورلی پس‌زمینه منو در موبایل */}
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30" />
      )}

      {/* محتوای اصلی */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {activeTab === 'invoices' && (
          <>
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-indigo-400">بخش مدیریت و صدور فاکتورها</h2>
                <p className="text-xs text-slate-400 mt-1">صدور فاکتور فروش، پیش‌فاکتور و تسویه حساب</p>
              </div>
              <button onClick={() => handleOpenModal()} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> فاکتور جدید
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <p className="text-[11px] text-slate-400">کل فاکتورها</p>
                <p className="text-base font-bold text-indigo-400 mt-1">{invoices.length} عدد</p>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <p className="text-[11px] text-slate-400">مجموع فروش</p>
                <p className="text-base font-bold text-emerald-400 mt-1">
                  {invoices.filter(i => i.type === 'فاکتور فروش').reduce((acc, i) => acc + i.grandTotal, 0).toLocaleString()} ریال
                </p>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <p className="text-[11px] text-slate-400">مانده مطالبات</p>
                <p className="text-base font-bold text-rose-400 mt-1">
                  {invoices.reduce((acc, i) => acc + i.remainingAmount, 0).toLocaleString()} ریال
                </p>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <p className="text-[11px] text-slate-400">پیش‌فاکتورها</p>
                <p className="text-base font-bold text-amber-400 mt-1">
                  {invoices.filter(i => i.type === 'پیش‌فاکتور').length} عدد
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invoices.map((inv) => (
                <div key={inv.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-mono">{inv.invoiceNumber}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${inv.type === 'فاکتور فروش' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{inv.type}</span>
                    </div>
                    <h3 className="font-bold text-sm mt-2 text-indigo-300">{inv.contactName}</h3>
                    <p className="text-xs text-slate-400 mt-1">تاریخ: {inv.date} | اقلام: {inv.items.length}</p>
                    <div className="flex justify-between items-center text-xs mt-2 p-2 bg-slate-950 rounded border border-slate-800/80">
                      <span>مبلغ کل: <strong className="text-indigo-400">{inv.grandTotal.toLocaleString()}</strong></span>
                      <span>مانده: <strong className={inv.remainingAmount > 0 ? "text-rose-400" : "text-emerald-400"}>{inv.remainingAmount.toLocaleString()}</strong></span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                    <button onClick={() => setPreviewInvoice(inv)} className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-lg flex items-center gap-1">
                      <Printer className="w-3.5 h-3.5" /> چاپ
                    </button>
                    <button onClick={() => handleOpenModal(inv)} className="p-1.5 text-slate-400 hover:bg-slate-500/10 rounded-lg flex items-center gap-1">
                      <Edit className="w-3.5 h-3.5" /> ویرایش
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'inventory' && <div className="p-6 text-center text-slate-400">بخش کالاها و انبارداری</div>}
        {activeTab === 'contacts' && <div className="p-6 text-center text-slate-400">بخش طرف حساب‌ها</div>}
      </main>

      {/* مودال فاکتور */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl p-6 space-y-6 my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-indigo-400">{editingId ? 'ویرایش فاکتور' : 'صدور فاکتور جدید'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">نوع فاکتور</label>
                  <select value={invType} onChange={(e: any) => setInvType(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100">
                    <option value="فاکتور فروش">فاکتور فروش</option>
                    <option value="پیش‌فاکتور">پیش‌فاکتور</option>
                    <option value="فاکتور خرید">فاکتور خرید</option>
                    <option value="برگشت از فروش">برگشت از فروش</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">شماره فاکتور</label>
                  <input type="text" value={invNumber} onChange={e => setInvNumber(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100" required />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">تاریخ صدور</label>
                  <input type="text" value={invDate} onChange={e => setInvDate(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100" required />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">طرف حساب</label>
                  <select value={selectedContactId} onChange={e => setSelectedContactId(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100" required>
                    <option value="">-- انتخاب کنید --</option>
                    {contacts.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name} {c.lastName} ({c.mobile})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-slate-400">افزودن کالا به فاکتور</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <select value={selectedProdId} onChange={e => {
                    setSelectedProdId(e.target.value);
                    const p = products.find((prod: any) => prod.id === e.target.value);
                    if (p) setItemPrice(p.sellPrice || p.price || 0);
                  }} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100">
                    <option value="">-- انتخاب کالا --</option>
                    {products.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name || p.title}</option>
                    ))}
                  </select>
                  <input type="number" value={itemQty || ''} onChange={e => setItemQty(Number(e.target.value))} placeholder="تعداد" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100" />
                  <input type="number" value={itemPrice || ''} onChange={e => setItemPrice(Number(e.target.value))} placeholder="قیمت واحد" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100" />
                  <input type="number" value={itemDiscount || ''} onChange={e => setItemDiscount(Number(e.target.value))} placeholder="درصد تخفیف" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100" />
                  <button type="button" onClick={handleAddItem} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold">افزودن</button>
                </div>

                {items.length > 0 && (
                  <table className="w-full text-right border-collapse mt-2">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                        <th className="p-2">کالا</th>
                        <th className="p-2">تعداد</th>
                        <th className="p-2">قیمت واحد</th>
                        <th className="p-2">تخفیف</th>
                        <th className="p-2">جمع نهایی</th>
                        <th className="p-2 text-center">حذف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-800/50">
                          <td className="p-2 text-indigo-300 font-bold">{item.productName}</td>
                          <td className="p-2">{item.quantity} {item.unit}</td>
                          <td className="p-2">{item.unitPrice.toLocaleString()}</td>
                          <td className="p-2">{item.discountAmount.toLocaleString()}</td>
                          <td className="p-2 font-bold text-emerald-400">{item.totalPrice.toLocaleString()}</td>
                          <td className="p-2 text-center">
                            <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-rose-400"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="space-y-2">
                  <label className="text-slate-400 block">هزینه حمل و نقل (ریال)</label>
                  <input type="number" value={shippingCost || ''} onChange={e => setShippingCost(Number(e.target.value))} className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100" />
                  <label className="text-slate-400 block">توضیحات فاکتور</label>
                  <input type="text" value={invNotes} onChange={e => setInvNotes(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100" />
                </div>
                <div className="space-y-1.5 text-left flex flex-col justify-center">
                  <p className="flex justify-between text-slate-400"><span>جمع اولیه:</span> <span>{subtotal.toLocaleString()} ریال</span></p>
                  <p className="flex justify-between text-rose-400"><span>تخفیف:</span> <span>({totalDiscount.toLocaleString()}) ریال</span></p>
                  <p className="flex justify-between text-slate-400"><span>مالیات:</span> <span>{totalTax.toLocaleString()} ریال</span></p>
                  <p className="flex justify-between text-indigo-400 font-bold text-sm border-t border-slate-800 pt-1"><span>جمع نهایی:</span> <span>{grandTotal.toLocaleString()} ریال</span></p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg">انصراف</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold">ذخیره فاکتور</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceModule;
