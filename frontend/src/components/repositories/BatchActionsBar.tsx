import React from 'react';
import { Button } from '../common/Button';
import { Play, Pause, X } from 'lucide-react';

interface BatchActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBatchActivate: () => void;
  onBatchDeactivate: () => void;
  isLoading?: boolean;
}

export const BatchActionsBar: React.FC<BatchActionsBarProps> = ({
  selectedCount,
  onClearSelection,
  onBatchActivate,
  onBatchDeactivate,
  isLoading = false,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-5 py-3 bg-slate-900/95 border border-brand-500/40 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
        <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
        <span className="text-xs font-semibold text-slate-100">
          {selectedCount} {selectedCount === 1 ? 'repository' : 'repositories'} selected
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="primary"
          onClick={onBatchActivate}
          isLoading={isLoading}
          leftIcon={<Play className="w-3.5 h-3.5" />}
        >
          Activate All
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={onBatchDeactivate}
          isLoading={isLoading}
          leftIcon={<Pause className="w-3.5 h-3.5" />}
        >
          Deactivate All
        </Button>
      </div>

      <button
        onClick={onClearSelection}
        className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
        title="Deselect all"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
