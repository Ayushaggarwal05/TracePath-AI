import React from 'react';
import { ExecutionStatus } from '../../types/execution';
import { CheckCircle2, Clock, AlertCircle, Sparkles, Brain, FileCode, Check } from 'lucide-react';

interface AgentPipelineVisualizerProps {
  status: ExecutionStatus;
  errorStage?: string;
  hasAnalysis?: boolean;
  hasDecision?: boolean;
  hasDocs?: boolean;
  orientation?: 'horizontal' | 'vertical';
  analysisSummary?: string;
  decisionRationale?: string;
  updatedDocsCount?: number;
}

export const AgentPipelineVisualizer: React.FC<AgentPipelineVisualizerProps> = ({
  status,
  errorStage,
  hasAnalysis,
  hasDecision,
  hasDocs,
  orientation = 'horizontal',
  analysisSummary,
  decisionRationale,
  updatedDocsCount,
}) => {
  const steps = [
    {
      id: 'ANALYZING',
      name: 'Agent 1: Analysis',
      desc: 'Semantic Code Extraction',
      detail: analysisSummary ? 'Code semantics analyzed' : 'Extracts AST & purpose',
      icon: <Brain className="w-4 h-4" />,
    },
    {
      id: 'PLANNING',
      name: 'Agent 2: Decision',
      desc: 'Doc Impact Evaluation',
      detail: decisionRationale ? 'Impact evaluated' : 'Checks README, Arch & Specs',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'GENERATING',
      name: 'Agent 3: Generator',
      desc: 'Minimal Diff Assembly',
      detail: updatedDocsCount ? `${updatedDocsCount} docs generated` : 'Builds minimal unified diffs',
      icon: <FileCode className="w-4 h-4" />,
    },
    {
      id: 'COMMITTING',
      name: 'Sync Backend',
      desc: 'GitHub Commit / PR',
      detail: status === 'COMPLETED' ? 'Synced to GitHub' : 'Direct commit or PR write-back',
      icon: <Check className="w-4 h-4" />,
    },
  ];

  const getStepState = (stepIndex: number): 'completed' | 'active' | 'skipped' | 'failed' | 'pending' => {
    if (status === 'COMPLETED') {
      return 'completed';
    }

    if (status === 'SKIPPED') {
      return stepIndex <= 1 ? 'completed' : 'skipped';
    }

    if (status === 'FAILED') {
      const errLower = (errorStage || '').toLowerCase();
      let failedStepIdx = 0;
      if (errLower.includes('committing') || errLower.includes('github') || errLower.includes('sync')) {
        failedStepIdx = 3;
      } else if (errLower.includes('agent3') || errLower.includes('generator') || errLower.includes('doc')) {
        failedStepIdx = 2;
      } else if (errLower.includes('agent2') || errLower.includes('decision') || errLower.includes('impact') || errLower.includes('planner')) {
        failedStepIdx = 1;
      } else if (errLower.includes('agent1') || errLower.includes('analysis') || errLower.includes('change')) {
        failedStepIdx = 0;
      } else {
        if (hasDocs) failedStepIdx = 3;
        else if (hasDecision) failedStepIdx = 2;
        else if (hasAnalysis) failedStepIdx = 1;
        else failedStepIdx = 0;
      }

      if (stepIndex < failedStepIdx) return 'completed';
      if (stepIndex === failedStepIdx) return 'failed';
      return 'pending';
    }

    const statusOrder: ExecutionStatus[] = [
      'PENDING',
      'ANALYZING',
      'PLANNING',
      'GENERATING',
      'COMMITTING',
      'COMPLETED',
    ];
    const currentIndex = statusOrder.indexOf(status);

    if (currentIndex > stepIndex + 1) return 'completed';
    if (currentIndex === stepIndex + 1) return 'active';
    return 'pending';
  };

  if (orientation === 'vertical') {
    return (
      <div className="space-y-3 relative">
        {steps.map((step, idx) => {
          const state = getStepState(idx);
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.id} className="relative flex items-start gap-3">
              {/* Vertical connecting line */}
              {!isLast && (
                <div
                  className={`absolute left-[17px] top-[34px] bottom-[-14px] w-0.5 transition-colors ${
                    state === 'completed'
                      ? 'bg-emerald-500/40 dark:bg-emerald-500/40'
                      : state === 'active'
                      ? 'bg-indigo-500/40 dark:bg-indigo-500/40'
                      : 'bg-stone-300 dark:bg-slate-800'
                  }`}
                />
              )}

              {/* Status Circle Icon */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border z-10 transition-all ${
                  state === 'completed'
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : state === 'active'
                    ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-300 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-200 dark:ring-indigo-500/30 animate-pulse'
                    : state === 'skipped'
                    ? 'bg-stone-100 dark:bg-slate-900 border-stone-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                    : state === 'failed'
                    ? 'bg-rose-50 dark:bg-rose-500/15 border-rose-300 dark:border-rose-500/40 text-rose-600 dark:text-rose-400'
                    : 'bg-stone-100 dark:bg-slate-900/90 border-stone-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                }`}
              >
                {state === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : state === 'failed' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                ) : state === 'active' ? (
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-300 animate-spin" />
                ) : (
                  step.icon
                )}
              </div>

              {/* Step Info Card */}
              <div
                className={`flex-1 p-3 rounded-xl border transition-all ${
                  state === 'completed'
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-300'
                    : state === 'active'
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-500/40 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-300 dark:ring-indigo-500/20'
                    : state === 'skipped'
                    ? 'bg-stone-100/60 dark:bg-slate-900/40 border-stone-200 dark:border-slate-800/60 text-slate-600 dark:text-slate-400'
                    : state === 'failed'
                    ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/40 text-rose-900 dark:text-rose-300'
                    : 'bg-stone-50 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5 font-sans">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{step.name}</p>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
                      state === 'completed'
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400'
                        : state === 'active'
                        ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300'
                        : state === 'failed'
                        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-400'
                        : state === 'skipped'
                        ? 'bg-stone-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                        : 'bg-stone-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500'
                    }`}
                  >
                    {state}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium font-sans">{step.desc}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono truncate">{step.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="p-4 bg-[#F7F5F0] dark:bg-slate-900/60 border border-stone-200/90 dark:border-slate-800 rounded-2xl shadow-2xs">
      <div className="flex items-center justify-between mb-3 font-sans">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">
          Autonomous Pipeline Execution
        </h4>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">3 Independent AI Agents</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
        {steps.map((step, idx) => {
          const state = getStepState(idx);

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                state === 'completed'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 shadow-2xs'
                  : state === 'active'
                  ? 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/40 text-indigo-800 dark:text-indigo-300 ring-1 ring-indigo-300 dark:ring-indigo-500/30 animate-pulse shadow-2xs'
                  : state === 'skipped'
                  ? 'bg-stone-100 dark:bg-slate-800/40 border-stone-200 dark:border-slate-700/40 text-slate-600 dark:text-slate-400'
                  : state === 'failed'
                  ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-400 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border-stone-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-400 shadow-2xs'
              }`}
            >
              <div className="p-2 rounded-lg bg-white dark:bg-slate-950/60 border border-stone-200 dark:border-slate-800 shrink-0">
                {state === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : state === 'failed' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                ) : state === 'active' ? (
                  <div className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin">
                    <Clock className="w-4 h-4" />
                  </div>
                ) : (
                  step.icon
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate text-slate-900 dark:text-slate-200 font-sans">{step.name}</p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate font-sans">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
