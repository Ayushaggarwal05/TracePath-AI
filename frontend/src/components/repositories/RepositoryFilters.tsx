import React from 'react';
import { SearchInput } from '../common/SearchInput';
import { AutomationStatus } from '../../types/repository';

interface RepositoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'ALL' | AutomationStatus;
  onStatusFilterChange: (status: 'ALL' | AutomationStatus) => void;
  totalCount: number;
  activeCount: number;
}

export const RepositoryFilters: React.FC<RepositoryFiltersProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  totalCount,
  activeCount,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
      <div className="w-full sm:w-80">
        <SearchInput
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          placeholder="Filter by repository name..."
        />
      </div>

      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-xs self-start sm:self-auto overflow-x-auto">
        <button
          onClick={() => onStatusFilterChange('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All ({totalCount})
        </button>
        <button
          onClick={() => onStatusFilterChange('ACTIVE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            statusFilter === 'ACTIVE'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Active ({activeCount})
        </button>
        <button
          onClick={() => onStatusFilterChange('INACTIVE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            statusFilter === 'INACTIVE'
              ? 'bg-slate-200 text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Inactive ({totalCount - activeCount})
        </button>
      </div>
    </div>
  );
};
