export const gregorianToJalali = (gy: number, gm: number, gd: number) => {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  jy += Math.floor((days - 1) / 365);
  if (days > 0) days = (days - 1) % 365;
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
};

export const formatJalali = (date: any) => {
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'short' }).format(new Date(date));
  } catch {
    return '';
  }
};

export const formatRial = (amount: number | string) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('fa-IR').format(num) + ' ریال';
};

export const parseAmount = (val: string) => {
  if (!val) return 0;
  const englishDigits = val.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
  return parseFloat(englishDigits.replace(/,/g, '')) || 0;
};

export const toFaDigits = (str: string | number) => {
  if (str === null || str === undefined) return '';
  return str.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
};

export const lineTotals = (items: any[]) => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
};
