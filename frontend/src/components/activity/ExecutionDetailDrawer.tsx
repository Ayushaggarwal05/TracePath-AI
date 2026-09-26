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
  Cpu,
} from 'lucide-react';

interface ExecutionDetailDrawerProps {
  execution: Execution | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'pipeline' | 'agents' | 'files' | 'diff' | 'telemetry';
}

export const ExecutionDetailDrawer: React.FC<ExecutionDetailDrawerProps> = ({
  execution,
  isOpen,
  onClose,
  initialTab = 'pipeline',
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'agents' | 'files' | 'diff' | 'telemetry'>(initialTab);
  const [selectedDocDiff, setSelectedDocDiff] = useState<{ path: string; diff: string; content?: string } | null>(null);
  const [copiedSha, setCopiedSha] = useState(false);

  // Synchronize activeTab whenever modal is opened or initialTab changes
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
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5 md:p-6 lg:p-8 bg-black/80 backdrop-blur-md transition-all duration-200">
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Centered Modal with 70/30 Split */}
      <div className="relative w-full max-w-7xl h-[92vh] max-h-[920px] bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Main 70/30 Grid Container */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-10 min-h-0 overflow-hidden">
          
          {/* ========================================================================= */}
          {/* LEFT 70% COLUMN: Header, Tabs, Content, and Footer */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-stone-200/90 dark:border-slate-800 bg-white dark:bg-[#0D1526]">
            
            {/* 70% Header: Badges, Title, Metadata */}
            <div className="p-5 sm:p-6 border-b border-stone-200/90 dark:border-slate-800 bg-[#F7F5F0] dark:bg-slate-900/80 backdrop-blur-md shrink-0">
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

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800/80 border border-stone-200/90 dark:border-slate-700/60 text-xs font-mono text-slate-800 dark:text-slate-300 shadow-2xs">
                    <GitCommit className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{formatShortSha(execution.commit_sha)}</span>
                    <button
                      type="button"
                      onClick={() => handleCopySha(execution.commit_sha)}
                      className="ml-1 p-0.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded transition-colors cursor-pointer"
                      title="Copy full commit SHA"
                    >
                      {copiedSha ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <a
                      href={githubCommitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors ml-0.5"
                      title="View on GitHub"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <Badge variant="indigo">{execution.event_type.toUpperCase()}</Badge>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-[#0F2742] dark:text-slate-100 tracking-tight leading-snug font-sans">
                {execution.analysis_result?.summary || `Autonomous documentation sync for commit ${formatShortSha(execution.commit_sha)}`}
              </h3>

              <div className="flex flex-wrap items-center gap-3.5 text-xs font-mono text-slate-500 dark:text-slate-400 mt-2.5">
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{repoFullName}</span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span>Branch: <code className="text-indigo-700 dark:text-brand-300 bg-indigo-50 dark:bg-brand-500/10 px-1.5 py-0.5 rounded">{execution.branch}</code></span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  {formatDate(execution.created_at)}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 px-4 sm:px-6 border-b border-stone-200/90 dark:border-slate-800 bg-[#ECE9E2]/50 dark:bg-slate-900/40 shrink-0 overflow-x-auto">
              {[
                { id: 'pipeline', label: 'Overview & Flow', icon: <Compass className="w-4 h-4" /> },
                { id: 'agents', label: '3-Agent Deep Trace', icon: <Brain className="w-4 h-4" /> },
                { id: 'files', label: `Code Changes (${execution.changed_files?.length || 0})`, icon: <Code2 className="w-4 h-4" /> },
                { id: 'diff', label: `Docs Diff (${execution.updated_documents?.length || 0})`, icon: <FileText className="w-4 h-4" /> },
                { id: 'telemetry', label: `Engine Telemetry (${execution.telemetry_logs?.length || 0})`, icon: <Activity className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-white/60 dark:bg-emerald-500/5'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-stone-200/50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Scrollable Tab Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 min-h-0">
              {/* TAB 1: OVERVIEW & FLOW */}
              {activeTab === 'pipeline' && (
                <div className="space-y-6">
                  {/* Key Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[#F7F5F0] dark:bg-slate-900/60 border border-stone-200/90 dark:border-slate-800">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-sans">
                        Trigger Commit
                      </div>
                      <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <span>{formatShortSha(execution.commit_sha)}</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F7F5F0] dark:bg-slate-900/60 border border-stone-200/90 dark:border-slate-800">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-sans">
                        Code Impact
                      </div>
                      <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <span>{execution.changed_files?.length || 0} files</span>
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs">+{totalAdditions}</span>
                        <span className="text-rose-600 dark:text-rose-400 text-xs">-{totalDeletions}</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F7F5F0] dark:bg-slate-900/60 border border-stone-200/90 dark:border-slate-800">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-sans">
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

                    <div className="p-3.5 rounded-2xl bg-[#F7F5F0] dark:bg-slate-900/60 border border-stone-200/90 dark:border-slate-800">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-sans">
                        Docs Modified
                      </div>
                      <div className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {execution.updated_documents?.length || 0} files
                      </div>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#F7F5F0] dark:bg-slate-900/60 border border-stone-200/90 dark:border-slate-800 space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-sans">
                        <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Code Change Analysis & Purpose</span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-300 font-medium leading-relaxed font-sans">
                        {execution.analysis_result?.purpose || execution.analysis_result?.summary || 'Analysis in progress or not recorded.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F7F5F0] dark:bg-slate-900/60 border border-stone-200/90 dark:border-slate-800 space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-sans">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Documentation Decision Rationale</span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed font-sans">
                        {execution.documentation_decision?.decision_rationale || 'Evaluating impact on system docs.'}
                      </p>
                    </div>
                  </div>

                  {/* Step-by-Step Flow Execution Trail */}
                  <div className="p-5 rounded-2xl bg-[#F7F5F0] dark:bg-slate-900/40 border border-stone-200/90 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 flex items-center gap-2 font-sans">
                        <Layers className="w-4 h-4 text-indigo-600 dark:text-brand-400" />
                        <span>Step-by-Step Execution Journey</span>
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">3 AI Agents + Backend Engine</span>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                      {/* Step 1: GitHub Ingestion */}
                      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-stone-200/90 dark:border-slate-800 shadow-2xs">
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 font-bold text-xs">
                          1
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between font-sans">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">GitHub Code Commit Ingestion</span>
                            <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold font-mono">200 OK</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed font-sans">
                            Extracted commit <code className="text-slate-900 dark:text-slate-200 font-mono">{formatShortSha(execution.commit_sha)}</code> on branch <code className="text-indigo-700 dark:text-brand-300 font-mono">{execution.branch}</code> ({execution.changed_files?.length || 0} files changed: +{totalAdditions}, -{totalDeletions}).
                          </p>
                        </div>
                      </div>

                      {/* Step 2: Agent 1 */}
                      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-stone-200/90 dark:border-slate-800 shadow-2xs">
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 font-bold text-xs">
                          2
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between font-sans">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">Agent 1: Semantic Code Understanding</span>
                            <span className="text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold font-mono">Completed</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed font-sans">
                            {execution.analysis_result?.summary || 'Extracted structural diff and behavioral changes.'}
                          </p>
                        </div>
                      </div>

                      {/* Step 3: Agent 2 */}
                      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-stone-200/90 dark:border-slate-800 shadow-2xs">
                        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 font-bold text-xs">
                          3
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between font-sans">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">Agent 2: Documentation Impact Decision</span>
                            <span className="text-amber-600 dark:text-amber-400 text-[11px] font-semibold font-mono">
                              {execution.documentation_decision?.overall_decision || 'Evaluated'}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed font-sans">
                            {execution.documentation_decision?.decision_rationale || 'Determined whether documentation changes are required.'}
                          </p>
                        </div>
                      </div>

                      {/* Step 4: Agent 3 & Commits */}
                      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-stone-200/90 dark:border-slate-800 shadow-2xs">
                        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold text-xs">
                          4
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between font-sans">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">Agent 3: Assembly & GitHub Sync</span>
                            <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold font-mono">
                              {execution.status === 'COMPLETED' ? 'Synchronized' : execution.status}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed font-sans">
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
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
                      <div className="flex items-center gap-2 font-semibold mb-1 font-sans">
                        <AlertCircle className="w-4 h-4" />
                        <span>Pipeline Execution Failure at {execution.error_information.stage}</span>
                      </div>
                      <p className="font-mono mt-1 text-slate-800 dark:text-slate-300">{execution.error_information.error}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: AGENT DEEP TRACE */}
              {activeTab === 'agents' && (
                <div className="space-y-6">
                  {/* Agent 1 Analysis */}
                  <div className="p-5 rounded-2xl bg-[#F7F5F0] dark:bg-slate-900/60 border border-stone-200/90 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-200/90 dark:border-slate-800">
                      <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 font-sans">
                        <Brain className="w-4 h-4" />
                        <span>Agent 1 — Code Understanding Agent</span>
                      </div>
                      <Badge variant="indigo">Analysis Complete</Badge>
                    </div>

                    {execution.analysis_result ? (
                      <div className="space-y-4 text-xs font-sans">
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-300 block mb-1">High-Level Summary:</span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-stone-200/90 dark:border-slate-800 shadow-2xs">
                            {execution.analysis_result.summary}
                          </p>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-300 block mb-1">Underlying Purpose:</span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-stone-200/90 dark:border-slate-800 shadow-2xs">
                            {execution.analysis_result.purpose}
                          </p>
                        </div>

                        {execution.analysis_result.key_changes?.length > 0 && (
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-300 block mb-1.5">Key Structural & Behavioral Changes:</span>
                            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1.5 pl-2 font-mono text-[11px] bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-stone-200/90 dark:border-slate-800 shadow-2xs">
                              {execution.analysis_result.key_changes.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {execution.analysis_result.affected_components?.length > 0 && (
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-300 block mb-1.5">Affected Components:</span>
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
                            <span className="font-semibold text-slate-800 dark:text-slate-300 block mb-1.5">Dependencies Touched:</span>
                            <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                              {execution.analysis_result.dependencies.map((d, i) => (
                                <span key={i} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs">
                                  {d}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {execution.analysis_result.behavior_changes?.length > 0 && (
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-300 block mb-1.5">Behavioral Changes:</span>
                            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1 pl-2 text-[11px]">
                              {execution.analysis_result.behavior_changes.map((b, i) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No analysis data available for this execution stage.</p>
                    )}
                  </div>

                  {/* Agent 2 Impact Decision */}
                  <div className="p-5 rounded-2xl bg-[#F7F5F0] dark:bg-slate-900/60 border border-stone-200/90 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-200/90 dark:border-slate-800">
                      <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-sans">
                        <Sparkles className="w-4 h-4" />
                        <span>Agent 2 — Documentation Impact & Decision Agent</span>
                      </div>
                      <Badge variant="amber">
                        {execution.documentation_decision?.overall_decision || 'Evaluation Complete'}
                      </Badge>
                    </div>

                    {execution.documentation_decision ? (
                      <div className="space-y-4 text-xs font-sans">
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-300 block mb-1">Impact Decision:</span>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                execution.documentation_decision.overall_decision === 'UPDATE_REQUIRED'
                                  ? 'rose'
                                  : 'emerald'
                              }
                            >
                              {execution.documentation_decision.overall_decision}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-300 block mb-1">Decision Rationale:</span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-stone-200/90 dark:border-slate-800 shadow-2xs">
                            {execution.documentation_decision.decision_rationale}
                          </p>
                        </div>

                        {execution.documentation_decision.document_decisions?.length > 0 && (
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-300 block mb-2">Evaluated Target Documents:</span>
                            <div className="space-y-2">
                              {execution.documentation_decision.document_decisions.map((d, i) => (
                                <div
                                  key={i}
                                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900/90 border border-stone-200/90 dark:border-slate-800 flex items-start justify-between gap-3 text-xs shadow-2xs"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 font-mono font-medium text-slate-900 dark:text-slate-200">
                                      <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                      <span>{d.doc_path}</span>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 text-[11px] font-sans">{d.reason}</p>
                                  </div>
                                  <Badge variant={d.is_affected ? 'rose' : 'slate'} className="shrink-0">
                                    {d.is_affected ? 'AFFECTED' : 'NO CHANGE'}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No decision data available for this execution stage.</p>
                    )}
                  </div>

                  {/* Agent 3 Generated Docs */}
                  <div className="p-5 rounded-2xl bg-[#F7F5F0] dark:bg-slate-900/60 border border-stone-200/90 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-200/90 dark:border-slate-800">
                      <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-sans">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Agent 3 — Documentation Generator Agent</span>
                      </div>
                      <Badge variant="emerald">Generation Complete</Badge>
                    </div>

                    {execution.updated_documents && execution.updated_documents.length > 0 ? (
                      <div className="space-y-3 text-xs">
                        {execution.updated_documents.map((doc, i) => (
                          <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-stone-200/90 dark:border-slate-800 space-y-2 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-slate-900 dark:text-slate-200 text-xs">{doc.doc_path}</span>
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
                            <p className="text-slate-600 dark:text-slate-300 font-sans">{doc.summary_of_changes}</p>
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
                        className="p-4 rounded-2xl bg-[#F7F5F0] dark:bg-slate-900/60 border border-stone-200/90 dark:border-slate-800 text-xs font-mono space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between font-sans">
                          <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">{file.filename}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{file.additions}</span>
                            <span className="text-rose-600 dark:text-rose-400 font-bold">-{file.deletions}</span>
                            <Badge variant="slate">{file.status?.toUpperCase() || 'MODIFIED'}</Badge>
                          </div>
                        </div>
                        {file.patch && (
                          <pre className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-stone-200/90 dark:border-slate-800 text-[11px] text-slate-800 dark:text-slate-300 overflow-x-auto leading-relaxed font-mono">
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
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs italic bg-[#F7F5F0] dark:bg-slate-900/40 rounded-2xl border border-stone-200/90 dark:border-slate-800">
                      No documentation diff was produced for this execution run.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: ENGINE TELEMETRY & LOGS */}
              {activeTab === 'telemetry' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-sans">
                        <Activity className="w-4 h-4 text-indigo-600 dark:text-brand-400" />
                        <span>Real-Time Engine Telemetry & Agent Model Logs</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
                        Deterministic error classifier, model cascade failover, and latency telemetry
                      </p>
                    </div>
                    <Badge variant="indigo">
                      {execution.telemetry_logs?.length || 0} Events Logged
                    </Badge>
                  </div>

                  {execution.telemetry_logs && execution.telemetry_logs.length > 0 ? (
                    <div className="rounded-2xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-950/80 p-4 font-mono text-xs space-y-3 overflow-x-auto shadow-2xs">
                      {execution.telemetry_logs.map((log, index) => {
                        const isError = log.level === 'ERROR' || log.status === 'FAILED';
                        const isWarn = log.level === 'WARN' || log.status === 'FAILOVER' || log.status === 'RETRY';
                        const isSuccess = log.status === 'SUCCESS';

                        return (
                          <div
                            key={index}
                            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 transition-all ${
                              isError
                                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/40 text-rose-900 dark:text-rose-200'
                                : isWarn
                                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/40 text-amber-900 dark:text-amber-200'
                                : isSuccess
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30 text-slate-800 dark:text-slate-200'
                                : 'bg-[#F7F5F0] dark:bg-slate-900/60 border-stone-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-300'
                            }`}
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    isError
                                      ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                                      : isWarn
                                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                      : isSuccess
                                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                      : 'bg-stone-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-stone-300 dark:border-slate-700'
                                  }`}
                                >
                                  {log.stage}
                                </span>

                                {log.model && (
                                  <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-brand-500/10 text-indigo-700 dark:text-brand-300 border border-indigo-200 dark:border-brand-500/20 text-[10px]">
                                    {log.model}
                                  </span>
                                )}

                                {log.latency_ms !== undefined && (
                                  <span className="text-[10px] text-slate-600 dark:text-slate-400 bg-stone-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-stone-200 dark:border-slate-700/50">
                                    ⏱️ {log.latency_ms}ms
                                  </span>
                                )}

                                {log.status && (
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                      isSuccess
                                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
                                        : isWarn
                                        ? 'text-amber-700 dark:text-amber-400 bg-amber-500/10'
                                        : 'text-rose-700 dark:text-rose-400 bg-rose-500/10'
                                    }`}
                                  >
                                    {log.status}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs font-sans text-slate-800 dark:text-slate-200 leading-relaxed pl-0.5">
                                {log.message}
                              </p>
                            </div>

                            <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap self-start font-mono">
                              {log.timestamp ? log.timestamp.split('T')[1]?.replace('Z', '') : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs italic bg-[#F7F5F0] dark:bg-slate-900/40 rounded-2xl border border-stone-200/90 dark:border-slate-800 space-y-2">
                      <Activity className="w-6 h-6 text-slate-400 dark:text-slate-600 mx-auto" />
                      <p>No telemetry events recorded for this historical execution run.</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-600">
                        New synchronizations will stream live model selection, failovers, and latency data here.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 70% Left Footer: Commit SHA, Sync SHA, View PR, Close */}
            <div className="p-4 sm:p-5 border-t border-stone-200/90 dark:border-slate-800 bg-[#F7F5F0] dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2 flex-wrap">
                <span>Commit: <code className="text-slate-900 dark:text-slate-200 font-bold">{formatShortSha(execution.commit_sha)}</code></span>
                {execution.final_commit_sha && (
                  <>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sync SHA: <code className="text-indigo-600 dark:text-brand-400 font-bold">{formatShortSha(execution.final_commit_sha)}</code></span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                {execution.pull_request_url && (
                  <a
                    href={execution.pull_request_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
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

          {/* ========================================================================= */}
          {/* RIGHT 30% COLUMN: Top-to-Down Multi-Agent Pipeline Progression */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 flex flex-col h-full min-h-0 bg-[#F7F5F0] dark:bg-slate-950/80 p-5 sm:p-6 overflow-y-auto border-t lg:border-t-0 border-stone-200/90 dark:border-slate-800 justify-between space-y-6">
            
            <div className="space-y-5">
              {/* Right Column Header: Title, Live Status & Close X */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-200/90 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-sans">
                  <Activity className="w-4 h-4 text-indigo-600 dark:text-brand-400 animate-pulse" />
                  <span>Pipeline Progression</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-stone-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Duration & Execution Mode Tag */}
              <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900/80 border border-stone-200/90 dark:border-slate-800 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans">Total Duration</span>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-brand-300">
                  {formatDuration(execution.start_time, execution.completion_time)}
                </span>
              </div>

              {/* Vertical Stepper Visualizer */}
              <div className="pt-1">
                <AgentPipelineVisualizer
                  orientation="vertical"
                  status={execution.status}
                  errorStage={execution.error_information?.stage}
                  hasAnalysis={!!execution.analysis_result}
                  hasDecision={!!execution.documentation_decision}
                  hasDocs={Boolean(execution.updated_documents && execution.updated_documents.length > 0)}
                  analysisSummary={execution.analysis_result?.summary}
                  decisionRationale={execution.documentation_decision?.decision_rationale}
                  updatedDocsCount={execution.updated_documents?.length}
                />
              </div>
            </div>

            {/* Bottom Engine Specs Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-stone-200/90 dark:border-slate-800 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Engine Telemetry</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-brand-500/10 text-emerald-700 dark:text-brand-400 border border-emerald-200 dark:border-brand-500/20 font-bold">
                  Autonomous
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-sans">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Default Model:</span>
                  <span className="font-mono text-slate-900 dark:text-slate-200">gemini-3.5-flash-lite</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Engine Mode:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Zero-Token Bot Bypass</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Docs Synchronized:</span>
                  <span className="font-mono text-slate-900 dark:text-slate-200">{execution.updated_documents?.length || 0} files</span>
                </div>
              </div>
            </div>

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
