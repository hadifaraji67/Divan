import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, ShoppingCart, FileText, Package,
  Printer, Wallet, BookOpen, CheckSquare, BarChart3, Calendar,
  Smartphone, MessageSquare, Settings, ChevronDown, X,
  TrendingUp, CreditCard, Search, Star, Scale, MapPin, Download,
} from 'lucide-react';
import { APP_VERSION } from '../lib/update-service';

export type ViewKey =
  | 'home' | 'contacts'
  | 'invoice' | 'invoices' | 'inventory' | 'invoice-print' | 'print-settings'
  | 'customer-ledger' | 'cheques' | 'journal-entry'
  | 'financial-reports' | 'fiscal-year-closing' | 'profit-loss' | 'balance-sheet'
  | 'reports' | 'reports-hub' | 'finance' | 'payments'
  | 'regional-report' | 'backup' | 'customer-club' | 'installments' | 'cash-box'
  | 'sms-import' | 'settings';

interface MenuItem { key: ViewKey; title: string; icon: React.ElementType; }
interface MenuGroup { id: string; title: string; icon: React.ElementType; items: MenuItem[]; }

// دسترسی سریع - همیشه بالای سایدبار
const quickItems: MenuItem[] = [
  { key: 'home', title: 'داشبورد', icon: LayoutDashboard },
  { key: 'invoices', title: 'فاکتورها', icon: FileText },
  { key: 'contacts', title: 'مشتریان', icon: Users },
  { key: 'inventory', title: 'انبار', icon: Package },
];

// گروه‌ها - ساده و مختصر
const menuGroups: MenuGroup[] = [
  {
    id: 'sales',
    title: 'فروش',
    icon: ShoppingCart,
    items: [
        { key: 'payments', title: 'پرداخت‌ها', icon: CreditCard },
      { key: 'cheques', title: 'چک‌ها', icon: CheckSquare },
      { key: 'print-settings', title: 'تنظیمات چاپ', icon: Printer },
      { key: 'installments', title: 'اقساط و تسویه', icon: Wallet },
    ],
  },
  {
    id: 'accounting',
    title: 'حسابداری',
    icon: Wallet,
    items: [
      { key: 'journal-entry', title: 'اسناد حسابداری', icon: FileText },
      { key: 'financial-reports', title: 'تراز آزمایشی', icon: BarChart3 },
      { key: 'profit-loss', title: 'سود و زیان', icon: TrendingUp },
      { key: 'balance-sheet', title: 'ترازنامه', icon: Scale },
      { key: 'reports', title: 'گزارش‌های جامع', icon: TrendingUp },
      { key: 'regional-report', title: 'گزارش منطقه‌ای', icon: MapPin },
      { key: 'customer-club', title: 'باشگاه مشتریان', icon: Star },
      { key: 'cash-box', title: 'صندوق و کیف پول', icon: Wallet },
      { key: 'fiscal-year-closing', title: 'بستن سال مالی', icon: Calendar },
    ],
  },
  {
    id: 'system',
    title: 'سیستم',
    icon: Settings,
    items: [
      { key: 'sms-import', title: 'استخراج پیامک', icon: MessageSquare },
      { key: 'settings', title: 'تنظیمات', icon: Settings },
      { key: 'backup', title: 'پشتیبان‌گیری', icon: Download },
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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    sales: true, accounting: true, system: false,
  });
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);

  // فقط گروهی که آیتم فعال در آن است باز می‌شود
  useEffect(() => {
    const groupOf = menuGroups.find(g => g.items.some(i => i.key === active));
    if (groupOf) setOpenGroups(p => ({ ...p, [groupOf.id]: true }));
  }, [active]);

  const toggle = (id: string) => setOpenGroups(p => ({ ...p, [id]: !p[id] }));
  const select = (k: ViewKey) => { onSelect(k); onClose(); };

  const q = query.trim();
  const filtered = q
    ? menuGroups.map(g => ({ ...g, items: g.items.filter(i => i.title.includes(q)) })).filter(g => g.items.length > 0)
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
        className={`w-72 md:w-64 h-screen flex-col shrink-0 z-50
          border-l
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
              <div className="text-base font-bold">دیوان</div>
              <div className="text-[11px] opacity-50">سامانه جامع</div>
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

        {/* جستجو - فقط وقتی کلیک شود */}
        <div className="px-3 py-2 shrink-0">
          {!searchMode ? (
            <button
              onClick={() => setSearchMode(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:bg-white/5 rounded-lg transition-colors"
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
                className="w-full pr-9 pl-3 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 focus:border-indigo-400/50 focus:outline-none"
                style={{ color: 'inherit' }}
              />
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 pb-4">
          {/* دسترسی سریع */}
          {!q && (
            <div className="mb-3">
              <div className="text-[11px] text-slate-500 px-2 py-1.5 font-bold">دسترسی سریع</div>
              <div className="space-y-0.5">
                {quickItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => select(item.key)}
                      className={`w-full text-right flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all
                        ${isActive
                          ? 'bg-indigo-500/15 text-white font-bold'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-indigo-400' : ''}`} />
                      <span>{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* گروه‌ها */}
          <div className="space-y-1">
            {filtered.map((group) => {
              const GroupIcon = group.icon;
              const isOpenGroup = openGroups[group.id] || !!q;
              return (
                <div key={group.id}>
                  <button
                    type="button"
                    onClick={() => toggle(group.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm font-bold text-slate-300"
                  >
                    <div className="flex items-center gap-2.5">
                      <GroupIcon className="w-[18px] h-[18px] text-indigo-400" />
                      <span>{group.title}</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 opacity-40 transition-transform duration-150 ${isOpenGroup ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isOpenGroup && (
                    <div className="space-y-0.5 mr-2 pr-2 border-r border-slate-700/40">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = active === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => select(item.key)}
                            className={`w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all
                              ${isActive
                                ? 'bg-indigo-500/15 text-white font-bold'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                              }`}
                          >
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : ''}`} />
                            <span className="truncate">{item.title}</span>
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
          </div>
        </nav>

        <div className="px-4 py-2.5 border-t text-[11px] opacity-40 text-center shrink-0" style={{ borderColor: 'inherit' }}>
          نسخه {APP_VERSION}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
