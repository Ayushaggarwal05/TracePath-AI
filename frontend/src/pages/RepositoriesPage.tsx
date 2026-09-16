import React, { useState } from 'react';
import { useRepositories } from '../hooks/useRepositories';
import { useAutomation } from '../hooks/useAutomation';
import { Repository, AutomationStatus } from '../types/repository';
import { RepositoryCard } from '../components/repositories/RepositoryCard';
import { RepositoryFilters } from '../components/repositories/RepositoryFilters';
import { AutomationSettingsModal } from '../components/repositories/AutomationSettingsModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { BatchActionsBar } from '../components/repositories/BatchActionsBar';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { GitBranch, Plus } from 'lucide-react';

interface RepositoriesPageProps {
  onImportClick: () => void;
}

export const RepositoriesPage: React.FC<RepositoriesPageProps> = ({
  onImportClick,
}) => {
  const { repositories, setRepositories, loading } = useRepositories();
  const { togglingId, toggleAutomation } = useAutomation();

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AutomationStatus>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [settingsRepo, setSettingsRepo] = useState<Repository | null>(null);
  
  // Deactivation confirmation modal state
  const [deactivatingRepo, setDeactivatingRepo] = useState<Repository | null>(null);
  const [batchActionLoading, setBatchActionLoading] = useState(false);

  const activeCount = repositories.filter((r) => r.automation?.status === 'ACTIVE').length;

  const filteredRepos = repositories.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(search.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(search.toLowerCase());

    const status = repo.automation?.status || 'INACTIVE';
    const matchesStatus = statusFilter === 'ALL' || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleToggleClick = (repo: Repository) => {
    const currentStatus = repo.automation?.status || 'INACTIVE';
    if (currentStatus === 'ACTIVE') {
      // Require confirmation before deactivating
      setDeactivatingRepo(repo);
    } else {
      executeToggle(repo, 'INACTIVE');
    }
  };

  const executeToggle = (repo: Repository, currentStatus: AutomationStatus) => {
    toggleAutomation(repo.id, currentStatus, (newStatus) => {
      setRepositories((prev) =>
        prev.map((r) =>
          r.id === repo.id
            ? {
                ...r,
                automation: {
                  ...r.automation!,
                  status: newStatus,
                },
              }
            : r
        )
      );
    });
  };

  const handleConfirmDeactivation = () => {
    if (!deactivatingRepo) return;
    executeToggle(deactivatingRepo, 'ACTIVE');
    setDeactivatingRepo(null);
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchToggle = async (targetStatus: AutomationStatus) => {
    setBatchActionLoading(true);
    for (const id of selectedIds) {
      const repo = repositories.find((r) => r.id === id);
      if (repo && repo.automation?.status !== targetStatus) {
        await new Promise((res) => {
          toggleAutomation(id, repo.automation?.status || 'INACTIVE', (newStatus) => {
            setRepositories((prev) =>
              prev.map((r) => (r.id === id ? { ...r, automation: { ...r.automation!, status: newStatus } } : r))
            );
            res(true);
          });
        });
      }
    }
    setBatchActionLoading(false);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Connected Repositories</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Manage documentation automation and target branch configurations per repository
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={onImportClick} leftIcon={<Plus className="w-4 h-4" />}>
          Import Repository
        </Button>
      </div>

      {/* Filters */}
      <RepositoryFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalCount={repositories.length}
        activeCount={activeCount}
      />

      {/* Repository Cards Grid */}
      {loading ? (
        <LoadingSpinner label="Loading repositories..." />
      ) : filteredRepos.length === 0 ? (
        <EmptyState
          icon={<GitBranch className="w-8 h-8" />}
          title="No repositories found"
          description={
            search || statusFilter !== 'ALL'
              ? 'No repositories match your active filter criteria.'
              : 'You have not connected any repositories for automated documentation synchronization yet.'
          }
          actionLabel={search || statusFilter !== 'ALL' ? 'Clear Filters' : 'Import First Repository'}
          onAction={
            search || statusFilter !== 'ALL'
              ? () => {
                  setSearch('');
                  setStatusFilter('ALL');
                }
              : onImportClick
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepos.map((repo) => (
            <RepositoryCard
              key={repo.id}
              repository={repo}
              isSelected={selectedIds.includes(repo.id)}
              onSelect={handleSelect}
              onToggleAutomation={handleToggleClick}
              onOpenSettings={setSettingsRepo}
              isToggling={togglingId === repo.id}
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal for Disabling Automation */}
      <ConfirmationModal
        isOpen={!!deactivatingRepo}
        onClose={() => setDeactivatingRepo(null)}
        onConfirm={handleConfirmDeactivation}
        title={`Deactivate Automation for ${deactivatingRepo?.name}?`}
        message={`Disabling automation will pause all AI documentation synchronization pipelines for ${deactivatingRepo?.full_name}. Future code commits will not automatically update tracked documentation files.`}
        confirmLabel="Deactivate Automation"
        variant="danger"
      />

      {/* Automation Settings Modal */}
      <AutomationSettingsModal
        repository={settingsRepo}
        isOpen={!!settingsRepo}
        onClose={() => setSettingsRepo(null)}
        onSaved={(updated) => {
          setRepositories((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        }}
      />

      {/* Batch Actions Bar */}
      <BatchActionsBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBatchActivate={() => handleBatchToggle('ACTIVE')}
        onBatchDeactivate={() => handleBatchToggle('INACTIVE')}
        isLoading={batchActionLoading}
      />
    </div>
  );
};
