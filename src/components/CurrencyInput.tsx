import React from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder = 'مبلغ را وارد کنید',
  label,
  className = '',
  ...props
}) => {
  const formatNumber = (val: string | number) => {
    if (!val && val !== 0) return '';
    const cleanVal = val.toString().replace(/\D/g, '');
    if (!cleanVal) return '';
    return new Intl.NumberFormat('fa-IR').format(parseInt(cleanVal, 10));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    onChange(rawValue);
  };

  return (
    <div className="w-full flex flex-col gap-1.5 dir-rtl">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <div className="relative flex items-center">
        <input
          type="text"
          inputMode="numeric"
          value={formatNumber(value)}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md text-right dir-rtl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors ${className}`}
          {...props}
        />
        <span className="absolute left-3 text-xs text-muted-foreground pointer-events-none">تومان</span>
      </div>
    </div>
  );
};
