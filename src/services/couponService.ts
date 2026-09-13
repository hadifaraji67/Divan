export interface Coupon {
  code: string;
  discountPercent: number;
  maxDiscountAmount: number;
  expiryDate: string;
}

export const validateAndApplyCoupon = (coupon: Coupon, invoiceSubtotal: number) => {
  const now = new Date().toISOString().split('T')[0];
  if (coupon.expiryDate < now) {
    return { valid: false, message: 'کد تخفیف منقضی شده است', discountAmount: 0 };
  }

  let discount = (invoiceSubtotal * coupon.discountPercent) / 100;
  if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
    discount = coupon.maxDiscountAmount;
  }

  return { valid: true, message: 'کد تخفیف اعمال شد', discountAmount: discount };
};
