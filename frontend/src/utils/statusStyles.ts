import { AutomationStatus } from '../types/repository';
import { ExecutionStatus } from '../types/execution';

export interface StatusStyleConfig {
  bg: string;
  text: string;
  border: string;
  dot: string;
  label: string;
}

export function getAutomationStatusStyle(status?: AutomationStatus): StatusStyleConfig {
  if (status === 'ACTIVE') {
    return {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-400 animate-pulse',
      label: 'Active',
    };
  }
  return {
    bg: 'bg-slate-800/60',
    text: 'text-slate-400',
    border: 'border-slate-700/50',
    dot: 'bg-slate-500',
    label: 'Inactive',
  };
}

export function getExecutionStatusStyle(status: ExecutionStatus): StatusStyleConfig {
  switch (status) {
    case 'COMPLETED':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400',
        label: 'Completed',
      };
    case 'SKIPPED':
      return {
        bg: 'bg-slate-700/30',
        text: 'text-slate-300',
        border: 'border-slate-600/40',
        dot: 'bg-slate-400',
        label: 'Skipped (No Doc Impact)',
      };
    case 'ANALYZING':
    case 'PLANNING':
    case 'GENERATING':
    case 'COMMITTING':
      return {
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-400',
        border: 'border-indigo-500/30',
        dot: 'bg-indigo-400 animate-ping',
        label: status.charAt(0) + status.slice(1).toLowerCase(),
      };
    case 'FAILED':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        dot: 'bg-rose-400',
        label: 'Failed',
      };
    case 'PENDING':
    default:
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-400',
        label: 'Pending',
      };
  }
}
