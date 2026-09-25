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
          'bg-white border border-slate-200/90 rounded-2xl p-5 transition-all duration-200 shadow-xs',
          hoverable && 'hover:bg-slate-50/80 hover:border-slate-300 cursor-pointer',
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
