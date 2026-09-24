// ═══════════════════════════════════════════════════════════
//  IndexedDB Storage Layer
//  - Primary storage برای داده‌های حجیم
//  - In-memory cache برای دسترسی sync
//  - بدون dependency خارجی
// ═══════════════════════════════════════════════════════════

const DB_NAME = 'divan_db';
const DB_VERSION = 1;
const STORE_NAME = 'kv';

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;
let initialized = false;
let unavailable = false;

// In-memory cache برای دسترسی sync
const memCache = new Map<string, any>();

/**
 * باز کردن IndexedDB (یک بار)
 */
function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbPromise) return dbPromise;
  if (unavailable) return Promise.reject(new Error('IndexedDB unavailable'));

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      unavailable = true;
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onerror = () => {
      unavailable = true;
      reject(req.error);
    };

    req.onsuccess = () => {
      dbInstance = req.result;
      resolve(req.result);
    };

    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });

  return dbPromise;
}

function idbPut(key: string, value: any): Promise<void> {
  return openDatabase().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  });
}

function idbDeleteKey(key: string): Promise<void> {
  return openDatabase().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  });
}

function idbGetAll(): Promise<{ keys: string[]; values: any[] }> {
  return openDatabase().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const keysReq = store.getAllKeys();
      const valuesReq = store.getAll();

      let keys: string[] = [];
      let values: any[] = [];
      let done = 0;

      const check = () => {
        if (++done === 2) {
          resolve({
            keys: keys.map(String),
            values,
          });
        }
      };

      keysReq.onsuccess = () => { keys = keysReq.result as string[]; check(); };
      keysReq.onerror = () => reject(keysReq.error);

      valuesReq.onsuccess = () => { values = valuesReq.result; check(); };
      valuesReq.onerror = () => reject(valuesReq.error);
    });
  });
}

// ═══════════════════════════════════════════════════════════
//  Initialization
// ═══════════════════════════════════════════════════════════

/**
 * بارگذاری همه داده‌ها از IndexedDB به cache
 * یک بار در startup اجرا میشه
 */
export async function initIndexedDB(): Promise<void> {
  if (initialized) return;
  if (typeof window === 'undefined') return;

  try {
    const { keys, values } = await idbGetAll();
    for (let i = 0; i < keys.length; i++) {
      memCache.set(keys[i], values[i]);
    }
    initialized = true;
    console.log('[idb] initialized with ' + keys.length + ' keys');
  } catch (err) {
    console.warn('[idb] init failed, fallback to localStorage only', err);
    unavailable = true;
  }
}

// ═══════════════════════════════════════════════════════════
//  Public API
// ═══════════════════════════════════════════════════════════

/**
 * آیا IndexedDB در دسترسه؟
 */
export function isIndexedDBAvailable(): boolean {
  return !unavailable && typeof window !== 'undefined' && !!window.indexedDB;
}

/**
 * خواندن sync از cache
 */
export function idbLoadSync<T>(key: string, fallback: T): T {
  if (memCache.has(key)) {
    return memCache.get(key) as T;
  }
  return fallback;
}

/**
 * نوشتن: cache + localStorage (mirror) + IndexedDB
 */
export function idbSave<T>(key: string, value: T): void {
  // 1. cache (sync read)
  memCache.set(key, value);

  // 2. IndexedDB (async, بی‌صدا)
  if (!unavailable) {
    idbPut(key, value).catch(() => {
      // silent
    });
  }
}

/**
 * حذف کلید
 */
export function idbDelete(key: string): void {
  memCache.delete(key);
  if (!unavailable) {
    idbDeleteKey(key).catch(() => {
      // silent
    });
  }
}

/**
 * پاک کردن همه چیز (wipe)
 */
export function idbClear(): void {
  memCache.clear();
  if (typeof window === 'undefined') return;
  if (unavailable) return;

  openDatabase()
    .then((db) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
    })
    .catch(() => {
      // silent
    });
}

/**
 * آیا cache آماده‌ست؟
 */
export function isCacheReady(): boolean {
  return initialized;
}

/**
 * Migration از localStorage به IndexedDB (یک بار)
 * - همه کلیدهای divan_* رو می‌خونه
 * - به IDB منتقل می‌کنه
 * - localStorage رو نگه می‌داره (mirror)
 */
export async function migrateFromLocalStorage(): Promise<number> {
  if (typeof window === 'undefined') return 0;
  if (unavailable) return 0;

  let migrated = 0;

  try {
    const db = await openDatabase();
    const keys: string[] = [];

    // پیدا کردن همه کلیدهای divan_*
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('divan_')) {
        keys.push(k);
      }
    }

    for (const lsKey of keys) {
      // تبدیل divan_xxx به xxx (چون IDB با key بدون prefix کار می‌کنه)
      const idbKey = lsKey.replace(/^divan_/, '');

      // چک کن در IDB نیست
      const existing = await new Promise<any>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(idbKey);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(undefined);
      });

      if (existing === undefined) {
        try {
          const raw = localStorage.getItem(lsKey);
          if (raw) {
            const value = JSON.parse(raw);
            await idbPut(idbKey, value);
            memCache.set(idbKey, value);
            migrated++;
          }
        } catch {
          // skip
        }
      } else {
        // قبلاً بود، فقط به cache اضافه کن
        memCache.set(idbKey, existing);
      }
    }

    if (migrated > 0) {
      console.log('[idb] migrated ' + migrated + ' keys from localStorage');
    }
  } catch (err) {
    console.warn('[idb] migration failed:', err);
  }

  return migrated;
}

/**
 * Init کامل: open DB + migrate + cache
 */
export async function bootstrapIndexedDB(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    await openDatabase();
    await migrateFromLocalStorage();
    initialized = true;
  } catch (err) {
    console.warn('[idb] bootstrap failed, using localStorage only', err);
    unavailable = true;
  }
}
