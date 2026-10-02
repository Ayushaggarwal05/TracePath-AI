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
import { LoadingDots } from '../components/common/LoadingDots';
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
      // 1. Fetch Repository Details with fallback resolution
      const reposResponse = await repositoryService.getRepositories().catch(() => ({ items: [] }));
      const currentRepo =
        reposResponse.items.find(
          (r) =>
            r.id === repositoryId ||
            r.github_repo_id === repositoryId ||
            r.name.toLowerCase() === repositoryId.toLowerCase() ||
            r.full_name.toLowerCase() === repositoryId.toLowerCase()
        ) ||
        (await repositoryService.getRepository(repositoryId).catch(() => null));

      setRepository(currentRepo);

      const targetId = currentRepo?.id || repositoryId;

      // 2. Fetch Executions, Documents, and Activities in parallel
      const [execsResponse, docsResponse, activityResponse] = await Promise.all([
        executionService.getExecutions({ repository_id: targetId }).catch(() => ({ items: [] })),
        documentationService.getTrackedDocuments(targetId).catch(() => []),
        activityService.getActivityEvents({ repository_id: targetId }).catch(() => ({ items: [] })),
      ]);

      setExecutions(execsResponse.items || []);
      setDocuments(docsResponse || []);
      setActivities(activityResponse.items || []);
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
      <div className="py-24 flex justify-center bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800/90 rounded-2xl shadow-xs">
        <LoadingDots size="lg" color="slate" label="Loading repository workspace..." />
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

  // Real incoming git commits derived from pipeline executions
  const recentCommits = executions.map((exec) => ({
    sha: exec.commit_sha,
    message:
      exec.analysis_result?.summary ||
      (exec.documentation_decision
        ? exec.documentation_decision.decision_rationale
        : `Autonomous documentation synchronization for branch ${exec.branch}`),
    author: exec.event_type === 'push' ? 'GitHub Push' : 'Manual Trigger',
    timestamp: exec.created_at,
    files_count:
      exec.analysis_result?.affected_components?.length ||
      (exec.updated_documents?.length || 1),
    execution_id: exec.id,
    sync_status:
      exec.status === 'COMPLETED'
        ? 'SYNCED'
        : exec.status === 'SKIPPED'
        ? 'SKIPPED'
        : exec.status === 'FAILED'
        ? 'FAILED'
        : 'IN_PROGRESS',
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-stone-100 dark:hover:bg-slate-800 border border-stone-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
            title="Back to Repositories"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2742] dark:text-slate-100 tracking-tight font-sans">{repository.name}</h2>
              <Badge variant={isAutomationActive ? 'emerald' : 'slate'}>
                {isAutomationActive ? 'Automation Active' : 'Automation Paused'}
              </Badge>
              {repository.is_private && <Badge variant="slate">Private</Badge>}
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">{repository.full_name}</p>
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
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
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
              className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-stone-100 dark:hover:bg-slate-800 border border-stone-200/90 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
              title="View on GitHub"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Metadata KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800/90 shadow-xs">
          <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] block font-sans font-bold">Target Branch</span>
          <span className="text-[#0F2742] dark:text-slate-100 font-bold text-sm mt-1 block font-mono">
            {repository.automation?.target_branch || repository.default_branch}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800/90 shadow-xs">
          <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] block font-sans font-bold">Tracked Documents</span>
          <span className="text-[#0F2742] dark:text-slate-100 font-bold text-sm mt-1 block font-mono">
            {documents.length} files
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800/90 shadow-xs">
          <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] block font-sans font-bold">Last Pipeline Run</span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold mt-1 block font-mono">
            {latestExecution ? formatDate(latestExecution.created_at) : 'Never'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800/90 shadow-xs">
          <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] block font-sans font-bold">Last Doc Sync</span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold mt-1 block font-mono">
            {latestDocUpdate ? formatDate(latestDocUpdate) : 'Never'}
          </span>
        </div>
      </div>

      {/* Interactive Tabs Header */}
      <div className="flex items-center gap-1.5 p-1 bg-[#F4F2EB] dark:bg-[#131D2E] border border-stone-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-x-auto">
        {[
          { id: 'changes', label: 'Recent Changes', icon: <GitCommit className="w-3.5 h-3.5" /> },
          { id: 'executions', label: `Executions (${executions.length})`, icon: <Activity className="w-3.5 h-3.5" /> },
          { id: 'docs', label: `Documentation (${documents.length})`, icon: <FileCode className="w-3.5 h-3.5" /> },
          { id: 'activity', label: 'Audit Activity', icon: <Clock className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 py-2 px-3.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white dark:bg-[#0D1526] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: RECENT CODE CHANGES */}
      {activeTab === 'changes' && (
        <Card className="p-0 overflow-hidden bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800/90 shadow-xs">
          <div className="p-4 border-b border-stone-100 dark:border-slate-800 bg-[#F7F5F0] dark:bg-[#131D2E] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-sans">
              Incoming GitHub Commits
            </h3>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Autonomous webhook listening active</span>
          </div>

          {recentCommits.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                No incoming commits received yet for this repository.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSyncModal(true)}
                leftIcon={<RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              >
                Trigger First Sync
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-slate-800/80 font-mono text-xs">
              {recentCommits.map((commit, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-4 hover:bg-stone-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5">
                      <GitCommit className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 font-sans">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                          {formatShortSha(commit.sha)}
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium text-xs truncate">{commit.message}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{commit.author}</span>
                        <span>•</span>
                        <span>{commit.files_count} files analyzed</span>
                        <span>•</span>
                        <span>{formatDate(commit.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        commit.sync_status === 'SYNCED'
                          ? 'emerald'
                          : commit.sync_status === 'FAILED'
                          ? 'rose'
                          : commit.sync_status === 'IN_PROGRESS'
                          ? 'indigo'
                          : 'slate'
                      }
                    >
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
          )}
        </Card>
      )}

      {/* TAB 2: EXECUTIONS */}
      {activeTab === 'executions' && (
        <Card className="p-0 overflow-hidden bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800/90 shadow-xs">
          <div className="p-4 border-b border-stone-100 dark:border-slate-800 bg-[#F7F5F0] dark:bg-[#131D2E] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-sans">
              Pipeline Execution History
            </h3>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">3-agent autonomous traces</span>
          </div>

          {executions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 italic text-xs">
              No executions recorded for this repository yet.
            </div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-slate-800/80 font-mono text-xs">
              {executions.map((exec) => {
                const style = getExecutionStatusStyle(exec.status);
                return (
                  <div
                    key={exec.id}
                    onClick={() => setSelectedExecution(exec)}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-stone-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3 font-sans min-w-0">
                      <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${style.bg} ${style.border} ${style.text}`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                            {formatShortSha(exec.commit_sha)}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {style.label}
                          </span>
                          <span className={`text-xs font-medium truncate ${exec.status === 'FAILED' ? 'text-rose-600 dark:text-rose-400 font-mono text-[11px]' : 'text-slate-700 dark:text-slate-300'}`}>
                            {exec.status === 'FAILED'
                              ? exec.error_information?.error
                                ? `Failed at ${exec.error_information.stage || 'Pipeline'}: ${exec.error_information.error}`
                                : 'Pipeline execution failed'
                              : exec.status === 'SKIPPED'
                              ? exec.documentation_decision?.decision_rationale || 'Zero documentation impact (Skipped)'
                              : exec.analysis_result?.summary || 'Execution run'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          <span>Branch: {exec.branch}</span>
                          <span>•</span>
                          <span>Duration: {formatDuration(exec.start_time, exec.completion_time)}</span>
                          <span>•</span>
                          <span>{formatDate(exec.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
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
        <Card className="p-0 overflow-hidden bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800/90 shadow-xs">
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
