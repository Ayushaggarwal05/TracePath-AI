import React, { useState } from 'react';
import { useExecutions } from '../hooks/useExecutions';
import { Execution, ExecutionStatus } from '../types/execution';
import { Card } from '../components/common/Card';
import { SearchInput } from '../components/common/SearchInput';
import { ExecutionTimeline } from '../components/activity/ExecutionTimeline';
import { ExecutionDetailDrawer } from '../components/activity/ExecutionDetailDrawer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Activity, RefreshCw } from 'lucide-react';

export const ActivityPage: React.FC = () => {
  const { executions, loading, refetch } = useExecutions();
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ExecutionStatus>('ALL');
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);

  const filteredExecutions = executions.filter((exec) => {
    const matchesSearch =
      exec.commit_sha.toLowerCase().includes(search.toLowerCase()) ||
      (exec.analysis_result?.summary || '').toLowerCase().includes(search.toLowerCase()) ||
      (exec.repository_name || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || exec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Execution Activity & Audit Log</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Full trace history of multi-agent analysis, decisions, and synchronized diffs
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={refetch} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Traces
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search by commit SHA or summary..."
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-dark-card border border-dark-border rounded-lg overflow-x-auto self-start sm:self-auto">
          {(['ALL', 'COMPLETED', 'SKIPPED', 'FAILED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                statusFilter === st
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Traces' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Card */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading execution traces..." />
        ) : filteredExecutions.length === 0 ? (
          <EmptyState
            icon={<Activity className="w-8 h-8" />}
            title="No executions found"
            description={
              search || statusFilter !== 'ALL'
                ? 'No activity matches your active search or status filter.'
                : 'No documentation synchronization runs have occurred yet.'
            }
            actionLabel={search || statusFilter !== 'ALL' ? 'Clear Filters' : undefined}
            onAction={
              search || statusFilter !== 'ALL'
                ? () => {
                    setSearch('');
                    setStatusFilter('ALL');
                  }
                : undefined
            }
          />
        ) : (
          <ExecutionTimeline
            executions={filteredExecutions}
            onSelectExecution={setSelectedExecution}
          />
        )}
      </Card>

      {/* Execution Detail Drawer */}
      <ExecutionDetailDrawer
        execution={selectedExecution}
        isOpen={!!selectedExecution}
        onClose={() => setSelectedExecution(null)}
      />
    </div>
  );
};
