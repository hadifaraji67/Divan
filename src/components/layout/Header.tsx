import React, { useState } from 'react';
import { Menu, Sun, Moon, Bell, Search } from 'lucide-react';
import { useSettings } from '../../lib/theme-context';
import { RoleBadge } from '../shared/RoleBadge';
import { NotificationsPanel } from '../shared/NotificationsPanel';

interface Props {
  title: string;
  onMenuClick: () => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<Props> = ({ title, onMenuClick, onOpenSearch }) => {
  const { settings, update } = useSettings();
  const [showNotifications, setShowNotifications] = useState(false);

  const cycleTheme = () => {
    const next = settings.theme === 'light' ? 'dark' : settings.theme === 'dark' ? 'system' : 'light';
    update({ theme: next });
  };

  const ThemeIcon = settings.theme === 'dark' ? Moon : Sun;

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-2 px-3 md:px-5 py-3 border-b backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-slate-200 dark:border-slate-700"
      dir="rtl"
    >
      {/* Menu (Mobile) */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
        aria-label="منو"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Title */}
      <h1 className="text-sm md:text-base font-bold flex-1 truncate">{title}</h1>

      {/* Role Badge */}
      <RoleBadge />

      {/* Search Desktop */}
      {onOpenSearch && (
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs opacity-70 hover:opacity-100 transition-all"
          title="جستجو (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span>جستجو...</span>
          <kbd className="text-[9px] px-1 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600">
            Ctrl+K
          </kbd>
        </button>
      )}

      {/* Search Mobile */}
      {onOpenSearch && (
        <button
          onClick={onOpenSearch}
          className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 md:hidden"
          aria-label="جستجو"
        >
          <Search className="w-5 h-5" />
        </button>
      )}

      {/* Theme Toggle */}
      <button
        onClick={cycleTheme}
        className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
        title={`تم: ${settings.theme || 'روشن'}`}
        aria-label="تغییر تم"
      >
        <ThemeIcon className="w-5 h-5" />
      </button>

      {/* Notifications */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 relative"
        aria-label="اعلان‌ها"
      >
        <Bell className="w-5 h-5" />
      </button>

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel />
      )}
    </header>
  );
};

export default Header;
