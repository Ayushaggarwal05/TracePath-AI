import React from 'react';
import { Repository } from '../../types/repository';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { getAutomationStatusStyle } from '../../utils/statusStyles';
import { GitBranch, Lock, Globe, Settings, Play, Pause, ExternalLink, ChevronRight } from 'lucide-react';

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
    <Card
      className={`relative flex flex-col justify-between transition-all duration-200 ${
        isSelected ? 'border-brand-500/60 ring-1 ring-brand-500/30 bg-dark-card/90' : ''
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(repository.id)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500/40 cursor-pointer"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewDetail?.(repository)}
                  className="text-base font-semibold text-slate-100 truncate hover:text-brand-400 transition-colors text-left"
                >
                  {repository.name}
                </button>
                {repository.is_private ? (
                  <span title="Private"><Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" /></span>
                ) : (
                  <span title="Public"><Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" /></span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                {repository.full_name}
              </p>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {statusStyle.label}
          </div>
        </div>

        {repository.description && (
          <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
            {repository.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <GitBranch className="w-3.5 h-3.5 text-slate-500" />
            {repository.default_branch}
          </span>
          {repository.language && (
            <Badge variant="slate" className="text-[11px] py-0">
              {repository.language}
            </Badge>
          )}
          {repository.automation?.doc_paths && (
            <span className="text-slate-500">
              • {repository.automation.doc_paths.length} docs tracked
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-dark-border/80 mt-auto">
        <div className="flex items-center gap-1">
          {repository.html_url && (
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-300 p-1.5 rounded hover:bg-slate-800 transition-colors"
              title="View on GitHub"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => onOpenSettings(repository)}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded hover:bg-slate-800 transition-colors"
            title="Configure Documentation Paths & Automation"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onViewDetail && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewDetail(repository)}
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
    </Card>
  );
};
