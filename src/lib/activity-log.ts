import { genId } from './storage';
import { getCurrentRole } from './rbac';

const STORAGE_KEY = 'divan_activity_log';
const MAX_ENTRIES = 1000;

export type ActivityAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'void'
  | 'restore'
  | 'login'
  | 'logout'
  | 'payment'
  | 'status_change';

export type ActivityEntity =
  | 'invoice'
  | 'contact'
  | 'product'
  | 'payment'
  | 'cheque'
  | 'installment'
  | 'cashbox'
  | 'journal'
  | 'user'
  | 'settings'
  | 'system';

export interface ActivityEntry {
  id: string;
  at: string; // ISO
  action: ActivityAction;
  entity: ActivityEntity;
  entityId?: string;
  entityLabel?: string; // نام برای نمایش
  summary: string; // توصیف کوتاه
  details?: Record<string, any>;
  user?: string;
  amount?: number; // برای نمایش سریع
}

function loadAll(): ActivityEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(entries: ActivityEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    // سقف ۱۰۰۰ رکورد
    const trimmed = entries.slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // اگه پر بود، نصف رو حذف کن
    try {
      const half = entries.slice(0, Math.floor(MAX_ENTRIES / 2));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(half));
    } catch {
      // silent
    }
  }
}

export function logActivity(
  action: ActivityAction,
  entity: ActivityEntity,
  opts: {
    entityId?: string;
    entityLabel?: string;
    summary: string;
    details?: Record<string, any>;
    amount?: number;
  },
): ActivityEntry {
  const user = (() => {
    try {
      return getCurrentRole() || undefined;
    } catch {
      return undefined;
    }
  })();

  const entry: ActivityEntry = {
    id: genId(),
    at: new Date().toISOString(),
    action,
    entity,
    entityId: opts.entityId,
    entityLabel: opts.entityLabel,
    summary: opts.summary,
    details: opts.details,
    amount: opts.amount,
    user,
  };

  const all = loadAll();
  all.unshift(entry);
  saveAll(all);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('divan-activity-log', { detail: entry }));
  }

  return entry;
}

export function getActivityLog(): ActivityEntry[] {
  return loadAll();
}

export function clearActivityLog(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('divan-activity-log', { detail: null }));
}

export function getActivityLogFiltered(filter: {
  entity?: ActivityEntity;
  action?: ActivityAction;
  from?: string; // ISO
  to?: string;
  search?: string;
  limit?: number;
}): ActivityEntry[] {
  let entries = loadAll();

  if (filter.entity) {
    entries = entries.filter((e) => e.entity === filter.entity);
  }
  if (filter.action) {
    entries = entries.filter((e) => e.action === filter.action);
  }
  if (filter.from) {
    const fromMs = new Date(filter.from).getTime();
    entries = entries.filter((e) => new Date(e.at).getTime() >= fromMs);
  }
  if (filter.to) {
    const toMs = new Date(filter.to).getTime();
    entries = entries.filter((e) => new Date(e.at).getTime() <= toMs);
  }
  if (filter.search) {
    const q = filter.search.trim().toLowerCase();
    entries = entries.filter(
      (e) =>
        e.summary.toLowerCase().includes(q) ||
        (e.entityLabel || '').toLowerCase().includes(q),
    );
  }
  if (filter.limit) {
    entries = entries.slice(0, filter.limit);
  }

  return entries;
}

export function getActivityStats(): {
  total: number;
  today: number;
  thisWeek: number;
  byEntity: Record<string, number>;
} {
  const entries = loadAll();
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startWeek = startToday - 6 * 24 * 60 * 60 * 1000;

  const byEntity: Record<string, number> = {};
  let today = 0;
  let thisWeek = 0;

  for (const e of entries) {
    const ms = new Date(e.at).getTime();
    if (ms >= startToday) today++;
    if (ms >= startWeek) thisWeek++;
    byEntity[e.entity] = (byEntity[e.entity] || 0) + 1;
  }

  return {
    total: entries.length,
    today,
    thisWeek,
    byEntity,
  };
}

/**
 * برچسب فارسی برای action
 */
export function actionLabel(action: ActivityAction): string {
  const map: Record<ActivityAction, string> = {
    create: 'ایجاد',
    update: 'ویرایش',
    delete: 'حذف',
    void: 'باطل کردن',
    restore: 'بازگردانی',
    login: 'ورود',
    logout: 'خروج',
    payment: 'پرداخت',
    status_change: 'تغییر وضعیت',
  };
  return map[action] || action;
}

/**
 * رنگ برای action
 */
export function actionColor(action: ActivityAction): string {
  const map: Record<ActivityAction, string> = {
    create: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
    update: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10',
    delete: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10',
    void: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10',
    restore: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10',
    login: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
    logout: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
    payment: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
    status_change: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10',
  };
  return map[action] || 'text-slate-600 bg-slate-100';
}

/**
 * برچسب فارسی برای entity
 */
export function entityLabel(entity: ActivityEntity): string {
  const map: Record<ActivityEntity, string> = {
    invoice: 'فاکتور',
    contact: 'شخص',
    product: 'کالا',
    payment: 'پرداخت',
    cheque: 'چک',
    installment: 'قسط',
    cashbox: 'صندوق',
    journal: 'سند حسابداری',
    user: 'کاربر',
    settings: 'تنظیمات',
    system: 'سیستم',
  };
  return map[entity] || entity;
}

/**
 * آیکون emoji برای entity
 */
export function entityIcon(entity: ActivityEntity): string {
  const map: Record<ActivityEntity, string> = {
    invoice: '📄',
    contact: '👤',
    product: '📦',
    payment: '💰',
    cheque: '🏦',
    installment: '📅',
    cashbox: '💵',
    journal: '📒',
    user: '👥',
    settings: '⚙️',
    system: '🖥️',
  };
  return map[entity] || '📌';
}
