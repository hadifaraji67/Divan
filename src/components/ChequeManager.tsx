import React from 'react';
import { Cheque, ChequeStatus } from '../types/cheque';

interface Props {
  cheques: Cheque[];
  onStatusChange: (cheque: Cheque, newStatus: ChequeStatus) => void;
}

export const ChequeManager: React.FC<Props> = ({ cheques, onStatusChange }) => {
  const getStatusBadge = (status: ChequeStatus) => {
    const badges: Record<ChequeStatus, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CLEARED: 'bg-green-100 text-green-800',
      BOUNCED: 'bg-red-100 text-red-800',
      PASSED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<ChequeStatus, string> = {
      PENDING: 'در جریان وصول',
      CLEARED: 'وصول شده',
      BOUNCED: 'برگشتی',
      PASSED: 'خرج شده',
      CANCELLED: 'ابطال شده',
    };
    return <span className={`px-2 py-1 rounded-md text-xs font-semibold ${badges[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="w-full dir-rtl text-right space-y-4">
      <h3 className="text-lg font-bold">دفتر مدیریت چک‌ها و اسناد</h3>
      <div className="overflow-x-auto border rounded-xl bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b text-muted-foreground">
            <tr>
              <th className="p-3">شماره چک</th>
              <th className="p-3">بانک</th>
              <th className="p-3">مبلغ (تومان)</th>
              <th className="p-3">سررسید</th>
              <th className="p-3">نوع</th>
              <th className="p-3">وضعیت</th>
              <th className="p-3">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {cheques.map((chq) => (
              <tr key={chq.id} className="hover:bg-muted/30">
                <td className="p-3 font-mono">{chq.chequeNumber}</td>
                <td className="p-3">{chq.bankName}</td>
                <td className="p-3 font-semibold">{Math.round(chq.amount).toLocaleString('fa-IR')}</td>
                <td className="p-3 dir-ltr text-right">{chq.dueDate}</td>
                <td className="p-3">{chq.type === 'RECEIVABLE' ? 'دریافتی' : 'پرداختی'}</td>
                <td className="p-3">{getStatusBadge(chq.status)}</td>
                <td className="p-3">
                  {chq.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onStatusChange(chq, 'CLEARED')}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        وصول
                      </button>
                      <button
                        onClick={() => onStatusChange(chq, 'BOUNCED')}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        برگشت
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
