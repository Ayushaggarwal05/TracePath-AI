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
    emerald: 'hover:border-emerald-500/40 hover:shadow-glow-emerald',
    indigo: 'hover:border-indigo-500/40 hover:shadow-glow-indigo',
    none: '',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'bg-dark-card border border-dark-border rounded-xl p-5 transition-all duration-200',
          hoverable && 'hover:bg-dark-hover hover:border-slate-700 cursor-pointer',
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
