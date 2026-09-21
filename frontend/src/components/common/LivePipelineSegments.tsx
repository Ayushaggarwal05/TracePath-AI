import React from 'react';
import { ExecutionStatus } from '../../types/execution';

interface LivePipelineSegmentsProps {
  status: ExecutionStatus;
  errorStage?: string;
  className?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

type StepState = 'pending' | 'active' | 'completed' | 'failed' | 'skipped';

export const LivePipelineSegments: React.FC<LivePipelineSegmentsProps> = ({
  status,
  errorStage = '',
  className = '',
  showLabels = false,
  size = 'md',
}) => {
  const getStepStates = (): [StepState, StepState, StepState, StepState, StepState] => {
    if (status === 'FAILED') {
      const stage = errorStage.toLowerCase();
      if (stage.includes('context') || stage.includes('ingest')) {
        return ['failed', 'pending', 'pending', 'pending', 'pending'];
      }
      if (stage.includes('agent1') || stage.includes('analysis')) {
        return ['completed', 'failed', 'pending', 'pending', 'pending'];
      }
      if (stage.includes('agent2') || stage.includes('decision') || stage.includes('impact')) {
        return ['completed', 'completed', 'failed', 'pending', 'pending'];
      }
      if (stage.includes('agent3') || stage.includes('docgen') || stage.includes('generator')) {
        return ['completed', 'completed', 'completed', 'failed', 'pending'];
      }
      return ['completed', 'completed', 'completed', 'completed', 'failed'];
    }

    if (status === 'SKIPPED') {
      // Agent 2 determined NO_UPDATE_REQUIRED -> Agent 3 & Commit are skipped
      return ['completed', 'completed', 'completed', 'skipped', 'skipped'];
    }

    if (status === 'COMPLETED') {
      return ['completed', 'completed', 'completed', 'completed', 'completed'];
    }

    if (status === 'COMMITTING') {
      return ['completed', 'completed', 'completed', 'completed', 'active'];
    }

    if (status === 'GENERATING') {
      return ['completed', 'completed', 'completed', 'active', 'pending'];
    }

    if (status === 'PLANNING') {
      return ['completed', 'completed', 'active', 'pending', 'pending'];
    }

    if (status === 'ANALYZING') {
      return ['completed', 'active', 'pending', 'pending', 'pending'];
    }

    // PENDING / INGESTION
    return ['active', 'pending', 'pending', 'pending', 'pending'];
  };

  const states = getStepStates();

  const stepLabels = [
    { label: 'Ingest', full: '1. Ingestion' },
    { label: 'Agent 1', full: '2. Analysis' },
    { label: 'Agent 2', full: '3. Decision' },
    { label: 'Agent 3', full: '4. Generator' },
    { label: 'Commit', full: '5. Direct Commit' },
  ];

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3.5' : 'h-2.5';
  const textClass = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-xs' : 'text-[10px]';

  const getSegmentStyle = (st: StepState) => {
    switch (st) {
      case 'completed':
        return 'bg-emerald-500 border-emerald-400/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
      case 'active':
        return 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)] animate-pulse';
      case 'failed':
        return 'bg-rose-500 border-rose-400/80 shadow-[0_0_8px_rgba(244,63,94,0.35)]';
      case 'skipped':
        return 'bg-slate-700/60 border-slate-600/40 opacity-50';
      case 'pending':
      default:
        return 'bg-slate-800/80 border-slate-700/60 opacity-60';
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* 5-segment rectangular bar */}
      <div className="grid grid-cols-5 gap-1.5 w-full">
        {states.map((st, idx) => {
          const segStyle = getSegmentStyle(st);
          return (
            <div
              key={idx}
              className={`relative rounded-md border transition-all duration-300 ${heightClass} ${segStyle} flex items-center justify-center overflow-hidden`}
              title={`${stepLabels[idx].full}: ${st.toUpperCase()}`}
            >
              {st === 'active' && (
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_1.5s_infinite] -skew-x-12" />
              )}
            </div>
          );
        })}
      </div>

      {/* Optional labels below segments */}
      {showLabels && (
        <div className="grid grid-cols-5 gap-1.5 text-center font-mono select-none">
          {states.map((st, idx) => (
            <div
              key={idx}
              className={`${textClass} font-semibold truncate transition-colors ${
                st === 'completed'
                  ? 'text-emerald-400'
                  : st === 'active'
                  ? 'text-amber-300 font-bold animate-pulse'
                  : st === 'failed'
                  ? 'text-rose-400'
                  : st === 'skipped'
                  ? 'text-slate-500'
                  : 'text-slate-600'
              }`}
            >
              {stepLabels[idx].label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
