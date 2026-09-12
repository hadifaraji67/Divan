import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  ShoppingCart, 
  FileText, 
  Package, 
  Printer, 
  Wallet, 
  BookOpen, 
  CheckSquare, 
  BarChart3, 
  Calendar, 
  Smartphone, 
  MessageSquare, 
  Settings, 
  ChevronDown, 
  ChevronLeft 
} from 'lucide-react';
import { UpdateChecker } from './UpdateChecker';

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
}

interface MenuGroup {
  id: string;
  title: string;
  icon: React.ElementType;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    id: "dashboard",
    title: "اطلاعات پایه و داشبورد",
    icon: LayoutDashboard,
    items: [
      { title: "صفحه اصلی", path: "/", icon: Home },
      { title: "مدیریت اشخاص و مشتریان", path: "/contacts", icon: Users },
    ]
  },
  {
    id: "sales",
    title: "فروش و انبارداری",
    icon: ShoppingCart,
    items: [
      { title: "صدور و مدیریت فاکتور", path: "/invoices", icon: FileText },
      { title: "مدیریت انبار", path: "/inventory", icon: Package },
      { title: "تنظیمات چاپ فاکتور", path: "/invoice-print", icon: Printer },
    ]
  },
  {
    id: "finance",
    title: "حسابداری و مالی",
    icon: Wallet,
    items: [
      { title: "دفتر معین مشتریان", path: "/customer-ledger", icon: BookOpen },
      { title: "مدیریت چک‌ها", path: "/cheques", icon: CheckSquare },
      { title: "ثبت سند دستی", path: "/journal-entry", icon: FileText },
      { title: "گزارش‌های جامع مالی", path: "/financial-reports", icon: BarChart3 },
      { title: "بستن سال مالی", path: "/fiscal-year-closing", icon: Calendar },
    ]
  },
  {
    id: "tools",
    title: "ابزارهای هوشمند",
    icon: Smartphone,
    items: [
      { title: "استخراج پیامک بانکی", path: "/sms-import", icon: MessageSquare },
      { title: "تنظیمات سیستم", path: "/settings", icon: Settings },
    ]
  }
];

export const Sidebar: React.FC = () => {
  const [openGroup, setOpenGroup] = useState<string | null>("sales");

  const toggleGroup = (id: string) => {
    setOpenGroup(openGroup === id ? null : id);
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 h-screen p-4 flex flex-col dir-rtl select-none shadow-xl border-l border-slate-800">
      <div className="flex items-center justify-center h-14 mb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-wide text-indigo-400">نرم‌افزار دیوان</h1>
      </div>

      {/* بخش بررسی و اطلاع‌رسانی بروزرسانی */}
      <UpdateChecker />

      <nav className="flex-1 overflow-y-auto space-y-2 pr-1 mt-2">
        {menuGroups.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = openGroup === group.id;

          return (
            <div key={group.id} className="border-b border-slate-800/60 pb-2">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-200 font-medium text-sm"
              >
                <div className="flex items-center gap-3">
                  <GroupIcon className="w-5 h-5 text-indigo-400" />
                  <span>{group.title}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isOpen && (
                <div className="mr-6 mt-1 space-y-1 border-r-2 border-slate-700/50 pr-2">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <a
                        key={item.path}
                        href={item.path}
                        className="flex items-center gap-2.5 p-2 rounded-md text-xs text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                      >
                        <ItemIcon className="w-4 h-4 text-slate-400" />
                        <span>{item.title}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
        نسخه ۱.۰.۰ - برنامه دیوان
      </div>
    </aside>
  );
};

export default Sidebar;
