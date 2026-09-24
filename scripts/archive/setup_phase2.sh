#!/bin/bash

# ۱. ساخت ماژول محاسبات مالی (تخفیف، مالیات، جمع کل)
mkdir -p src/utils
cat << 'ES1' > src/utils/calculator.ts
export interface InvoiceItem {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface FinancialSummary {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  finalTotal: number;
}

export const calculateInvoice = (
  items: InvoiceItem[],
  discountPercent: number = 0,
  taxPercent: number = 9
): FinancialSummary => {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxPercent) / 100;
  const finalTotal = taxableAmount + taxAmount;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    finalTotal
  };
};
ES1

# ۲. سرویس خروجی PDF فاکتور
mkdir -p src/services
cat << 'ES2' > src/services/pdfService.ts
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
ES2

# ۳. کامپوننت داشبورد گزارش‌گیری سریع
cat << 'ES3' > src/components/Dashboard.tsx
import React from 'react';

interface DashboardProps {
  stats: {
    todaySales: number;
    monthlySales: number;
    pendingInvoices: number;
  };
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {

  return (
    <div style={{ padding: '1rem', direction: 'rtl' }}>
      <h3>داشبورد مدیریت فروش</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '8px' }}>
          <h4>فروش امروز</h4>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.todaySales.toLocaleString()} تومان</p>
        </div>
        <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '8px' }}>
          <h4>فروش ماهانه</h4>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.monthlySales.toLocaleString()} تومان</p>
        </div>
        <div style={{ background: '#fff3e0', padding: '1rem', borderRadius: '8px' }}>
          <h4>فاکتورهای تسویه‌نشده</h4>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.pendingInvoices} عدد</p>
        </div>
      </div>
    </div>
  );
};
ES3

# ۴. آپدیت ماژول اصلی فاکتور با محاسبات مالی و خروجی PDF
cat << 'ES4' > src/components/InvoiceModule.tsx
import React, { useState } from 'react';
import { calculateInvoice, InvoiceItem } from '../utils/calculator';
import { generateInvoicePDF } from '../services/pdfService';

export const InvoiceModule: React.FC = () => {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(9);

  const addItem = () => {
    if (!title || unitPrice <= 0) return;
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      title,
      quantity,
      unitPrice
    };
    setItems([...items, newItem]);
    setTitle('');
    setUnitPrice(0);
    setQuantity(1);
  };

  const summary = calculateInvoice(items, discountPercent, taxPercent);

  const handleExportPDF = () => {
    generateInvoicePDF({
      id: Date.now(),
      items,
      totalAmount: summary.finalTotal
    });
  };

  return (
    <div style={{ padding: '1rem', direction: 'rtl' }}>
      <h3>صدور فاکتور جدید</h3>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input 
          placeholder="عنوان کالا / خدمت" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: '0.5rem', flex: 2 }}
        />
        <input 
          type="number" 
          placeholder="تعداد" 
          value={quantity} 
          onChange={(e) => setQuantity(Number(e.target.value))}
          style={{ padding: '0.5rem', flex: 1 }}
        />
        <input 
          type="number" 
          placeholder="قیمت واحد" 
          value={unitPrice || ''} 
          onChange={(e) => setUnitPrice(Number(e.target.value))}
          style={{ padding: '0.5rem', flex: 1 }}
        />
        <button onClick={addItem} style={{ padding: '0.5rem 1rem' }}>افزودن</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '0.5rem', textAlign: 'right' }}>عنوان</th>
            <th style={{ padding: '0.5rem', textAlign: 'right' }}>تعداد</th>
            <th style={{ padding: '0.5rem', textAlign: 'right' }}>قیمت واحد</th>
            <th style={{ padding: '0.5rem', textAlign: 'right' }}>جمع</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.5rem' }}>{item.title}</td>
              <td style={{ padding: '0.5rem' }}>{item.quantity}</td>
              <td style={{ padding: '0.5rem' }}>{item.unitPrice.toLocaleString()}</td>
              <td style={{ padding: '0.5rem' }}>{(item.quantity * item.unitPrice).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fafafa', borderRadius: '8px' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
          <label>
            تخفیف (%):
            <input 
              type="number" 
              value={discountPercent} 
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              style={{ width: '60px', marginRight: '0.5rem' }}
            />
          </label>
          <label>
            مالیات (%):
            <input 
              type="number" 
              value={taxPercent} 
              onChange={(e) => setTaxPercent(Number(e.target.value))}
              style={{ width: '60px', marginRight: '0.5rem' }}
            />
          </label>
        </div>

        <p>مبلغ اولیه: {summary.subtotal.toLocaleString()} تومان</p>
        <p>مبلغ تخفیف: {summary.discountAmount.toLocaleString()} تومان</p>
        <p>مالیات: {summary.taxAmount.toLocaleString()} تومان</p>
        <h4 style={{ color: '#2e7d32' }}>قابل پرداخت: {summary.finalTotal.toLocaleString()} تومان</h4>

        <button 
          onClick={handleExportPDF} 
          disabled={items.length === 0}
          style={{ padding: '0.75rem 1.5rem', marginTop: '1rem', cursor: 'pointer' }}
        >
          دریافت PDF فاکتور
        </button>
      </div>
    </div>
  );
};
ES4

# ۵. ثبت تغییرات فاز ۲ در Git و Push به GitHub
git add .
git commit -m "Feat: Complete Phase 2 - UI/UX, Discount/Tax Calculations, PDF Export & Dashboard"
git push origin main

echo "✅ تمامی کدهای فاز ۲ جای‌گذاری شده و روی گیت‌هاب آپلود شدند."
