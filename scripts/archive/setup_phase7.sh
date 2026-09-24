#!/bin/bash

# ۱. افزودن سرویس مدیریت انبار و کنترل موجودی
mkdir -p src/services
cat << 'ES1' > src/services/inventoryService.ts
export interface ProductStock {
  id: number;
  title: string;
  stock: number;
  minAlertStock: number;
}

export const checkLowStock = (products: ProductStock[]): ProductStock[] => {
  return products.filter(product => product.stock <= product.minAlertStock);
};

export const updateStockAfterSale = (products: ProductStock[], soldItems: { id: number; quantity: number }[]) => {
  return products.map(product => {
    const sold = soldItems.find(item => item.id === product.id);
    if (sold) {
      return { ...product, stock: Math.max(0, product.stock - sold.quantity) };
    }
    return product;
  });
};
ES1

# ۲. سرویس گزارش‌گیری مالی و خروجی اکسل (CSV)
cat << 'ES2' > src/services/reportService.ts
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
ES2

# ۳. سرویس ثبت و پیگیری چک‌ها
cat << 'ES3' > src/services/chequeService.ts
export interface Cheque {
  id: string;
  bankName: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'cleared' | 'bounced';
  payerName: string;
}

const CHEQUE_KEY = 'divan_cheques';

export const saveCheque = (cheque: Cheque) => {
  const existing: Cheque[] = JSON.parse(localStorage.getItem(CHEQUE_KEY) || '[]');
  existing.push(cheque);
  localStorage.setItem(CHEQUE_KEY, JSON.stringify(existing));
};

export const getCheques = (): Cheque[] => {
  return JSON.parse(localStorage.getItem(CHEQUE_KEY) || '[]');
};
ES3

# ۴. ثبت تغییرات فاز ۷ در Git و Push به GitHub
git add .
git commit -m "Feat: Complete Phase 7 - Inventory Automation, CSV Export & Cheque Management"
git push origin main

echo "✅ تمامی کدهای فاز ۷ اعمال شده و روی گیت‌هاب آپلود شدند."
