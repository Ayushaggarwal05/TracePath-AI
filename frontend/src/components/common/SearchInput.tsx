import React, { InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onClear,
  placeholder = 'Search...',
  className = '',
  ...props
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3 w-4 h-4 text-[#0F2742]/60 dark:text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800 rounded-xl text-sm text-[#0F2742] dark:text-slate-100 placeholder-[#0F2742]/60 dark:placeholder-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-slate-400 transition-colors shadow-xs"
        {...props}
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
