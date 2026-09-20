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
  ExternalLink,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Copy,
  Check,
  Layers,
  Activity,
  Code2,
  Compass,
} from 'lucide-react';

interface ExecutionDetailDrawerProps {
  execution: Execution | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'pipeline' | 'agents' | 'files' | 'diff';
}

export const ExecutionDetailDrawer: React.FC<ExecutionDetailDrawerProps> = ({
  execution,
  isOpen,
  onClose,
  initialTab = 'pipeline',
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'agents' | 'files' | 'diff'>(initialTab);
  const [selectedDocDiff, setSelectedDocDiff] = useState<{ path: string; diff: string; content?: string } | null>(null);
  const [copiedSha, setCopiedSha] = useState(false);

  // Synchronize activeTab whenever drawer is opened or initialTab changes
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen || !execution) return null;

  const statusStyle = getExecutionStatusStyle(execution.status);
  const totalAdditions = execution.changed_files?.reduce((acc, f) => acc + (f.additions || 0), 0) || 0;
  const totalDeletions = execution.changed_files?.reduce((acc, f) => acc + (f.deletions || 0), 0) || 0;
  const repoFullName = execution.repository_name || 'Repository';
  const githubCommitUrl = `https://github.com/${repoFullName}/commit/${execution.commit_sha}`;

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-4xl w-full bg-dark-card border-l border-dark-border shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-dark-border bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 flex-wrap">
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

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-xs font-mono text-slate-300">
                <GitCommit className="w-3.5 h-3.5 text-brand-400" />
                <span>{formatShortSha(execution.commit_sha)}</span>
                <button
                  type="button"
                  onClick={() => handleCopySha(execution.commit_sha)}
                  className="ml-1 p-0.5 text-slate-400 hover:text-white rounded transition-colors"
                  title="Copy full commit SHA"
                >
                  {copiedSha ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
                <a
                  href={githubCommitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-brand-300 transition-colors ml-0.5"
                  title="View on GitHub"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <Badge variant="indigo">{execution.event_type.toUpperCase()}</Badge>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight leading-snug">
            {execution.analysis_result?.summary || `Autonomous documentation sync for commit ${formatShortSha(execution.commit_sha)}`}
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mt-2.5">
            <span className="text-slate-200 font-semibold">{repoFullName}</span>
            <span className="text-slate-600">•</span>
            <span>Branch: <code className="text-brand-300 bg-brand-500/10 px-1.5 py-0.5 rounded">{execution.branch}</code></span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {formatDate(execution.created_at)}
            </span>
          </div>
        </div>

        {/* Pipeline Stage Visualizer */}
        <div className="p-4 sm:p-5 border-b border-dark-border bg-slate-950/60">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-brand-400" />
              <span>Multi-Agent Pipeline Progression</span>
            </span>
            <span className="text-slate-400 font-mono text-xs">
              Duration: <strong className="text-slate-200">{formatDuration(execution.start_time, execution.completion_time)}</strong>
            </span>
          </div>
          <AgentPipelineVisualizer status={execution.status} />
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-dark-border bg-dark-card shrink-0 overflow-x-auto">
          {[
            { id: 'pipeline', label: 'Overview & Flow', icon: <Compass className="w-4 h-4" /> },
            { id: 'agents', label: '3-Agent Deep Trace', icon: <Brain className="w-4 h-4" /> },
            { id: 'files', label: `Code Changes (${execution.changed_files?.length || 0})`, icon: <Code2 className="w-4 h-4" /> },
            { id: 'diff', label: `Docs Diff (${execution.updated_documents?.length || 0})`, icon: <FileText className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-brand-400 text-brand-400 bg-brand-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW & FLOW */}
          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              {/* Executive Key Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-dark-border">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Trigger Commit
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-100 flex items-center gap-1">
                    <span>{formatShortSha(execution.commit_sha)}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-dark-border">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Code Impact
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>{execution.changed_files?.length || 0} files</span>
                    <span className="text-emerald-400 text-xs">+{totalAdditions}</span>
                    <span className="text-rose-400 text-xs">-{totalDeletions}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-dark-border">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Doc Decision
                  </div>
                  <Badge
                    variant={
                      execution.documentation_decision?.overall_decision === 'UPDATE_REQUIRED'
                        ? 'emerald'
                        : 'slate'
                    }
                  >
                    {execution.documentation_decision?.overall_decision || execution.status}
                  </Badge>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-dark-border">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Docs Modified
                  </div>
                  <div className="font-mono text-sm font-bold text-emerald-400">
                    {execution.updated_documents?.length || 0} files
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-dark-border space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-indigo-400" />
                    <span>Code Change Analysis & Purpose</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {execution.analysis_result?.purpose || execution.analysis_result?.summary || 'Analysis in progress or not recorded.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-dark-border space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Documentation Decision Rationale</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {execution.documentation_decision?.decision_rationale || 'Evaluating impact on system docs.'}
                  </p>
                </div>
              </div>

              {/* Step-by-Step Flow Execution Trail */}
              <div className="p-5 rounded-xl bg-slate-900/40 border border-dark-border space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-400" />
                    <span>Step-by-Step Execution Journey</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">3 AI Agents + Backend Engine</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {/* Step 1: GitHub Ingestion */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-dark-card border border-dark-border/80">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 font-bold text-xs">
                      1
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100">GitHub Code Commit Ingestion</span>
                        <span className="text-emerald-400 text-[11px] font-semibold">200 OK</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Extracted commit <code className="text-slate-200">{formatShortSha(execution.commit_sha)}</code> on branch <code className="text-brand-300">{execution.branch}</code> ({execution.changed_files?.length || 0} files changed: +{totalAdditions}, -{totalDeletions}).
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Agent 1 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-dark-card border border-dark-border/80">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 font-bold text-xs">
                      2
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100">Agent 1: Semantic Code Understanding</span>
                        <span className="text-indigo-400 text-[11px] font-semibold">Completed</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {execution.analysis_result?.summary || 'Extracted structural diff and behavioral changes.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Agent 2 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-dark-card border border-dark-border/80">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 font-bold text-xs">
                      3
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100">Agent 2: Documentation Impact Decision</span>
                        <span className="text-amber-400 text-[11px] font-semibold">
                          {execution.documentation_decision?.overall_decision || 'Evaluated'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {execution.documentation_decision?.decision_rationale || 'Determined whether documentation changes are required.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Agent 3 & Commits */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-dark-card border border-dark-border/80">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 font-bold text-xs">
                      4
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100">Agent 3: Assembly & GitHub Sync</span>
                        <span className="text-emerald-400 text-[11px] font-semibold">
                          {execution.status === 'COMPLETED' ? 'Synchronized' : execution.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {execution.updated_documents && execution.updated_documents.length > 0
                          ? `Generated documentation updates for ${execution.updated_documents.map((d) => d.doc_path).join(', ')}.`
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
                <div className="flex items-center justify-between pb-3 border-b border-dark-border">
                  <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-indigo-400">
                    <Brain className="w-4 h-4" />
                    <span>Agent 1 — Code Understanding Agent (Gemini 3.6 Flash)</span>
                  </div>
                  <Badge variant="indigo">Analysis Complete</Badge>
                </div>

                {execution.analysis_result ? (
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="font-semibold text-slate-300 block mb-1">High-Level Summary:</span>
                      <p className="text-slate-300 leading-relaxed bg-dark-card p-3 rounded-lg border border-dark-border">
                        {execution.analysis_result.summary}
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-300 block mb-1">Underlying Purpose:</span>
                      <p className="text-slate-300 leading-relaxed bg-dark-card p-3 rounded-lg border border-dark-border">
                        {execution.analysis_result.purpose}
                      </p>
                    </div>

                    {execution.analysis_result.key_changes?.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-300 block mb-1.5">Key Structural & Behavioral Changes:</span>
                        <ul className="list-disc list-inside text-slate-300 space-y-1.5 pl-2 font-mono text-[11px] bg-dark-card p-3 rounded-lg border border-dark-border">
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
                        <span className="font-semibold text-slate-300 block mb-1.5">Dependencies Touched:</span>
                        <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                          {execution.analysis_result.dependencies.map((d, i) => (
                            <span key={i} className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
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
                <div className="flex items-center justify-between pb-3 border-b border-dark-border">
                  <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Agent 2 — Documentation Impact & Decision Agent (Gemini 3.6 Flash)</span>
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
                        <div key={i} className="p-3.5 rounded-lg bg-dark-card border border-dark-border space-y-1.5">
                          <div className="flex items-center justify-between font-mono font-semibold">
                            <span className="text-brand-300 text-xs">{doc.doc_path}</span>
                            <Badge variant={doc.is_affected ? 'emerald' : 'slate'}>
                              {doc.is_affected ? 'Update Required' : 'No Change Needed'}
                            </Badge>
                          </div>
                          <p className="text-slate-300 text-xs">{doc.reason}</p>
                          {doc.required_changes?.length > 0 && (
                            <div className="pt-1.5 text-[11px] font-mono text-slate-400 border-t border-slate-800/80 mt-1">
                              <span className="text-amber-400 font-semibold">Planned Updates: </span>
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
                <div className="flex items-center justify-between pb-3 border-b border-dark-border">
                  <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <FileCode className="w-4 h-4" />
                    <span>Agent 3 — Documentation Generator Agent (Gemini 3.6 Flash)</span>
                  </div>
                  <Badge variant="emerald">Generation Complete</Badge>
                </div>

                {execution.updated_documents && execution.updated_documents.length > 0 ? (
                  <div className="space-y-3 text-xs">
                    {execution.updated_documents.map((doc, i) => (
                      <div key={i} className="p-3.5 rounded-lg bg-dark-card border border-dark-border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-200 text-xs">{doc.doc_path}</span>
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
                    className="p-4 rounded-xl bg-slate-900/60 border border-dark-border text-xs font-mono space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-100">{file.filename}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">+{file.additions}</span>
                        <span className="text-rose-400 font-bold">-{file.deletions}</span>
                        <Badge variant="slate">{file.status?.toUpperCase() || 'MODIFIED'}</Badge>
                      </div>
                    </div>
                    {file.patch && (
                      <pre className="p-3 rounded-lg bg-slate-950 border border-dark-border text-[11px] text-slate-300 overflow-x-auto leading-relaxed font-mono">
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
        <div className="p-4 sm:p-5 border-t border-dark-border bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2 flex-wrap">
            <span>Commit: <code className="text-slate-200">{formatShortSha(execution.commit_sha)}</code></span>
            {execution.final_commit_sha && (
              <>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                <span>Sync SHA: <code className="text-brand-400">{formatShortSha(execution.final_commit_sha)}</code></span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {execution.pull_request_url && (
              <a
                href={execution.pull_request_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-500 text-dark-base font-semibold text-xs hover:bg-brand-600 transition-colors shadow-sm"
              >
                <GitPullRequest className="w-4 h-4" />
                <span>View Pull Request on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
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
