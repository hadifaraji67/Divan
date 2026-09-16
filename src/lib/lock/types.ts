/**
 * تایپ‌های سیستم قفل محلی
 */

export type LockType = 'pin' | 'password' | 'pattern' | 'biometric';
export type AutoLockTime = 0 | 1 | 5 | 15 | 30; // دقیقه (0 = هرگز)

export interface LockSettings {
  enabled: boolean;
  type: LockType;
  autoLockMinutes: AutoLockTime;
  biometricEnabled: boolean;
  recoveryGenerated: boolean;
  createdAt?: string;
  lastChangedAt?: string;
}

export const DEFAULT_LOCK_SETTINGS: LockSettings = {
  enabled: false,
  type: 'pin',
  autoLockMinutes: 5,
  biometricEnabled: false,
  recoveryGenerated: false,
};

export interface LockCredential {
  type: LockType;
  hash: string;
  salt: string;
  createdAt: string;
}

export interface RecoveryCredential {
  hash: string;
  salt: string;
  createdAt: string;
}
