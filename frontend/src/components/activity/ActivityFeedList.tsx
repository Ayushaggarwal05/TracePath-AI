import React from 'react';
import { ActivityEvent, ActivityEventType } from '../../types/activity';
import { Badge } from '../common/Badge';
import { formatShortSha, formatDate } from '../../utils/formatters';
import {
  GitCommit,
  GitBranch,
  FileCode,
  Brain,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Power,
  PowerOff,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface ActivityFeedListProps {
  events: ActivityEvent[];
  onSelectExecution?: (executionId: string) => void;
}

export const ActivityFeedList: React.FC<ActivityFeedListProps> = ({
  events,
  onSelectExecution,
}) => {
  const getEventIcon = (type: ActivityEventType) => {
    switch (type) {
      case 'REPOSITORY_CONNECTED':
        return <GitBranch className="w-4 h-4 text-brand-400" />;
      case 'AUTOMATION_ACTIVATED':
        return <Power className="w-4 h-4 text-emerald-400" />;
      case 'AUTOMATION_DEACTIVATED':
        return <PowerOff className="w-4 h-4 text-rose-400" />;
      case 'CODE_CHANGE_DETECTED':
        return <GitCommit className="w-4 h-4 text-indigo-400" />;
      case 'AI_ANALYSIS_COMPLETED':
        return <Brain className="w-4 h-4 text-indigo-300" />;
      case 'DOCUMENTATION_UPDATED':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'COMMIT_CREATED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'EXECUTION_FAILED':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <FileCode className="w-4 h-4 text-slate-400" />;
    }
  };

  const getEventBadge = (type: ActivityEventType) => {
    switch (type) {
      case 'REPOSITORY_CONNECTED':
        return <Badge variant="indigo">Connected</Badge>;
      case 'AUTOMATION_ACTIVATED':
        return <Badge variant="emerald">Activated</Badge>;
      case 'AUTOMATION_DEACTIVATED':
        return <Badge variant="rose">Deactivated</Badge>;
      case 'CODE_CHANGE_DETECTED':
        return <Badge variant="indigo">Code Push</Badge>;
      case 'AI_ANALYSIS_COMPLETED':
        return <Badge variant="indigo">Agent 1</Badge>;
      case 'DOCUMENTATION_UPDATED':
        return <Badge variant="emerald">Agent 3</Badge>;
      case 'COMMIT_CREATED':
        return <Badge variant="emerald">Synced</Badge>;
      case 'EXECUTION_FAILED':
        return <Badge variant="rose">Failed</Badge>;
    }
  };

  return (
    <div className="divide-y divide-dark-border">
      {events.map((evt) => (
        <div
          key={evt.id}
          className="p-4 hover:bg-slate-900/40 transition-colors flex items-start justify-between gap-4 group"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-slate-900 border border-dark-border shrink-0 mt-0.5 group-hover:border-slate-700 transition-colors">
              {getEventIcon(evt.type)}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-200 group-hover:text-brand-300 transition-colors">
                  {evt.title}
                </span>
                {getEventBadge(evt.type)}
                {evt.commit_sha && (
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-dark-border">
                    {formatShortSha(evt.commit_sha)}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{evt.description}</p>

              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500 pt-0.5">
                <span className="text-slate-400">{evt.repository_name}</span>
                <span>•</span>
                {evt.actor && (
                  <>
                    <span>By {evt.actor}</span>
                    <span>•</span>
                  </>
                )}
                <span>{formatDate(evt.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Link */}
          <div className="flex items-center gap-2 shrink-0 self-center">
            {evt.execution_id && onSelectExecution && (
              <button
                onClick={() => onSelectExecution(evt.execution_id!)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-mono text-slate-300 hover:text-slate-100 transition-colors border border-dark-border"
              >
                <span>View Trace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            {evt.metadata?.pull_request_url && (
              <a
                href={evt.metadata.pull_request_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                title="Open Pull Request"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
