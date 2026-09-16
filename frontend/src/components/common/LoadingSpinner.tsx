import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
  className = '',
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-3 ${className}`}>
      <div
        className={`${sizes[size]} border-2 border-brand-500/20 border-t-brand-400 rounded-full animate-spin`}
      />
      {label && <p className="text-sm text-slate-400 font-medium">{label}</p>}
    </div>
  );
};
