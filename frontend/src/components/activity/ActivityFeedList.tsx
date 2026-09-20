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
  Code2,
  FileText,
  GitPullRequest,
} from 'lucide-react';

interface ActivityFeedListProps {
  events: ActivityEvent[];
  onSelectExecution?: (executionId: string, initialTab?: 'pipeline' | 'agents' | 'files' | 'diff') => void;
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

  const renderContextualButton = (evt: ActivityEvent) => {
    if (!evt.execution_id || !onSelectExecution) return null;

    if (evt.type === 'CODE_CHANGE_DETECTED') {
      return (
        <button
          onClick={() => onSelectExecution(evt.execution_id!, 'files')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-xs font-mono text-indigo-300 hover:text-indigo-200 transition-colors border border-indigo-500/30"
          title="Inspect code changes and AI reasoning"
        >
          <Code2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>View Code Changes</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>
      );
    }

    if (evt.type === 'DOCUMENTATION_UPDATED' || evt.type === 'COMMIT_CREATED') {
      return (
        <button
          onClick={() => onSelectExecution(evt.execution_id!, 'diff')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-mono text-emerald-300 hover:text-emerald-200 transition-colors border border-emerald-500/30"
          title="Inspect documentation diff and PR"
        >
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>View Doc Updates</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>
      );
    }

    if (evt.type === 'AI_ANALYSIS_COMPLETED') {
      return (
        <button
          onClick={() => onSelectExecution(evt.execution_id!, 'agents')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-xs font-mono text-amber-300 hover:text-amber-200 transition-colors border border-amber-500/30"
          title="View 3-Agent deep trace"
        >
          <Brain className="w-3.5 h-3.5 text-amber-400" />
          <span>View AI Trace</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>
      );
    }

    return (
      <button
        onClick={() => onSelectExecution(evt.execution_id!, 'pipeline')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-mono text-slate-300 hover:text-slate-100 transition-colors border border-dark-border"
      >
        <span>View Trace</span>
        <ChevronRight className="w-3.5 h-3.5 opacity-70" />
      </button>
    );
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

          {/* Contextual Action Links */}
          <div className="flex items-center gap-2 shrink-0 self-center">
            {renderContextualButton(evt)}
            {evt.metadata?.pull_request_url && (
              <a
                href={evt.metadata.pull_request_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 hover:text-brand-200 border border-brand-500/30 text-xs font-mono transition-colors"
                title="Open Pull Request on GitHub"
              >
                <GitPullRequest className="w-3.5 h-3.5 text-brand-400" />
                <span className="hidden sm:inline">PR</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
