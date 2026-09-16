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

      <div className="flex items-center gap-1.5 p-1 bg-dark-card border border-dark-border rounded-lg self-start sm:self-auto overflow-x-auto">
        <button
          onClick={() => onStatusFilterChange('ALL')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            statusFilter === 'ALL'
              ? 'bg-slate-800 text-slate-100 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({totalCount})
        </button>
        <button
          onClick={() => onStatusFilterChange('ACTIVE')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            statusFilter === 'ACTIVE'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-emerald-400'
          }`}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => onStatusFilterChange('INACTIVE')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            statusFilter === 'INACTIVE'
              ? 'bg-slate-800 text-slate-300'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Inactive ({totalCount - activeCount})
        </button>
      </div>
    </div>
  );
};
