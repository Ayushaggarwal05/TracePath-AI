import React, { useState, useEffect } from 'react';
import { Repository, AutomationStatus } from '../types/repository';
import { Execution } from '../types/execution';
import { TrackedDocument } from '../types/documentation';
import { ActivityEvent } from '../types/activity';
import { repositoryService } from '../services/repositoryService';
import { executionService } from '../services/executionService';
import { documentationService } from '../services/documentationService';
import { activityService } from '../services/activityService';
import { useAutomation } from '../hooks/useAutomation';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { AutomationSettingsModal } from '../components/repositories/AutomationSettingsModal';
import { QuickSyncTriggerModal } from '../components/dashboard/QuickSyncTriggerModal';
import { ExecutionDetailDrawer } from '../components/activity/ExecutionDetailDrawer';
import { DocumentationCatalog } from '../components/documentation/DocumentationCatalog';
import { DocHistoryModal } from '../components/documentation/DocHistoryModal';
import { ActivityFeedList } from '../components/activity/ActivityFeedList';
import { formatShortSha, formatDate, formatDuration } from '../utils/formatters';
import { getExecutionStatusStyle } from '../utils/statusStyles';
import {
  GitBranch,
  GitCommit,
  FileCode,
  Activity,
  Settings,
  RefreshCw,
  Power,
  PowerOff,
  ExternalLink,
  ChevronLeft,
  Clock,
} from 'lucide-react';

interface RepositoryDetailPageProps {
  repositoryId: string;
  onBack: () => void;
}

export const RepositoryDetailPage: React.FC<RepositoryDetailPageProps> = ({
  repositoryId,
  onBack,
}) => {
  const { togglingId, toggleAutomation } = useAutomation();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [documents, setDocuments] = useState<TrackedDocument[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<'changes' | 'executions' | 'docs' | 'activity'>('changes');

  // Modals & Drawers
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [selectedExecutionTab, setSelectedExecutionTab] = useState<'pipeline' | 'agents' | 'files' | 'diff'>('pipeline');
  const [historyDoc, setHistoryDoc] = useState<TrackedDocument | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Repository Details
      const reposResponse = await repositoryService.getRepositories();
      const currentRepo =
        reposResponse.items.find((r) => r.id === repositoryId) ||
        (await repositoryService.getRepository(repositoryId).catch(() => null));
      setRepository(currentRepo);

      // 2. Fetch Executions for this repository
      const execsResponse = await executionService.getExecutions({ repository_id: repositoryId });
      setExecutions(execsResponse.items);

      // 3. Fetch Tracked Documents
      const docsResponse = await documentationService.getTrackedDocuments(repositoryId);
      setDocuments(docsResponse);

      // 4. Fetch Activity Events
      const activityResponse = await activityService.getActivityEvents({ repository_id: repositoryId });
      setActivities(activityResponse.items);
    } catch (err) {
      console.error('Failed to load repository detail data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [repositoryId]);

  const handleToggleAutomation = () => {
    if (!repository) return;
    const currentStatus = repository.automation?.status || 'INACTIVE';
    if (currentStatus === 'ACTIVE') {
      setShowDeactivateModal(true);
    } else {
      executeToggle('INACTIVE');
    }
  };

  const executeToggle = (currentStatus: AutomationStatus) => {
    if (!repository) return;
    toggleAutomation(repository.id, currentStatus, (newStatus) => {
      setRepository((prev) =>
        prev
          ? {
              ...prev,
              automation: {
                ...prev.automation!,
                status: newStatus,
              },
            }
          : prev
      );
    });
  };

  const handleConfirmDeactivation = () => {
    executeToggle('ACTIVE');
    setShowDeactivateModal(false);
  };

  if (loading && !repository) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner label="Loading repository workspace..." />
      </div>
    );
  }

  if (!repository) {
    return (
      <EmptyState
        icon={<GitBranch className="w-8 h-8" />}
        title="Repository Not Found"
        description="The repository you are looking for does not exist or has been removed."
        actionLabel="Back to Repositories"
        onAction={onBack}
      />
    );
  }

  const isAutomationActive = repository.automation?.status === 'ACTIVE';
  const latestExecution = executions[0];
  const latestDocUpdate = documents.reduce(
    (latest, doc) => (!latest || doc.last_updated_at > latest ? doc.last_updated_at : latest),
    ''
  );

  // Mock recent incoming git commits for the Changes tab
  const mockRecentCommits = [
    {
      sha: latestExecution?.commit_sha || 'a8f4c219904d493a772c5a14d5e9712a884c12ef',
      message: 'feat(billing): add stripe webhook verification and subscription models',
      author: 'Alex River',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      files_count: 2,
      execution_id: latestExecution?.id,
      sync_status: 'SYNCED',
    },
    {
      sha: '3c99a112233445566778899aabbccddeeff00112',
      message: 'test(parser): add test fixtures for edge case input validation',
      author: 'Dev Bot',
      timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
      files_count: 1,
      execution_id: 'exec-103',
      sync_status: 'SKIPPED',
    },
    {
      sha: 'd3e9110a2233445566778899aabbccddeeff0011',
      message: 'refactor(api): optimize response serialize payload formatting',
      author: 'Ayush Aggarwal',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      files_count: 3,
      execution_id: 'exec-099',
      sync_status: 'SYNCED',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-dark-card hover:bg-slate-800 border border-dark-border text-slate-400 hover:text-slate-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold text-slate-100 tracking-tight">{repository.name}</h2>
              <Badge variant={isAutomationActive ? 'emerald' : 'slate'}>
                {isAutomationActive ? 'Automation Active' : 'Automation Paused'}
              </Badge>
              {repository.is_private && <Badge variant="slate">Private</Badge>}
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{repository.full_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant={isAutomationActive ? 'outline' : 'primary'}
            onClick={handleToggleAutomation}
            isLoading={togglingId === repository.id}
            leftIcon={isAutomationActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
          >
            {isAutomationActive ? 'Pause Automation' : 'Activate Automation'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSyncModal(true)}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Trigger Sync
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSettingsModal(true)}
            leftIcon={<Settings className="w-3.5 h-3.5" />}
          >
            Settings
          </Button>

          {repository.html_url && (
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-dark-card hover:bg-slate-800 border border-dark-border text-slate-400 hover:text-slate-100 transition-colors"
              title="View on GitHub"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Metadata KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-dark-border">
          <span className="text-slate-500 uppercase tracking-wider text-[11px] block">Target Branch</span>
          <span className="text-brand-400 font-bold text-sm mt-1 block">
            {repository.automation?.target_branch || repository.default_branch}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-dark-border">
          <span className="text-slate-500 uppercase tracking-wider text-[11px] block">Tracked Documents</span>
          <span className="text-slate-200 font-bold text-sm mt-1 block">
            {documents.length} files
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-dark-border">
          <span className="text-slate-500 uppercase tracking-wider text-[11px] block">Last Pipeline Run</span>
          <span className="text-slate-200 font-semibold mt-1 block">
            {latestExecution ? formatDate(latestExecution.created_at) : 'Never'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-dark-border">
          <span className="text-slate-500 uppercase tracking-wider text-[11px] block">Last Doc Sync</span>
          <span className="text-slate-200 font-semibold mt-1 block">
            {latestDocUpdate ? formatDate(latestDocUpdate) : 'Never'}
          </span>
        </div>
      </div>

      {/* Interactive Tabs Header */}
      <div className="flex items-center gap-2 border-b border-dark-border bg-dark-card px-2 rounded-t-xl">
        {[
          { id: 'changes', label: 'Recent Changes', icon: <GitCommit className="w-3.5 h-3.5" /> },
          { id: 'executions', label: `Executions (${executions.length})`, icon: <Activity className="w-3.5 h-3.5" /> },
          { id: 'docs', label: `Documentation (${documents.length})`, icon: <FileCode className="w-3.5 h-3.5" /> },
          { id: 'activity', label: 'Audit Activity', icon: <Clock className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-brand-400 text-brand-400 bg-brand-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: RECENT CODE CHANGES */}
      {activeTab === 'changes' && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-dark-border bg-slate-900/40 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Incoming GitHub Commits
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Autonomous webhook listening active</span>
          </div>

          <div className="divide-y divide-dark-border font-mono text-xs">
            {mockRecentCommits.map((commit, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-900/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-indigo-400 shrink-0 mt-0.5">
                    <GitCommit className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 font-sans">
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {formatShortSha(commit.sha)}
                      </span>
                      <span className="text-slate-300 font-medium text-xs">{commit.message}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>{commit.author}</span>
                      <span>•</span>
                      <span>{commit.files_count} files changed</span>
                      <span>•</span>
                      <span>{formatDate(commit.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={commit.sync_status === 'SYNCED' ? 'emerald' : 'slate'}>
                    {commit.sync_status}
                  </Badge>
                  {commit.execution_id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const target = executions.find((e) => e.id === commit.execution_id);
                        if (target) setSelectedExecution(target);
                      }}
                    >
                      Trace
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 2: EXECUTIONS */}
      {activeTab === 'executions' && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-dark-border bg-slate-900/40 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Pipeline Execution History
            </h3>
            <span className="text-[11px] font-mono text-slate-500">3-agent autonomous traces</span>
          </div>

          {executions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic text-xs">
              No executions recorded for this repository yet.
            </div>
          ) : (
            <div className="divide-y divide-dark-border font-mono text-xs">
              {executions.map((exec) => {
                const style = getExecutionStatusStyle(exec.status);
                return (
                  <div
                    key={exec.id}
                    onClick={() => setSelectedExecution(exec)}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-900/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3 font-sans">
                      <div className="p-2 rounded-lg bg-slate-800 text-brand-400 shrink-0 mt-0.5 font-mono">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-200">
                            {formatShortSha(exec.commit_sha)}
                          </span>
                          <Badge variant={exec.status === 'COMPLETED' ? 'emerald' : exec.status === 'FAILED' ? 'rose' : exec.status === 'SKIPPED' ? 'slate' : 'amber'}>
                            {style.label}
                          </Badge>
                          <span className={`text-xs font-medium ${exec.status === 'FAILED' ? 'text-rose-400 font-mono text-[11px]' : 'text-slate-300'}`}>
                            {exec.status === 'FAILED'
                              ? exec.error_information?.error
                                ? `Failed at ${exec.error_information.stage || 'Pipeline'}: ${exec.error_information.error}`
                                : 'Pipeline execution failed'
                              : exec.status === 'SKIPPED'
                              ? exec.documentation_decision?.decision_rationale || 'Zero documentation impact (Skipped)'
                              : exec.analysis_result?.summary || 'Execution run'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                          <span>Branch: {exec.branch}</span>
                          <span>•</span>
                          <span>Duration: {formatDuration(exec.start_time, exec.completion_time)}</span>
                          <span>•</span>
                          <span>{formatDate(exec.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {exec.updated_documents?.length || 0} docs updated
                      </span>
                      <Button size="sm" variant="ghost">
                        View Trace
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* TAB 3: DOCUMENTATION */}
      {activeTab === 'docs' && (
        <DocumentationCatalog
          documents={documents}
          onOpenHistory={(doc) => setHistoryDoc(doc)}
        />
      )}

      {/* TAB 4: AUDIT ACTIVITY */}
      {activeTab === 'activity' && (
        <Card className="p-0 overflow-hidden">
          <ActivityFeedList
            events={activities}
            onSelectExecution={async (id, tab = 'pipeline') => {
              setSelectedExecutionTab(tab);
              const target = executions.find((e) => e.id === id);
              if (target) setSelectedExecution(target);
              try {
                const full = await executionService.getExecution(id);
                if (full) setSelectedExecution(full);
              } catch (err) {
                console.error(err);
              }
            }}
          />
        </Card>
      )}

      {/* Execution Drawer */}
      <ExecutionDetailDrawer
        execution={selectedExecution}
        isOpen={!!selectedExecution}
        onClose={() => setSelectedExecution(null)}
        initialTab={selectedExecutionTab}
      />

      {/* Doc History Modal */}
      <DocHistoryModal
        document={historyDoc}
        isOpen={!!historyDoc}
        onClose={() => setHistoryDoc(null)}
      />

      {/* Automation Settings Modal */}
      <AutomationSettingsModal
        repository={repository}
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSaved={(updated) => setRepository(updated)}
      />

      {/* Trigger Quick Sync Modal */}
      <QuickSyncTriggerModal
        repositories={repository ? [repository] : []}
        isOpen={showSyncModal}
        initialRepoId={repository?.id}
        onClose={() => setShowSyncModal(false)}
        onTriggered={() => loadData()}
        onViewDetails={(exec) => setSelectedExecution(exec)}
      />

      {/* Deactivation Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleConfirmDeactivation}
        title={`Pause Automation for ${repository.name}?`}
        message={`Pausing automation will stop TracePath AI from automatically analyzing pushes and synchronizing documentation for ${repository.full_name}. You can reactivate anytime.`}
        confirmLabel="Pause Automation"
        variant="danger"
      />
    </div>
  );
};
