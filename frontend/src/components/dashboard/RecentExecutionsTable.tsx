import React from 'react';
import { Execution } from '../../types/execution';
import { Repository } from '../../types/repository';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { getExecutionStatusStyle } from '../../utils/statusStyles';
import { formatShortSha, formatTimeAgo } from '../../utils/formatters';
import { ArrowRight, GitCommit, FileText, FolderGit2 } from 'lucide-react';

interface RecentExecutionsTableProps {
  executions: Execution[];
  repositories?: Repository[];
  onSelectExecution: (execution: Execution) => void;
  onViewAll: () => void;
}

export const RecentExecutionsTable: React.FC<RecentExecutionsTableProps> = ({
  executions,
  repositories = [],
  onSelectExecution,
  onViewAll,
}) => {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-dark-border bg-slate-900/40">
        <div>
          <h3 className="text-base font-semibold text-slate-100">Live Sync Stream</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-agent documentation updates from code commits
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
          View Activity
        </Button>
      </div>

      <div className="divide-y divide-dark-border/60">
        {executions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 italic text-sm">
            No execution runs recorded yet.
          </div>
        ) : (
          executions.slice(0, 5).map((exec) => {
            const style = getExecutionStatusStyle(exec.status);
            const docUpdatesCount = exec.updated_documents?.length || 0;
            const repo = repositories.find((r) => r.id === exec.repository_id);
            const repoDisplayName = repo?.name || exec.repository_name || 'Repository';

            return (
              <div
                key={exec.id}
                onClick={() => onSelectExecution(exec)}
                className="flex items-center justify-between p-4 hover:bg-dark-hover/70 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`p-2 rounded-lg border shrink-0 ${style.bg} ${style.border} ${style.text}`}>
                    <GitCommit className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-brand-300 border border-slate-700/60">
                        <FolderGit2 className="w-3 h-3 text-brand-400" />
                        {repoDisplayName}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {formatShortSha(exec.commit_sha)}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.2 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                        <span className={`w-1 h-1 rounded-full ${style.dot}`} />
                        {style.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 truncate mt-1 group-hover:text-brand-300 transition-colors">
                      {exec.analysis_result?.summary || exec.documentation_decision?.decision_rationale || (exec.status === 'COMPLETED' ? 'Code commit synchronized' : 'Processing commit...')}
                    </p>

                  </div>
                </div>


                <div className="flex items-center gap-4 text-xs text-slate-500 font-mono shrink-0">
                  {docUpdatesCount > 0 && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-emerald-400">
                      <FileText className="w-3.5 h-3.5" />
                      +{docUpdatesCount}
                    </span>
                  )}
                  <span>{formatTimeAgo(exec.created_at)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
