import React, { useState, useEffect } from 'react';
import { useExecutions } from '../hooks/useExecutions';
import { useRepositories } from '../hooks/useRepositories';
import { activityService } from '../services/activityService';
import { executionService } from '../services/executionService';
import { Execution, ExecutionStatus } from '../types/execution';
import { ActivityEvent, ActivityEventType } from '../types/activity';
import { Card } from '../components/common/Card';
import { SearchInput } from '../components/common/SearchInput';
import { ExecutionTimeline } from '../components/activity/ExecutionTimeline';
import { ActivityFeedList } from '../components/activity/ActivityFeedList';
import { ExecutionDetailDrawer } from '../components/activity/ExecutionDetailDrawer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Activity, RefreshCw, Layers, Clock, FolderGit2, ChevronDown } from 'lucide-react';


export const ActivityPage: React.FC = () => {
  const { executions, loading: executionsLoading, refetch } = useExecutions();
  const { repositories } = useRepositories();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  // Tab mode: 'events' (Chronological Stream) vs 'traces' (Execution Pipeline Traces)
  const [viewMode, setViewMode] = useState<'events' | 'traces'>('events');

  const [search, setSearch] = useState<string>('');
  const [repoFilter, setRepoFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ExecutionStatus>('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState<'ALL' | ActivityEventType>('ALL');
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [selectedExecutionTab, setSelectedExecutionTab] = useState<'pipeline' | 'agents' | 'files' | 'diff'>('pipeline');

  const loadActivities = async () => {
    setActivityLoading(true);
    try {
      const res = await activityService.getActivityEvents();
      setActivities(res.items);
    } catch (err) {
      console.error('Failed to load activities', err);
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleRefresh = () => {
    refetch();
    loadActivities();
  };

  // Filtered Executions
  const filteredExecutions = executions.filter((exec) => {
    const matchesSearch =
      exec.commit_sha.toLowerCase().includes(search.toLowerCase()) ||
      (exec.analysis_result?.summary || '').toLowerCase().includes(search.toLowerCase()) ||
      (exec.repository_name || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || exec.status === statusFilter;
    const matchesRepo =
      repoFilter === 'ALL' ||
      exec.repository_id === repoFilter ||
      (exec.repository_name || '').toLowerCase().includes(repoFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesRepo;
  });

  // Filtered Activities
  const filteredActivities = activities.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      evt.description.toLowerCase().includes(search.toLowerCase()) ||
      evt.repository_name.toLowerCase().includes(search.toLowerCase()) ||
      (evt.commit_sha || '').toLowerCase().includes(search.toLowerCase());

    const matchesType = eventTypeFilter === 'ALL' || evt.type === eventTypeFilter;
    const matchesRepo =
      repoFilter === 'ALL' ||
      evt.repository_id === repoFilter ||
      evt.repository_name.toLowerCase().includes(repoFilter.toLowerCase());

    return matchesSearch && matchesType && matchesRepo;
  });

  const handleOpenExecution = async (executionId: string, tab: 'pipeline' | 'agents' | 'files' | 'diff' = 'pipeline') => {
    setSelectedExecutionTab(tab);
    // Instant optimistic render from list if available
    const found = executions.find((e) => e.id === executionId);
    if (found) {
      setSelectedExecution(found);
    }
    // Fetch full, complete execution record with all agent details from API
    try {
      const fullExec = await executionService.getExecution(executionId);
      if (fullExec) {
        setSelectedExecution(fullExec);
      }
    } catch (err) {
      console.error('Failed to fetch full execution details', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Audit & Activity Log</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Chronological audit stream of webhooks, AI agent executions, and documentation commits
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center p-0.5 bg-dark-card border border-dark-border rounded-lg text-xs">
            <button
              onClick={() => setViewMode('events')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                viewMode === 'events'
                  ? 'bg-slate-800 text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Event Stream</span>
            </button>
            <button
              onClick={() => setViewMode('traces')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                viewMode === 'traces'
                  ? 'bg-slate-800 text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Pipeline Traces</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-2xl">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search commits, repos, or summaries..."
            />
          </div>

          {/* Repository Selector Dropdown (Active Automation Only) */}
          <div className="relative min-w-[210px] shrink-0">
            <select
              value={repoFilter}
              onChange={(e) => setRepoFilter(e.target.value)}
              className="w-full appearance-none pl-8 pr-8 py-2 bg-dark-card border border-dark-border rounded-lg text-xs text-slate-200 font-medium focus:outline-none focus:border-brand-500/60 cursor-pointer hover:border-slate-700 transition-colors"
            >
              <option value="ALL">
                All Active Repos ({repositories.filter((r) => r.automation?.status === 'ACTIVE').length})
              </option>
              {repositories
                .filter((r) => r.automation?.status === 'ACTIVE')
                .map((repo) => (
                  <option key={repo.id} value={repo.id}>
                    {repo.name}
                  </option>
                ))}
            </select>
            <FolderGit2 className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>


          {repoFilter !== 'ALL' && (
            <button
              onClick={() => setRepoFilter('ALL')}
              className="text-xs text-brand-400 hover:underline shrink-0 whitespace-nowrap self-center"
            >
              Reset Repo
            </button>
          )}
        </div>

        {viewMode === 'events' ? (
          <div className="flex items-center gap-1.5 p-1 bg-dark-card border border-dark-border rounded-lg overflow-x-auto self-start lg:self-auto text-xs">
            {(
              [
                { id: 'ALL', label: 'All Events' },
                { id: 'COMMIT_CREATED', label: 'Commits' },
                { id: 'DOCUMENTATION_UPDATED', label: 'Doc Updates' },
                { id: 'AI_ANALYSIS_COMPLETED', label: 'AI Analyses' },
                { id: 'CODE_CHANGE_DETECTED', label: 'Code Pushes' },
                { id: 'AUTOMATION_ACTIVATED', label: 'Activated' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setEventTypeFilter(filter.id as any)}
                className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${
                  eventTypeFilter === filter.id
                    ? 'bg-slate-800 text-slate-100 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 p-1 bg-dark-card border border-dark-border rounded-lg overflow-x-auto self-start lg:self-auto text-xs">
            {(['ALL', 'COMPLETED', 'SKIPPED', 'FAILED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-slate-800 text-slate-100 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Traces' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}
      </div>


      {/* Main Content Area */}
      <Card className="p-0 overflow-hidden">
        {viewMode === 'events' ? (
          activityLoading ? (
            <LoadingSpinner label="Loading chronological activity stream..." />
          ) : filteredActivities.length === 0 ? (
            <EmptyState
              icon={<Activity className="w-8 h-8" />}
              title="No events found"
              description="No activity matches your active search or event type filter."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearch('');
                setEventTypeFilter('ALL');
              }}
            />
          ) : (
            <ActivityFeedList
              events={filteredActivities}
              onSelectExecution={handleOpenExecution}
            />
          )
        ) : executionsLoading ? (
          <LoadingSpinner label="Loading execution traces..." />
        ) : filteredExecutions.length === 0 ? (
          <EmptyState
            icon={<Activity className="w-8 h-8" />}
            title="No executions found"
            description="No pipeline runs match your search or status filter."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearch('');
              setStatusFilter('ALL');
            }}
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
        initialTab={selectedExecutionTab}
      />
    </div>
  );
};
