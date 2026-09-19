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
      <div className="p-4 rounded-xl bg-gradient-to-r from-brand-950/40 via-dark-card to-dark-card border border-brand-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">No Repositories Currently Synchronizing</h4>
            <p className="text-xs text-slate-400 mt-0.5">
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
    <Card className="p-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 border-b border-dark-border bg-slate-900/40 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-100">
            Active Automation Repositories ({activeRepos.length})
          </h3>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">• Real-time commit listeners active</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onNavigateToRepos} className="text-xs self-start sm:self-auto" rightIcon={<ChevronRight className="w-3 h-3" />}>
          Manage All Repositories ({repositories.length})
        </Button>
      </div>

      <div className="divide-y divide-dark-border/60">
        {activeRepos.map((repo) => (
          <div
            key={repo.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-5 gap-3 hover:bg-slate-800/30 transition-colors"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-100 truncate">{repo.name}</span>
                  <span className="text-xs text-slate-500 font-mono hidden md:inline truncate">
                    {repo.full_name}
                  </span>
                  <div className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.2 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ACTIVE
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3 text-slate-500" />
                    {repo.default_branch || 'main'}
                  </span>
                  <span>•</span>
                  <span>{repo.automation?.doc_paths?.length || 3} docs tracked</span>
                  <span>•</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Webhook listening
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
                leftIcon={<Play className="w-3 h-3 text-emerald-400" />}
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
