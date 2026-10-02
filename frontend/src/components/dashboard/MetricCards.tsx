import React from 'react';
import { Card } from '../common/Card';
import { LoadingDots } from '../common/LoadingDots';
import { FolderGit2, Bot, FileText, Zap } from 'lucide-react';

interface MetricCardsProps {
  totalRepos: number;
  activeAutomations: number;
  totalExecutions: number;
  totalDocUpdates: number;
  successRate?: number;
  loading?: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalRepos,
  activeAutomations,
  totalExecutions,
  totalDocUpdates,
  loading = false,
}) => {
  const metrics = [
    {
      title: 'Connected Repositories',
      value: totalRepos,
      subtext: `${activeAutomations} actively syncing`,
      icon: <FolderGit2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-indigo-500/25" />,
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200/80 dark:border-indigo-800/60 shadow-xs',
    },
    {
      title: 'Active Automations',
      value: activeAutomations,
      subtext: `${Math.round((activeAutomations / (totalRepos || 1)) * 100)}% coverage`,
      icon: <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/40" />,
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/80 dark:border-emerald-800/60 shadow-xs',
    },
    {
      title: 'Doc Sync Executions',
      value: totalExecutions,
      subtext: 'Autonomous 3-agent pipeline',
      icon: <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-indigo-500/30" />,
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200/80 dark:border-indigo-800/60 shadow-xs',
    },
    {
      title: 'Doc Updates Generated',
      value: totalDocUpdates,
      subtext: '99% successful precision',
      icon: <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400 fill-amber-500/30" />,
      badgeBg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200/80 dark:border-amber-800/60 shadow-xs',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((m, i) => (
        <Card key={i} className="relative overflow-hidden bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {m.title}
            </span>
            <div className={`p-2 rounded-xl border ${m.badgeBg}`}>
              {m.icon}
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#0F2742] dark:text-white font-mono tracking-tight h-9 flex items-center">
            {loading ? <LoadingDots size="xs" color="slate" inline /> : m.value}
          </div>
          <p className={`text-xs mt-1 font-medium ${i === 0 || i === 1 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {loading ? 'Refreshing status...' : m.subtext}
          </p>
        </Card>
      ))}
    </div>
  );
};
