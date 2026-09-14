import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type FontSize = 'sm' | 'md' | 'lg';

export type PrintPaper = 'A4' | 'A5' | 'thermal80' | 'thermal58';
export type PrintMode = 'formal' | 'informal';

export interface Settings {
  theme: Theme;
  fontSize: FontSize;
  persianNumbers: boolean;
  currency: 'ریال' | 'تومان';
  accentColor: string;
  storeName: string;
  storePhone: string;
  storeAddress: string;
  storeEconomicCode: string;
  defaultTaxPercent: number;
  animationsEnabled: boolean;
  compactMode: boolean;

  // تنظیمات چاپ
  printPaper: PrintPaper;
  printMode: PrintMode;
  printAccentColor: string;
  printLogo?: string;
  printHeaderText: string;
  printFooterText: string;
  showStamp: boolean;
  showQR: boolean;
  showItemDescription: boolean;
  showDiscount: boolean;
  showTax: boolean;
  showShipping: boolean;
  thermalWidth: number;
}

const DEFAULTS: Settings = {
  theme: 'light',
  fontSize: 'md',
  persianNumbers: true,
  currency: 'ریال',
  accentColor: 'indigo',
  storeName: 'فروشگاه من',
  storePhone: '',
  storeAddress: '',
  storeEconomicCode: '',
  defaultTaxPercent: 9,
  animationsEnabled: true,
  compactMode: false,

  printPaper: 'A4',
  printMode: 'informal',
  printAccentColor: 'indigo',
  printLogo: undefined,
  printHeaderText: '',
  printFooterText: 'از خرید شما سپاسگزاریم',
  showStamp: true,
  showQR: true,
  showItemDescription: true,
  showDiscount: true,
  showTax: true,
  showShipping: true,
  thermalWidth: 80,
};

const STORAGE_KEY = 'divan_settings_v1';

interface Ctx {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<Ctx | null>(null);

function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => { setSettings(loadSettings()); }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    const html = document.documentElement;
    html.classList.remove('theme-light', 'theme-dark');
    html.classList.remove('text-sm', 'text-base', 'text-lg');

    let resolved: 'light' | 'dark';
    if (settings.theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = settings.theme;
    }
    setResolvedTheme(resolved);
    html.classList.add(resolved === 'dark' ? 'theme-dark' : 'theme-light');
    html.classList.add(`text-${settings.fontSize === 'md' ? 'base' : settings.fontSize}`);
    html.style.setProperty('--accent', settings.accentColor);
    html.setAttribute('data-accent', settings.accentColor);
    html.setAttribute('data-compact', settings.compactMode ? '1' : '0');
    html.setAttribute('data-anim', settings.animationsEnabled ? '1' : '0');

    if (resolved === 'dark') html.classList.add('dark');
    else html.classList.remove('dark');
  }, [settings]);

  useEffect(() => {
    if (settings.theme !== 'system' || typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const r = mq.matches ? 'dark' : 'light';
      setResolvedTheme(r);
      document.documentElement.classList.toggle('dark', r === 'dark');
      document.documentElement.classList.remove('theme-light', 'theme-dark');
      document.documentElement.classList.add(r === 'dark' ? 'theme-dark' : 'theme-light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [settings.theme]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => setSettings(DEFAULTS), []);

  return (
    <ThemeContext.Provider value={{ settings, update, reset, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useSettings(): Ctx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useSettings must be used inside ThemeProvider');
  return ctx;
}

export function formatNum(n: number, persian: boolean): string {
  const s = n.toLocaleString('en-US');
  if (!persian) return s;
  const fa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return s.replace(/[0-9]/g, d => fa[Number(d)]);
}

export function formatMoney(n: number, persian: boolean, currency: string): string {
  return formatNum(n, persian) + ' ' + currency;
}
