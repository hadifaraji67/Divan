const ALGO = 'AES-GCM';
const KEY_LENGTH = 256;
const ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

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

function stringToUint8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function uint8ToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(u8.byteLength);
  new Uint8Array(buffer).set(u8);
  return buffer;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const passwordBytes = stringToUint8(password);
  const baseKey = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(passwordBytes),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(salt),
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: ALGO, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(plaintext: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const key = await deriveKey(password, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGO, iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(stringToUint8(plaintext))
  );

  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  return bufferToBase64(toArrayBuffer(combined));
}

export async function decrypt(ciphertext: string, password: string): Promise<string> {
  const combined = base64ToUint8(ciphertext);

  if (combined.length < SALT_LENGTH + IV_LENGTH + 1) {
    throw new Error('داده رمزنگاری‌شده معتبر نیست');
  }

  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH);

  const key = await deriveKey(password, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGO, iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(encrypted)
  );

  return uint8ToString(new Uint8Array(decrypted));
}

export async function hash(text: string): Promise<string> {
  const bytes = stringToUint8(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', toArrayBuffer(bytes));
  return bufferToBase64(hashBuffer);
}
