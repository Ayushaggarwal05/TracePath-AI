import React, { useState } from 'react';
import { useRepositories } from '../hooks/useRepositories';
import { useExecutions } from '../hooks/useExecutions';
import { MetricCards } from '../components/dashboard/MetricCards';
import { ActiveRepositoriesBar } from '../components/dashboard/ActiveRepositoriesBar';
import { RecentExecutionsTable } from '../components/dashboard/RecentExecutionsTable';
import { DocumentationUpdatesCard } from '../components/dashboard/DocumentationUpdatesCard';
import { AgentHealthAndCoverageCard } from '../components/dashboard/AgentHealthAndCoverageCard';
import { QuickSyncTriggerModal } from '../components/dashboard/QuickSyncTriggerModal';
import { ExecutionDetailDrawer } from '../components/activity/ExecutionDetailDrawer';
import { DiffViewerModal } from '../components/activity/DiffViewerModal';
import { Button } from '../components/common/Button';
import { LivePipelineSegments } from '../components/common/LivePipelineSegments';
import { executionService } from '../services/executionService';
import { Execution } from '../types/execution';
import { formatShortSha } from '../utils/formatters';
import { Sparkles, RefreshCw } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (route: 'repositories' | 'activity' | 'settings' | 'connect') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { repositories, refetch: refetchRepos } = useRepositories();
  const { executions, refetch: refetchExecs } = useExecutions();
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [diffModalData, setDiffModalData] = useState<{ isOpen: boolean; diff: string; title: string }>({
    isOpen: false,
    diff: '',
    title: '',
  });

  const activeAutomations = repositories.filter((r) => r.automation?.status === 'ACTIVE').length;
  const completedCount = executions.filter((e) => e.status === 'COMPLETED').length;
  const successRate = executions.length > 0 ? Math.round((completedCount / executions.length) * 100) : 100;
  
  let totalDocUpdates = 0;
  executions.forEach((e) => {
    totalDocUpdates += e.updated_documents?.length || 0;
  });

  const handleRefresh = () => {
    refetchRepos();
    refetchExecs();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">System Dashboard</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Autonomous documentation synchronization status across all repositories
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsTriggerModalOpen(true)}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Trigger AI Sync Run
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <MetricCards
        totalRepos={repositories.length}
        activeAutomations={activeAutomations}
        totalExecutions={executions.length}
        totalDocUpdates={totalDocUpdates}
        successRate={successRate}
      />

      {/* Active Pipeline Live Stream Banner */}
      {(() => {
        const activeExec = executions.find((e) =>
          ['PENDING', 'ANALYZING', 'PLANNING', 'GENERATING', 'COMMITTING'].includes(e.status)
        );
        if (!activeExec) return null;

        const activeRepo = repositories.find((r) => r.id === activeExec.repository_id);
        const repoName = activeRepo?.name || activeExec.repository_name || 'Repository';

        return (
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/30 via-dark-card to-slate-900 border border-amber-500/40 shadow-lg shadow-amber-500/5 space-y-3 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                      Autonomous Pipeline In Progress
                    </span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Analyzing commit <code className="text-brand-300 bg-slate-800/80 px-1 py-0.5 rounded font-mono text-[11px]">{formatShortSha(activeExec.commit_sha)}</code> on <strong className="text-slate-100">{repoName}</strong>
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 self-start sm:self-auto text-xs"
                onClick={() => setSelectedExecution(activeExec)}
              >
                View Live Trace
              </Button>
            </div>

            <div className="pt-1">
              <LivePipelineSegments
                status={activeExec.status}
                errorStage={activeExec.error_information?.stage}
                showLabels={true}
                size="md"
              />
            </div>
          </div>
        );
      })()}

      {/* Active Repositories Live Status Bar */}
      <ActiveRepositoriesBar
        repositories={repositories}
        onTriggerSync={() => setIsTriggerModalOpen(true)}
        onNavigateToRepos={() => onNavigate('repositories')}
      />

      {/* Main Grid: Stream & Recent Docs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentExecutionsTable
            executions={executions}
            repositories={repositories}
            onSelectExecution={async (exec) => {
              setSelectedExecution(exec);
              try {
                const full = await executionService.getExecution(exec.id);
                if (full) setSelectedExecution(full);
              } catch (err) {
                console.error(err);
              }
            }}
            onViewAll={() => onNavigate('activity')}
          />
        </div>

        <div>
          <DocumentationUpdatesCard
            executions={executions}
            repositories={repositories}
            onOpenDiff={(diff, title) => setDiffModalData({ isOpen: true, diff, title })}
          />
        </div>
      </div>

      {/* Multi-Agent Engine Health & Protected Docs Coverage */}
      <AgentHealthAndCoverageCard activeReposCount={activeAutomations} />



      {/* Trigger Sync Modal */}
      <QuickSyncTriggerModal
        repositories={repositories}
        isOpen={isTriggerModalOpen}
        onClose={() => setIsTriggerModalOpen(false)}
        onTriggered={handleRefresh}
        onViewDetails={(exec) => setSelectedExecution(exec)}
      />

      {/* Execution Details Drawer */}
      <ExecutionDetailDrawer
        execution={selectedExecution}
        isOpen={!!selectedExecution}
        onClose={() => setSelectedExecution(null)}
      />

      {/* Standalone Diff Modal */}
      <DiffViewerModal
        isOpen={diffModalData.isOpen}
        onClose={() => setDiffModalData({ isOpen: false, diff: '', title: '' })}
        title={diffModalData.title}
        rawDiff={diffModalData.diff}
      />
    </div>
  );
};
