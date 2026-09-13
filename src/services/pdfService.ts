export const generateInvoicePDF = (invoiceData: any) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <title>فاکتور فروش #${invoiceData.id || ''}</title>
      <style>
        body { font-family: Tahoma, sans-serif; padding: 20px; direction: rtl; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
        th { background-color: #f2f2f2; }
        .total-box { margin-top: 20px; text-align: left; }
      </style>
    </head>
    <body>
      <h2>فاکتور فروش دیوان</h2>
      <p>تاریخ: ${new Date().toLocaleDateString('fa-IR')}</p>
      <p>مشتری: ${invoiceData.customerName || 'مشتری عمومی'}</p>
      
      <table>
        <thead>
          <tr>
            <th>کالا / خدمت</th>
            <th>تعداد</th>
            <th>قیمت واحد</th>
            <th>جمع کل</th>
          </tr>
        </thead>
        <tbody>
          ${(invoiceData.items || []).map((item: any) => `
            <tr>
              <td>${item.title}</td>
              <td>${item.quantity}</td>
              <td>${item.unitPrice.toLocaleString()}</td>
              <td>${(item.quantity * item.unitPrice).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-box">
        <p><strong>جمع کل: ${invoiceData.totalAmount?.toLocaleString() || 0} تومان</strong></p>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
