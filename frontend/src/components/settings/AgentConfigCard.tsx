import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Brain, Cpu, FileCode, CheckCircle2 } from 'lucide-react';

interface AgentConfigCardProps {
  agentNumber: 1 | 2 | 3;
  stepTitle: string;
  name: string;
  whatItDoes: string;
  whyItMatters: string;
  defaultModel: string;
  temperature: number;
  envKeyName: string;
  envModelName: string;
  isConfigured?: boolean;
}

export const AgentConfigCard: React.FC<AgentConfigCardProps> = ({
  agentNumber,
  stepTitle,
  name,
  whatItDoes,
  whyItMatters,
  defaultModel,
  temperature,
  envKeyName,
  envModelName,
  isConfigured = true,
}) => {
  const icons = {
    1: <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-indigo-500/30" />,
    2: <Cpu className="w-5 h-5 text-amber-600 dark:text-amber-400 fill-amber-500/35" />,
    3: <FileCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/30" />,
  };

  const containerClasses = {
    1: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200/80 dark:border-indigo-800/60 shadow-xs',
    2: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200/80 dark:border-amber-800/60 shadow-xs',
    3: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/80 dark:border-emerald-800/60 shadow-xs',
  };

  const stepBadges = {
    1: 'Step 1: Understand',
    2: 'Step 2: Decide',
    3: 'Step 3: Write',
  };

  return (
    <Card className="flex flex-col justify-between p-5 space-y-4">
      <div className="space-y-3.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border shrink-0 ${containerClasses[agentNumber]}`}>
              {icons[agentNumber]}
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-indigo-700 dark:text-brand-400">
                  {stepBadges[agentNumber]}
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#0F2742] dark:text-slate-100">{name}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{stepTitle}</p>
            </div>
          </div>
          <Badge variant={isConfigured ? 'emerald' : 'amber'}>
            {isConfigured ? 'Active' : 'Setup Required'}
          </Badge>
        </div>

        {/* Humanized Explanations */}
        <div className="p-3.5 rounded-xl bg-[#F7F5F0] dark:bg-slate-900/60 border border-stone-200/90 dark:border-slate-800 space-y-2 text-xs font-sans">
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
              What it does:
            </span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">{whatItDoes}</p>
          </div>
          <div className="pt-1.5 border-t border-stone-200/70 dark:border-slate-800/80">
            <span className="font-bold text-emerald-800 dark:text-emerald-400 block text-[11px] uppercase tracking-wider">
              Why it helps you:
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">{whyItMatters}</p>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="space-y-1.5 pt-2 text-[11px] font-mono">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Model Engine:</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">{defaultModel}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Creativity / Temp:</span>
            <span className="text-slate-800 dark:text-slate-200">{temperature} (Precise)</span>
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Key Variable:</span>
            <span className="text-indigo-700 dark:text-brand-300 font-bold">{envKeyName}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Model Variable:</span>
            <span className="text-slate-800 dark:text-slate-300 font-semibold">{envModelName}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-stone-200/90 dark:border-slate-800 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 font-sans">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Ready & monitoring commits</span>
      </div>
    </Card>
  );
};
