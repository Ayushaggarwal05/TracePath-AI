import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl';
  variant?: 'default' | 'darkBeige';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
  variant = 'default',
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
  };

  const isDarkBeige = variant === 'darkBeige';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${maxWidths[maxWidth]} ${
          isDarkBeige
            ? 'bg-[#ECE9E2] dark:bg-[#0D1526] border border-stone-300/90 dark:border-slate-800'
            : 'bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800'
        } rounded-3xl shadow-2xl overflow-hidden z-10 transition-colors ${className}`}
      >
        <div
          className={`flex items-start justify-between px-7 sm:px-8 py-5 sm:py-6 border-b ${
            isDarkBeige
              ? 'border-stone-300/80 dark:border-slate-800 bg-[#DFDACF] dark:bg-[#131D2E]'
              : 'border-stone-100 dark:border-slate-800 bg-[#F7F5F0] dark:bg-[#131D2E]'
          }`}
        >
          <div className="space-y-1.5 pr-4">
            <h3 className="text-xl font-extrabold text-[#0F2742] dark:text-slate-100 tracking-tight font-sans leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 mt-0.5 ${
              isDarkBeige
                ? 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-stone-300/60 dark:hover:bg-slate-800'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-stone-200/60 dark:hover:bg-slate-800'
            }`}
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-7 sm:p-8 max-h-[78vh] overflow-y-auto text-slate-800 dark:text-slate-200 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
