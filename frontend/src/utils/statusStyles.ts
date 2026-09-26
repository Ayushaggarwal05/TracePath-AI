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
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-800 dark:text-emerald-300',
      border: 'border-emerald-200/80 dark:border-emerald-500/30',
      dot: 'bg-emerald-500 animate-pulse',
      label: 'Active',
    };
  }
  return {
    bg: 'bg-stone-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-stone-200 dark:border-slate-700',
    dot: 'bg-slate-400 dark:bg-slate-500',
    label: 'Inactive',
  };
}

export function getExecutionStatusStyle(status: ExecutionStatus): StatusStyleConfig {
  switch (status) {
    case 'COMPLETED':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        text: 'text-emerald-800 dark:text-emerald-300',
        border: 'border-emerald-200/80 dark:border-emerald-500/30',
        dot: 'bg-emerald-500',
        label: 'Completed',
      };
    case 'SKIPPED':
      return {
        bg: 'bg-stone-100 dark:bg-slate-800',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-stone-200 dark:border-slate-700',
        dot: 'bg-slate-400 dark:bg-slate-500',
        label: 'Skipped (No Doc Impact)',
      };
    case 'ANALYZING':
    case 'PLANNING':
    case 'GENERATING':
    case 'COMMITTING':
      return {
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        text: 'text-amber-800 dark:text-amber-300',
        border: 'border-amber-200/80 dark:border-amber-500/30',
        dot: 'bg-amber-500 animate-ping',
        label: status.charAt(0) + status.slice(1).toLowerCase(),
      };
    case 'FAILED':
      return {
        bg: 'bg-rose-50 dark:bg-rose-500/10',
        text: 'text-rose-800 dark:text-rose-300',
        border: 'border-rose-200/80 dark:border-rose-500/30',
        dot: 'bg-rose-500',
        label: 'Failed',
      };
    case 'PENDING':
    default:
      return {
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        text: 'text-amber-800 dark:text-amber-300',
        border: 'border-amber-200/80 dark:border-amber-500/30',
        dot: 'bg-amber-500',
        label: 'Pending',
      };
  }
}
