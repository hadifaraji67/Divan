export interface LogEntry {
  id: string;
  level: 'error' | 'warn' | 'info';
  source: string;
  message: string;
  stack?: string;
  data?: any;
  timestamp: number;
}

const STORAGE_KEY = 'divan_error_log';
const MAX_ENTRIES = 100;
const listeners: Set<(log: LogEntry[]) => void> = new Set();

function genId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

export function getLog(): LogEntry[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function saveLog(log: LogEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log.slice(0, MAX_ENTRIES)));
    listeners.forEach((fn) => fn(log));
  } catch {}
}

export function logError(source: string, message: string, data?: any, error?: any): void {
  const log = getLog();
  log.unshift({ id: genId(), level: 'error', source, message: String(message).slice(0, 500), stack: error?.stack, data, timestamp: Date.now() });
  saveLog(log);
  console.error(`[${source}]`, message, data, error);
}

export function logWarn(source: string, message: string, data?: any): void {
  const log = getLog();
  log.unshift({ id: genId(), level: 'warn', source, message: String(message).slice(0, 500), data, timestamp: Date.now() });
  saveLog(log);
}

export function logInfo(source: string, message: string, data?: any): void {
  const log = getLog();
  log.unshift({ id: genId(), level: 'info', source, message: String(message).slice(0, 500), data, timestamp: Date.now() });
  saveLog(log);
}

export function clearLog(): void { saveLog([]); }

export function subscribe(fn: (log: LogEntry[]) => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function installGlobalHandlers(): void {
  if (typeof window === 'undefined') return;
  const w = window as any;
  if (w.__divan_error_handlers_installed) return;
  w.__divan_error_handlers_installed = true;

  window.addEventListener('error', (event) => {
    logError('window.error', event.message || 'Unknown', { filename: event.filename?.split('/').pop(), line: event.lineno }, event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const r: any = event.reason;
    logError('unhandledrejection', r?.message || String(r), {}, r);
  });
}
