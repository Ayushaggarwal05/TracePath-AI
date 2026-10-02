import React from 'react';
import { Repository } from '../../types/repository';
import { GitBranch, Lock, Globe, Settings, Play, Pause, ExternalLink, ChevronRight, FolderGit2, FileText, Loader2 } from 'lucide-react';

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
  const isActive = repository.automation?.status === 'ACTIVE';

  return (
    <div
      className={`group relative flex flex-col md:flex-row md:items-center justify-between p-4 sm:px-6 gap-4 transition-all duration-150 ${
        isSelected
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-l-emerald-600'
          : isActive
          ? 'bg-white dark:bg-[#0D1526] hover:bg-emerald-50/40 dark:hover:bg-slate-800/50'
          : 'bg-white dark:bg-[#0D1526] hover:bg-stone-50 dark:hover:bg-slate-800/40'
      }`}
    >
      {/* Left: Checkbox + Repo Info */}
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        {onSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(repository.id)}
            className="w-4 h-4 mt-1 sm:mt-0 rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500/40 cursor-pointer shrink-0"
          />
        )}

        <div
          className={`p-2.5 rounded-xl border shrink-0 transition-colors ${
            isActive
              ? 'bg-emerald-950 border-emerald-800 text-emerald-300 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
          }`}
        >
          <FolderGit2 className={`w-4 h-4 ${isActive ? 'fill-emerald-400/30' : 'fill-slate-400/20'}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onViewDetail?.(repository)}
              className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors text-left truncate cursor-pointer"
            >
              {repository.name}
            </button>

            {repository.is_private ? (
              <span title="Private Repository" className="inline-flex items-center text-slate-400">
                <Lock className="w-3.5 h-3.5 fill-slate-400/30" />
              </span>
            ) : (
              <span title="Public Repository" className="inline-flex items-center text-slate-400">
                <Globe className="w-3.5 h-3.5 fill-slate-400/30" />
              </span>
            )}

            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline truncate">
              {repository.full_name}
            </span>
          </div>

          {repository.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5 leading-relaxed">
              {repository.description}
            </p>
          )}
        </div>
      </div>

      {/* Middle: Badges & Meta */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 shrink-0 text-xs">
        <span className="inline-flex items-center gap-1 font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-[11px]">
          <GitBranch className="w-3.5 h-3.5 text-slate-400 fill-slate-400/25" />
          {repository.default_branch || 'main'}
        </span>

        {repository.language && (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
            {repository.language}
          </span>
        )}

        {repository.automation?.doc_paths && (
          <span className="hidden lg:inline-flex items-center gap-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
            <FileText className="w-3.5 h-3.5 text-slate-400 fill-slate-400/25" />
            {repository.automation.doc_paths.length} docs tracked
          </span>
        )}

        {/* Status Badge: Active / Inactive / Activating... / Pausing... */}
        {isToggling ? (
          isActive ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800 shadow-sm animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
              <span>PAUSING...</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700 shadow-sm animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
              <span>ACTIVATING...</span>
            </div>
          )
        ) : isActive ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-200 border border-emerald-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ACTIVE</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>INACTIVE</span>
          </div>
        )}
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-slate-800 justify-end">
        {repository.html_url && (
          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="View on GitHub"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        <button
          onClick={() => onOpenSettings(repository)}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Configure Automation Rules"
        >
          <Settings className="w-4 h-4 fill-slate-400/20" />
        </button>

        {onViewDetail && (
          <button
            onClick={() => onViewDetail(repository)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <span>Workspace</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Activate Button vs Pause Button */}
        {isActive ? (
          <button
            type="button"
            onClick={() => onToggleAutomation(repository)}
            disabled={isToggling}
            className={`inline-flex items-center justify-center gap-1.5 min-w-[96px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              isToggling
                ? 'bg-amber-950/60 text-amber-300 border border-amber-800/80 cursor-not-allowed opacity-90'
                : 'bg-emerald-950 hover:bg-rose-950 text-emerald-200 hover:text-rose-200 border border-emerald-800 hover:border-rose-800 group/btn cursor-pointer'
            }`}
          >
            {isToggling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Pausing...</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/40 group-hover/btn:text-rose-400 group-hover/btn:fill-rose-400/40" />
                <span className="group-hover/btn:hidden">Active</span>
                <span className="hidden group-hover/btn:inline">Pause</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onToggleAutomation(repository)}
            disabled={isToggling}
            className={`inline-flex items-center justify-center gap-1.5 min-w-[96px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
              isToggling
                ? 'bg-emerald-600/80 text-white border border-emerald-500 cursor-not-allowed opacity-90'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
            }`}
          >
            {isToggling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                <span>Activating...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-white fill-white" />
                <span>Activate</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
