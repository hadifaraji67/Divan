import React, { useState, useEffect, useMemo } from 'react';
import {ArrowRightLeft, Edit, FileText, Filter, Package, Plus, Printer, Search, Trash2, Users, X, QrCode } from 'lucide-react';
import { InvoiceQRScanner } from '../print/InvoiceQRScanner';
import { RBACGate } from '../shared/RBACGate';
import type { Invoice, InvoiceLine, Contact, Product, InvoiceType } from '../../types/models';
import { invoiceSubtotal, invoiceDiscount, invoiceTax, invoiceTotal, INVOICE_TYPES, invoiceTypeLabel, invoiceTypeRole } from '../../types/models';
import { loadData, saveData, genId } from '../../lib/storage';
import { notify } from '../../lib/toast';
import { JalaliDatePicker } from '../shared/JalaliDatePicker';
import { InvoicePrintPro } from '../print/InvoicePrintPro';
import { applyInvoiceEffects, convertToFinalInvoice, paymentFromInvoice } from '../../lib/invoice-logic';
import { getInvoicePaymentInfo, payStatusLabel, payStatusColor, payStatusEmoji } from '../../lib/invoice-payment';
import type { Payment } from '../../types/models';
import { ArchiveToggle, VoidedItemCard, VoidConfirmDialog } from '../shared/Archive';
import { createInvoiceJournalEntry } from '../../lib/accounting';
import type { JournalEntry } from '../../types/accounting';
import { calculateLineTotal } from '../../lib/format';
import { useFormDraft } from '../../lib/use-form-draft';
import { logActivity } from '../../lib/activity-log';
import { useBulkSelect } from '../../lib/use-bulk-select';
import { BulkActionsBar } from '../shared/BulkActionsBar';

const empty = (): Invoice => ({
  id: '', number: '', type: 'فروش', date: new Date().toLocaleDateString('fa-IR'),
  contactId: '', contactName: '', items: [], discountPercent: 0, taxPercent: 9,
  shippingCost: 0, notes: '', createdAt: '',
});

const TYPE_COLORS: Record<string, string> = {
  'فروش': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'پیش‌فاکتور فروش': 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'خرید': 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  'پیش‌فاکتور خرید': 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  'برگشت از فروش': 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
};

const PREFIXES: Record<InvoiceType, string> = {
  'فروش': 'INV-',
  'پیش‌فاکتور فروش': 'PF-',
  'خرید': 'PUR-',
  'پیش‌فاکتور خرید': 'PPF-',
  'برگشت از فروش': 'RET-',
};

type Props = { filterType?: InvoiceType };
export const InvoicesModule: React.FC<Props> = ({ filterType }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<InvoiceType | 'all'>(filterType ?? 'all');
  const [showForm, setShowForm] = useState(false);
  const [showQRScan, setShowQRScan] = useState(false);
  const [editing, setEditing] = useState<Invoice>(empty());
  const [preview, setPreview] = useState<Invoice | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [voidTarget, setVoidTarget] = useState<Invoice | null>(null);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [withPayment, setWithPayment] = useState(false);
  const [payType, setPayType] = useState<'نقد' | 'کارت' | 'چک'>('نقد');
  const [payAmount, setPayAmount] = useState(0);

  // Auto-save draft فرم فاکتور
  const invoiceDraft = useFormDraft<Invoice>(
    'invoice_new',
    editing,
    showForm,
    (draft) => setEditing(draft),
  );

  useEffect(() => {
    setInvoices(loadData<Invoice[]>('invoices', []));
    setContacts(loadData<Contact[]>('contacts', []));
    setProducts(loadData<Product[]>('products', []));
    setAllPayments(loadData<Payment[]>('payments', []));
  }, []);

  // رفرش پرداخت‌ها هر بار که فاکتورها تغییر کنند
  useEffect(() => {
    setAllPayments(loadData<Payment[]>('payments', []));
  }, [invoices]);
  useEffect(() => { saveData('invoices', invoices); }, [invoices]);

  const filtered = useMemo(() => {
    let list = showArchived ? invoices.filter(i => i.void) : invoices.filter(i => !i.void);
    if (typeFilter !== 'all') list = list.filter(i => i.type === typeFilter);
    if (search.trim()) {
      const q = search.trim();
      list = list.filter(i => i.number.includes(q) || i.contactName.includes(q));
    }
    return [...list].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [invoices, search, typeFilter, showArchived]);

  const bulk = useBulkSelect(filtered, (inv) => inv.id);

  const stats = useMemo(() => {
    const count = (t: InvoiceType) => invoices.filter(i => i.type === t).length;
    return {
      sale: count('فروش'),
      preSale: count('پیش‌فاکتور فروش'),
      purchase: count('خرید'),
      prePurchase: count('پیش‌فاکتور خرید'),
      ret: count('برگشت از فروش'),
      total: invoices.length,
    };
  }, [invoices]);

  // مشتریان مناسب بر اساس نوع
  const eligibleContacts = useMemo(() => {
    const role = invoiceTypeRole(editing.type);
    return contacts.filter(c => c.roles.includes(role as any));
  }, [contacts, editing.type]);

  const openNew = (type?: InvoiceType) => {
    const inv = empty();
    inv.id = genId();
    inv.type = type || 'فروش';
    inv.number = PREFIXES[inv.type] + String(invoices.filter(i => i.type === inv.type).length + 1).padStart(4, '0');
    inv.createdAt = new Date().toISOString();
    inv.contactId = contacts.find(c => c.roles.includes(invoiceTypeRole(inv.type) as any))?.id || '';
    setEditing(inv);
    setWithPayment(false);
    setPayAmount(0);
    setShowForm(true);
  };

  const openEdit = (inv: Invoice) => { setEditing({ ...inv }); setShowForm(true); };

  const handleVoid = (reason: string) => {
    if (!voidTarget) return;
    setInvoices(prev => prev.map(i =>
      i.id === voidTarget.id
        ? { ...i, void: true, voidedAt: new Date().toISOString(), voidedReason: reason }
        : i
    ));
    logActivity('void', 'invoice', {
      entityId: voidTarget.id,
      entityLabel: voidTarget.number,
      summary: `باطل کردن فاکتور ${voidTarget.number}`,
      details: { reason },
    });
    notify.success('فاکتور باطل شد');
    setVoidTarget(null);
  };

  const handleRestore = (id: string) => {
    if (!confirm('این فاکتور بازگردانی شود؟')) return;
    setInvoices(prev => prev.map(i =>
      i.id === id ? { ...i, void: false, voidedAt: undefined, voidedReason: undefined } : i
    ));
    const target = invoices.find(i => i.id === id);
    logActivity('restore', 'invoice', {
      entityId: id,
      entityLabel: target?.number,
      summary: target ? `بازگردانی فاکتور ${target.number}` : 'بازگردانی فاکتور',
    });
    notify.success('فاکتور بازگردانی شد');
  };
  const handleBulkDelete = () => {
    const count = bulk.count;
    if (count === 0) return;
    if (!confirm(`حذف ${count} فاکتور؟`)) return;
    const ids = new Set(bulk.selected);
    setInvoices(prev => prev.filter(i => !ids.has(i.id)));
    logActivity('delete', 'invoice', {
      summary: `حذف گروهی ${count} فاکتور`,
      details: { count },
    });
    bulk.clear();
  };


  const save = () => {
    if (!editing.contactId) { notify.warning('شخص را انتخاب کن'); return; }
    if (editing.items.length === 0) { notify.warning('حداقل یک قلم اضافه کن'); return; }
    const c = contacts.find(x => x.id === editing.contactId);
    const inv = { ...editing, contactName: c ? (c.type === 'حقوقی' ? c.companyName || c.name : `${c.name} ${c.lastName || ''}`) : '' };
    const isNew = !invoices.find(i => i.id === inv.id);
    setInvoices(prev => isNew ? [...prev, inv] : prev.map(i => i.id === inv.id ? inv : i));

    // Activity Log
    logActivity(
      isNew ? 'create' : 'update',
      'invoice',
      {
        entityId: inv.id,
        entityLabel: inv.number,
        summary: isNew
          ? `ایجاد ${inv.type} ${inv.number} برای ${inv.contactName}`
          : `ویرایش ${inv.type} ${inv.number}`,
        amount: inv.items.reduce((s, it) => s + (it.quantity || 0) * (it.unitPrice || 0), 0),
      },
    );

    if (isNew) {
      // اضافه کردن پرداخت اگر لازم است
      let payments: Payment[] | undefined;
      let cheques: any[] | undefined;
      if (withPayment && payAmount > 0) {
        const newPayment = paymentFromInvoice(inv, payAmount, payType);
        payments = [newPayment];

        // اگر چک بود، به cheques هم اضافه کن
        if (payType === 'چک') {
          cheques = [{
            id: newPayment.id + '-chq',
            contactId: inv.contactId,
            contactName: inv.contactName,
            bankName: '',
            chequeNumber: newPayment.refCode || '',
            amount: payAmount,
            dueDate: inv.dueDate || inv.date,
            direction: inv.type === 'خرید' || inv.type === 'پیش‌فاکتور خرید' ? 'پرداختی' : 'دریافتی',
            status: 'در جریان',
            notes: `بابت فاکتور ${inv.number}`,
            createdAt: new Date().toISOString(),
          }];
        }
      }

      applyInvoiceEffects(inv, payments, cheques);

      // ساخت سند حسابداری خودکار (به جز پیش‌فاکتورها)
      if (!inv.type.includes('پیش‌فاکتور')) {
        const entries = loadData<JournalEntry[]>('journal_entries', []);
        const je = createInvoiceJournalEntry(inv, entries.length + 1);
        if (je && je.lines && je.lines.length > 0) {
          saveData('journal_entries', [...entries, je]);
          notify.info(`سند حسابداری #${je.entryNumber} ساخته شد`);
        }
      }

      const effect = INVOICE_TYPES.find(t => t.value === inv.type)?.effect;
      if (withPayment && payAmount > 0) {
        notify.success(`فاکتور ثبت شد + پرداخت ${payAmount.toLocaleString()} ریال ثبت گردید`);
      } else if (effect === 'decrease') {
        notify.success('فاکتور ثبت شد و موجودی انبار کسر شد');
      } else if (effect === 'increase') {
        notify.success('فاکتور ثبت شد و موجودی انبار افزایش یافت');
      } else {
        notify.success('پیش‌فاکتور ذخیره شد');
      }

      // رفرش لیست پرداخت‌ها
      setAllPayments(loadData<Payment[]>('payments', []));
    } else {
      notify.success('فاکتور به‌روزرسانی شد');
    }
    setShowForm(false);
    invoiceDraft.clearDraft();
  };

  const convert = (inv: Invoice) => {
    if (!confirm('این پیش‌فاکتور به فاکتور قطعی تبدیل شود؟')) return;
    const newInv = convertToFinalInvoice(inv);
    setInvoices(prev => [newInv, ...prev]);
    applyInvoiceEffects(newInv);
    notify.success(`تبدیل شد به ${newInv.type}`);
  };

  const addLine = (productId: string, qty: number) => {
    const p = products.find(x => x.id === productId);
    if (!p || qty <= 0) return;
    const line: InvoiceLine = {
      productId: p.id, productCode: p.sku, productName: p.name,
      description: p.description || '', unit: p.unit,
      quantity: qty, unitPrice: p.sellPrice, discountPercent: 0, taxPercent: p.taxPercent,
    };
    setEditing({ ...editing, items: [...editing.items, line] });
  };

  const removeLine = (i: number) => setEditing({ ...editing, items: editing.items.filter((_, idx) => idx !== i) });

  const updateLine = (i: number, patch: Partial<InvoiceLine>) => {
    setEditing({ ...editing, items: editing.items.map((it, idx) => idx === i ? { ...it, ...patch } : it) });
  };

  useEffect(() => {
    if (withPayment && payAmount === 0) {
      const t = invoiceTotal(editing.items, editing.discountPercent, editing.taxPercent, editing.shippingCost);
      setPayAmount(t);
    }
  }, [withPayment, editing.items.length]);

  const subtotal = invoiceSubtotal(editing.items);
  const discount = invoiceDiscount(editing.items, editing.discountPercent);
  const tax = invoiceTax(editing.items, editing.discountPercent, editing.taxPercent);
  const total = invoiceTotal(editing.items, editing.discountPercent, editing.taxPercent, editing.shippingCost);



  return (
    <div className="space-y-4" dir="rtl">
      {showQRScan && (
        <InvoiceQRScanner onClose={() => setShowQRScan(false)} />
      )}

      {/* کارت‌های آمار */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <StatCard label="فروش" count={stats.sale} color="emerald" onClick={() => setTypeFilter('فروش')} active={typeFilter === 'فروش'} />
        <StatCard label="پیش‌فاکتور فروش" count={stats.preSale} color="amber" onClick={() => setTypeFilter('پیش‌فاکتور فروش')} active={typeFilter === 'پیش‌فاکتور فروش'} />
        <StatCard label="خرید" count={stats.purchase} color="rose" onClick={() => setTypeFilter('خرید')} active={typeFilter === 'خرید'} />
        <StatCard label="پیش‌فاکتور خرید" count={stats.prePurchase} color="sky" onClick={() => setTypeFilter('پیش‌فاکتور خرید')} active={typeFilter === 'پیش‌فاکتور خرید'} />
        <StatCard label="برگشت از فروش" count={stats.ret} color="violet" onClick={() => setTypeFilter('برگشت از فروش')} active={typeFilter === 'برگشت از فروش'} />
      </div>

      {typeFilter !== 'all' && (
        <button onClick={() => setTypeFilter('all')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
          ← نمایش همه ({stats.total})
        </button>
      )}

      {/* نوار جستجو */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو..."
            className="w-full pr-10 pl-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900" />
        </div>
        <ArchiveToggle
          showArchived={showArchived}
          onChange={setShowArchived}
          activeCount={invoices.filter(i => !i.void).length}
          voidedCount={invoices.filter(i => i.void).length}
        />
        <button onClick={() => openNew('فروش')} className="flex items-center gap-1.5 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg">
          <Plus className="w-3.5 h-3.5" /> فاکتور فروش
        </button>
        <button onClick={() => openNew('خرید')} className="flex items-center gap-1.5 px-3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg">
          <Plus className="w-3.5 h-3.5" /> فاکتور خرید
        </button>
      </div>

      {/* لیست */}
      <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3">
          {filtered.length > 0 && (
            <input
              type="checkbox"
              checked={bulk.allSelected}
              ref={(el) => { if (el) el.indeterminate = bulk.someSelected; }}
              onChange={bulk.toggleAll}
              className="w-4 h-4 rounded cursor-pointer"
            />
          )}
          <span>مجموع: {invoices.length} — نمایش: {filtered.length}</span>
        </div>
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">{invoices.length === 0 ? 'فاکتوری ثبت نشده' : 'چیزی پیدا نشد'}</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map(inv => {
              const t = invoiceTotal(inv.items, inv.discountPercent, inv.taxPercent, inv.shippingCost);
              const isPre = inv.type === 'پیش‌فاکتور فروش' || inv.type === 'پیش‌فاکتور خرید';
              const canConvert = isPre;
              
              if (showArchived) {
                return (
                  <VoidedItemCard
                    key={inv.id}
                    title={`${inv.number} — ${invoiceTypeLabel(inv.type)}`}
                    subtitle={inv.contactName}
                    amount={t}
                    amountUnit="ریال"
                    voidedAt={inv.voidedAt}
                    voidedReason={inv.voidedReason}
                    onRestore={() => handleRestore(inv.id)}
                  />
                );
              }
              
              return (
                <div key={inv.id} className={`p-4 flex flex-wrap gap-3 items-center justify-between ${bulk.isSelected(inv.id) ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                  <input
                    type="checkbox"
                    checked={bulk.isSelected(inv.id)}
                    onChange={() => bulk.toggle(inv.id)}
                    className="w-4 h-4 rounded cursor-pointer shrink-0"
                  />
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded">{inv.number}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${TYPE_COLORS[inv.type] || 'bg-slate-100'}`}>
                        {invoiceTypeLabel(inv.type)}
                      </span>
                      {(() => {
                        const info = getInvoicePaymentInfo(inv, allPayments);
                        const isPre = inv.type === 'پیش‌فاکتور فروش' || inv.type === 'پیش‌فاکتور خرید';
                        if (isPre) return null;
                        return (
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${payStatusColor(info.status)}`}>
                            {payStatusEmoji(info.status)} {payStatusLabel(info.status)}
                          </span>
                        );
                      })()}
                      <span className="text-xs text-slate-500">{inv.date}</span>
                    </div>
                    <div className="font-bold text-sm mt-1">{inv.contactName || '—'}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      اقلام: {inv.items.length} — مبلغ: <b className="text-indigo-600 dark:text-indigo-400">{t.toLocaleString()} ریال</b>
                    </div>
                    {(() => {
                      const info = getInvoicePaymentInfo(inv, allPayments);
                      const isPre = inv.type === 'پیش‌فاکتور فروش' || inv.type === 'پیش‌فاکتور خرید';
                      if (isPre || info.status === 'paid') return null;
                      return (
                        <div className="text-xs mt-1 text-rose-600 dark:text-rose-400 font-bold">
                          مانده: {info.remaining.toLocaleString()} ریال
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex gap-1">
                    {canConvert && (
                      <button onClick={() => convert(inv)} title="تبدیل به فاکتور قطعی"
                        className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600">
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => setPreview(inv)} title="چاپ"
                      className="p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-600">
                      <Printer className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEdit(inv)} title="ویرایش"
                      className="p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <RBACGate permission="invoice.void">{<button onClick={() => setVoidTarget(inv)} title="باطل کردن"
                      className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>}</RBACGate>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* فرم */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-3 md:p-4 overflow-y-auto" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl my-3 md:my-8">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold">{invoices.find(i => i.id === editing.id) ? 'ویرایش' : 'جدید'} — {invoiceTypeLabel(editing.type)}</h3>
              <button onClick={() => { setShowForm(false); invoiceDraft.clearDraft(); }} className="p-2 rounded-lg hover:bg-black/5"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="block md:col-span-2">
                <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1">نوع سند</span>
                <select value={editing.type}
                  onChange={(e) => {
                    const t = e.target.value as InvoiceType;
                    setEditing({ ...editing, type: t, number: PREFIXES[t] + String(invoices.filter(i => i.type === t).length + 1).padStart(4, '0') });
                  }}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900">
                  {INVOICE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label} ({t.role === 'مشتری' ? 'مشتری' : 'تامین‌کننده'})</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1">شماره</span>
                <input value={editing.number} onChange={(e) => setEditing({ ...editing, number: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900" dir="ltr" />
              </label>

              <label className="block">
                <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1">تاریخ</span>
                <JalaliDatePicker value={editing.date} onChange={(v: any) => setEditing({ ...editing, date: v })} />
              </label>

              <label className="block">
                <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1">سررسید (اختیاری)</span>
                <JalaliDatePicker value={editing.dueDate || ''} onChange={(v: any) => setEditing({ ...editing, dueDate: v })} />
              </label>

              <label className="block">
                <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                  {invoiceTypeRole(editing.type) === 'مشتری' ? 'مشتری *' : 'تامین‌کننده *'}
                </span>
                <select value={editing.contactId} onChange={(e) => setEditing({ ...editing, contactId: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900">
                  <option value="">— انتخاب —</option>
                  {eligibleContacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.type === 'حقوقی' ? c.companyName || c.name : `${c.name} ${c.lastName || ''}`} — {c.mobile}
                    </option>
                  ))}
                </select>
                {eligibleContacts.length === 0 && (
                  <div className="text-[10px] text-amber-600 mt-1">
                    ⚠️ هیچ {invoiceTypeRole(editing.type) === 'مشتری' ? 'مشتری' : 'تامین‌کننده‌ای'} وجود ندارد. ابتدا از منوی مشتریان اضافه کن.
                  </div>
                )}
              </label>
            </div>

            {/* اقلام */}
            <div className="px-4 pb-4">
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 flex flex-wrap gap-2 items-center">
                  <select id="prodSel" className="flex-1 min-w-[180px] p-2 border rounded-lg text-sm bg-white dark:bg-slate-900">
                    <option value="">— انتخاب کالا —</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} — {p.sellPrice.toLocaleString()} (موجودی: {p.stock})</option>)}
                  </select>
                  <input id="qtySel" type="number" defaultValue={1} min={1} className="w-20 p-2 border rounded-lg text-sm bg-white dark:bg-slate-900" />
                  <button onClick={() => {
                    const s = document.getElementById('prodSel') as HTMLSelectElement;
                    const q = document.getElementById('qtySel') as HTMLInputElement;
                    addLine(s.value, Number(q.value));
                    s.value = ''; q.value = '1';
                  }} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg">
                    افزودن
                  </button>
                </div>

                {editing.items.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">هنوز قلمی اضافه نشده</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                        <tr>
                          <th className="p-2 text-right">کالا</th>
                          <th className="p-2 text-center w-16">تعداد</th>
                          <th className="p-2 text-center w-20">قیمت</th>
                          <th className="p-2 text-center w-16">تخفیف٪</th>
                          <th className="p-2 text-center w-16">مالیات٪</th>
                          <th className="p-2 text-left w-24">جمع</th>
                          <th className="p-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {editing.items.map((it, i) => {
                          const { payable: lineTotal } = calculateLineTotal(it.quantity, it.unitPrice, it.discountPercent, it.taxPercent);
                          return (
                            <tr key={i}>
                              <td className="p-2">{it.productName}</td>
                              <td className="p-2">
                                <input type="number" value={it.quantity} onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })}
                                  className="w-14 p-1 border rounded text-center text-xs bg-white dark:bg-slate-900" />
                              </td>
                              <td className="p-2">
                                <input type="number" value={it.unitPrice} onChange={(e) => updateLine(i, { unitPrice: Number(e.target.value) })}
                                  className="w-20 p-1 border rounded text-center text-xs bg-white dark:bg-slate-900" dir="ltr" />
                              </td>
                              <td className="p-2">
                                <input type="number" value={it.discountPercent} onChange={(e) => updateLine(i, { discountPercent: Number(e.target.value) })}
                                  className="w-12 p-1 border rounded text-center text-xs bg-white dark:bg-slate-900" />
                              </td>
                              <td className="p-2">
                                <input type="number" value={it.taxPercent} onChange={(e) => updateLine(i, { taxPercent: Number(e.target.value) })}
                                  className="w-12 p-1 border rounded text-center text-xs bg-white dark:bg-slate-900" />
                              </td>
                              <td className="p-2 font-bold text-left font-mono">{lineTotal.toLocaleString()}</td>
                              <td className="p-2">
                                <button onClick={() => removeLine(i)} className="text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <label className="block">
                  <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1">تخفیف کل (%)</span>
                  <input type="number" value={editing.discountPercent} onChange={(e) => setEditing({ ...editing, discountPercent: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-900" dir="ltr" />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1">مالیات (%)</span>
                  <input type="number" value={editing.taxPercent} onChange={(e) => setEditing({ ...editing, taxPercent: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-900" dir="ltr" />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1">هزینه ارسال</span>
                  <input type="number" value={editing.shippingCost} onChange={(e) => setEditing({ ...editing, shippingCost: Number(e.target.value) })}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-900" dir="ltr" />
                </label>
              </div>

              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm space-y-1">
                <div className="flex justify-between"><span>جمع اقلام:</span><b>{subtotal.toLocaleString()}</b></div>
                <div className="flex justify-between text-rose-600"><span>تخفیف:</span><b>{discount.toLocaleString()}</b></div>
                <div className="flex justify-between text-amber-600"><span>مالیات:</span><b>{tax.toLocaleString()}</b></div>
                <div className="flex justify-between text-lg text-emerald-700 dark:text-emerald-400 border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                  <span>قابل پرداخت:</span><b>{total.toLocaleString()} ریال</b>
                </div>
              </div>

              {editing.type === 'پیش‌فاکتور فروش' || editing.type === 'پیش‌فاکتور خرید' ? (
                <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-400">
                  ⓘ این یک پیش‌فاکتور است — موجودی انبار تغییر نمی‌کند. بعد از تأیید می‌توانید آن را به فاکتور قطعی تبدیل کنید.
                </div>
              ) : null}

              {/* بخش پرداخت */}
              {!editing.type.includes('پیش‌فاکتور') && (
                <div className="mt-3 p-3 rounded-xl border-2 border-dashed border-emerald-500/30 bg-emerald-500/5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={withPayment}
                      onChange={(e) => {
                        setWithPayment(e.target.checked);
                        if (e.target.checked) setPayAmount(total);
                        else setPayAmount(0);
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      💰 پرداخت همراه با صدور فاکتور
                    </span>
                  </label>

                  {withPayment && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <label className="block">
                        <span className="text-xs opacity-60 block mb-1">نوع پرداخت</span>
                        <select
                          value={payType}
                          onChange={(e) => setPayType(e.target.value as any)}
                          className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-900"
                        >
                          <option value="نقد">نقد</option>
                          <option value="کارت">کارت</option>
                          <option value="چک">چک</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-xs opacity-60 block mb-1">مبلغ پرداختی</span>
                        <input
                          type="number"
                          value={payAmount}
                          onChange={(e) => setPayAmount(Number(e.target.value))}
                          className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-900"
                          dir="ltr"
                        />
                      </label>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => setPayAmount(total)}
                          className="w-full p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                        >
                          پرداخت کامل ({total.toLocaleString()})
                        </button>
                      </div>
                      <div className="md:col-span-3 text-xs p-2 rounded-lg bg-black/5 dark:bg-white/5 flex justify-between">
                        <span>مانده پس از پرداخت:</span>
                        <b className={Math.max(0, total - payAmount) > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                          {Math.max(0, total - payAmount).toLocaleString()} ریال
                        </b>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm hover:bg-black/5 rounded-lg">لغو</button>
              <button onClick={save} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg">
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* دیالوگ تایید باطل کردن */}
      <VoidConfirmDialog
        open={!!voidTarget}
        title={voidTarget ? `فاکتور ${voidTarget.number}` : ''}
        onConfirm={handleVoid}
        onCancel={() => setVoidTarget(null)}
      />

      {/* پیش‌نمایش */}
      {preview && (
        <InvoicePrintPro
          invoice={preview}
          contact={contacts.find(c => c.id === preview.contactId)}
          products={products}
          onClose={() => setPreview(null)}
        />
      )}
      <BulkActionsBar
        count={bulk.count}
        total={filtered.length}
        onClear={bulk.clear}
        onSelectAll={bulk.toggleAll}
        actions={[
          {
            label: 'حذف',
            icon: Trash2,
            onClick: handleBulkDelete,
            variant: 'danger',
          },
        ]}
      />

    </div>
  );
};

const StatCard: React.FC<{ label: string; count: number; color: string; onClick: () => void; active: boolean }> = ({ label, count, color, onClick, active }) => {
  const colors: any = {
    emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/40',
    amber: 'from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/40',
    rose: 'from-rose-500/10 to-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-500/40',
    sky: 'from-sky-500/10 to-sky-500/5 text-sky-600 dark:text-sky-400 border-sky-500/40',
    violet: 'from-violet-500/10 to-violet-500/5 text-violet-600 dark:text-violet-400 border-violet-500/40',
  };
  return (
    <button onClick={onClick} className={`p-3 rounded-xl border bg-gradient-to-br text-right transition-all ${active ? colors[color] + ' ring-2 ring-current/30' : 'from-transparent to-transparent border-slate-200 dark:border-slate-700 opacity-75 hover:opacity-100'}`}>
      <div className="text-[10px] opacity-70">{label}</div>
      <div className="text-xl font-bold mt-1">{count}</div>
    </button>
  );
};

export default InvoicesModule;
