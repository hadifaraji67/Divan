const DEFAULT_ITERATIONS = 100000;
const KEY_LENGTH = 256;

function u8ToBase64(u8: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(u8.subarray(i, i + chunk)));
  }
  return btoa(binary);
}

function base64ToU8(b64: string): Uint8Array {
  const binary = atob(b64);
  const u8 = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) u8[i] = binary.charCodeAt(i);
  return u8;
}

function strToU8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(u8.byteLength);
  new Uint8Array(buf).set(u8);
  return buf;
}

export function generateSalt(length = 16): string {
  const salt = crypto.getRandomValues(new Uint8Array(length));
  return u8ToBase64(salt);
}

export async function hashPassword(
  password: string,
  salt: string,
  iterations = DEFAULT_ITERATIONS
): Promise<string> {
  const passwordBytes = strToU8(password);
  const saltBytes = base64ToU8(salt);

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
      salt: toArrayBuffer(saltBytes),
      iterations,
      hash: 'SHA-256',
    },
    baseKey,
    KEY_LENGTH
  );

  return u8ToBase64(new Uint8Array(derivedBits));
}

export async function verifyPassword(
  password: string,
  hash: string,
  salt: string,
  iterations = DEFAULT_ITERATIONS
): Promise<boolean> {
  try {
    const computed = await hashPassword(password, salt, iterations);
    if (computed.length !== hash.length) return false;
    let diff = 0;
    for (let i = 0; i < computed.length; i++) {
      diff |= computed.charCodeAt(i) ^ hash.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

export async function quickHash(text: string, salt: string): Promise<string> {
  return hashPassword(text, salt, 50000);
}

export async function quickVerify(text: string, hash: string, salt: string): Promise<boolean> {
  return verifyPassword(text, hash, salt, 50000);
}

export { u8ToBase64, base64ToU8 };
