import React, { useState } from 'react';
import { Execution } from '../../types/execution';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { AgentPipelineVisualizer } from './AgentPipelineVisualizer';
import { DiffViewerModal } from './DiffViewerModal';
import { DiffViewer } from '../diff/DiffViewer';
import { getExecutionStatusStyle } from '../../utils/statusStyles';
import { formatShortSha, formatDate, formatDuration } from '../../utils/formatters';
import {
  X,
  GitPullRequest,
  GitCommit,
  FileCode,
  Brain,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
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
  const [activeTab, setActiveTab] = useState<'pipeline' | 'agents' | 'files' | 'diff'>('pipeline');
  const [selectedDocDiff, setSelectedDocDiff] = useState<{ path: string; diff: string; content?: string } | null>(null);

  if (!isOpen || !execution) return null;

  const statusStyle = getExecutionStatusStyle(execution.status);
  const totalAdditions = execution.changed_files?.reduce((acc, f) => acc + f.additions, 0) || 0;
  const totalDeletions = execution.changed_files?.reduce((acc, f) => acc + f.deletions, 0) || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-3xl w-full bg-dark-card border-l border-dark-border shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-dark-border bg-slate-900/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  execution.status === 'COMPLETED'
                    ? 'emerald'
                    : execution.status === 'FAILED'
                    ? 'rose'
                    : execution.status === 'SKIPPED'
                    ? 'slate'
                    : 'indigo'
                }
              >
                {statusStyle.label}
              </Badge>
              <span className="text-xs font-mono text-slate-400">
                Commit {formatShortSha(execution.commit_sha)}
              </span>
              <Badge variant="indigo">{execution.event_type.toUpperCase()}</Badge>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-lg font-bold text-slate-100 tracking-tight leading-snug">
            {execution.analysis_result?.summary || `Autonomous sync for commit ${formatShortSha(execution.commit_sha)}`}
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mt-2">
            <span className="text-slate-300 font-semibold">{execution.repository_name || 'Repository'}</span>
            <span>•</span>
            <span>Branch: <code className="text-brand-400">{execution.branch}</code></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {formatDate(execution.created_at)}
            </span>
          </div>
        </div>

        {/* Pipeline Stage Visualizer */}
        <div className="p-5 border-b border-dark-border bg-slate-950/40">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span>Autonomous Pipeline Flow</span>
            <span className="text-slate-500 font-mono">
              Duration: {formatDuration(execution.start_time, execution.completion_time)}
            </span>
          </div>
          <AgentPipelineVisualizer status={execution.status} />
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 border-b border-dark-border bg-dark-card shrink-0">
          {[
            { id: 'pipeline', label: 'Overview & Flow' },
            { id: 'agents', label: '3-Agent Deep Trace' },
            { id: 'files', label: `Code Diff (${execution.changed_files?.length || 0})` },
            { id: 'diff', label: `Docs Diff (${execution.updated_documents?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-brand-400 text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW & FLOW */}
          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-dark-border space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-brand-400" />
                    <span>What Changed & Purpose</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {execution.analysis_result?.purpose || 'Analysis in progress or not recorded.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-dark-border space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Documentation Outcome</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        execution.documentation_decision?.overall_decision === 'UPDATE_REQUIRED'
                          ? 'emerald'
                          : 'slate'
                      }
                    >
                      {execution.documentation_decision?.overall_decision || execution.status}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {execution.updated_documents?.length || 0} files updated
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {execution.documentation_decision?.decision_rationale || 'Evaluating impact on system docs.'}
                  </p>
                </div>
              </div>

              {/* Step-by-Step Flow Execution Trail */}
              <div className="p-5 rounded-xl bg-slate-900/40 border border-dark-border space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Execution Trace Steps
                </h4>

                <div className="space-y-3 font-mono text-xs">
                  {/* Step 1: GitHub Event */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-dark-card border border-dark-border">
                    <div className="p-1.5 rounded bg-slate-800 text-indigo-400 shrink-0 mt-0.5">
                      <GitCommit className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">1. GitHub Webhook Ingestion</span>
                        <span className="text-emerald-400 text-[11px]">200 OK</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Event: {execution.event_type} on branch <code className="text-slate-300">{execution.branch}</code> ({execution.changed_files?.length || 0} changed files: +{totalAdditions}, -{totalDeletions})
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Agent 1 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-dark-card border border-dark-border">
                    <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">2. Agent 1: Code Understanding</span>
                        <span className="text-indigo-400 text-[11px]">Completed</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        {execution.analysis_result?.summary || 'Extracted structural diff and behavioral changes.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Agent 2 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-dark-card border border-dark-border">
                    <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">3. Agent 2: Documentation Decision</span>
                        <span className="text-amber-400 text-[11px]">
                          {execution.documentation_decision?.overall_decision || 'Evaluated'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        {execution.documentation_decision?.decision_rationale || 'Determined whether documentation changes are required.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Agent 3 & Commits */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-dark-card border border-dark-border">
                    <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">4. Agent 3 & Synchronization</span>
                        <span className="text-emerald-400 text-[11px]">
                          {execution.status === 'COMPLETED' ? 'Synchronized' : execution.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        {execution.updated_documents && execution.updated_documents.length > 0
                          ? `Generated unified diffs for ${execution.updated_documents.map((d) => d.doc_path).join(', ')}.`
                          : 'Zero documentation updates needed for this code commit.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Box if FAILED */}
              {execution.error_information && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Pipeline Execution Failure at {execution.error_information.stage}</span>
                  </div>
                  <p className="font-mono mt-1 text-slate-300">{execution.error_information.error}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AGENT DEEP TRACE */}
          {activeTab === 'agents' && (
            <div className="space-y-6">
              {/* Agent 1 Analysis */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-dark-border space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-dark-border">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                    <Brain className="w-4 h-4" />
                    <span>Agent 1 — Code Understanding Agent</span>
                  </div>
                  <Badge variant="indigo">Analysis Complete</Badge>
                </div>

                {execution.analysis_result ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-semibold text-slate-300 block mb-0.5">High-Level Summary:</span>
                      <p className="text-slate-400 leading-relaxed">{execution.analysis_result.summary}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-300 block mb-0.5">Underlying Purpose:</span>
                      <p className="text-slate-400 leading-relaxed">{execution.analysis_result.purpose}</p>
                    </div>

                    {execution.analysis_result.key_changes?.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-300 block mb-1">Key Modifications:</span>
                        <ul className="list-disc list-inside text-slate-400 space-y-1 pl-1 font-mono text-[11px]">
                          {execution.analysis_result.key_changes.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {execution.analysis_result.affected_components?.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-300 block mb-1.5">Affected Components:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {execution.analysis_result.affected_components.map((c, i) => (
                            <Badge key={i} variant="indigo">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {execution.analysis_result.dependencies?.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-300 block mb-1">Dependencies Touched:</span>
                        <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                          {execution.analysis_result.dependencies.map((d, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Analysis stage trace not available.</p>
                )}
              </div>

              {/* Agent 2 Decision */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-dark-border space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-dark-border">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Agent 2 — Documentation Impact & Decision Agent</span>
                  </div>
                  <Badge
                    variant={
                      execution.documentation_decision?.overall_decision === 'UPDATE_REQUIRED'
                        ? 'emerald'
                        : 'slate'
                    }
                  >
                    {execution.documentation_decision?.overall_decision || 'EVALUATED'}
                  </Badge>
                </div>

                {execution.documentation_decision ? (
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="font-semibold text-slate-300 block mb-1">Decision Rationale:</span>
                      <p className="text-slate-300 leading-relaxed bg-dark-card p-3 rounded-lg border border-dark-border">
                        {execution.documentation_decision.decision_rationale}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="font-semibold text-slate-300 block">Evaluated Documentation Files:</span>
                      {execution.documentation_decision.document_decisions?.map((doc, i) => (
                        <div key={i} className="p-3 rounded-lg bg-dark-card border border-dark-border space-y-1.5">
                          <div className="flex items-center justify-between font-mono font-semibold">
                            <span className="text-brand-400">{doc.doc_path}</span>
                            <Badge variant={doc.is_affected ? 'emerald' : 'slate'}>
                              {doc.is_affected ? 'Update Required' : 'No Change Needed'}
                            </Badge>
                          </div>
                          <p className="text-slate-400">{doc.reason}</p>
                          {doc.required_changes?.length > 0 && (
                            <div className="pt-1 text-[11px] font-mono text-slate-400">
                              <span className="text-slate-500">Planned updates: </span>
                              {doc.required_changes.join(' • ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Decision stage trace not available.</p>
                )}
              </div>

              {/* Agent 3 Generation */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-dark-border space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-dark-border">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <FileCode className="w-4 h-4" />
                    <span>Agent 3 — Documentation Generator Agent</span>
                  </div>
                  <Badge variant="emerald">Generation Complete</Badge>
                </div>

                {execution.updated_documents && execution.updated_documents.length > 0 ? (
                  <div className="space-y-3 text-xs">
                    {execution.updated_documents.map((doc, i) => (
                      <div key={i} className="p-3 rounded-lg bg-dark-card border border-dark-border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-200">{doc.doc_path}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setSelectedDocDiff({
                                path: doc.doc_path,
                                diff: doc.diff,
                                content: doc.updated_content,
                              })
                            }
                          >
                            Inspect Diff
                          </Button>
                        </div>
                        <p className="text-slate-300">{doc.summary_of_changes}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    {execution.status === 'SKIPPED'
                      ? 'No updates generated (Agent 2 determined documentation changes were unnecessary).'
                      : 'No documentation files generated.'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CODE DIFF */}
          {activeTab === 'files' && (
            <div className="space-y-3">
              {execution.changed_files && execution.changed_files.length > 0 ? (
                execution.changed_files.map((file, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-900/60 border border-dark-border text-xs font-mono space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{file.filename}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">+{file.additions}</span>
                        <span className="text-rose-400 font-bold">-{file.deletions}</span>
                        <Badge variant="slate">{file.status.toUpperCase()}</Badge>
                      </div>
                    </div>
                    {file.patch && (
                      <pre className="p-2.5 rounded bg-slate-950 border border-dark-border text-[11px] text-slate-400 overflow-x-auto">
                        {file.patch}
                      </pre>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No changed files recorded for this execution.</p>
              )}
            </div>
          )}

          {/* TAB 4: DOCS DIFF */}
          {activeTab === 'diff' && (
            <div>
              {execution.generated_diff ? (
                <DiffViewer
                  rawDiff={execution.generated_diff}
                  updatedContent={execution.updated_documents?.[0]?.updated_content}
                  docPath={execution.updated_documents?.[0]?.doc_path}
                />
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs italic bg-slate-900/40 rounded-xl border border-dark-border">
                  No documentation diff was produced for this execution run.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-dark-border bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <span>Commit: <code className="text-slate-300">{formatShortSha(execution.commit_sha)}</code></span>
            {execution.final_commit_sha && (
              <>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                <span>Sync SHA: <code className="text-brand-400">{formatShortSha(execution.final_commit_sha)}</code></span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {execution.pull_request_url && (
              <a
                href={execution.pull_request_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-dark-base font-semibold text-xs hover:bg-brand-600 transition-colors shadow-xs"
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>View Pull Request</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            )}
            <Button size="sm" variant="outline" onClick={onClose}>
              Close Trace
            </Button>
          </div>
        </div>
      </div>

      {/* Selected Doc Diff Modal */}
      {selectedDocDiff && (
        <DiffViewerModal
          isOpen={!!selectedDocDiff}
          onClose={() => setSelectedDocDiff(null)}
          title={`Documentation Diff: ${selectedDocDiff.path}`}
          subtitle={`Autonomous changes synchronized by Agent 3`}
          rawDiff={selectedDocDiff.diff}
          updatedContent={selectedDocDiff.content}
          docPath={selectedDocDiff.path}
        />
      )}
    </div>
  );
};
