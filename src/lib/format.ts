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
