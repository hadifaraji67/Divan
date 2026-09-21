/**
 * RBAC — مدیریت نقش‌ها و دسترسی‌ها
 * - admin: همه چیز
 * - accountant: مالی + گزارش (بدون حذف کاربران)
 * - seller: فروش + مشتریان (بدون حذف)
 * - viewer: فقط مشاهده
 */

import { serverClient } from './server/server-client';
import { getMode } from './server/mode';

export type Role = 'admin' | 'accountant' | 'seller' | 'viewer';

export type Permission =
  // فروش
  | 'invoice.view'
  | 'invoice.create'
  | 'invoice.edit'
  | 'invoice.delete'
  | 'invoice.void'
  // مشتریان
  | 'contact.view'
  | 'contact.create'
  | 'contact.edit'
  | 'contact.delete'
  // کالاها
  | 'product.view'
  | 'product.create'
  | 'product.edit'
  | 'product.delete'
  // پرداخت
  | 'payment.view'
  | 'payment.create'
  | 'payment.delete'
  // گزارش
  | 'report.view'
  | 'report.export'
  // تنظیمات
  | 'settings.view'
  | 'settings.edit'
  // کاربران
  | 'user.view'
  | 'user.create'
  | 'user.delete'
  // بکاپ
  | 'backup.create'
  | 'backup.restore';

const PERMISSIONS: Record<Role, Permission[] | '*'> = {
  admin: '*',
  accountant: [
    'invoice.view', 'invoice.create', 'invoice.edit', 'invoice.void',
    'contact.view', 'contact.create', 'contact.edit',
    'product.view',
    'payment.view', 'payment.create',
    'report.view', 'report.export',
    'settings.view',
    'backup.create',
  ],
  seller: [
    'invoice.view', 'invoice.create',
    'contact.view', 'contact.create', 'contact.edit',
    'product.view',
    'payment.view',
    'report.view',
  ],
  viewer: [
    'invoice.view',
    'contact.view',
    'product.view',
    'payment.view',
    'report.view',
  ],
};

/* ═══════════ توابع اصلی ═══════════ */

export function getCurrentRole(): Role | null {
  if (getMode() !== 'server') return null;
  const user = serverClient.getUser();
  if (!user) return null;
  return (user.role as Role) || null;
}

export function hasPermission(permission: Permission): boolean {
  if (getMode() !== 'server') return true; // حالت local = همه چیز مجاز
  const role = getCurrentRole();
  if (!role) return false;

  const perms = PERMISSIONS[role];
  if (perms === '*') return true;
  return perms.includes(permission);
}

export function hasAnyPermission(...permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(p));
}

export function requirePermission(permission: Permission): boolean {
  return hasPermission(permission);
}

export function isAdmin(): boolean {
  return getCurrentRole() === 'admin';
}

export function isViewer(): boolean {
  return getCurrentRole() === 'viewer';
}

/* ═══════════ Labels فارسی ═══════════ */

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'مدیر',
  accountant: 'حسابدار',
  seller: 'فروشنده',
  viewer: 'بازدیدکننده',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: 'دسترسی کامل به همه بخش‌ها',
  accountant: 'مدیریت مالی، گزارش‌ها و بکاپ (بدون مدیریت کاربران)',
  seller: 'فروش، مشتریان و پرداخت‌ها',
  viewer: 'فقط مشاهده گزارش‌ها و اطلاعات',
};

export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role as Role] || role;
}
