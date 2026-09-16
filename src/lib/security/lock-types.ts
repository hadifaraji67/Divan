export type LockMethod = 'pin' | 'password' | 'pattern' | 'biometric';
export type AutoLockDelay = 'immediate' | 1 | 5 | 15 | 30 | 'never';

export interface LockConfig {
  enabled: boolean;
  method: LockMethod;
  autoLockDelay: AutoLockDelay;
  biometricEnabled: boolean;
  biometricPreferred: boolean;
  hint?: string;
  createdAt: string;
  lastChangedAt: string;
}

export interface LockCredentials {
  hash: string;
  salt: string;
  iterations: number;
}

export interface RecoveryInfo {
  codeHash: string;
  codeSalt: string;
  createdAt: string;
}

export interface LockState {
  locked: boolean;
  lastUnlockAt?: string;
  failedAttempts: number;
  lockedUntil?: string;
}

export const LOCK_CONFIG_KEY = 'divan_lock_config';
export const LOCK_CRED_KEY = 'divan_lock_cred';
export const LOCK_RECOVERY_KEY = 'divan_lock_recovery';
export const LOCK_STATE_KEY = 'divan_lock_state';

export const DEFAULT_CONFIG: LockConfig = {
  enabled: false,
  method: 'pin',
  autoLockDelay: 5,
  biometricEnabled: false,
  biometricPreferred: false,
  createdAt: '',
  lastChangedAt: '',
};

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 30 * 1000;
export const PIN_LENGTHS = [4, 5, 6];
export const PATTERN_MIN_DOTS = 4;
