/**
 * HTTP Client برای ارتباط با سرور دیوان
 */

const TOKEN_KEY = 'divan_server_token';
const URL_KEY = 'divan_server_url';
const USER_KEY = 'divan_server_user';

export interface ServerUser {
  id: number;
  username: string;
  fullName?: string;
  full_name?: string;
  role: string;
}

export interface LoginResponse {
  user: ServerUser;
  token: string;
}

export interface SyncChange {
  collection: string;
  recordId: string;
  data: any;
  updatedAt: string;
  deleted?: boolean;
}

export interface SyncResult {
  created: number;
  updated: number;
  skipped: number;
  errors: { recordId: string; error: string }[];
}

class ServerClient {
  private _url: string = '';
  private _token: string = '';

  constructor() {
    if (typeof window === 'undefined') return;
    this._url = localStorage.getItem(URL_KEY) || '';
    this._token = localStorage.getItem(TOKEN_KEY) || '';
  }

  // ═══ تنظیمات ═══
  get url() { return this._url; }
  get token() { return this._token; }
  get isConfigured() { return !!(this._url); }
  get isAuthenticated() { return !!(this._token); }

  setUrl(url: string) {
    this._url = url.replace(/\/+$/, '');
    localStorage.setItem(URL_KEY, this._url);
  }

  setToken(token: string) {
    this._token = token;
    localStorage.setItem(TOKEN_KEY, token);
  }

  setUser(user: ServerUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUser(): ServerUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  logout() {
    this._token = '';
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // ═══ درخواست پایه ═══
  private async request<T>(
    path: string,
    options: RequestInit = {},
    timeout = 15000
  ): Promise<T> {
    if (!this._url) {
      throw new Error('آدرس سرور تنظیم نشده');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(`${this._url}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(this._token ? { 'Authorization': `Bearer ${this._token}` } : {}),
          ...(options.headers || {}),
        },
      });

      clearTimeout(timer);

      const text = await res.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = text; }

      if (!res.ok) {
        const msg = data?.error || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      return data as T;
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError') throw new Error('زمان درخواست تمام شد');
      throw err;
    }
  }

  // ═══ Health ═══
  async health(): Promise<{ status: string; database: any }> {
    return this.request('/api/health');
  }

  async needsSetup(): Promise<boolean> {
    const r = await this.request<{ needsSetup: boolean }>('/api/auth/needs-setup');
    return r.needsSetup;
  }

  // ═══ احراز هویت ═══
  async login(username: string, password: string): Promise<LoginResponse> {
    const r = await this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(r.token);
    this.setUser(r.user);
    return r;
  }

  async setup(username: string, password: string, fullName: string): Promise<LoginResponse> {
    const r = await this.request<LoginResponse>('/api/auth/setup', {
      method: 'POST',
      body: JSON.stringify({ username, password, fullName }),
    });
    this.setToken(r.token);
    this.setUser(r.user);
    return r;
  }

  async me(): Promise<{ user: ServerUser }> {
    return this.request('/api/auth/me');
  }

  // ═══ Sync ═══
  async pull(since?: string): Promise<{ data: Record<string, any[]>; serverTime: string }> {
    const qs = since ? `?since=${encodeURIComponent(since)}` : '';
    return this.request(`/api/sync/pull${qs}`);
  }

  async push(changes: SyncChange[]): Promise<{ results: SyncResult; serverTime: string }> {
    return this.request('/api/sync/push', {
      method: 'POST',
      body: JSON.stringify({ changes }),
    });
  }

  async pushAll(data: Record<string, any[]>): Promise<{ results: any }> {
    return this.request('/api/sync/push-all', {
      method: 'POST',
      body: JSON.stringify({ data }),
      // timeout بیشتر برای حجم زیاد
    }, 60000);
  }

  async status(): Promise<any> {
    return this.request('/api/sync/status');
  }
}

export const serverClient = new ServerClient();
