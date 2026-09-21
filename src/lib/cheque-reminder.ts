/**
 * یادآوری چک‌های سررسید با Local Notifications
 */

import { Capacitor } from '@capacitor/core';
import { loadData } from './storage';
import { notify } from './toast';
import type { Cheque } from '../types/models';

const REMINDER_KEY = 'divan_cheque_reminders';
const DEFAULT_DAYS_BEFORE = 3;
const DEFAULT_HOUR = 9; // 9 صبح

export interface ReminderSettings {
  enabled: boolean;
  daysBefore: number;
  hour: number; // 0-23
}

export interface ScheduledReminder {
  chequeId: string;
  notificationId: number;
  scheduledAt: string;
}

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: true,
  daysBefore: DEFAULT_DAYS_BEFORE,
  hour: DEFAULT_HOUR,
};

/* ═══════════ تنظیمات ═══════════ */

export function loadReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(REMINDER_KEY + '_settings');
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveReminderSettings(s: Partial<ReminderSettings>): void {
  const current = loadReminderSettings();
  const updated = { ...current, ...s };
  localStorage.setItem(REMINDER_KEY + '_settings', JSON.stringify(updated));
}

/* ═══════════ ذخیره زمان‌بندی‌ها ═══════════ */

function loadScheduled(): ScheduledReminder[] {
  try {
    const raw = localStorage.getItem(REMINDER_KEY + '_scheduled');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveScheduled(list: ScheduledReminder[]): void {
  localStorage.setItem(REMINDER_KEY + '_scheduled', JSON.stringify(list));
}

/* ═══════════ درخواست مجوز ═══════════ */

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  try {
    const w = window as any;
    const LocalNotifications = w.Capacitor?.Plugins?.LocalNotifications;
    if (!LocalNotifications) return false;

    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      perm = await LocalNotifications.requestPermissions();
    }
    return perm.display === 'granted';
  } catch (err: any) {
    console.warn('[Reminder] permission error:', err);
    return false;
  }
}

/* ═══════════ ساخت ID عددی ═══════════ */

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/* ═══════════ تبدیل تاریخ شمسی به میلادی ═══════════ */

function parseJalaliDate(jalaliStr: string): Date | null {
  try {
    const parts = jalaliStr.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).split('/');
    if (parts.length !== 3) return null;
    const [jy, jm, jd] = parts.map(Number);
    if (!jy || !jm || !jd) return null;

    // استفاده از الگوریتم jalali→gregorian
    const gy = jy + 621;
    const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
    let leapJ = -14;
    let jp = breaks[0];
    let jump = 0;

    for (let i = 1; i < breaks.length; i++) {
      const jm2 = breaks[i];
      jump = jm2 - jp;
      if (jy < jm2) break;
      leapJ = leapJ + Math.floor(jump / 33) * 8 + Math.floor((jump % 33) / 4);
      jp = jm2;
    }

    let n = jy - jp;
    leapJ = leapJ + Math.floor(n / 33) * 8 + Math.floor(((n % 33) + 3) / 4);
    if (jump % 33 === 4 && jump - n === 4) leapJ += 1;

    const leapG = Math.floor(gy / 4) - Math.floor((Math.floor(gy / 100) + 1) * 3 / 4) - 150;
    const march = 20 + leapJ - leapG;
    let jdn = Math.floor((gy + Math.floor((jm - 8) / 6) + 100100) * 1461 / 4) +
              Math.floor((153 * ((jm + 9) % 12) + 2) / 5) + jd - 34840408;
    jdn = jdn - Math.floor(Math.floor((gy + 100100 + Math.floor((jm - 8) / 6)) / 100) * 3 / 4) + 752;

    let j = 4 * jdn + 139361631;
    j = j + Math.floor(Math.floor((4 * jdn + 183187720) / 146097) * 3 / 4) * 4 - 3908;
    const i2 = Math.floor(((j % 1461) / 4) * 5 + 308);
    const gd = Math.floor((i2 % 153) / 5) + 1;
    const gm = (Math.floor(i2 / 153) % 12) + 1;
    const gyOut = Math.floor(j / 1461) - 100100 + Math.floor((8 - gm) / 6);

    return new Date(gyOut, gm - 1, gd);
  } catch {
    return null;
  }
}

/* ═══════════ زمان‌بندی یادآوری‌ها ═══════════ */

export async function rescheduleAllReminders(): Promise<{ scheduled: number; errors: number }> {
  if (!Capacitor.isNativePlatform()) {
    return { scheduled: 0, errors: 0 };
  }

  const settings = loadReminderSettings();
  if (!settings.enabled) {
    await cancelAllReminders();
    return { scheduled: 0, errors: 0 };
  }

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    return { scheduled: 0, errors: 0 };
  }

  const w = window as any;
  const LocalNotifications = w.Capacitor?.Plugins?.LocalNotifications;
  if (!LocalNotifications) return { scheduled: 0, errors: 0 };

  // لغو همه اول
  await cancelAllReminders();

  const cheques = loadData<Cheque[]>('cheques', []);
  const now = Date.now();
  const scheduled: ScheduledReminder[] = [];
  let errors = 0;

  for (const cheque of cheques) {
    // فقط چک‌های در انتظار
    if (cheque.status !== 'در انتظار' && cheque.status !== 'pending' && cheque.status !== 'نزدیک سررسید') {
      continue;
    }

    const dueDate = parseJalaliDate(cheque.dueDate || '');
    if (!dueDate) continue;

    // زمان یادآوری: چند روز قبل از سررسید، ساعت مشخص
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - settings.daysBefore);
    reminderDate.setHours(settings.hour, 0, 0, 0);

    if (reminderDate.getTime() <= now) continue; // گذشته

    const notificationId = hashCode(cheque.id);

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title: '📋 چک نزدیک سررسید',
            body: `چک ${cheque.number || ''} از ${cheque.contactName || 'نامشخص'} — ${cheque.amount ? cheque.amount.toLocaleString('fa-IR') : ''} ریال — سررسید: ${cheque.dueDate}`,
            schedule: { at: reminderDate },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: { chequeId: cheque.id },
          },
        ],
      });

      scheduled.push({
        chequeId: cheque.id,
        notificationId,
        scheduledAt: reminderDate.toISOString(),
      });
    } catch (err) {
      console.warn('[Reminder] schedule error:', err);
      errors++;
    }
  }

  saveScheduled(scheduled);
  return { scheduled: scheduled.length, errors };
}

export async function cancelAllReminders(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const w = window as any;
  const LocalNotifications = w.Capacitor?.Plugins?.LocalNotifications;
  if (!LocalNotifications) return;

  try {
    const scheduled = loadScheduled();
    if (scheduled.length > 0) {
      await LocalNotifications.cancel({
        notifications: scheduled.map((s) => ({ id: s.notificationId })),
      });
    }
    saveScheduled([]);
  } catch (err) {
    console.warn('[Reminder] cancel error:', err);
  }
}

export async function cancelChequeReminder(chequeId: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const w = window as any;
  const LocalNotifications = w.Capacitor?.Plugins?.LocalNotifications;
  if (!LocalNotifications) return;

  const scheduled = loadScheduled();
  const target = scheduled.find((s) => s.chequeId === chequeId);
  if (!target) return;

  try {
    await LocalNotifications.cancel({
      notifications: [{ id: target.notificationId }],
    });
    saveScheduled(scheduled.filter((s) => s.chequeId !== chequeId));
  } catch (err) {
    console.warn('[Reminder] cancel error:', err);
  }
}

/* ═══════════ زمان‌بندی خودکار روزانه ═══════════ */

let autoRescheduleTimer: ReturnType<typeof setInterval> | null = null;

export function startAutoReschedule(): () => void {
  if (autoRescheduleTimer) return () => {};

  // هر ۶ ساعت یک بار
  autoRescheduleTimer = setInterval(() => {
    rescheduleAllReminders().catch(() => {});
  }, 6 * 60 * 60 * 1000);

  // اولین بار بعد از ۵ ثانیه
  setTimeout(() => {
    rescheduleAllReminders().catch(() => {});
  }, 5000);

  return () => {
    if (autoRescheduleTimer) clearInterval(autoRescheduleTimer);
    autoRescheduleTimer = null;
  };
}

/* ═══════════ تست سریع ═══════════ */

export async function sendTestNotification(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    notify.warning('فقط در اپ اندروید');
    return false;
  }

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    notify.error('مجوز اعلان داده نشد');
    return false;
  }

  const w = window as any;
  const LocalNotifications = w.Capacitor?.Plugins?.LocalNotifications;
  if (!LocalNotifications) return false;

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 999999,
          title: '🧪 تست یادآوری',
          body: 'این یک اعلان تستی است. اگر می‌بینی، یعنی یادآوری کار می‌کند!',
          schedule: { at: new Date(Date.now() + 5000) }, // ۵ ثانیه بعد
        },
      ],
    });
    notify.success('اعلان تستی در ۵ ثانیه می‌آید');
    return true;
  } catch (err: any) {
    notify.error(err?.message || 'خطا');
    return false;
  }
}
