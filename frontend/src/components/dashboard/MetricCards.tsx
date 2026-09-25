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
        <Card key={i} glow={m.glow} className="relative overflow-hidden bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {m.title}
            </span>
            <div className="p-2.5 rounded-xl bg-[#F7F5F0] border border-stone-200/80">
              {m.icon}
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
            {m.value}
          </div>
          <p className="text-xs text-slate-500 mt-1">{m.subtext}</p>
        </Card>
      ))}
    </div>
  );
};
