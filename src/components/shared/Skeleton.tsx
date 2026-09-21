import React from 'react';

interface Props {
  className?: string;
}

export const Skeleton: React.FC<Props> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`}
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export const SkeletonStats: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
