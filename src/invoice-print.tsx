import { Capacitor } from '@capacitor/core';
import { Plugins } from '@capacitor/core';

const { NativePrintPlugin } = Plugins;

export const printInvoice = async (invoiceData: any) => {
  if (Capacitor.isNativePlatform() && NativePrintPlugin) {
    try {
      await NativePrintPlugin.print({ data: JSON.stringify(invoiceData) });
      return;
    } catch (error) {
      console.warn("Native print failed, falling back to Web print:", error);
    }
  }

  handleWebPrint(invoiceData);
};

const handleWebPrint = (data: any) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>فاکتور فروش - ${data.id || ''}</title>
        <style>
          body { font-family: Tahoma, sans-serif; direction: rtl; padding: 20px; }
          .invoice-box { border: 1px solid #eee; padding: 10px; }
          @media print {
            body { margin: 0; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <h2>فاکتور دیوان</h2>
          <p>مبلغ کل: ${data.totalAmount || 0} ریال</p>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};
