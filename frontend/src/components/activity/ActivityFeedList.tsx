import React from 'react';
import { ActivityEvent, ActivityEventType } from '../../types/activity';
import { Badge } from '../common/Badge';
import { formatShortSha, formatDate } from '../../utils/formatters';
import {
  GitCommit,
  GitBranch,
  FileCode,
  Bot,
  FileCheck2,
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
        return <GitBranch className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/25" />;
      case 'AUTOMATION_ACTIVATED':
        return <Power className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/30" />;
      case 'AUTOMATION_DEACTIVATED':
        return <PowerOff className="w-5 h-5 text-rose-600 dark:text-rose-400 fill-rose-500/20" />;
      case 'CODE_CHANGE_DETECTED':
        return <GitCommit className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-indigo-500/30" />;
      case 'AI_ANALYSIS_COMPLETED':
        return <Bot className="w-5 h-5 text-amber-600 dark:text-amber-400 fill-amber-500/30" />;
      case 'DOCUMENTATION_UPDATED':
        return <FileCheck2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/30" />;
      case 'COMMIT_CREATED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/30" />;
      case 'EXECUTION_FAILED':
        return <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 fill-rose-500/30" />;
      default:
        return <FileCode className="w-5 h-5 text-slate-600 dark:text-slate-400 fill-slate-400/25" />;
    }
  };

  const getEventContainerClass = (type: ActivityEventType) => {
    switch (type) {
      case 'REPOSITORY_CONNECTED':
      case 'AUTOMATION_ACTIVATED':
      case 'DOCUMENTATION_UPDATED':
      case 'COMMIT_CREATED':
        return 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/80 dark:border-emerald-800/60 shadow-xs';
      case 'CODE_CHANGE_DETECTED':
        return 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200/80 dark:border-indigo-800/60 shadow-xs';
      case 'AI_ANALYSIS_COMPLETED':
        return 'bg-amber-50 dark:bg-amber-950/50 border-amber-200/80 dark:border-amber-800/60 shadow-xs';
      case 'AUTOMATION_DEACTIVATED':
      case 'EXECUTION_FAILED':
        return 'bg-rose-50 dark:bg-rose-950/50 border-rose-200/80 dark:border-rose-800/60 shadow-xs';
      default:
        return 'bg-stone-100 dark:bg-slate-900 border-stone-200 dark:border-slate-800 shadow-2xs';
    }
  };

  const getEventBadge = (type: ActivityEventType) => {
    switch (type) {
      case 'REPOSITORY_CONNECTED':
      case 'AUTOMATION_ACTIVATED':
        return <Badge variant="emerald">Activated</Badge>;
      case 'AUTOMATION_DEACTIVATED':
        return <Badge variant="rose">Deactivated</Badge>;
      case 'CODE_CHANGE_DETECTED':
        return <Badge variant="indigo">In Progress</Badge>;
      case 'AI_ANALYSIS_COMPLETED':
        return <Badge variant="amber">AI Evaluated</Badge>;
      case 'DOCUMENTATION_UPDATED':
      case 'COMMIT_CREATED':
        return <Badge variant="emerald">Doc Updated</Badge>;
      case 'EXECUTION_FAILED':
        return <Badge variant="rose">Failed</Badge>;
      default:
        return <Badge variant="slate">Event</Badge>;
    }
  };

  const renderContextualButton = (evt: ActivityEvent) => {
    if (!evt.execution_id || !onSelectExecution) return null;

    if (evt.type === 'CODE_CHANGE_DETECTED') {
      return (
        <button
          onClick={() => onSelectExecution(evt.execution_id!, 'files')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-xs font-mono text-indigo-800 dark:text-indigo-300 hover:text-indigo-950 dark:hover:text-indigo-200 transition-colors border border-indigo-200 dark:border-indigo-500/30 cursor-pointer shadow-2xs font-semibold"
          title="Inspect code changes and AI reasoning"
        >
          <Code2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-500/20" />
          <span>View Code Changes</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>
      );
    }

    if (evt.type === 'DOCUMENTATION_UPDATED' || evt.type === 'COMMIT_CREATED') {
      return (
        <button
          onClick={() => onSelectExecution(evt.execution_id!, 'diff')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-xs font-mono text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-emerald-200 transition-colors border border-emerald-200 dark:border-emerald-500/30 cursor-pointer shadow-2xs font-semibold"
          title="Inspect documentation diff and PR"
        >
          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-500/25" />
          <span>View Doc Updates</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>
      );
    }

    if (evt.type === 'AI_ANALYSIS_COMPLETED') {
      return (
        <button
          onClick={() => onSelectExecution(evt.execution_id!, 'agents')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-xs font-mono text-amber-900 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-200 transition-colors border border-amber-200 dark:border-amber-500/30 cursor-pointer shadow-2xs font-semibold"
          title="View 3-Agent deep trace"
        >
          <Bot className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-500/30" />
          <span>View AI Trace</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>
      );
    }

    if (evt.type === 'EXECUTION_FAILED') {
      return (
        <button
          onClick={() => onSelectExecution(evt.execution_id!, 'pipeline')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-xs font-mono text-rose-800 dark:text-rose-300 hover:text-rose-950 dark:hover:text-rose-200 transition-colors border border-rose-200 dark:border-rose-500/30 cursor-pointer shadow-2xs font-semibold"
          title="Inspect failure diagnostics and stage error"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 fill-rose-500/25" />
          <span>View Error Trace</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-70" />
        </button>
      );
    }

    return (
      <button
        onClick={() => onSelectExecution(evt.execution_id!, 'pipeline')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 transition-colors border border-stone-200/90 dark:border-slate-700 cursor-pointer shadow-2xs"
      >
        <span>View Trace</span>
        <ChevronRight className="w-3.5 h-3.5 opacity-70" />
      </button>
    );
  };

  return (
    <div className="divide-y divide-stone-100 dark:divide-slate-800/80 font-sans">
      {events.map((evt) => (
        <div
          key={evt.id}
          className="p-4 sm:p-5 hover:bg-stone-50/70 dark:hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-4 group"
        >
          <div className="flex items-start gap-3.5 min-w-0">
            <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 transition-colors ${getEventContainerClass(evt.type)}`}>
              {getEventIcon(evt.type)}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-[#0F2742] dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {evt.title}
                </span>
                {getEventBadge(evt.type)}
                {evt.commit_sha && (
                  <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-slate-300 bg-stone-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-stone-200 dark:border-slate-700 shadow-2xs">
                    {formatShortSha(evt.commit_sha)}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">{evt.description}</p>

              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-0.5">
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{evt.repository_name}</span>
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 text-emerald-800 dark:text-brand-300 hover:text-emerald-950 dark:hover:text-brand-200 border border-emerald-200 dark:border-brand-500/30 text-xs font-mono transition-colors shadow-2xs font-semibold"
                title="Open Pull Request on GitHub"
              >
                <GitPullRequest className="w-3.5 h-3.5 text-emerald-600 dark:text-brand-400" />
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
