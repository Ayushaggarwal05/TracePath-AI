import React from 'react';

interface LoadingDotsProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'slate' | 'brand' | 'muted' | 'white';
  label?: string;
  className?: string;
  inline?: boolean;
  overlay?: boolean;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 'md',
  color = 'slate',
  label,
  className = '',
  inline = false,
  overlay = false,
}) => {
  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
  };

  const gapSizes = {
    xs: 'gap-1',
    sm: 'gap-1.5',
    md: 'gap-2',
    lg: 'gap-2.5',
  };

  const colorStyles = {
    slate: 'bg-slate-400 dark:bg-slate-500',
    brand: 'bg-[#1877F2] dark:bg-[#388BFD]',
    muted: 'bg-slate-300 dark:bg-slate-600',
    white: 'bg-white',
  };

  const dotClass = `${dotSizes[size]} ${colorStyles[color]} rounded-full shadow-sm`;

  const content = (
    <div className={`flex flex-col items-center justify-center ${inline ? 'inline-flex' : 'p-6'} ${gapSizes[size]} ${className}`}>
      <div className={`flex items-center ${gapSizes[size]}`}>
        <span className={`${dotClass} animate-dot-wave-1`} />
        <span className={`${dotClass} animate-dot-wave-2`} />
        <span className={`${dotClass} animate-dot-wave-3`} />
        <span className={`${dotClass} animate-dot-wave-4`} />
      </div>
      {label && (
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-tight mt-1 animate-pulse">
          {label}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-xl transition-all duration-300">
        {content}
      </div>
    );
  }

  return content;
};
