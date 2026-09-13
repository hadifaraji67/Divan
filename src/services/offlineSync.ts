const OFFLINE_KEY = 'divan_pending_invoices';

export const saveInvoiceOffline = (invoiceData: any) => {
  const existing = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]');
  existing.push({ ...invoiceData, savedAt: new Date().toISOString() });
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(existing));
};

export const getPendingOfflineInvoices = () => {
  return JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]');
};

export const clearOfflineInvoices = () => {
  localStorage.removeItem(OFFLINE_KEY);
};
