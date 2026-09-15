/**
 * سرویس احراز هویت بیومتریک (اثر انگشت / چهره)
 * فقط در APK کار می‌کند
 */

const BIOMETRIC_ENABLED_KEY = 'divan_biometric_enabled';
const BIOMETRIC_CRED_KEY = 'divan_biometric_cred';

export interface BiometricAvailability {
  available: boolean;
  type: 'fingerprint' | 'face' | 'iris' | 'none';
  reason?: string;
}

const isCapacitor = (): boolean => {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  return !!(w.Capacitor?.isNativePlatform?.() || w.Capacitor?.platform);
};

/**
 * بررسی موجود بودن بیومتریک
 */
export async function checkBiometricAvailability(): Promise<BiometricAvailability> {
  if (!isCapacitor()) {
    return { available: false, type: 'none', reason: 'فقط در اپلیکیشن اندروید' };
  }

  try {
    const w = window as any;
    const plugin = w.Capacitor?.Plugins?.NativeBiometric;
    if (!plugin) {
      return { available: false, type: 'none', reason: 'پلاگین نصب نیست' };
    }

    const result = await plugin.isAvailable();

    if (!result.isAvailable) {
      return {
        available: false,
        type: 'none',
        reason: result.errorCode === 'BIOMETRIC_NOT_ENROLLED'
          ? 'اثر انگشت / چهره روی گوشی ثبت نشده'
          : 'بیومتریک در دسترس نیست',
      };
    }

    let type: BiometricAvailability['type'] = 'fingerprint';
    if (result.biometryType === 2) type = 'face';
    else if (result.biometryType === 3) type = 'iris';

    return { available: true, type };
  } catch (err: any) {
    return { available: false, type: 'none', reason: err.message };
  }
}

/**
 * فعال کردن بیومتریک (بعد از ورود موفق با رمز)
 * توکن را در Keychain امن ذخیره می‌کند
 */
export async function enableBiometric(username: string, password: string): Promise<boolean> {
  if (!isCapacitor()) return false;

  try {
    const w = window as any;
    const plugin = w.Capacitor?.Plugins?.NativeBiometric;
    if (!plugin) return false;

    // ذخیره رمز در Keychain (اختیاری — اگر بخواهیم auto-login)
    await plugin.setCredentials({
      username,
      password,
      server: 'divan',
    });

    // فعال‌سازی flag
    localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
    localStorage.setItem(BIOMETRIC_CRED_KEY, JSON.stringify({ username }));

    return true;
  } catch (err) {
    console.error('[biometric] enable error:', err);
    return false;
  }
}

/**
 * غیرفعال کردن بیومتریک
 */
export async function disableBiometric(): Promise<void> {
  if (isCapacitor()) {
    try {
      const w = window as any;
      const plugin = w.Capacitor?.Plugins?.NativeBiometric;
      if (plugin?.deleteCredentials) {
        await plugin.deleteCredentials({ server: 'divan' });
      }
    } catch (err) {
      console.error('[biometric] disable error:', err);
    }
  }

  localStorage.removeItem(BIOMETRIC_ENABLED_KEY);
  localStorage.removeItem(BIOMETRIC_CRED_KEY);
}

/**
 * بررسی فعال بودن بیومتریک
 */
export function isBiometricEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(BIOMETRIC_ENABLED_KEY) === 'true';
}

/**
 * اطلاعات کاربر ذخیره‌شده
 */
export function getStoredUser(): { username: string } | null {
  try {
    const raw = localStorage.getItem(BIOMETRIC_CRED_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/**
 * ورود با بیومتریک
 * - تأیید اثر انگشت
 * - خواندن رمز از Keychain
 * - برگرداندن username/password برای login
 */
export async function loginWithBiometric(): Promise<{ username: string; password: string } | null> {
  if (!isCapacitor()) return null;
  if (!isBiometricEnabled()) return null;

  try {
    const w = window as any;
    const plugin = w.Capacitor?.Plugins?.NativeBiometric;
    if (!plugin) return null;

    // تأیید هویت
    await plugin.verifyIdentity({
      reason: 'برای ورود به دیوان',
      title: 'ورود با اثر انگشت',
      subtitle: 'انگشت خود را روی سنسور قرار دهید',
      description: 'برای دسترسی، هویت خود را تأیید کنید',
    });

    // خواندن رمز
    const cred = await plugin.getCredentials({ server: 'divan' });

    if (cred?.username && cred?.password) {
      return { username: cred.username, password: cred.password };
    }

    return null;
  } catch (err: any) {
    console.error('[biometric] login error:', err);
    return null;
  }
}

export { isCapacitor };
