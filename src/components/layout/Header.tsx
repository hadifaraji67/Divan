import React from 'react';
import { Menu, Moon, Sun, Monitor, Bell, User, Search } from 'lucide-react';
import { RoleBadge } from '../shared/RoleBadge';
import { useSettings, type Theme } from '../../lib/theme-context';
import { NotificationsPanel } from '../shared/NotificationsPanel';
import { SyncStatus } from '../shared/SyncStatus';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const { settings, update, resolvedTheme } = useSettings();

  const cycleTheme = () => {
    const order: Theme[] = ['light', 'dark', 'system'];
    const idx = order.indexOf(settings.theme);
    update({ theme: order[(idx + 1) % order.length] });
  };

  const ThemeIcon = settings.theme === 'system' ? Monitor : (resolvedTheme === 'dark' ? Moon : Sun);

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-2 px-3 md:px-5 py-3 border-b backdrop-blur-md"
      style={{
        background: resolvedTheme === 'dark' ? 'rgba(11,18,32,0.85)' : 'rgba(255,255,255,0.85)',
        borderColor: resolvedTheme === 'dark' ? '#1e293b' : '#e2e8f0',
      }}
    >
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label="منو"
      >
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="text-sm md:text-base font-bold flex-1 truncate">{title}</h1>
        <RoleBadge />

      <button
        onClick={cycleTheme}
        className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        title={`تم: ${settings.theme === 'system' ? 'سیستم' : settings.theme === 'dark' ? 'تیره' : 'روشن'}`}
      >
        <ThemeIcon className="w-4 h-4" />
      </button>

      <SyncStatus />

      <NotificationsPanel onNavigate={(v) => { /* App-level navigation */ }} />

      <button
        className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        title="حساب کاربری"
      >
        <User className="w-4 h-4" />
      </button>
    </header>
  );
};

export default Header;
