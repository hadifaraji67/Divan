import React, { useState, useEffect } from 'react';
import {
  Smartphone, Server, RefreshCw, LogOut, User, Shield, Users,
  Plus, Edit, Trash2, X, Check, AlertTriangle, Wifi, WifiOff,
  Clock, Database, Info, ChevronLeft, Loader2, Eye, EyeOff,
} from 'lucide-react';
import { getMode, setMode } from '../../lib/server/mode';
import { serverClient, type ServerUser } from '../../lib/server/server-client';
import { useSync } from '../../lib/sync/use-sync';
import { notify } from '../../lib/toast';
import { useSettings } from '../../lib/theme-context';
import { ModeSelection } from '../setup/ModeSelection';

export const ServerSettings: React.FC = () => {
  const { settings } = useSettings();
  const [mode, setModeState] = useState(getMode());
  const [user, setUser] = useState<ServerUser | null>(serverClient.getUser());
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  const { sync, busy: syncBusy, queue, lastSync, status, isServerMode } = useSync();

  useEffect(() => {
    const timer = setInterval(() => {
      setUser(serverClient.getUser());
      setModeState(getMode());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    if (!confirm('از حساب کاربری خارج شوید؟')) return;
    serverClient.logout();
    setUser(null);
    notify.success('خارج شدید');
  };

  const handleSwitchMode = () => {
    if (!confirm('برای تغییر حالت، اپ دوباره بارگذاری می‌شود. ادامه؟')) return;
    setShowModeSelection(true);
  };

  const handleModeComplete = () => {
    localStorage.setItem('divan_setup_completed', 'true');
    setTimeout(() => window.location.reload(), 500);
  };

  if (showModeSelection) {
    return <ModeSelection onComplete={handleModeComplete} />;
  }

  const formatTime = (iso: string | null) => {
    if (!iso) return 'هرگز';
    try {
      const d = new Date(iso);
      const now = Date.now();
      const diff = Math.floor((now - d.getTime()) / 1000);
      if (diff < 60) return 'همین الان';
      if (diff < 3600) return `${Math.floor(diff / 60)} دقیقه پیش`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} ساعت پیش`;
      return d.toLocaleDateString('fa-IR');
    } catch { return 'هرگز'; }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4" dir="rtl">

      {/* کارت حالت فعلی */}
      <div className={`rounded-2xl border p-5 ${mode === 'server'
        ? 'border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-violet-500/10'
        : 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 ${
            mode === 'server'
              ? 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/30'
              : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30'
          }`}>
            {mode === 'server' ? <Server className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
          </div>
          <div className="flex-1">
            <div className="text-xs opacity-60 mb-1">حالت فعلی</div>
            <h3 className="font-bold text-lg">
              {mode === 'server' ? 'اتصال به سرور' : 'مستقل'}
            </h3>
            <p className="text-xs opacity-70 mt-1 leading-relaxed">
              {mode === 'server'
                ? 'داده‌ها روی سرور ذخیره می‌شوند. از چند دستگاه قابل دسترس است.'
                : 'داده‌ها فقط روی این دستگاه ذخیره می‌شوند. کاملاً آفلاین.'
              }
            </p>
          </div>
          <button
            onClick={handleSwitchMode}
            className="px-3 py-2 text-xs font-bold rounded-lg bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-900 shrink-0"
          >
            تغییر حالت
          </button>
        </div>
      </div>

      {/* بخش حالت سرور */}
      {mode === 'server' && (
        <>
          {/* کارت کاربر */}
          <Section icon={User} title="حساب کاربری">
            {user ? (
              <>
                <Row label="نام کاربری" value={user.username} mono />
                <Row label="نام کامل" value={user.fullName || user.full_name || '—'} />
                <Row label="نقش" value={
                  user.role === 'admin' ? 'مدیر' :
                  user.role === 'accountant' ? 'حسابدار' :
                  user.role === 'seller' ? 'فروشنده' :
                  user.role === 'viewer' ? 'بیننده' : user.role
                } />

                <div className="flex gap-2 pt-2">
                  {user.role === 'admin' && (
                    <button
                      onClick={() => setShowUsers(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg"
                    >
                      <Users className="w-3.5 h-3.5" />
                      مدیریت کاربران
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    خروج از حساب
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs opacity-60 mb-3">به سرور وصل هستید ولی وارد نشده‌اید</p>
                <button
                  onClick={() => setShowModeSelection(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg"
                >
                  ورود به سرور
                </button>
              </div>
            )}
          </Section>

          {/* کارت سرور */}
          <Section icon={Server} title="اطلاعات سرور">
            <Row label="آدرس" value={serverClient.url} mono />
            <Row label="وضعیت اتصال" value={
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                متصل
              </span>
            } />
          </Section>

          {/* کارت همگام‌سازی */}
          <Section icon={RefreshCw} title="همگام‌سازی">
            <Row label="وضعیت" value={
              <span className={`font-bold ${
                status.color === 'emerald' ? 'text-emerald-600' :
                status.color === 'amber' ? 'text-amber-600' :
                status.color === 'rose' ? 'text-rose-600' : 'text-slate-500'
              }`}>
                {status.label}
              </span>
            } />
            <Row label="آخرین همگام‌سازی" value={formatTime(lastSync)} />
            <Row label="تغییرات در انتظار" value={`${queue} مورد`} />

            <button
              onClick={() => sync(true)}
              disabled={syncBusy}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl"
            >
              <RefreshCw className={`w-4 h-4 ${syncBusy ? 'animate-spin' : ''}`} />
              {syncBusy ? 'در حال همگام‌سازی...' : 'همگام‌سازی فوری'}
            </button>

            <div className="text-[11px] opacity-50 leading-relaxed text-center pt-1">
              هر ۵ دقیقه، خودکار همگام‌سازی می‌شود
            </div>
          </Section>
        </>
      )}

      {/* بخش حالت مستقل */}
      {mode === 'local' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm mb-1">حالت مستقل فعال است</h3>
              <p className="text-xs opacity-60 leading-relaxed">
                همه داده‌ها فقط روی این دستگاه ذخیره می‌شوند. برای دسترسی از چند دستگاه،
                روی «تغییر حالت» بزنید و «اتصال به سرور» را انتخاب کنید.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* اطلاعات سیستم */}
      <div className="rounded-xl border p-3 text-[11px] opacity-70 flex items-center gap-2" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
        <Info className="w-3.5 h-3.5" />
        <div>
          حالت ذخیره‌سازی: <b>{mode === 'server' ? 'ابری (سرور)' : 'محلی (دستگاه)'}</b>
        </div>
      </div>

      {/* مودال مدیریت کاربران */}
      {showUsers && <UsersManager onClose={() => setShowUsers(false)} />}
    </div>
  );
};

/* ═══ اجزای کمکی ═══ */

const Section: React.FC<{ icon: any; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
  <div className="rounded-2xl border bg-white dark:bg-slate-900/50 overflow-hidden" style={{ borderColor: 'var(--border-c, #e2e8f0)' }}>
    <div className="flex items-center gap-2 px-4 py-3 border-b bg-black/[0.02] dark:bg-white/[0.02]" style={{ borderColor: 'inherit' }}>
      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-sm font-bold">{title}</h3>
    </div>
    <div className="p-4 space-y-3">{children}</div>
  </div>
);

const Row: React.FC<{ label: string; value: React.ReactNode; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5 last:border-0">
    <span className="text-xs opacity-60">{label}</span>
    <span className={`text-sm font-medium ${mono ? 'font-mono' : ''}`} dir={mono ? 'ltr' : 'rtl'}>{value}</span>
  </div>
);

/* ═══ مدیریت کاربران ═══ */
const UsersManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${serverClient.url}/api/auth/users`, {
        headers: { 'Authorization': `Bearer ${serverClient.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا');
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`حذف کاربر «${username}»؟`)) return;
    try {
      const res = await fetch(`${serverClient.url}/api/auth/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${serverClient.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا');
      notify.success('کاربر حذف شد');
      load();
    } catch (err: any) {
      notify.error(err.message);
    }
  };

  const handleSave = async (data: any) => {
    try {
      const url = editing
        ? `${serverClient.url}/api/auth/users/${editing.id}`
        : `${serverClient.url}/api/auth/users`;
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serverClient.token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'خطا');
      notify.success(editing ? 'کاربر بروزرسانی شد' : 'کاربر ساخته شد');
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err: any) {
      notify.error(err.message);
    }
  };

  const roleLabel = (role: string) => ({
    admin: 'مدیر',
    accountant: 'حسابدار',
    seller: 'فروشنده',
    viewer: 'بیننده',
  }[role] || role);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg my-8">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold">مدیریت کاربران</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto opacity-50" />
            </div>
          ) : error ? (
            <div className="p-3 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs">
              {error}
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-3">
                {users.map(u => (
                  <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg border border-black/5 dark:border-white/5">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shrink-0 ${
                      u.role === 'admin' ? 'bg-rose-500' :
                      u.role === 'accountant' ? 'bg-indigo-500' :
                      u.role === 'seller' ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}>
                      {u.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{u.username}</div>
                      <div className="text-[11px] opacity-60 flex gap-2 mt-0.5">
                        <span>{u.full_name || '—'}</span>
                        <span className="px-1.5 rounded bg-black/5 dark:bg-white/5">{roleLabel(u.role)}</span>
                        {!u.is_active && <span className="text-rose-500">غیرفعال</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => { setEditing(u); setShowForm(true); }}
                      className="p-1.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-600"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {u.username !== 'admin' && (
                      <button
                        onClick={() => handleDelete(u.id, u.username)}
                        className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setEditing(null); setShowForm(true); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl"
              >
                <Plus className="w-4 h-4" />
                کاربر جدید
              </button>
            </>
          )}
        </div>
      </div>

      {showForm && (
        <UserForm
          user={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
};

const UserForm: React.FC<{ user: any; onSave: (d: any) => void; onCancel: () => void }> = ({ user, onSave, onCancel }) => {
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [role, setRole] = useState(user?.role || 'seller');
  const [isActive, setIsActive] = useState(user?.is_active !== false);
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = () => {
    if (!username.trim()) return;
    if (!user && !password) return;
    if (password && password.length < 4) return;

    setBusy(true);
    const data: any = { username: username.trim(), fullName: fullName.trim(), role };
    if (password) data.password = password;
    if (user) data.isActive = isActive;
    onSave(data);
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold mb-4">{user ? 'ویرایش کاربر' : 'کاربر جدید'}</h3>
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs opacity-60 block mb-1">نام کاربری *</span>
            <input value={username} onChange={e => setUsername(e.target.value)} disabled={!!user}
              className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-900 disabled:opacity-60" dir="ltr" />
          </label>
          <label className="block">
            <span className="text-xs opacity-60 block mb-1">
              {user ? 'رمز عبور جدید (خالی = بدون تغییر)' : 'رمز عبور *'}
            </span>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full p-2.5 pl-10 border rounded-lg text-sm bg-white dark:bg-slate-900" dir="ltr" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-black/5">
                {showPass ? <EyeOff className="w-3.5 h-3.5 opacity-50" /> : <Eye className="w-3.5 h-3.5 opacity-50" />}
              </button>
            </div>
          </label>
          <label className="block">
            <span className="text-xs opacity-60 block mb-1">نام کامل</span>
            <input value={fullName} onChange={e => setFullName(e.target.value)}
              className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-900" />
          </label>
          <label className="block">
            <span className="text-xs opacity-60 block mb-1">نقش</span>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-900">
              <option value="seller">فروشنده</option>
              <option value="accountant">حسابدار</option>
              <option value="viewer">بیننده</option>
              <option value="admin">مدیر</option>
            </select>
          </label>
          {user && (
            <label className="flex items-center gap-2 py-1">
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
              <span className="text-sm">فعال</span>
            </label>
          )}
        </div>
        <div className="flex gap-2 justify-end mt-5">
          <button onClick={onCancel} className="px-4 py-2 text-sm hover:bg-black/5 rounded-lg">لغو</button>
          <button onClick={handleSubmit} disabled={busy}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg disabled:opacity-60">
            ذخیره
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServerSettings;
