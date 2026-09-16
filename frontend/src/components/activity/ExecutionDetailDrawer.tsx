import React, { useState } from 'react';
import { Execution } from '../../types/execution';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { AgentPipelineVisualizer } from './AgentPipelineVisualizer';
import { DiffViewerModal } from './DiffViewerModal';
import { getExecutionStatusStyle } from '../../utils/statusStyles';
import { formatShortSha, formatDate, formatDuration } from '../../utils/formatters';
import {
  X,
  GitPullRequest,
  FileCode,
  Brain,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface ExecutionDetailDrawerProps {
  execution: Execution | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutionDetailDrawer: React.FC<ExecutionDetailDrawerProps> = ({
  execution,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'agents' | 'files' | 'diff'>('agents');
  const [showDiffModal, setShowDiffModal] = useState<boolean>(false);

  if (!isOpen || !execution) return null;

  const statusStyle = getExecutionStatusStyle(execution.status);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-dark-card border-l border-dark-border shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-dark-border bg-slate-900/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant={execution.status === 'COMPLETED' ? 'emerald' : execution.status === 'FAILED' ? 'rose' : 'indigo'}>
                {statusStyle.label}
              </Badge>
              <span className="text-xs font-mono text-slate-400">
                Commit {formatShortSha(execution.commit_sha)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-lg font-semibold text-slate-100">
            {execution.analysis_result?.summary || `Execution for commit ${formatShortSha(execution.commit_sha)}`}
          </h3>
          <p className="text-xs font-mono text-slate-400 mt-1">
            {execution.repository_name || 'Repository'} • Branch: {execution.branch} • {formatDate(execution.created_at)}
          </p>
        </div>

        {/* Visualizer */}
        <div className="p-6 border-b border-dark-border">
          <AgentPipelineVisualizer status={execution.status} />
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 border-b border-dark-border bg-dark-card">
          <button
            onClick={() => setActiveTab('agents')}
            className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'agents'
                ? 'border-brand-400 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Agent Traces
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'files'
                ? 'border-brand-400 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Changed Files ({execution.changed_files?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('diff')}
            className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'diff'
                ? 'border-brand-400 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Documentation Diff
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'agents' && (
            <div className="space-y-6">
              {/* Agent 1 Section */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-dark-border">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  <Brain className="w-4 h-4" />
                  <span>Agent 1 — Code Analysis</span>
                </div>
                {execution.analysis_result ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-semibold text-slate-300">Purpose: </span>
                      <span className="text-slate-400">{execution.analysis_result.purpose}</span>
                    </div>
                    {execution.analysis_result.key_changes?.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-300 block mb-1">Key Modifications:</span>
                        <ul className="list-disc list-inside text-slate-400 space-y-0.5 pl-1">
                          {execution.analysis_result.key_changes.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {execution.analysis_result.affected_components?.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-300 block mb-1">Affected Components:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {execution.analysis_result.affected_components.map((c, i) => (
                            <Badge key={i} variant="indigo">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Analysis stage not yet executed.</p>
                )}
              </div>

              {/* Agent 2 Section */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-dark-border">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Agent 2 — Differential Decision</span>
                </div>
                {execution.documentation_decision ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-semibold text-slate-300">Overall Decision: </span>
                      <Badge
                        variant={
                          execution.documentation_decision.overall_decision === 'UPDATE_REQUIRED'
                            ? 'emerald'
                            : 'slate'
                        }
                      >
                        {execution.documentation_decision.overall_decision}
                      </Badge>
                    </div>
                    <p className="text-slate-400">{execution.documentation_decision.decision_rationale}</p>
                    {execution.documentation_decision.document_decisions?.map((doc, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-dark-card border border-dark-border">
                        <div className="flex items-center justify-between font-mono font-semibold text-slate-200 mb-1">
                          <span>{doc.doc_path}</span>
                          <span className={doc.is_affected ? 'text-emerald-400' : 'text-slate-500'}>
                            {doc.is_affected ? 'Requires Update' : 'No Change Needed'}
                          </span>
                        </div>
                        <p className="text-slate-400">{doc.reason}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Decision stage not yet executed.</p>
                )}
              </div>

              {/* Agent 3 Section */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-dark-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    <FileCode className="w-4 h-4" />
                    <span>Agent 3 — Documentation Generator</span>
                  </div>
                  {execution.generated_diff && (
                    <Button size="sm" variant="outline" onClick={() => setShowDiffModal(true)}>
                      View Full Diff
                    </Button>
                  )}
                </div>

                {execution.updated_documents && execution.updated_documents.length > 0 ? (
                  <div className="space-y-2 text-xs">
                    {execution.updated_documents.map((doc, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-dark-card border border-dark-border">
                        <span className="font-mono font-semibold text-brand-400 block">{doc.doc_path}</span>
                        <p className="text-slate-300 mt-1">{doc.summary_of_changes}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    {execution.status === 'SKIPPED'
                      ? 'No updates generated (Agent 2 determined documentation changes were unnecessary).'
                      : 'No documentation files updated.'}
                  </p>
                )}
              </div>

              {/* Error Information if failed */}
              {execution.error_information && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Pipeline Error at stage: {execution.error_information.stage}</span>
                  </div>
                  <p className="font-mono">{execution.error_information.error}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-2">
              {execution.changed_files && execution.changed_files.length > 0 ? (
                execution.changed_files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-dark-border text-xs font-mono"
                  >
                    <span className="text-slate-200">{file.filename}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">+{file.additions}</span>
                      <span className="text-rose-400">-{file.deletions}</span>
                      <Badge variant="slate">{file.status}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No changed files recorded.</p>
              )}
            </div>
          )}

          {activeTab === 'diff' && (
            <div>
              {execution.generated_diff ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-dark-border font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed text-slate-300">
                  {execution.generated_diff}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No diff was generated for this execution run.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer with PR Links */}
        <div className="p-4 border-t border-dark-border bg-slate-900/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Duration: {formatDuration(execution.start_time, execution.completion_time)}
          </div>
          <div className="flex items-center gap-2">
            {execution.pull_request_url && (
              <a
                href={execution.pull_request_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-dark-base font-semibold text-xs hover:bg-brand-600 transition-colors shadow-sm"
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>View Pull Request</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Full Diff Modal */}
      <DiffViewerModal
        isOpen={showDiffModal}
        onClose={() => setShowDiffModal(false)}
        title={`Diff: Commit ${formatShortSha(execution.commit_sha)}`}
        subtitle={execution.analysis_result?.summary}
        rawDiff={execution.generated_diff || ''}
      />
    </div>
  );
};
