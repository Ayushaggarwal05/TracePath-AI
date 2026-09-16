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
      <div className="p-8 text-center text-slate-500 italic text-sm">
        No executions recorded yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-dark-border/80">
      {executions.map((exec) => {
        const style = getExecutionStatusStyle(exec.status);
        const docUpdatesCount = exec.updated_documents?.length || 0;

        return (
          <div
            key={exec.id}
            onClick={() => onSelectExecution(exec)}
            className="flex items-center justify-between p-4 hover:bg-dark-hover/60 transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className={`mt-0.5 p-2 rounded-lg border shrink-0 ${style.bg} ${style.border} ${style.text}`}>
                <GitCommit className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {formatShortSha(exec.commit_sha)}
                  </span>
                  {exec.repository_name && (
                    <span className="text-xs text-slate-400 font-mono">
                      • {exec.repository_name}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                    <span className={`w-1 h-1 rounded-full ${style.dot}`} />
                    {style.label}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-1 group-hover:text-brand-300 transition-colors">
                  {exec.analysis_result?.summary || 'Execution running...'}
                </p>

                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-mono">
                  <span>{formatTimeAgo(exec.created_at)}</span>
                  <span>•</span>
                  <span>Duration: {formatDuration(exec.start_time, exec.completion_time)}</span>
                  {docUpdatesCount > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <FileText className="w-3 h-3" />
                        {docUpdatesCount} doc {docUpdatesCount === 1 ? 'update' : 'updates'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-4 shrink-0">
              {exec.pull_request_url && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-brand-400 font-mono">
                  <GitPullRequest className="w-3.5 h-3.5" />
                  PR
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
