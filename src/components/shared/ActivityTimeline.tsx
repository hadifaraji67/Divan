import React from 'react';
import {
  type ActivityEntry,
  actionLabel,
  actionColor,
  entityLabel,
  entityIcon,
} from '../../lib/activity-log';
import { formatJalaliLong } from '../../lib/jalali';

interface Props {
  entries: ActivityEntry[];
  compact?: boolean;
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return '—';
  }
}

function formatDateJalali(iso: string): string {
  try {
    const d = new Date(iso);
    const jy = d.getFullYear() - 621;
    return formatJalaliLong(jy, d.getMonth() + 1, d.getDate());
  } catch {
    return '—';
  }
}

function formatAmount(n?: number): string | null {
  if (!n) return null;
  return n.toLocaleString('fa-IR');
}

export const ActivityTimeline: React.FC<Props> = ({ entries, compact = false }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        <div className="text-4xl mb-2">📋</div>
        هنوز فعالیتی ثبت نشده
      </div>
    );
  }

  // گروه‌بندی بر اساس تاریخ
  const groups: { date: string; items: ActivityEntry[] }[] = [];
  let currentDate = '';

  for (const e of entries) {
    const dateKey = e.at.slice(0, 10);
    if (dateKey !== currentDate) {
      currentDate = dateKey;
      groups.push({ date: dateKey, items: [e] });
    } else {
      groups[groups.length - 1].items.push(e);
    }
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.date}>
          <div className="flex items-center gap-2 mb-2 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm py-1 z-10">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
              {formatDateJalali(group.items[0].at)}
            </div>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          <div className="space-y-2">
            {group.items.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* آیکون */}
                <div className="text-xl shrink-0 mt-0.5">
                  {entityIcon(entry.entity)}
                </div>

                {/* محتوا */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${actionColor(entry.action)}`}
                    >
                      {actionLabel(entry.action)}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {entityLabel(entry.entity)}
                    </span>
                    {entry.user && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        · {entry.user}
                      </span>
                    )}
                  </div>

                  <div className={`mt-1 ${compact ? 'text-xs' : 'text-sm'} text-slate-700 dark:text-slate-300`}>
                    {entry.summary}
                  </div>

                  {!compact && entry.entityLabel && (
                    <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {entry.entityLabel}
                    </div>
                  )}

                  {entry.amount ? (
                    <div className="mt-1 text-xs font-mono text-emerald-600 dark:text-emerald-400" dir="ltr">
                      {formatAmount(entry.amount)} ریال
                    </div>
                  ) : null}
                </div>

                {/* زمان */}
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0 mt-1">
                  {formatTime(entry.at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
