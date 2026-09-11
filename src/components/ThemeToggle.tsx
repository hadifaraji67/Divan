import React, { useEffect, useState } from 'react';
import { Theme, getStoredTheme, applyTheme } from '../lib/theme';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const current = getStoredTheme();
    setTheme(current);
    applyTheme(current);
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-xl border border-border dir-rtl">
      <button
        onClick={() => handleThemeChange('light')}
        className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
          theme === 'light' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
        }`}
      >
        ☀️ روشن
      </button>
      <button
        onClick={() => handleThemeChange('dark')}
        className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
          theme === 'dark' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
        }`}
      >
        🌙 تاریک
      </button>
      <button
        onClick={() => handleThemeChange('system')}
        className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
          theme === 'system' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
        }`}
      >
        💻 سیستم
      </button>
    </div>
  );
};
