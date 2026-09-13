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
export default InvoiceModule;
