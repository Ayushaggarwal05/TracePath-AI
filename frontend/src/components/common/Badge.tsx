import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'indigo' | 'amber' | 'rose' | 'slate';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  dot = false,
  className,
}) => {
  const variants = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 font-semibold',
    indigo: 'bg-slate-100 text-slate-800 border-slate-200 font-semibold',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80 font-semibold',
    rose: 'bg-rose-50 text-rose-800 border-rose-200/80 font-semibold',
    slate: 'bg-stone-100 text-slate-700 border-stone-200',
  };

  const dotColors = {
    emerald: 'bg-emerald-500',
    indigo: 'bg-slate-700',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-400',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide',
          variants[variant],
          className
        )
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
};
