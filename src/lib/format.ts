export interface LineItemInput {
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  vatRate?: number;
}

export interface LineItemResult {
  amount: number;
  discountAmount: number;
  afterDiscount: number;
  vatAmount: number;
  total: number;
}

export const calculateLineTotals = (item: LineItemInput): LineItemResult => {
  const qty = item.quantity || 0;
  const price = item.unitPrice || 0;
  const discountPercent = item.discountPercent || 0;
  const vatRate = item.vatRate || 0;

  // ۱. مبلغ خام (گرد شده جهت جلوگیری از دریفت اعشاری)
  const amount = Math.round(qty * price);

  // ۲. محاسبه تخفیف و مبلغ پس از تخفیف
  const discountAmount = Math.round((amount * discountPercent) / 100);
  const afterDiscount = Math.round(amount - discountAmount);

  // ۳. محاسبه مالیات بر ارزش افزوده
  const vatAmount = Math.round((afterDiscount * vatRate) / 100);

  // ۴. جمع کل سطر
  const total = Math.round(afterDiscount + vatAmount);

  return {
    amount,
    discountAmount,
    afterDiscount,
    vatAmount,
    total,
  };
};
