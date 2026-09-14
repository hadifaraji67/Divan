import React, { useState } from 'react';
import {
  LayoutDashboard, Users, FileText, Package, Wallet,
  ChevronDown, X, Search, Star, Settings, BarChart3,
  CreditCard, CheckSquare, Calendar, ShoppingCart, ShoppingBag,
  Landmark, UserCog, Briefcase, Clock, Factory, ClipboardCheck,
  ArrowRightLeft, Truck, Banknote, Receipt, UserPlus,
} from 'lucide-react';
import { APP_VERSION } from '../lib/update-service';

export type ViewKey =
  // داشبورد
  | 'home'
  // چرخه فروش
  | 'contacts' | 'invoices' | 'payments' | 'cheques' | 'installments' | 'customer-club'
  // چرخه خرید
  | 'suppliers' | 'purchase-invoices' | 'supplier-payments'
  // انبار
  | 'inventory' | 'stock-movements' | 'stock-take'
  // مالی
  | 'journal-entry' | 'cash-box' | 'fiscal-year-closing'
  // گزارش‌ها
  | 'reports-hub'
  // منابع انسانی
  | 'employees' | 'payroll' | 'attendance'
  // پروژه‌ها و تولید
  | 'projects' | 'production'
  // سیستم
  | 'settings';

interface MenuItem {
  key: ViewKey;
  title: string;
  icon: React.ElementType;
  soon?: boolean;
}

interface MenuGroup {
  id: string;
  title: string;
  icon: React.ElementType;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    id: 'sales',
    title: 'فروش',
    icon: ShoppingCart,
    items: [
      { key: 'contacts', title: 'مشتریان', icon: Users },
      { key: 'invoices', title: 'فاکتورها', icon: FileText },
      { key: 'payments', title: 'پرداخت‌ها', icon: CreditCard },
      { key: 'cheques', title: 'چک‌ها', icon: CheckSquare },
      { key: 'installments', title: 'اقساط', icon: Calendar },
      { key: 'customer-club', title: 'باشگاه مشتریان', icon: Star },
    ],
  },
  {
    id: 'purchase',
    title: 'خرید',
    icon: ShoppingBag,
    items: [
      { key: 'suppliers', title: 'تامین‌کنندگان', icon: Truck, soon: true },
      { key: 'purchase-invoices', title: 'فاکتور خرید', icon: Receipt, soon: true },
      { key: 'supplier-payments', title: 'پرداخت به تامین‌کننده', icon: Banknote, soon: true },
    ],
  },
  {
    id: 'inventory',
    title: 'انبار و کالا',
    icon: Package,
    items: [
      { key: 'inventory', title: 'کالاها', icon: Package },
      { key: 'stock-movements', title: 'نقل و انتقال', icon: ArrowRightLeft, soon: true },
      { key: 'stock-take', title: 'انبارگردانی', icon: ClipboardCheck, soon: true },
    ],
  },
  {
    id: 'finance',
    title: 'مالی و حسابداری',
    icon: Wallet,
    items: [
      { key: 'journal-entry', title: 'اسناد حسابداری', icon: FileText },
      { key: 'cash-box', title: 'صندوق و بانک', icon: Landmark },
      { key: 'fiscal-year-closing', title: 'بستن سال مالی', icon: Calendar },
    ],
  },
  {
    id: 'reports',
    title: 'گزارش‌ها و تحلیل',
    icon: BarChart3,
    items: [
      { key: 'reports-hub', title: 'همه گزارش‌ها', icon: BarChart3 },
    ],
  },
  {
    id: 'hr',
    title: 'منابع انسانی',
    icon: UserCog,
    items: [
      { key: 'employees', title: 'پرسنل', icon: Users, soon: true },
      { key: 'payroll', title: 'حقوق و دستمزد', icon: Wallet, soon: true },
      { key: 'attendance', title: 'حضور و غیاب', icon: Clock, soon: true },
    ],
  },
  {
    id: 'projects',
    title: 'پروژه‌ها و تولید',
    icon: Briefcase,
    items: [
      { key: 'projects', title: 'پروژه‌ها', icon: Briefcase, soon: true },
      { key: 'production', title: 'تولید', icon: Factory, soon: true },
    ],
  },
  {
    id: 'system',
    title: 'مدیریت سیستم',
    icon: Settings,
    items: [
      { key: 'settings', title: 'تنظیمات', icon: Settings },
    ],
  },
];

interface SidebarProps {
  active: ViewKey;
  onSelect: (key: ViewKey) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ active, onSelect, isOpen, onClose }) => {
  // همه بسته به صورت پیش‌فرض
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);

  const toggle = (id: string) => {
    setOpenGroups(prev => {
      const isCurrentlyOpen = prev[id];
      // همه بسته، فقط این یکی
      const newState: Record<string, boolean> = {};
      for (const g of menuGroups) {
        newState[g.id] = g.id === id ? !isCurrentlyOpen : false;
      }
      return newState;
    });
  };

  const select = (k: ViewKey) => { onSelect(k); onClose(); };

  const q = query.trim();
  const filtered = q
    ? menuGroups
        .map(g => ({ ...g, items: g.items.filter(i => i.title.includes(q)) }))
        .filter(g => g.items.length > 0)
    : menuGroups;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          style={{ animation: 'fadeIn 0.12s ease-out' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`w-72 md:w-64 h-screen flex-col shrink-0 z-50 border-l
          ${isOpen ? 'flex fixed right-0 top-0' : 'hidden'} md:flex md:relative`}
        style={{
          background: '#0f172a',
          color: '#e2e8f0',
          borderColor: '#1e293b',
          transition: 'transform 0.14s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* لوگو */}
        <div className="flex items-center justify-between px-4 h-14 shrink-0 border-b" style={{ borderColor: 'inherit' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Star className="w-4 h-4 text-white" fill="white" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold">دیوان</div>
              <div className="text-[10px] opacity-50">سامانه جامع</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg hover:bg-white/10"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* داشبورد - همیشه بالا */}
        <div className="px-3 pt-3 pb-2 shrink-0">
          <button
            onClick={() => select('home')}
            className={`w-full text-right flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
              active === 'home'
                ? 'bg-indigo-500/15 text-white font-bold'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <LayoutDashboard className={`w-[18px] h-[18px] shrink-0 ${active === 'home' ? 'text-indigo-400' : ''}`} />
            <span>داشبورد</span>
          </button>
        </div>

        <div className="mx-3 mb-2 border-t border-white/5" />

        {/* جستجو */}
        <div className="px-3 pb-2 shrink-0">
          {!searchMode ? (
            <button
              onClick={() => setSearchMode(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>جستجو...</span>
            </button>
          ) : (
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => { if (!q) setSearchMode(false); }}
                placeholder="جستجوی منو..."
                className="w-full pr-9 pl-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 focus:border-indigo-400/50 focus:outline-none"
                style={{ color: 'inherit' }}
              />
            </div>
          )}
        </div>

        {/* گروه‌ها */}
        <nav className="flex-1 overflow-y-auto px-2.5 pb-4 space-y-1">
          {filtered.map((group) => {
            const GroupIcon = group.icon;
            const isOpenGroup = !!q || openGroups[group.id];
            const hasSoon = group.items.some(i => i.soon);
            return (
              <div key={group.id}>
                <button
                  type="button"
                  onClick={() => toggle(group.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm text-slate-300"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <GroupIcon className="w-[18px] h-[18px] text-indigo-400 shrink-0" />
                    <span className="font-medium truncate">{group.title}</span>
                    {hasSoon && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold shrink-0">
                        جدید
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 opacity-40 transition-transform duration-200 shrink-0 ${isOpenGroup ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpenGroup && (
                  <div className="space-y-0.5 mr-3 pr-3 border-r border-slate-700/40 mt-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = active === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => select(item.key)}
                          className={`w-full text-right flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-all ${
                            isActive
                              ? 'bg-indigo-500/15 text-white font-bold'
                              : 'text-slate-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : ''}`} />
                          <span className="truncate flex-1">{item.title}</span>
                          {item.soon && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold shrink-0">
                              به زودی
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center text-xs opacity-40 py-8">چیزی پیدا نشد</div>
          )}
        </nav>

        <div className="px-4 py-2.5 border-t text-[10px] opacity-40 text-center shrink-0" style={{ borderColor: 'inherit' }}>
          نسخه {APP_VERSION}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
