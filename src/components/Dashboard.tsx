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
