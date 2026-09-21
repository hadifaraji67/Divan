import React, { useEffect, useState, useMemo } from 'react';
import {
  Search, FileText, Users, Package, Wallet, CreditCard, Calendar,
  BarChart3, Settings, Home, X, Hash, CircleDollarSign, TrendingUp,
} from 'lucide-react';
import { loadData } from '../../lib/storage';
import type { Contact, Product, Invoice, Payment } from '../../types/models';
import type { ViewKey } from '../layout/Sidebar';

interface Props {
  open: boolean;
  onClose: () => void;
  onNavigate: (view: ViewKey, data?: any) => void;
}

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  category: 'navigation' | 'contact' | 'product' | 'invoice' | 'payment';
  action: () => void;
  keywords?: string;
}

export const CommandPalette: React.FC<Props> = ({ open, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  // بارگذاری داده
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!open) return;
    setContacts(loadData<Contact[]>('contacts', []));
    setProducts(loadData<Product[]>('products', []));
    setInvoices(loadData<Invoice[]>('invoices', []));
    setPayments(loadData<Payment[]>('payments', []));
  }, [open]);

  // reset
  useEffect(() => {
    if (open) {
      setQuery('');
    }
  }, [open]);

  // ─── آیتم‌های ناوبری ───
  const navItems: CommandItem[] = [
    { id: 'nav-dashboard', label: 'داشبورد', icon: Home, category: 'navigation', action: () => { onNavigate('home'); onClose(); }, keywords: 'خانه' },
    { id: 'nav-contacts', label: 'مشتریان', icon: Users, category: 'navigation', action: () => { onNavigate('contacts'); onClose(); }, keywords: 'اشخاص' },
    { id: 'nav-invoices', label: 'فاکتورها', icon: FileText, category: 'navigation', action: () => { onNavigate('invoices'); onClose(); }, keywords: 'صورتحساب' },
    { id: 'nav-products', label: 'کالاها', icon: Package, category: 'navigation', action: () => { onNavigate('inventory'); onClose(); }, keywords: 'انبار محصول' },
    { id: 'nav-payments', label: 'پرداخت‌ها', icon: Wallet, category: 'navigation', action: () => { onNavigate('payments'); onClose(); }, keywords: 'دریافت' },
    { id: 'nav-cheques', label: 'چک‌ها', icon: CreditCard, category: 'navigation', action: () => { onNavigate('cheques'); onClose(); }, keywords: 'چک' },
    { id: 'nav-installments', label: 'اقساط', icon: Calendar, category: 'navigation', action: () => { onNavigate('installments'); onClose(); }, keywords: 'قسط' },
    { id: 'nav-reports', label: 'گزارش‌ها', icon: BarChart3, category: 'navigation', action: () => { onNavigate('reports-hub'); onClose(); }, keywords: 'تحلیل' },
    { id: 'nav-settings', label: 'تنظیمات', icon: Settings, category: 'navigation', action: () => { onNavigate('settings'); onClose(); }, keywords: 'پیکربندی' },
  ];

  // ─── جستجو در داده‌ها ───
  const dataItems = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];

    const q = query.trim().toLowerCase();
    const items: CommandItem[] = [];

    // مشتریان
    contacts
      .filter((c) => 
        c.name?.toLowerCase().includes(q) ||
        c.mobile?.includes(q) ||
        c.phone?.includes(q) ||
        c.companyName?.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .forEach((c) => {
        items.push({
          id: `contact-${c.id}`,
          label: c.name || 'مشتری',
          description: [c.mobile, c.phone, c.companyName].filter(Boolean).join(' • '),
          icon: Users,
          category: 'contact',
          action: () => {
            onNavigate('contacts', { editId: c.id });
            onClose();
          },
        });
      });

    // کالاها
    products
      .filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.barcode?.includes(q) ||
        p.category?.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .forEach((p) => {
        items.push({
          id: `product-${p.id}`,
          label: p.name || 'کالا',
          description: [p.sku, p.category, p.barcode].filter(Boolean).join(' • '),
          icon: Package,
          category: 'product',
          action: () => {
            onNavigate('inventory', { editId: p.id });
            onClose();
          },
        });
      });

    // فاکتورها
    invoices
      .filter((i) =>
        i.number?.includes(q) ||
        i.contactName?.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .forEach((i) => {
        items.push({
          id: `invoice-${i.id}`,
          label: `فاکتور ${i.number || ''}`,
          description: [i.contactName, i.date, i.type].filter(Boolean).join(' • '),
          icon: FileText,
          category: 'invoice',
          action: () => {
            onNavigate('invoices', { previewId: i.id });
            onClose();
          },
        });
      });

    // پرداخت‌ها
    payments
      .filter((p) =>
        p.contactName?.toLowerCase().includes(q) ||
        p.id?.includes(q)
      )
      .slice(0, 5)
      .forEach((p) => {
        items.push({
          id: `payment-${p.id}`,
          label: `پرداخت ${p.id || ''}`,
          description: [p.contactName, p.amount?.toLocaleString('fa-IR')].filter(Boolean).join(' • '),
          icon: Wallet,
          category: 'payment',
          action: () => {
            onNavigate('payments', { editId: p.id });
            onClose();
          },
        });
      });

    return items;
  }, [query, contacts, products, invoices, payments, onNavigate, onClose]);

  // ─── فیلتر nav با query ───
  const filteredNav = useMemo(() => {
    if (!query.trim()) return navItems;
    const q = query.trim().toLowerCase();
    return navItems.filter((item) =>
      item.label.toLowerCase().includes(q) ||
      item.keywords?.toLowerCase().includes(q)
    );
  }, [query, navItems]);

  // ─── کیبورد ───
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const groupedData = {
    contact: dataItems.filter((i) => i.category === 'contact'),
    product: dataItems.filter((i) => i.category === 'product'),
    invoice: dataItems.filter((i) => i.category === 'invoice'),
    payment: dataItems.filter((i) => i.category === 'payment'),
  };

  const hasData = dataItems.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-[10vh] px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Search Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در همه‌جا... (مشتری، کالا، فاکتور)"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"
            dir="rtl"
          />
          <kbd className="hidden sm:block text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {/* Navigation */}
          {filteredNav.length > 0 && (
            <Section title="پیمایش">
              {filteredNav.map((item) => (
                <CommandRow key={item.id} item={item} />
              ))}
            </Section>
          )}

          {/* Data Results */}
          {hasData && (
            <>
              {groupedData.contact.length > 0 && (
                <Section title="مشتریان">
                  {groupedData.contact.map((item) => (
                    <CommandRow key={item.id} item={item} />
                  ))}
                </Section>
              )}

              {groupedData.product.length > 0 && (
                <Section title="کالاها">
                  {groupedData.product.map((item) => (
                    <CommandRow key={item.id} item={item} />
                  ))}
                </Section>
              )}

              {groupedData.invoice.length > 0 && (
                <Section title="فاکتورها">
                  {groupedData.invoice.map((item) => (
                    <CommandRow key={item.id} item={item} />
                  ))}
                </Section>
              )}

              {groupedData.payment.length > 0 && (
                <Section title="پرداخت‌ها">
                  {groupedData.payment.map((item) => (
                    <CommandRow key={item.id} item={item} />
                  ))}
                </Section>
              )}
            </>
          )}

          {/* No results */}
          {query.trim().length >= 2 && !hasData && filteredNav.length === 0 && (
            <div className="text-center py-8 text-xs opacity-50">
              نتیجه‌ای برای «{query}» پیدا نشد
            </div>
          )}

          {/* Hint */}
          {!query.trim() && (
            <div className="text-center py-6 text-[11px] opacity-40 leading-relaxed">
              برای جستجو تایپ کنید — مشتری، کالا، فاکتور، پرداخت
              <br />
              <span className="text-[10px]">حداقل ۲ کاراکتر برای جستجوی دقیق</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 text-[10px] opacity-60">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
              ↑↓
            </kbd>
            <span>پیمایش</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
              Enter
            </kbd>
            <span>انتخاب</span>
          </div>
          <div className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            {dataItems.length + filteredNav.length} نتیجه
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════ Sub Components ═══════════ */

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-1">
    <div className="text-[10px] font-bold opacity-40 px-3 py-2 uppercase">
      {title}
    </div>
    {children}
  </div>
);

const CommandRow: React.FC<{ item: CommandItem }> = ({ item }) => {
  const Icon = item.icon;

  return (
    <button
      onClick={item.action}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-right hover:bg-indigo-500/10 dark:hover:bg-indigo-500/10 transition-colors group"
    >
      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20">
        <Icon className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold truncate">{item.label}</div>
        {item.description && (
          <div className="text-[11px] opacity-50 truncate">{item.description}</div>
        )}
      </div>
    </button>
  );
};

export default CommandPalette;
