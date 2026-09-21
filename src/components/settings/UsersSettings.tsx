import React, { useEffect, useState } from 'react';
import { Users, Plus, Pencil, Trash2, RefreshCw, Shield, UserCog, ShoppingCart, Eye, Lock, Check } from 'lucide-react';
import { serverClient } from '../../lib/server/server-client';
import { getMode } from '../../lib/server/mode';
import { notify } from '../../lib/toast';
import { getCurrentRole, ROLE_LABELS, ROLE_DESCRIPTIONS, type Role } from '../../lib/rbac';

interface ServerUser {
  id: number;
  username: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  created_at?: string;
  last_login?: string;
}

const ROLE_ICONS: Record<string, React.ElementType> = {
  admin: Shield,
  accountant: UserCog,
  seller: ShoppingCart,
  viewer: Eye,
};

export const UsersSettings: React.FC = () => {
  const [users, setUsers] = useState<ServerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isServerMode = getMode() === 'server';
  const myRole = getCurrentRole();
  const canManage = myRole === 'admin';

  const load = async () => {
    if (!isServerMode) {
      setError('در حالت مستقل، کاربران وجود ندارند');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${serverClient.url}/api/auth/users`, {
        headers: {
          'Authorization': `Bearer ${serverClient.token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 403) {
          setError('فقط مدیر می‌تواند کاربران را ببیند');
        } else {
          setError('خطا در بارگذاری');
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err?.message || 'خطا در اتصال');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateUser = async (id: number, patch: Partial<ServerUser>) => {
    if (!canManage) return;

    try {
      const res = await fetch(`${serverClient.url}/api/auth/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serverClient.token}`,
        },
        body: JSON.stringify({
          role: patch.role,
          isActive: patch.is_active,
          fullName: patch.full_name,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'خطا');
      }

      notify.success('ذخیره شد');
      load();
    } catch (err: any) {
      notify.error(err?.message || 'خطا');
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm mb-1">مدیریت کاربران</div>
            <div className="text-xs opacity-70 leading-relaxed">
              {isServerMode
                ? 'کاربران متصل به سرور و نقش هر کدام'
                : 'در حالت مستقل، کاربران وجود ندارند'}
            </div>
          </div>
          {isServerMode && (
            <button
              onClick={load}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-700 dark:text-amber-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8 text-xs opacity-60">
          در حال بارگذاری...
        </div>
      )}

      {/* User List */}
      {!loading && !error && users.length > 0 && (
        <div className="space-y-2">
          {users.map((user) => {
            const RoleIcon = ROLE_ICONS[user.role] || Eye;
            const isMe = serverClient.getUser()?.id === user.id;

            return (
              <div
                key={user.id}
                className={`rounded-xl border p-3 ${
                  !user.is_active
                    ? 'border-slate-200 dark:border-slate-700 opacity-50'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <RoleIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{user.full_name || user.username}</span>
                      {isMe && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 font-bold">
                          شما
                        </span>
                      )}
                      {!user.is_active && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-700 font-bold">
                          غیرفعال
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] opacity-60 mt-0.5" dir="ltr">
                      @{user.username}
                    </div>
                    <div className="text-[10px] mt-1 flex items-center gap-1">
                      <RoleIcon className="w-3 h-3" />
                      {ROLE_LABELS[user.role as Role] || user.role}
                    </div>
                  </div>

                  {canManage && !isMe && (
                    <div className="flex flex-col gap-1">
                      <select
                        value={user.role}
                        onChange={(e) => updateUser(user.id, { role: e.target.value })}
                        className="text-[10px] p-1 border rounded"
                      >
                        {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => updateUser(user.id, { is_active: !user.is_active })}
                        className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                          user.is_active
                            ? 'bg-rose-500/10 text-rose-600'
                            : 'bg-emerald-500/10 text-emerald-600'
                        }`}
                      >
                        {user.is_active ? 'غیرفعال' : 'فعال'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info roles */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="text-xs font-bold mb-3">راهنمای نقش‌ها</div>
        <div className="space-y-2">
          {(Object.keys(ROLE_LABELS) as Role[]).map((role) => {
            const Icon = ROLE_ICONS[role];
            return (
              <div key={role} className="flex items-start gap-2 text-[11px]">
                <Icon className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-bold">{ROLE_LABELS[role]}</div>
                  <div className="opacity-60">{ROLE_DESCRIPTIONS[role]}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UsersSettings;
