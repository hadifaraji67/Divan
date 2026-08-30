const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toFaDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

export function parseAmount(raw: string): number {
  const normalized = raw
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٬,]/g, "")
    .replace(/\s/g, "")
    .trim();
  if (!normalized) return 0;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

export function formatRial(n: number): string {
  const rounded = Math.round(n);
  return toFaDigits(rounded.toLocaleString("en-US"));
}

export function gregorianToJalali(date: Date): { y: number; m: number; d: number } {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { y: jy, m: jm, d: jd };
}

export function formatJalali(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const { y, m, day } = (() => {
    const j = gregorianToJalali(d);
    return { y: j.y, m: j.m, day: j.d };
  })();
  const pad = (n: number) => String(n).padStart(2, "0");
  return toFaDigits(`${y}/${pad(m)}/${pad(day)}`);
}

export const VAT_RATE = 0.09;

export function lineTotals(qty: number, unitPrice: number, discount: number) {
  const amount = qty * unitPrice;
  const afterDiscount = Math.max(0, amount - discount);
  const vat = Math.round(afterDiscount * VAT_RATE);
  const payable = afterDiscount + vat;
  return { amount, afterDiscount, vat, payable };
}
