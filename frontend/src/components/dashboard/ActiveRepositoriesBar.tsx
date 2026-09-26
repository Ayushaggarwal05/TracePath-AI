import React from 'react';
import { Repository } from '../../types/repository';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { FolderGit2, GitBranch, Sparkles, ChevronRight, CheckCircle2, Play } from 'lucide-react';

interface ActiveRepositoriesBarProps {
  repositories: Repository[];
  onTriggerSync: (repoId?: string) => void;
  onNavigateToRepos: () => void;
}

export const ActiveRepositoriesBar: React.FC<ActiveRepositoriesBarProps> = ({
  repositories,
  onTriggerSync,
  onNavigateToRepos,
}) => {
  const activeRepos = repositories.filter((r) => r.automation?.status === 'ACTIVE');

  if (activeRepos.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-[#F7F5F0] border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">No Repositories Currently Synchronizing</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Activate automation on your GitHub repositories to start autonomous documentation tracking.
            </p>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={onNavigateToRepos} rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
          Activate Repositories
        </Button>
      </div>
    );
  }

  return (
    <Card className="p-0 overflow-hidden bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800/90 rounded-2xl shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 px-5 border-b border-stone-100 dark:border-slate-800 bg-[#F4F2EB] dark:bg-[#131D2E] gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-bold text-[#0F2742] dark:text-slate-100">
            Active Automation Repositories ({activeRepos.length})
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">• Real-time commit listeners active</span>
        </div>
        <button
          onClick={onNavigateToRepos}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Manage All Repositories ({repositories.length})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="divide-y divide-stone-100 dark:divide-slate-800/80">
        {activeRepos.map((repo) => (
          <div
            key={repo.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 gap-3 hover:bg-stone-50/70 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white shadow-xs shrink-0 border border-transparent dark:border-slate-700/60">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-[#0F2742] dark:text-white truncate">{repo.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden md:inline truncate">
                    {repo.full_name}
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ACTIVE
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3 text-slate-400" />
                    {repo.default_branch || 'main'}
                  </span>
                  <span>•</span>
                  <span>{repo.automation?.doc_paths?.length || 3} docs tracked</span>
                  <span>•</span>
                  <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Webhook listening
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTriggerSync(repo.id)}
                className="text-xs"
                leftIcon={<Play className="w-3 h-3 text-emerald-600" />}
              >
                Sync Now
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
