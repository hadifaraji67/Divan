import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, ShoppingCart, FileText, Package,
  Printer, Wallet, BookOpen, CheckSquare, BarChart3, Calendar,
  Smartphone, MessageSquare, Settings, ChevronDown, X,
  TrendingUp, CreditCard, Search, Star,
} from 'lucide-react';

export type ViewKey =
  | 'home' | 'contacts'
  | 'invoice' | 'invoices' | 'inventory' | 'invoice-print'
  | 'customer-ledger' | 'cheques' | 'journal-entry'
  | 'financial-reports' | 'fiscal-year-closing'
  | 'reports' | 'finance' | 'payments'
  | 'sms-import' | 'settings';

interface MenuItem { key: ViewKey; title: string; icon: React.ElementType; badge?: string; }
interface MenuGroup { id: string; title: string; icon: React.ElementType; items: MenuItem[]; }

const menuGroups: MenuGroup[] = [
  { id: 'dashboard', title: 'داشبورد', icon: LayoutDashboard, items: [
    { key: 'home', title: 'صفحه اصلی', icon: LayoutDashboard },
    { key: 'contacts', title: 'اشخاص و مشتریان', icon: Users },
  ]},
  { id: 'sales', title: 'فروش و انبار', icon: ShoppingCart, items: [
    { key: 'invoices', title: 'مدیریت فاکتورها', icon: FileText },
    { key: 'invoice', title: 'صدور سریع', icon: FileText },
    { key: 'inventory', title: 'انبار و کالا', icon: Package },
    { key: 'invoice-print', title: 'تنظیمات چاپ', icon: Printer },
    { key: 'payments', title: 'پرداخت‌ها', icon: CreditCard },
  ]},
  { id: 'finance', title: 'حسابداری', icon: Wallet, items: [
    { key: 'journal-entry', title: 'ثبت سند دستی', icon: FileText },
    { key: 'financial-reports', title: 'گزارش‌های مالی', icon: BarChart3 },
    { key: 'customer-ledger', title: 'دفتر معین', icon: BookOpen },
    { key: 'cheques', title: 'چک‌ها', icon: CheckSquare },
    { key: 'reports', title: 'گزارش‌های جامع', icon: TrendingUp },
    { key: 'finance', title: 'پنل مالی', icon: Wallet },
    { key: 'fiscal-year-closing', title: 'بستن سال مالی', icon: Calendar },
  ]},
  { id: 'tools', title: 'ابزارها', icon: Smartphone, items: [
    { key: 'sms-import', title: 'استخراج پیامک بانکی', icon: MessageSquare },
    { key: 'settings', title: 'تنظیمات سیستم', icon: Settings },
  ]},
];

interface SidebarProps {
  active: ViewKey;
  onSelect: (key: ViewKey) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ active, onSelect, isOpen, onClose }) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    dashboard: true, sales: true, finance: true, tools: false,
  });
  const [query, setQuery] = useState('');

  useEffect(() => {
    const groupOf = menuGroups.find(g => g.items.some(i => i.key === active));
    if (groupOf) setOpenGroups(p => ({ ...p, [groupOf.id]: true }));
  }, [active]);

  const toggle = (id: string) => setOpenGroups(p => ({ ...p, [id]: !p[id] }));
  const select = (k: ViewKey) => { onSelect(k); onClose(); };

  const q = query.trim();
  const filteredGroups = q
    ? menuGroups.map(g => ({
        ...g,
        items: g.items.filter(i => i.title.includes(q)),
      })).filter(g => g.items.length > 0)
    : menuGroups;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-[fadeIn_0.15s_ease-out]"
          onClick={onClose}
        />
      )}

      <aside
        className={`w-72 md:w-64 h-screen flex-col shrink-0 z-50
          border-l transition-transform duration-200
          ${isOpen ? 'flex fixed right-0 top-0 translate-x-0' : 'hidden'} md:flex md:relative md:translate-x-0
        `}
        style={{
          background: 'var(--sidebar-bg, #0f172a)',
          color: 'var(--sidebar-fg, #e2e8f0)',
          borderColor: 'var(--sidebar-border, #1e293b)',
        }}
      >
        {/* لوگو */}
        <div className="flex items-center justify-between px-4 h-16 shrink-0 border-b" style={{ borderColor: 'inherit' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Star className="w-5 h-5 text-white" fill="white" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold">دیوان</div>
              <div className="text-[10px] opacity-60">سامانه جامع</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* جستجو */}
        <div className="px-3 py-3 shrink-0">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی منو..."
              className="w-full pr-9 pl-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 focus:border-indigo-400/50 focus:outline-none transition-colors"
              style={{ color: 'inherit' }}
            />
          </div>
        </div>

        {/* منو */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5">
          {filteredGroups.map((group) => {
            const GroupIcon = group.icon;
            const isOpenGroup = openGroups[group.id] || !!q;
            return (
              <div key={group.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggle(group.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  <div className="flex items-center gap-2.5">
                    <GroupIcon className="w-4 h-4 text-indigo-400" />
                    <span className="opacity-95">{group.title}</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 opacity-50 transition-transform duration-200 ${isOpenGroup ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpenGroup && (
                  <div className="space-y-0.5 pr-2">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = active === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => select(item.key)}
                          className={`w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150 group
                            ${isActive
                              ? 'bg-gradient-to-l from-indigo-500/20 to-indigo-500/5 text-white font-bold border-r-2 border-indigo-400'
                              : 'opacity-70 hover:opacity-100 hover:bg-white/5'
                            }`}
                        >
                          <ItemIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'group-hover:text-indigo-400'} transition-colors`} />
                          <span className="truncate">{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {filteredGroups.length === 0 && (
            <div className="text-center text-xs opacity-50 py-8">چیزی پیدا نشد</div>
          )}
        </nav>

        {/* فوتر */}
        <div className="px-4 py-3 border-t text-[10px] opacity-50 text-center shrink-0" style={{ borderColor: 'inherit' }}>
          نسخه ۳.۱.۶
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
