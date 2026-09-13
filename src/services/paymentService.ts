export const createPaymentLink = async (invoiceId: number, amount: number) => {
  try {
    return {
      success: true,
      paymentUrl: `https://divan.app/pay/${invoiceId}?amount=${amount}`
    };
  } catch (error) {
    return { success: false, error: 'خطا در ایجاد لینک پرداخت' };
  }
};
