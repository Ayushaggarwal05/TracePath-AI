import React, { useState, useEffect } from 'react';
import { useExecutions } from '../hooks/useExecutions';
import { activityService } from '../services/activityService';
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
import { Activity, RefreshCw, Layers, Clock } from 'lucide-react';

export const ActivityPage: React.FC = () => {
  const { executions, loading: executionsLoading, refetch } = useExecutions();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  // Tab mode: 'events' (Chronological Stream) vs 'traces' (Execution Pipeline Traces)
  const [viewMode, setViewMode] = useState<'events' | 'traces'>('events');

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ExecutionStatus>('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState<'ALL' | ActivityEventType>('ALL');
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);

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
    return matchesSearch && matchesStatus;
  });

  // Filtered Activities
  const filteredActivities = activities.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      evt.description.toLowerCase().includes(search.toLowerCase()) ||
      evt.repository_name.toLowerCase().includes(search.toLowerCase()) ||
      (evt.commit_sha || '').toLowerCase().includes(search.toLowerCase());

    const matchesType = eventTypeFilter === 'ALL' || evt.type === eventTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleOpenExecution = (executionId: string) => {
    const found = executions.find((e) => e.id === executionId);
    if (found) {
      setSelectedExecution(found);
    } else {
      // Create fallback execution object if not yet in array
      setSelectedExecution({
        id: executionId,
        repository_id: 'repo-1',
        repository_name: 'tracepath-org/tracepath-backend',
        event_type: 'push',
        commit_sha: 'a8f4c219',
        branch: 'main',
        status: 'COMPLETED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        analysis_result: {
          summary: 'Synchronized documentation with recent code modifications.',
          purpose: 'Maintain architectural specification accuracy.',
          key_changes: ['Updated core components'],
          affected_components: ['API Engine'],
          behavior_changes: [],
          dependencies: [],
          evidence: [],
          uncertainties: [],
        },
      });
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search commits, repos, or summaries..."
          />
        </div>

        {viewMode === 'events' ? (
          <div className="flex items-center gap-1.5 p-1 bg-dark-card border border-dark-border rounded-lg overflow-x-auto self-start sm:self-auto text-xs">
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
          <div className="flex items-center gap-1.5 p-1 bg-dark-card border border-dark-border rounded-lg overflow-x-auto self-start sm:self-auto text-xs">
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
      />
    </div>
  );
};
