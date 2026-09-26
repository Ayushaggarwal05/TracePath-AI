import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glow?: 'emerald' | 'indigo' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  glow = 'none',
  ...props
}) => {
  const glowStyles = {
    emerald: 'hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-500/10',
    indigo: 'hover:border-slate-400 hover:shadow-md',
    none: '',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800/90 rounded-2xl p-5 transition-all duration-200 shadow-xs text-slate-900 dark:text-slate-100',
          hoverable && 'hover:bg-stone-50/80 dark:hover:bg-[#111C33] hover:border-stone-300 dark:hover:border-slate-700 cursor-pointer',
          glowStyles[glow],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
