/**
 * سیستم ماژولار — فعال/غیرفعال کردن ماژول‌ها برای هر سازمان
 *
 * دو مسیر برای فعال‌سازی:
 *  ۱) مستقیم از تنظیمات (سوییچ هر ماژول)
 *  ۲) با کد فعال‌سازی که توسعه‌دهنده برای هر سازمان صادر می‌کند
 *     (scripts/generate-activation-code.mjs)
 *
 * توجه صادقانه: چون اپ کاملاً آفلاین و سمت کلاینت است، این یک قفل «نرم» است
 * (برای مدیریت اینکه هر سازمان چه ماژول‌هایی ببیند)، نه DRM غیرقابل‌دور‌زدن.
 *
 * ماژول‌های جدیدی که در آینده به MODULES اضافه شوند، به‌صورت پیش‌فرض فعال‌اند
 * (چون فقط لیست «غیرفعال‌ها» ذخیره می‌شود) — پس بروزرسانی برنامه هیچ چیزی را
 * از کاربران فعلی پنهان نمی‌کند.
 */
import { loadData, saveData } from './storage';

export type ModuleKey =
  | 'sales' | 'purchase' | 'inventory' | 'finance' | 'reports' | 'hr' | 'projects';

export interface ModuleInfo {
  key: ModuleKey;
  name: string;
  description: string;
}

export const MODULES: ModuleInfo[] = [
  { key: 'sales', name: 'فروش', description: 'مشتریان، فاکتور فروش، پرداخت‌ها، چک، اقساط، باشگاه مشتریان' },
  { key: 'purchase', name: 'خرید', description: 'تامین‌کنندگان، فاکتور خرید، پرداخت به تامین‌کننده' },
  { key: 'inventory', name: 'انبار و کالا', description: 'کالاها، انبارها، نقل‌وانتقال، انبارگردانی' },
  { key: 'finance', name: 'مالی و حسابداری', description: 'اسناد حسابداری، صندوق و بانک، بستن سال مالی' },
  { key: 'reports', name: 'گزارش‌ها و تحلیل', description: 'گزارش‌های مالی، فروش و سود و زیان' },
  { key: 'hr', name: 'منابع انسانی', description: 'پرسنل، حقوق و دستمزد، حضور و غیاب (در دست توسعه)' },
  { key: 'projects', name: 'پروژه‌ها و تولید', description: 'مدیریت پروژه و خط تولید (در دست توسعه)' },
];

/** هر صفحه‌ای که اینجا نیست جزو هسته است (داشبورد، تنظیمات) و همیشه فعال می‌ماند */
export const VIEW_MODULE: Record<string, ModuleKey> = {
  contacts: 'sales', invoices: 'sales', payments: 'sales', cheques: 'sales',
  installments: 'sales', 'customer-club': 'sales',
  suppliers: 'purchase', 'purchase-invoices': 'purchase', 'supplier-payments': 'purchase',
  inventory: 'inventory', warehouses: 'inventory', 'stock-movements': 'inventory', 'stock-take': 'inventory',
  'journal-entry': 'finance', 'cash-box': 'finance', 'fiscal-year-closing': 'finance',
  'reports-hub': 'reports',
  employees: 'hr', payroll: 'hr', attendance: 'hr',
  projects: 'projects', production: 'projects',
};

interface LicenseState {
  disabledModules: ModuleKey[];
  activatedCodes: string[];
}

const STORAGE_KEY = 'license';
const CHANGE_EVENT = 'divan-modules-changed';

function getState(): LicenseState {
  const s = loadData<Partial<LicenseState>>(STORAGE_KEY, {});
  return {
    disabledModules: Array.isArray(s.disabledModules) ? s.disabledModules : [],
    activatedCodes: Array.isArray(s.activatedCodes) ? s.activatedCodes : [],
  };
}

function saveState(state: LicenseState): void {
  saveData(STORAGE_KEY, state);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getEnabledModules(): ModuleKey[] {
  const disabled = new Set(getState().disabledModules);
  return MODULES.map(m => m.key).filter(k => !disabled.has(k));
}

export function isModuleEnabled(key: ModuleKey): boolean {
  return !getState().disabledModules.includes(key);
}

/** آیا این صفحه (view) در حال حاضر قابل دسترسی است؟ صفحه‌های هسته همیشه true */
export function isViewEnabled(view: string): boolean {
  const mod = VIEW_MODULE[view];
  return mod ? isModuleEnabled(mod) : true;
}

export function setModuleEnabled(key: ModuleKey, enabled: boolean): void {
  const state = getState();
  const disabled = new Set(state.disabledModules);
  if (enabled) disabled.delete(key); else disabled.add(key);
  saveState({ ...state, disabledModules: Array.from(disabled) });
}

export function subscribeModules(fn: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, fn);
  return () => window.removeEventListener(CHANGE_EVENT, fn);
}

// ─── کد فعال‌سازی ───
// قالب: DIVAN-<payload base64url>-<چک‌سام ۴ کاراکتری>
// payload = "<نام/شناسه سازمان>|<ماژول۱,ماژول۲,...>"
// ⚠️ SALT و الگوریتم checksum باید با scripts/generate-activation-code.mjs یکی باشد.
const SALT = 'divan-5-module-lock-2026';

function checksum(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36).toUpperCase().padStart(4, '0').slice(-4);
}

function fromBase64Url(str: string): string {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export interface ActivationResult {
  ok: boolean;
  modules?: ModuleKey[];
  orgName?: string;
  error?: string;
}

export function activateWithCode(rawCode: string): ActivationResult {
  const code = rawCode.trim();
  const match = code.match(/^DIVAN-(.+)-([A-Z0-9]{4})$/);
  if (!match) return { ok: false, error: 'فرمت کد نامعتبر است' };

  const [, encoded, sum] = match;
  if (checksum(encoded + SALT) !== sum) return { ok: false, error: 'کد فعال‌سازی معتبر نیست' };

  let payload: string;
  try {
    payload = fromBase64Url(encoded);
  } catch {
    return { ok: false, error: 'کد فعال‌سازی معتبر نیست' };
  }

  const [orgName, moduleStr = ''] = payload.split('|');
  const known = new Set(MODULES.map(m => m.key));
  const modules = moduleStr.split(',').filter((m): m is ModuleKey => known.has(m as ModuleKey));
  if (modules.length === 0) return { ok: false, error: 'این کد ماژولی را فعال نمی‌کند' };

  const state = getState();
  const disabled = new Set(state.disabledModules);
  modules.forEach(m => disabled.delete(m));
  saveState({
    disabledModules: Array.from(disabled),
    activatedCodes: state.activatedCodes.includes(code) ? state.activatedCodes : [...state.activatedCodes, code],
  });

  return { ok: true, modules, orgName };
}
