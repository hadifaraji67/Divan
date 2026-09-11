import React from 'react';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => {
  return <div className={`animate-pulse rounded-md bg-muted/60 ${className}`} {...props} />;
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-4 border rounded-xl space-y-3 bg-card dir-rtl">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <div className="pt-2 flex justify-between items-center">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
};
