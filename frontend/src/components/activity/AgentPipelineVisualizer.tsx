import React from 'react';
import { ExecutionStatus } from '../../types/execution';
import { CheckCircle2, Clock, AlertCircle, Sparkles, Brain, FileCode, Check } from 'lucide-react';

interface AgentPipelineVisualizerProps {
  status: ExecutionStatus;
}

export const AgentPipelineVisualizer: React.FC<AgentPipelineVisualizerProps> = ({
  status,
}) => {
  const steps = [
    {
      id: 'ANALYZING',
      name: 'Agent 1: Analysis',
      desc: 'Semantic Code Extraction',
      icon: <Brain className="w-4 h-4" />,
    },
    {
      id: 'PLANNING',
      name: 'Agent 2: Decision',
      desc: 'Doc Impact Evaluation',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'GENERATING',
      name: 'Agent 3: Generator',
      desc: 'Minimal Diff Assembly',
      icon: <FileCode className="w-4 h-4" />,
    },
    {
      id: 'COMMITTING',
      name: 'Sync Backend',
      desc: 'GitHub Commit / PR',
      icon: <Check className="w-4 h-4" />,
    },
  ];

  const getStepState = (stepIndex: number) => {
    if (status === 'FAILED') {
      return 'failed';
    }
    if (status === 'COMPLETED') {
      return 'completed';
    }
    if (status === 'SKIPPED') {
      return stepIndex <= 1 ? 'completed' : 'skipped';
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

  return (
    <div className="p-4 bg-slate-900/60 border border-dark-border rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Autonomous Pipeline Execution
        </h4>
        <span className="text-xs text-slate-500 font-mono">3 Independent AI Agents</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
        {steps.map((step, idx) => {
          const state = getStepState(idx);

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                state === 'completed'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : state === 'active'
                  ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 ring-1 ring-indigo-500/30 animate-pulse'
                  : state === 'skipped'
                  ? 'bg-slate-800/40 border-slate-700/40 text-slate-500'
                  : state === 'failed'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-dark-card border-dark-border text-slate-400'
              }`}
            >
              <div className="p-2 rounded-md bg-slate-950/60 shrink-0">
                {state === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : state === 'failed' ? (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                ) : state === 'active' ? (
                  <div className="w-4 h-4 text-indigo-400 animate-spin">
                    <Clock className="w-4 h-4" />
                  </div>
                ) : (
                  step.icon
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate text-slate-200">{step.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
