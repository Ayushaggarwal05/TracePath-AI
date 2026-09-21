import React, { useState, useEffect } from 'react';
import { Execution, ExecutionStatus } from '../../types/execution';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { LivePipelineSegments } from '../common/LivePipelineSegments';
import { formatShortSha } from '../../utils/formatters';
import {
  GitCommit,
  Brain,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  ArrowRight,
} from 'lucide-react';

interface LiveSyncProgressStreamProps {
  execution: Execution | null;
  isLoading: boolean;
  repoFullName: string;
  onViewDetails?: (execution: Execution) => void;
  onDone?: () => void;
}

type StageStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

interface PipelineStep {
  id: string;
  stepNum: number;
  name: string;
  agentLabel: string;
  description: string;
  icon: React.ReactNode;
  status: StageStatus;
  detail?: string;
}

export const LiveSyncProgressStream: React.FC<LiveSyncProgressStreamProps> = ({
  execution,
  isLoading,
  repoFullName,
  onViewDetails,
  onDone,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [logs, setLogs] = useState<Array<{ time: string; text: string; type: 'info' | 'agent' | 'success' | 'error' }>>([]);

  const execStatus: ExecutionStatus = execution?.status || (isLoading ? 'PENDING' : 'PENDING');
  const isFinished = execution && ['COMPLETED', 'FAILED', 'SKIPPED'].includes(execution.status);

  // Timer for elapsed seconds during execution
  useEffect(() => {
    let timer: any = null;
    if (!isFinished) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isFinished]);

  // Derive stage status from backend execution state
  const getStageStatuses = (): {
    step1: StageStatus;
    step2: StageStatus;
    step3: StageStatus;
    step4: StageStatus;
    step5: StageStatus;
  } => {
    if (!execution) {
      return {
        step1: isLoading ? 'in_progress' : 'pending',
        step2: 'pending',
        step3: 'pending',
        step4: 'pending',
        step5: 'pending',
      };
    }

    if (execStatus === 'FAILED') {
      const stage = execution.error_information?.stage || '';
      if (stage.includes('Context') || stage.includes('Ingest')) {
        return { step1: 'failed', step2: 'pending', step3: 'pending', step4: 'pending', step5: 'pending' };
      }
      if (stage.includes('Agent1') || stage.includes('Analysis')) {
        return { step1: 'completed', step2: 'failed', step3: 'pending', step4: 'pending', step5: 'pending' };
      }
      if (stage.includes('Agent2') || stage.includes('Decision')) {
        return { step1: 'completed', step2: 'completed', step3: 'failed', step4: 'pending', step5: 'pending' };
      }
      if (stage.includes('Agent3') || stage.includes('DocGen')) {
        return { step1: 'completed', step2: 'completed', step3: 'completed', step4: 'failed', step5: 'pending' };
      }
      return { step1: 'completed', step2: 'completed', step3: 'completed', step4: 'completed', step5: 'failed' };
    }

    if (execStatus === 'SKIPPED') {
      return {
        step1: 'completed',
        step2: 'completed',
        step3: 'completed',
        step4: 'skipped',
        step5: 'skipped',
      };
    }

    if (execStatus === 'COMPLETED') {
      return {
        step1: 'completed',
        step2: 'completed',
        step3: 'completed',
        step4: 'completed',
        step5: 'completed',
      };
    }

    if (execStatus === 'COMMITTING') {
      return {
        step1: 'completed',
        step2: 'completed',
        step3: 'completed',
        step4: 'completed',
        step5: 'in_progress',
      };
    }

    if (execStatus === 'GENERATING') {
      return {
        step1: 'completed',
        step2: 'completed',
        step3: 'completed',
        step4: 'in_progress',
        step5: 'pending',
      };
    }

    if (execStatus === 'PLANNING') {
      return {
        step1: 'completed',
        step2: 'completed',
        step3: 'in_progress',
        step4: 'pending',
        step5: 'pending',
      };
    }

    if (execStatus === 'ANALYZING') {
      return {
        step1: 'completed',
        step2: 'in_progress',
        step3: 'pending',
        step4: 'pending',
        step5: 'pending',
      };
    }

    return {
      step1: 'in_progress',
      step2: 'pending',
      step3: 'pending',
      step4: 'pending',
      step5: 'pending',
    };
  };

  const stageStatuses = getStageStatuses();

  // Populate dynamic live logs based on stage transitions
  useEffect(() => {
    const newLogs: Array<{ time: string; text: string; type: 'info' | 'agent' | 'success' | 'error' }> = [];
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    newLogs.push({
      time: now,
      text: `Connecting to GitHub repository: ${repoFullName}...`,
      type: 'info',
    });

    if (execution) {
      if (execution.commit_sha) {
        newLogs.push({
          time: now,
          text: `Extracted commit ${formatShortSha(execution.commit_sha)} on branch ${execution.branch || 'main'}. Changed files: ${execution.changed_files?.length || 0}`,
          type: 'info',
        });
      }

      if (execution.analysis_result) {
        newLogs.push({
          time: now,
          text: `[Agent 1: Analysis] Completed semantic analysis: "${execution.analysis_result.summary}"`,
          type: 'agent',
        });
      }

      if (execution.documentation_decision) {
        const decision = execution.documentation_decision.overall_decision;
        newLogs.push({
          time: now,
          text: `[Agent 2: Decision] ${decision}: ${execution.documentation_decision.decision_rationale}`,
          type: 'agent',
        });
      }

      if (execution.updated_documents && execution.updated_documents.length > 0) {
        newLogs.push({
          time: now,
          text: `[Agent 3: Generator] Generated minimal markdown updates for ${execution.updated_documents.map((d) => d.doc_path).join(', ')}`,
          type: 'success',
        });
      }

      if (execution.status === 'COMPLETED') {
        newLogs.push({
          time: now,
          text: `[GitHub Commit] Successfully committed documentation changes to ${execution.branch || 'main'} branch!`,
          type: 'success',
        });
      } else if (execution.status === 'SKIPPED') {
        newLogs.push({
          time: now,
          text: `[Pipeline] Zero documentation changes required for this commit. Pipeline complete.`,
          type: 'info',
        });
      } else if (execution.status === 'FAILED') {
        newLogs.push({
          time: now,
          text: `[Error] Pipeline failed at ${execution.error_information?.stage}: ${execution.error_information?.error}`,
          type: 'error',
        });
      }
    }

    setLogs(newLogs);
  }, [execution?.status, execution?.analysis_result, execution?.documentation_decision, repoFullName]);

  const steps: PipelineStep[] = [
    {
      id: 'ingest',
      stepNum: 1,
      name: 'GitHub Commit Ingestion',
      agentLabel: 'GitHub API',
      description: 'Fetching commit details, author metadata, and raw file patches.',
      icon: <GitCommit className="w-4 h-4" />,
      status: stageStatuses.step1,
      detail: execution?.commit_sha ? `Commit ${formatShortSha(execution.commit_sha)} (${execution.changed_files?.length || 0} files)` : 'Ingesting diff...',
    },
    {
      id: 'agent1',
      stepNum: 2,
      name: 'Semantic Code Extraction',
      agentLabel: 'Agent 1 (Gemini Flash)',
      description: 'Analyzing structural changes, purpose, and affected components.',
      icon: <Brain className="w-4 h-4" />,
      status: stageStatuses.step2,
      detail: execution?.analysis_result?.summary,
    },
    {
      id: 'agent2',
      stepNum: 3,
      name: 'Documentation Impact Decision',
      agentLabel: 'Agent 2 (Gemini Flash)',
      description: 'Evaluating impact on README, Architecture, and API specifications.',
      icon: <Sparkles className="w-4 h-4" />,
      status: stageStatuses.step3,
      detail: execution?.documentation_decision?.decision_rationale,
    },
    {
      id: 'agent3',
      stepNum: 4,
      name: 'Minimal Markdown Assembly',
      agentLabel: 'Agent 3 (Gemini Flash)',
      description: 'Assembling targeted documentation deltas and unified diffs.',
      icon: <ShieldCheck className="w-4 h-4" />,
      status: stageStatuses.step4,
      detail: execution?.updated_documents?.length
        ? `Generated updates for ${execution.updated_documents.map((d) => d.doc_path).join(', ')}`
        : undefined,
    },
    {
      id: 'commit',
      stepNum: 5,
      name: 'GitHub Direct Commit',
      agentLabel: 'TracePath Bot',
      description: 'Directly pushing documentation commit to main branch.',
      icon: <CheckCircle2 className="w-4 h-4" />,
      status: stageStatuses.step5,
      detail: execution?.final_commit_sha ? `Committed: ${formatShortSha(execution.final_commit_sha)}` : undefined,
    },
  ];

  const getStepStyle = (status: StageStatus) => {
    switch (status) {
      case 'completed':
        return {
          badge: 'emerald',
          circle: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10 shadow-lg',
          line: 'bg-emerald-500',
          container: 'border-emerald-500/30 bg-emerald-950/10',
          label: 'Completed',
        };
      case 'in_progress':
        return {
          badge: 'amber',
          circle: 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse shadow-amber-500/20 shadow-lg',
          line: 'bg-gradient-to-r from-emerald-500 via-amber-500 to-slate-800 animate-pulse',
          container: 'border-amber-500/40 bg-amber-950/10 ring-1 ring-amber-500/20',
          label: 'In Progress...',
        };
      case 'failed':
        return {
          badge: 'rose',
          circle: 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-rose-500/10 shadow-lg',
          line: 'bg-rose-500',
          container: 'border-rose-500/40 bg-rose-950/20',
          label: 'Failed',
        };
      case 'skipped':
        return {
          badge: 'slate',
          circle: 'bg-slate-800 text-slate-400 border-slate-700',
          line: 'bg-slate-800',
          container: 'border-dark-border bg-slate-900/40',
          label: 'Skipped',
        };
      case 'pending':
      default:
        return {
          badge: 'slate',
          circle: 'bg-slate-900/80 text-slate-500 border-slate-800',
          line: 'bg-slate-800',
          container: 'border-dark-border/60 bg-slate-900/20 opacity-70',
          label: 'Waiting',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Summary Card */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-dark-border space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Target Repository:</span>
              <span className="text-xs font-bold text-slate-100">{repoFullName}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              {execution?.commit_sha && (
                <span className="flex items-center gap-1">
                  <GitCommit className="w-3.5 h-3.5 text-brand-400" />
                  {formatShortSha(execution.commit_sha)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Elapsed: {elapsedSeconds}s
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={
                execStatus === 'COMPLETED'
                  ? 'emerald'
                  : execStatus === 'FAILED'
                  ? 'rose'
                  : execStatus === 'SKIPPED'
                  ? 'slate'
                  : 'amber'
              }
            >
              {execStatus === 'COMPLETED'
                ? 'SYNCHRONIZED'
                : execStatus === 'FAILED'
                ? 'FAILED'
                : execStatus === 'SKIPPED'
                ? 'NO UPDATE NEEDED'
                : 'AI ENGINE RUNNING'}
            </Badge>
          </div>
        </div>

        {/* 5-Segment Progress Bar */}
        <div className="pt-2 border-t border-dark-border/80">
          <LivePipelineSegments
            status={execStatus}
            errorStage={execution?.error_information?.stage}
            showLabels={true}
            size="md"
          />
        </div>
      </div>

      {/* 5-Step Animated Progression Journey */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span>Live Multi-Agent Pipeline Progression</span>
          <span className="text-[11px] font-mono text-slate-500 font-normal">Step-by-Step AI Execution</span>
        </h4>

        <div className="space-y-2.5">
          {steps.map((step) => {
            const style = getStepStyle(step.status);
            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-xl border transition-all duration-300 flex items-start gap-3.5 ${style.container}`}
              >
                {/* Step number circle with icon */}
                <div
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 text-xs font-bold transition-all ${style.circle}`}
                >
                  {step.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : step.status === 'failed' ? (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  ) : (
                    step.icon
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-100">{step.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60">
                        {step.agentLabel}
                      </span>
                    </div>
                    <Badge variant={style.badge as any}>
                      {style.label}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">{step.description}</p>

                  {step.detail && (
                    <div className="pt-1 text-[11px] font-mono text-brand-300 bg-dark-bg/60 p-2 rounded-lg border border-dark-border/80">
                      {step.detail}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Terminal Console Logs */}
      <div className="rounded-xl border border-dark-border bg-black/70 overflow-hidden font-mono text-xs">
        <div className="p-2.5 bg-slate-900 border-b border-dark-border flex items-center justify-between text-slate-400 text-[11px]">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-300">Live Agent Stream Output</span>
          </div>
          <span className="text-[10px] text-slate-500">Autonomous Trace Logs</span>
        </div>

        <div className="p-3.5 space-y-1.5 max-h-44 overflow-y-auto">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-[11px] leading-relaxed">
              <span className="text-slate-500 shrink-0 select-none">[{log.time}]</span>
              <span
                className={
                  log.type === 'error'
                    ? 'text-rose-400 font-semibold'
                    : log.type === 'success'
                    ? 'text-emerald-400 font-semibold'
                    : log.type === 'agent'
                    ? 'text-brand-300'
                    : 'text-slate-300'
                }
              >
                {log.text}
              </span>
            </div>
          ))}
          {!isFinished && (
            <div className="flex items-center gap-2 text-[11px] text-amber-300 animate-pulse pt-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Processing stage with Gemini AI engine...</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons when Finished */}
      {isFinished && (
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-dark-border">
          {execution && onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(execution)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View Deep Trace & Unified Diff
            </Button>
          )}
          {onDone && (
            <Button variant="primary" size="sm" onClick={onDone}>
              Done
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
