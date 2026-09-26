import React from 'react';
import { Card } from '../common/Card';
import { GitBranch, Play, FileText, Zap } from 'lucide-react';

interface MetricCardsProps {
  totalRepos: number;
  activeAutomations: number;
  totalExecutions: number;
  totalDocUpdates: number;
  successRate: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalRepos,
  activeAutomations,
  totalExecutions,
  totalDocUpdates,
  successRate,
}) => {
  const metrics = [
    {
      title: 'Connected Repositories',
      value: totalRepos,
      subtext: `${activeAutomations} actively syncing`,
      icon: <GitBranch className="w-5 h-5 text-indigo-400" />,
      glow: 'indigo' as const,
    },
    {
      title: 'Active Automations',
      value: activeAutomations,
      subtext: `${Math.round((activeAutomations / (totalRepos || 1)) * 100)}% coverage`,
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      glow: 'emerald' as const,
    },
    {
      title: 'Doc Sync Executions',
      value: totalExecutions,
      subtext: 'Autonomous multi-agent runs',
      icon: <Play className="w-5 h-5 text-brand-400" />,
      glow: 'emerald' as const,
    },
    {
      title: 'Doc Updates Generated',
      value: totalDocUpdates,
      subtext: `${successRate}% successful precision`,
      icon: <FileText className="w-5 h-5 text-amber-400" />,
      glow: 'none' as const,
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
            <div className="p-2 rounded-xl bg-[#EEF2F5] dark:bg-slate-800/80 border border-stone-200/60 dark:border-slate-700/60">
              {m.icon}
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#0F2742] dark:text-white font-mono tracking-tight">
            {m.value}
          </div>
          <p className={`text-xs mt-1 font-medium ${i === 0 || i === 1 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {m.subtext}
          </p>
        </Card>
      ))}
    </div>
  );
};
