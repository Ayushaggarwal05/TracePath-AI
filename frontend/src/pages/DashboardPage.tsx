import React, { useState, useEffect } from 'react';
import { useRepositories } from '../hooks/useRepositories';
import { useExecutions } from '../hooks/useExecutions';
import { MetricCards } from '../components/dashboard/MetricCards';
import { ActiveRepositoriesBar } from '../components/dashboard/ActiveRepositoriesBar';
import { RecentExecutionsTable } from '../components/dashboard/RecentExecutionsTable';
import { DocumentationUpdatesCard } from '../components/dashboard/DocumentationUpdatesCard';
import { AgentHealthAndCoverageCard } from '../components/dashboard/AgentHealthAndCoverageCard';
import { QuickSyncTriggerModal } from '../components/dashboard/QuickSyncTriggerModal';
import { LiveSyncProgressStream } from '../components/dashboard/LiveSyncProgressStream';
import { ExecutionDetailDrawer } from '../components/activity/ExecutionDetailDrawer';
import { DiffViewerModal } from '../components/activity/DiffViewerModal';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { executionService } from '../services/executionService';
import { Execution } from '../types/execution';
import { Sparkles, RefreshCw } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (route: 'repositories' | 'activity' | 'settings' | 'connect') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { repositories, refetch: refetchRepos } = useRepositories();
  const { executions, total: totalExecutionsCount, refetch: refetchExecs } = useExecutions({ autoRefresh: true });
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [activeStreamingExecution, setActiveStreamingExecution] = useState<Execution | null>(null);
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

  // Poll for status updates while an execution stream modal is open
  useEffect(() => {
    if (activeStreamingExecution && !['COMPLETED', 'FAILED', 'SKIPPED'].includes(activeStreamingExecution.status)) {
      const interval = setInterval(async () => {
        try {
          const fresh = await executionService.getExecution(activeStreamingExecution.id);
          if (fresh) {
            setActiveStreamingExecution(fresh);
            if (['COMPLETED', 'FAILED', 'SKIPPED'].includes(fresh.status)) {
              refetchExecs();
            }
          }
        } catch (err) {
          console.debug('Polling note:', err);
        }
      }, 900);
      return () => clearInterval(interval);
    }
  }, [activeStreamingExecution?.id, activeStreamingExecution?.status, refetchExecs]);

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
        totalExecutions={totalExecutionsCount ?? executions.length}
        totalDocUpdates={totalDocUpdates}
        successRate={successRate}
      />

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
            onOpenLiveStream={(exec) => setActiveStreamingExecution(exec)}
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

      {/* Live Stream Progress Modal for in-progress executions */}
      {activeStreamingExecution && (
        <Modal
          isOpen={!!activeStreamingExecution}
          onClose={() => setActiveStreamingExecution(null)}
          title="Autonomous Documentation Sync Stream"
          subtitle="Live 3-Agent Progression, Real-time Gemini Trace & GitHub Write-Back."
          maxWidth="xl"
        >
          <LiveSyncProgressStream
            execution={activeStreamingExecution}
            isLoading={false}
            repoFullName={
              repositories.find((r) => r.id === activeStreamingExecution.repository_id)?.full_name ||
              activeStreamingExecution.repository_name ||
              'Repository'
            }
            onViewDetails={(exec) => {
              setActiveStreamingExecution(null);
              setSelectedExecution(exec);
            }}
            onDone={() => {
              setActiveStreamingExecution(null);
              handleRefresh();
            }}
          />
        </Modal>
      )}

      {/* Execution Details Centered 70/30 Modal */}
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
