import React from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'default',
  ...props
}) => {
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Fallback
    }
    if (onClick) onClick(e);
  };

  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
