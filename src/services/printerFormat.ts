export interface PrintOptions {
  paperWidth: '58mm' | '80mm';
  invoiceData: any;
}

export const formatTextForThermalPrinter = (options: PrintOptions): string => {
  const { paperWidth, invoiceData } = options;
  const lineLength = paperWidth === '58mm' ? 32 : 48;
  const separator = '-'.repeat(lineLength);

  let text = `فاکتور فروش دیوان\n`;
  text += `${separator}\n`;
  text += `تاریخ: ${new Date().toLocaleDateString('fa-IR')}\n`;
  if (invoiceData.customerName) {
    text += `مشتری: ${invoiceData.customerName}\n`;
  }
  text += `${separator}\n`;

  (invoiceData.items || []).forEach((item: any) => {
    const itemLine = `${item.title} x${item.quantity}`;
    const priceLine = `${(item.quantity * item.unitPrice).toLocaleString()} تومان`;
    text += `${itemLine}\n${priceLine}\n`;
  });

  text += `${separator}\n`;
  text += `جمع کل: ${invoiceData.totalAmount?.toLocaleString() || 0} تومان\n`;
  text += `${separator}\n\n`;

  return text;
};
