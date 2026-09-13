export const formatInvoiceSms = (customerName: string, invoiceId: number, amount: number, paymentUrl?: string): string => {
  let message = `${customerName} عزیز، فاکتور شماره ${invoiceId} به مبلغ ${amount.toLocaleString()} تومان ثبت شد.`;
  if (paymentUrl) {
    message += `\nلینک پرداخت: ${paymentUrl}`;
  }
  message += `\nبا تشکر - دیوان`;
  return message;
};

export const sendSmsNotification = async (phone: string, message: string) => {
  // آمادگی جهت فراخوانی سرویس‌های پیامک (مثل کاوه‌نگار یا ملی‌پیامک)
  console.log(`Sending SMS to ${phone}: ${message}`);
  return { success: true };
};
