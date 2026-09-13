export const exportInvoicesToCSV = (invoices: any[]) => {
  let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
  csvContent += "شناسه فاکتور,تاریخ,نام مشتری,مبلغ کل (تومان),وضعیت\n";

  invoices.forEach(inv => {
    const row = `${inv.id},${inv.createdAt || ''},${inv.customerName || 'عمومی'},${inv.totalAmount},${inv.status}`;
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `invoices_report_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
