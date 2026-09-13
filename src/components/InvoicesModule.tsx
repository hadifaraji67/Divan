import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, X, Printer, FileText } from 'lucide-react';
import type { Invoice, InvoiceLine, Contact, Product } from '../types/models';
import { loadData, saveData, genId, invoiceSubtotal, invoiceDiscount, invoiceTax, invoiceTotal } from '../types/models';
import { loadData as ld, saveData as sd, genId as gid } from '../lib/storage';

const empty = (): Invoice => ({
  id: '', number: '', type: 'فروش', date: new Date().toLocaleDateString('fa-IR'),
  contactId: '', contactName: '', items: [], discountPercent: 0, taxPercent: 9,
  shippingCost: 0, notes: '', createdAt: '',
});

export const InvoicesModule: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Invoice>(empty());
  const [preview, setPreview] = useState<Invoice | null>(null);

  useEffect(() => {
    setInvoices(ld<Invoice[]>('invoices', []));
    setContacts(ld<Contact[]>('contacts', []));
    setProducts(ld<Product[]>('products', []));
  }, []);
  useEffect(() => { sd('invoices', invoices); }, [invoices]);

  const filtered = useMemo(() => {
    if (!search.trim()) return invoices;
    const q = search.trim();
    return invoices.filter(i =>
      i.number.includes(q) || i.contactName.includes(q) || i.type.includes(q)
    );
  }, [invoices, search]);

  const openNew = () => {
    const inv = empty();
    inv.id = gid();
    inv.number = `INV-${(invoices.length + 1).toString().padStart(4, '0')}`;
    inv.createdAt = new Date().toISOString();
    inv.contactId = contacts[0]?.id || '';
    setEditing(inv); setShowForm(true);
  };
  const openEdit = (inv: Invoice) => { setEditing({ ...inv }); setShowForm(true); };
  const remove = (id: string) => {
    if (!confirm('حذف این فاکتور؟')) return;
    setInvoices(p => p.filter(i => i.id !== id));
  };

  const save = () => {
    if (!editing.contactId) { alert('مشتری را انتخاب کن'); return; }
    if (editing.items.length === 0) { alert('حداقل یک قلم اضافه کن'); return; }
    const c = contacts.find(x => x.id === editing.contactId);
    const inv = { ...editing, contactName: c ? (c.type === 'حقوقی' ? c.companyName || c.name : `${c.name} ${c.lastName || ''}`) : '' };
    setInvoices(prev => prev.find(i => i.id === inv.id)
      ? prev.map(i => i.id === inv.id ? inv : i)
      : [...prev, inv]);
    setShowForm(false);
  };

  const addLine = (productId: string, qty: number) => {
    const p = products.find(x => x.id === productId);
    if (!p || qty <= 0) return;
    const line: InvoiceLine = {
      productId: p.id, productName: p.name, unit: p.unit,
      quantity: qty, unitPrice: p.sellPrice, discountPercent: 0, taxPercent: p.taxPercent,
    };
    setEditing({ ...editing, items: [...editing.items, line] });
  };
  const removeLine = (i: number) => {
    setEditing({ ...editing, items: editing.items.filter((_, idx) => idx !== i) });
  };

  const subtotal = invoiceSubtotal(editing.items);
  const discount = invoiceDiscount(editing.items, editing.discountPercent);
  const tax = invoiceTax(editing.items, editing.discountPercent, editing.taxPercent);
  const total = invoiceTotal(editing.items, editing.discountPercent, editing.taxPercent, editing.shippingCost);

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو..."
            className="w-full pr-10 pl-3 py-2.5 border border-slate-300 rounded-lg text-sm" />
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg">
          <Plus className="w-4 h-4" /> فاکتور جدید
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-3 bg-slate-50 border-b text-xs text-slate-600">مجموع: {invoices.length} — نمایش: {filtered.length}</div>
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">{invoices.length === 0 ? 'فاکتوری ثبت نشده' : 'چیزی پیدا نشد'}</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(inv => {
              const t = invoiceTotal(inv.items, inv.discountPercent, inv.taxPercent, inv.shippingCost);
              return (
                <div key={inv.id} className="p-4 hover:bg-slate-50 flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{inv.number}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100">{inv.type}</span>
                      <span className="text-xs text-slate-500">{inv.date}</span>
                    </div>
                    <div className="font-bold text-sm mt-1">{inv.contactName || '—'}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      اقلام: {inv.items.length} — مبلغ: <b className="text-indigo-600">{t.toLocaleString()} ریال</b>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setPreview(inv)} className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600"><Printer className="w-4 h-4" /></button>
                    <button onClick={() => openEdit(inv)} className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => remove(inv.id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl my-8" dir="rtl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold">{invoices.find(i => i.id === editing.id) ? 'ویرایش فاکتور' : 'فاکتور جدید'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">نوع</span>
                <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm">
                  <option value="فروش">فروش</option>
                  <option value="پیش‌فاکتور">پیش‌فاکتور</option>
                  <option value="خرید">خرید</option>
                  <option value="برگشت از فروش">برگشت از فروش</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">شماره</span>
                <input value={editing.number} onChange={(e) => setEditing({ ...editing, number: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-600 block mb-1">تاریخ</span>
                <input value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" />
              </label>
              <label className="block md:col-span-3">
                <span className="text-xs text-slate-600 block mb-1">مشتری *</span>
                <select value={editing.contactId} onChange={(e) => setEditing({ ...editing, contactId: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm">
                  <option value="">— انتخاب —</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.type === 'حقوقی' ? c.companyName || c.name : `${c.name} ${c.lastName || ''}`} — {c.mobile}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="px-4 pb-4">
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-slate-50 p-3 flex flex-wrap gap-2 items-center">
                  <select id="prodSel" className="flex-1 min-w-[200px] p-2 border rounded-lg text-sm">
                    <option value="">— انتخاب کالا —</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} — {p.sellPrice.toLocaleString()}</option>)}
                  </select>
                  <input id="qtySel" type="number" defaultValue={1} min={1} className="w-20 p-2 border rounded-lg text-sm" />
                  <button
                    onClick={() => {
                      const s = document.getElementById('prodSel') as HTMLSelectElement;
                      const q = document.getElementById('qtySel') as HTMLInputElement;
                      addLine(s.value, Number(q.value));
                      s.value = ''; q.value = '1';
                    }}
                    className="px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg"
                  >افزودن</button>
                </div>

                {editing.items.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">هنوز قلمی اضافه نشده</div>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="p-2 text-right">کالا</th>
                        <th className="p-2 text-right">تعداد</th>
                        <th className="p-2 text-right">قیمت</th>
                        <th className="p-2 text-right">جمع</th>
                        <th className="p-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {editing.items.map((it, i) => (
                        <tr key={i}>
                          <td className="p-2">{it.productName}</td>
                          <td className="p-2">{it.quantity} {it.unit}</td>
                          <td className="p-2">{it.unitPrice.toLocaleString()}</td>
                          <td className="p-2 font-bold">{(it.quantity * it.unitPrice).toLocaleString()}</td>
                          <td className="p-2">
                            <button onClick={() => removeLine(i)} className="text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <label className="block">
                  <span className="text-xs text-slate-600 block mb-1">تخفیف (%)</span>
                  <input type="number" value={editing.discountPercent} onChange={(e) => setEditing({ ...editing, discountPercent: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-600 block mb-1">مالیات (%)</span>
                  <input type="number" value={editing.taxPercent} onChange={(e) => setEditing({ ...editing, taxPercent: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-600 block mb-1">هزینه ارسال</span>
                  <input type="number" value={editing.shippingCost} onChange={(e) => setEditing({ ...editing, shippingCost: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" dir="ltr" />
                </label>
              </div>

              <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm space-y-1">
                <div className="flex justify-between"><span>جمع اقلام:</span><b>{subtotal.toLocaleString()}</b></div>
                <div className="flex justify-between text-rose-600"><span>تخفیف:</span><b>{discount.toLocaleString()}</b></div>
                <div className="flex justify-between text-amber-600"><span>مالیات:</span><b>{tax.toLocaleString()}</b></div>
                <div className="flex justify-between text-lg text-emerald-700 border-t pt-1"><span>قابل پرداخت:</span><b>{total.toLocaleString()} ریال</b></div>
              </div>
            </div>

            <div className="p-4 border-t flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">لغو</button>
              <button onClick={save} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg">ذخیره</button>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8" dir="rtl">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold flex items-center gap-2"><FileText className="w-4 h-4" /> پیش‌نمایش فاکتور</h3>
              <button onClick={() => setPreview(null)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div id="invoice-print-area" className="p-6">
              <h2 className="text-center text-lg font-bold mb-4">فاکتور {preview.type} — {preview.number}</h2>
              <div className="text-sm mb-3">مشتری: <b>{preview.contactName}</b> | تاریخ: {preview.date}</div>
              <table className="w-full text-xs border">
                <thead className="bg-slate-100">
                  <tr><th className="p-2 border">کالا</th><th className="p-2 border">تعداد</th><th className="p-2 border">قیمت</th><th className="p-2 border">جمع</th></tr>
                </thead>
                <tbody>
                  {preview.items.map((it, i) => (
                    <tr key={i}>
                      <td className="p-2 border">{it.productName}</td>
                      <td className="p-2 border">{it.quantity} {it.unit}</td>
                      <td className="p-2 border">{it.unitPrice.toLocaleString()}</td>
                      <td className="p-2 border">{(it.quantity * it.unitPrice).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 text-left text-sm">
                <div>قابل پرداخت: <b>{invoiceTotal(preview.items, preview.discountPercent, preview.taxPercent, preview.shippingCost).toLocaleString()} ریال</b></div>
              </div>
            </div>
            <div className="p-4 border-t flex gap-3 justify-end">
              <button onClick={() => window.print()} className="px-4 py-2 bg-slate-700 text-white text-sm rounded-lg flex items-center gap-2">
                <Printer className="w-4 h-4" /> چاپ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesModule;
