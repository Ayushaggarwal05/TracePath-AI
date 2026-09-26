import React from 'react';
import { Execution } from '../../types/execution';
import { Repository } from '../../types/repository';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LivePipelineSegments } from '../common/LivePipelineSegments';
import { getExecutionStatusStyle } from '../../utils/statusStyles';
import { formatShortSha, formatTimeAgo } from '../../utils/formatters';
import { ArrowRight, GitCommit, FileText, FolderGit2, Activity, Compass } from 'lucide-react';

interface RecentExecutionsTableProps {
  executions: Execution[];
  repositories?: Repository[];
  onSelectExecution: (execution: Execution) => void;
  onOpenLiveStream?: (execution: Execution) => void;
  onViewAll: () => void;
}

export const RecentExecutionsTable: React.FC<RecentExecutionsTableProps> = ({
  executions,
  repositories = [],
  onSelectExecution,
  onOpenLiveStream,
  onViewAll,
}) => {
  const activeStatuses = ['PENDING', 'ANALYZING', 'PLANNING', 'GENERATING', 'COMMITTING'];
  const sortedExecutions = [...executions].sort((a, b) => {
    const aActive = activeStatuses.includes(a.status);
    const bActive = activeStatuses.includes(b.status);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  return (
    <Card className="p-0 overflow-hidden bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800/90 shadow-xs">
      <div className="flex items-center justify-between p-5 border-b border-stone-100 dark:border-slate-800 bg-[#F7F5F0] dark:bg-[#131D2E]">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Live Sync Stream</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time multi-agent documentation updates from code commits
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
          View Activity
        </Button>
      </div>

      <div className="divide-y divide-stone-100 dark:divide-slate-800/80">
        {sortedExecutions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 italic text-sm">
            No execution runs recorded yet.
          </div>
        ) : (
          sortedExecutions.slice(0, 5).map((exec) => {
            const style = getExecutionStatusStyle(exec.status);
            const isRunning = activeStatuses.includes(exec.status);
            const docUpdatesCount = exec.updated_documents?.length || 0;
            const repo = repositories.find((r) => r.id === exec.repository_id);
            const repoDisplayName = repo?.name || exec.repository_name || 'Repository';

            const getSummaryText = () => {
              if (exec.status === 'FAILED') {
                if (exec.error_information?.error) {
                  return `Failed at ${exec.error_information.stage || 'Pipeline'}: ${exec.error_information.error}`;
                }
                return 'Pipeline execution failed';
              }
              if (exec.status === 'SKIPPED') {
                return exec.documentation_decision?.decision_rationale || 'Zero documentation impact detected (No doc updates needed)';
              }
              if (exec.analysis_result?.summary) {
                return exec.analysis_result.summary;
              }
              if (exec.documentation_decision?.decision_rationale) {
                return exec.documentation_decision.decision_rationale;
              }
              if (exec.status === 'COMPLETED') {
                return 'Code commit synchronized directly to main branch';
              }
              if (exec.status === 'COMMITTING') {
                return 'Pushing documentation commit to GitHub...';
              }
              if (exec.status === 'GENERATING') {
                return 'Agent 3: Generating documentation updates...';
              }
              if (exec.status === 'PLANNING') {
                return 'Agent 2: Evaluating documentation impact...';
              }
              if (exec.status === 'ANALYZING') {
                return 'Agent 1: Analyzing code changes with Gemini...';
              }
              return 'Queued for pipeline execution...';
            };

            const handleClick = () => {
              if (isRunning && onOpenLiveStream) {
                onOpenLiveStream(exec);
              } else {
                onSelectExecution(exec);
              }
            };

            return (
              <div
                key={exec.id}
                onClick={handleClick}
                className="flex items-center justify-between p-4 hover:bg-stone-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className={`p-2 rounded-xl border shrink-0 ${style.bg} ${style.border} ${style.text}`}>
                    <GitCommit className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#F7F5F0] dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-stone-200 dark:border-slate-700">
                        <FolderGit2 className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                        {repoDisplayName}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                        {formatShortSha(exec.commit_sha)}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${isRunning ? 'animate-ping' : ''}`} />
                        {style.label}
                      </span>
                    </div>
                    <p className={`text-xs truncate mt-1 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors ${exec.status === 'FAILED' ? 'text-rose-700 dark:text-rose-400 font-mono text-[11px]' : 'text-slate-700 dark:text-slate-300'}`}>
                      {getSummaryText()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono shrink-0">
                  {/* Segmented Pipeline Bar */}
                  <div className="hidden lg:block w-32">
                    <LivePipelineSegments
                      status={exec.status}
                      errorStage={exec.error_information?.stage}
                      size="sm"
                    />
                  </div>

                  {docUpdatesCount > 0 && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold font-mono">
                      <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      +{docUpdatesCount}
                    </span>
                  )}

                  {/* Action Button: Live Stream while running, or Trace View */}
                  {isRunning ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenLiveStream) onOpenLiveStream(exec);
                        else onSelectExecution(exec);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-[11px] font-mono font-bold hover:bg-amber-100 transition-colors shadow-xs"
                    >
                      <Activity className="w-3 h-3 text-amber-600 animate-pulse" />
                      <span>Live Stream</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectExecution(exec);
                      }}
                      className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F7F5F0] dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-mono font-medium hover:text-slate-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Compass className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                      <span>Trace</span>
                    </button>
                  )}

                  <span className="text-slate-500 dark:text-slate-400 text-[11px] w-14 text-right">{formatTimeAgo(exec.created_at)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
