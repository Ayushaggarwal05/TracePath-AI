import React from 'react';
import { Execution } from '../../types/execution';
import { getExecutionStatusStyle } from '../../utils/statusStyles';
import { formatShortSha, formatTimeAgo, formatDuration } from '../../utils/formatters';
import { GitCommit, FileText, ChevronRight, GitPullRequest } from 'lucide-react';

interface ExecutionTimelineProps {
  executions: Execution[];
  onSelectExecution: (execution: Execution) => void;
}

export const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({
  executions,
  onSelectExecution,
}) => {
  if (executions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 italic text-sm">
        No executions recorded yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-stone-100 dark:divide-slate-800/80 font-sans">
      {executions.map((exec) => {
        const style = getExecutionStatusStyle(exec.status);
        const docUpdatesCount = exec.updated_documents?.length || 0;

        const summaryText =
          exec.analysis_result?.summary ||
          (exec.status === 'COMPLETED'
            ? docUpdatesCount > 0
              ? `Synchronized documentation updates for ${docUpdatesCount} ${docUpdatesCount === 1 ? 'file' : 'files'}.`
              : 'Autonomous documentation synchronization completed.'
            : exec.status === 'SKIPPED'
            ? exec.documentation_decision?.decision_rationale || 'Evaluated commit — zero documentation updates required.'
            : exec.status === 'FAILED'
            ? exec.error_information?.error
              ? `Failed: ${exec.error_information.error}`
              : 'Pipeline execution encountered an error.'
            : 'Pipeline execution running...');

        return (
          <div
            key={exec.id}
            onClick={() => onSelectExecution(exec)}
            className="flex items-center justify-between p-4 sm:p-5 hover:bg-stone-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className={`mt-0.5 p-2 rounded-xl border shrink-0 ${style.bg} ${style.border} ${style.text} shadow-2xs`}>
                <GitCommit className="w-4 h-4" />
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                    {formatShortSha(exec.commit_sha)}
                  </span>
                  {exec.repository_name && (
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                      • {exec.repository_name}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    {style.label}
                  </span>
                </div>

                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {summaryText}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>{formatTimeAgo(exec.created_at)}</span>
                  <span>•</span>
                  <span>Duration: {formatDuration(exec.start_time, exec.completion_time)}</span>
                  {docUpdatesCount > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                        <FileText className="w-3.5 h-3.5" />
                        {docUpdatesCount} doc {docUpdatesCount === 1 ? 'update' : 'updates'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-4 shrink-0">
              {exec.pull_request_url && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-brand-400 font-mono font-semibold">
                  <GitPullRequest className="w-3.5 h-3.5" />
                  PR
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
