export type Theme = 'light' | 'dark' | 'system';

export const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem('divan-theme') as Theme) || 'system';
};

export const applyTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  localStorage.setItem('divan-theme', theme);
};

export const initTheme = () => {
  const currentTheme = getStoredTheme();
  applyTheme(currentTheme);
};
