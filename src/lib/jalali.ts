/**
 * تبدیل تاریخ بین میلادی و شمسی
 * الگوریتم: jalaali-js (استاندارد جهانی)
 */

const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];

function jalCal(jy: number, withoutLeap = false) {
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  if (jy < jp || jy >= breaks[bl - 1]) throw new Error('Invalid Jalaali year');
  let jump = 0;
  for (let i = 1; i < bl; i += 1) {
    const jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  let n = jy - jp;
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  if (!withoutLeap) {
    if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
    let leap = mod(mod(n + 1, 33) - 1, 4);
    if (leap === -1) leap = 4;
  }
  return { leap: mod(mod(n + 1, 33) - 1, 4), gy, march };
}

function div(a: number, b: number) { return ~~(a / b); }
function mod(a: number, b: number) { return a - ~~(a / b) * b; }

export function toJalaali(gy: number, gm: number, gd: number) {
  return d2j(g2d(gy, gm, gd));
}

export function toGregorian(jy: number, jm: number, jd: number) {
  return d2g(j2d(jy, jm, jd));
}

function d2j(jdn: number) {
  const gy = d2g(jdn).gy;
  let jy = gy - 621;
  const r = jalCal(jy, false);
  const jdn1f = g2d(gy, 3, r.march);
  let jd, jm, k;
  k = jdn - jdn1f;
  if (k >= 0) {
    if (k <= 185) {
      jm = 1 + div(k, 31);
      jd = mod(k, 31) + 1;
      return { jy, jm, jd };
    } else {
      k -= 186;
    }
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  jm = 7 + div(k, 30);
  jd = mod(k, 30) + 1;
  return { jy, jm, jd };
}

function g2d(gy: number, gm: number, gd: number) {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

function d2g(jdn: number) {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

function j2d(jy: number, jm: number, jd: number) {
  const r = jalCal(jy, true);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

/* ============ API عمومی ============ */

const FA_DIGITS = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
const FA_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const FA_WEEKDAYS = ['شنبه','یک‌شنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنج‌شنبه','جمعه'];

export function toFaDigits(s: string | number): string {
  return String(s).replace(/[0-9]/g, d => FA_DIGITS[Number(d)]);
}

export function toEnDigits(s: string): string {
  return String(s).replace(/[۰-۹]/g, d => String(FA_DIGITS.indexOf(d)));
}

export function todayJalali(): { jy: number; jm: number; jd: number } {
  const now = new Date();
  return toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function formatJalali(jy: number, jm: number, jd: number, persian = true): string {
  const str = `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
  return persian ? toFaDigits(str) : str;
}

export function parseJalali(str: string): { jy: number; jm: number; jd: number } | null {
  if (!str) return null;
  const clean = toEnDigits(str).replace(/[^\d/]/g, '');
  const parts = clean.split('/');
  if (parts.length < 3) return null;
  const jy = Number(parts[0]);
  const jm = Number(parts[1]);
  const jd = Number(parts[2]);
  if (jy > 100) return { jy, jm, jd }; // عدد میلادی نیست
  return { jy, jm, jd };
}

/** تعداد روزهای ماه شمسی */
export function daysInJalaliMonth(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  // اسفند: چک کبیسه
  const r = jalCal(jy, false);
  if (r.leap === 0) return 30;
  return 29;
}

/** نام ماه شمسی */
export function faMonthName(jm: number): string {
  return FA_MONTHS[jm - 1] || '';
}

/** نام روز هفته (۰=شنبه تا ۶=جمعه) */
export function faWeekday(idx: number): string {
  return FA_WEEKDAYS[idx] || '';
}

/** روز هفته برای یک تاریخ شمسی (۰=شنبه تا ۶=جمعه) */
export function jalaliWeekday(jy: number, jm: number, jd: number): number {
  const g = toGregorian(jy, jm, jd);
  // در JS getDay: 0=Sunday, 6=Saturday
  // در ایران: 0=شنبه (Saturday)، پس Saturday باید 0 شود
  const d = new Date(g.gy, g.gm - 1, g.gd).getDay();
  // تبدیل: JS Sunday=0 → Iran یکشنبه=1
  // JS Saturday=6 → Iran شنبه=0
  return (d + 1) % 7;
}

/** آرایه‌ای از روزهای ماه برای نمایش در تقویم (با خالی‌های ابتدای ماه) */
export function buildMonthGrid(jy: number, jm: number): (number | null)[] {
  const totalDays = daysInJalaliMonth(jy, jm);
  const firstWeekday = jalaliWeekday(jy, jm, 1);
  const grid: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) grid.push(null);
  for (let d = 1; d <= totalDays; d++) grid.push(d);
  return grid;
}

export function isToday(jy: number, jm: number, jd: number): boolean {
  const t = todayJalali();
  return t.jy === jy && t.jm === jm && t.jd === jd;
}
