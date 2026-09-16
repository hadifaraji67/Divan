/**
 * رمزنگاری امن رمز قفل
 * - PBKDF2 با SHA-256
 * - ۱۰۰,۰۰۰ تکرار
 * - Salt ۱۶ بایتی
 */

const ITERATIONS = 100000;
const SALT_LENGTH = 16;
const HASH_LENGTH = 32; // SHA-256

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(u8.byteLength);
  new Uint8Array(buffer).set(u8);
  return buffer;
}

/**
 * تولید Salt تصادفی
 */
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return bufferToBase64(toArrayBuffer(salt));
}

/**
 * هش کردن رمز با PBKDF2
 */
export async function hashCredential(credential: string, saltBase64: string): Promise<string> {
  const salt = base64ToUint8(saltBase64);
  const passwordBytes = new TextEncoder().encode(credential);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(passwordBytes),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(salt),
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    HASH_LENGTH * 8
  );

  return bufferToBase64(derivedBits);
}

/**
 * بررسی تطابق رمز با هش
 */
export async function verifyCredential(
  credential: string,
  salt: string,
  expectedHash: string
): Promise<boolean> {
  try {
    const hash = await hashCredential(credential, salt);
    // مقایسه ثابت‌زمان
    if (hash.length !== expectedHash.length) return false;
    let diff = 0;
    for (let i = 0; i < hash.length; i++) {
      diff |= hash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

/**
 * تولید کد بازیابی ۱۶ کاراکتری
 * فرمت: XXXX-XXXX-XXXX-XXXX (بدون حروف مشابه: 0، O، I، l)
 */
export function generateRecoveryCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // بدون 0,O,1,I,L
  const random = crypto.getRandomValues(new Uint8Array(16));
  let code = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars[random[i] % chars.length];
  }
  return code;
}

/**
 * نرمال‌سازی کد بازیابی (حذف فاصله و خط تیره)
 */
export function normalizeRecoveryCode(code: string): string {
  return code.replace(/[\s-]/g, '').toUpperCase();
}
