import React from 'react';
import { Home, FileText, Users, Package, Menu } from 'lucide-react';
import type { ViewKey } from './Sidebar';

interface Props {
  active: ViewKey;
  onSelect: (key: ViewKey) => void;
  onMenuClick: () => void;
}

const items: { key: ViewKey; label: string; icon: React.ElementType }[] = [
  { key: 'home', label: 'داشبورد', icon: Home },
  { key: 'invoices', label: 'فاکتور', icon: FileText },
  { key: 'contacts', label: 'مشتری', icon: Users },
  { key: 'inventory', label: 'انبار', icon: Package },
];

export const BottomNav: React.FC<Props> = ({ active, onSelect, onMenuClick }) => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t bottom-nav-safe"
      style={{
        background: 'var(--bottomnav-bg, #ffffff)',
        borderColor: 'var(--border-c, #e2e8f0)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex justify-around items-stretch py-1.5 px-2">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.key;
          return (
            <button
              key={it.key}
              onClick={() => onSelect(it.key)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-xl transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className={`text-[10px] ${isActive ? 'font-bold' : ''}`}>{it.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
          );
        })}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-xl text-slate-500 dark:text-slate-400"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">منو</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
