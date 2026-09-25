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
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200/80',
      dot: 'bg-emerald-500 animate-pulse',
      label: 'Active',
    };
  }
  return {
    bg: 'bg-stone-100',
    text: 'text-slate-600',
    border: 'border-stone-200',
    dot: 'bg-slate-400',
    label: 'Inactive',
  };
}

export function getExecutionStatusStyle(status: ExecutionStatus): StatusStyleConfig {
  switch (status) {
    case 'COMPLETED':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200/80',
        dot: 'bg-emerald-500',
        label: 'Completed',
      };
    case 'SKIPPED':
      return {
        bg: 'bg-stone-100',
        text: 'text-slate-700',
        border: 'border-stone-200',
        dot: 'bg-slate-400',
        label: 'Skipped (No Doc Impact)',
      };
    case 'ANALYZING':
    case 'PLANNING':
    case 'GENERATING':
    case 'COMMITTING':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200/80',
        dot: 'bg-amber-500 animate-ping',
        label: status.charAt(0) + status.slice(1).toLowerCase(),
      };
    case 'FAILED':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-200/80',
        dot: 'bg-rose-500',
        label: 'Failed',
      };
    case 'PENDING':
    default:
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200/80',
        dot: 'bg-amber-500',
        label: 'Pending',
      };
  }
}
