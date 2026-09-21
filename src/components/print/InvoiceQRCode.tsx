import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { buildInvoiceQRText } from '../../lib/invoice-qr';
import type { Invoice } from '../../types/models';

interface Props {
  invoice: Invoice;
  size?: number;
  showCaption?: boolean;
}

export const InvoiceQRCode: React.FC<Props> = ({
  invoice,
  size = 100,
  showCaption = true,
}) => {
  const text = buildInvoiceQRText(invoice);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="bg-white p-1.5 rounded">
        <QRCodeSVG
          value={text}
          size={size}
          level="M"
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>
      {showCaption && (
        <div className="text-[7px] text-slate-500 text-center leading-tight">
          تأیید اصالت
          <br />
          دیوان
        </div>
      )}
    </div>
  );
};

export default InvoiceQRCode;
