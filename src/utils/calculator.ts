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
