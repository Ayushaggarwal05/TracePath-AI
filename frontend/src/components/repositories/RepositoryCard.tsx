import React from 'react';
import { Repository } from '../../types/repository';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { getAutomationStatusStyle } from '../../utils/statusStyles';
import { GitBranch, Lock, Globe, Settings, Play, Pause, ExternalLink, ChevronRight, FolderGit2, FileText } from 'lucide-react';

interface RepositoryCardProps {
  repository: Repository;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onToggleAutomation: (repo: Repository) => void;
  onOpenSettings: (repo: Repository) => void;
  onViewDetail?: (repo: Repository) => void;
  isToggling?: boolean;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({
  repository,
  isSelected = false,
  onSelect,
  onToggleAutomation,
  onOpenSettings,
  onViewDetail,
  isToggling = false,
}) => {
  const status = repository.automation?.status || 'INACTIVE';
  const statusStyle = getAutomationStatusStyle(status);

  return (
    <div
      className={`group relative flex flex-col md:flex-row md:items-center justify-between p-4 sm:px-5 gap-4 transition-all duration-150 ${
        isSelected
          ? 'bg-brand-500/10 border-l-4 border-l-brand-500'
          : 'hover:bg-slate-800/40'
      }`}
    >
      {/* Left: Checkbox + Repo Info */}
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        {onSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(repository.id)}
            className="w-4 h-4 mt-1 sm:mt-0 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500/40 cursor-pointer shrink-0"
          />
        )}

        <div className={`p-2 rounded-lg border shrink-0 ${status === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800/80 border-slate-700/60 text-slate-400'}`}>
          <FolderGit2 className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onViewDetail?.(repository)}
              className="text-sm font-semibold text-slate-100 hover:text-brand-400 transition-colors text-left truncate"
            >
              {repository.name}
            </button>

            {repository.is_private ? (
              <span title="Private Repository" className="inline-flex items-center text-slate-500">
                <Lock className="w-3.5 h-3.5" />
              </span>
            ) : (
              <span title="Public Repository" className="inline-flex items-center text-slate-500">
                <Globe className="w-3.5 h-3.5" />
              </span>
            )}

            <span className="text-xs text-slate-500 font-mono hidden sm:inline truncate">
              {repository.full_name}
            </span>
          </div>

          {repository.description && (
            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 leading-relaxed">
              {repository.description}
            </p>
          )}
        </div>
      </div>

      {/* Middle: Badges & Meta */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 shrink-0 text-xs">
        <span className="inline-flex items-center gap-1 font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/40">
          <GitBranch className="w-3.5 h-3.5 text-slate-500" />
          {repository.default_branch || 'main'}
        </span>

        {repository.language && (
          <Badge variant="slate" className="text-[11px] py-0 font-mono">
            {repository.language}
          </Badge>
        )}

        {repository.automation?.doc_paths && (
          <span className="hidden lg:inline-flex items-center gap-1 font-mono text-[11px] text-slate-400">
            <FileText className="w-3 h-3 text-slate-500" />
            {repository.automation.doc_paths.length} tracked
          </span>
        )}

        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
          {statusStyle.label}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 justify-end">
        {repository.html_url && (
          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-200 p-1.5 rounded hover:bg-slate-800 transition-colors"
            title="View on GitHub"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        <button
          onClick={() => onOpenSettings(repository)}
          className="text-slate-400 hover:text-slate-200 p-1.5 rounded hover:bg-slate-800 transition-colors"
          title="Configure Automation Rules"
        >
          <Settings className="w-4 h-4" />
        </button>

        {onViewDetail && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewDetail(repository)}
            className="text-xs"
            rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
          >
            Workspace
          </Button>
        )}

        <Button
          size="sm"
          variant={status === 'ACTIVE' ? 'secondary' : 'primary'}
          onClick={() => onToggleAutomation(repository)}
          isLoading={isToggling}
          className="min-w-[85px]"
          leftIcon={
            status === 'ACTIVE' ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )
          }
        >
          {status === 'ACTIVE' ? 'Pause' : 'Activate'}
        </Button>
      </div>
    </div>
  );
};

