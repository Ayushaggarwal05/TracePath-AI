import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Brain, Sparkles, FileCode, CheckCircle2 } from 'lucide-react';

interface AgentConfigCardProps {
  agentNumber: 1 | 2 | 3;
  name: string;
  role: string;
  defaultModel: string;
  temperature: number;
  envKeyName: string;
  envModelName: string;
  isConfigured?: boolean;
}

export const AgentConfigCard: React.FC<AgentConfigCardProps> = ({
  agentNumber,
  name,
  role,
  defaultModel,
  temperature,
  envKeyName,
  envModelName,
  isConfigured = true,
}) => {
  const icons = {
    1: <Brain className="w-5 h-5 text-indigo-400" />,
    2: <Sparkles className="w-5 h-5 text-amber-400" />,
    3: <FileCode className="w-5 h-5 text-emerald-400" />,
  };

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/50">
              {icons[agentNumber]}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">{name}</h4>
              <p className="text-xs text-slate-400">{role}</p>
            </div>
          </div>
          <Badge variant={isConfigured ? 'emerald' : 'amber'}>
            {isConfigured ? 'Ready' : 'Pending API Key'}
          </Badge>
        </div>

        <div className="space-y-2 mt-4 pt-3 border-t border-dark-border/80 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <span>Model:</span>
            <span className="text-slate-200">{defaultModel}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Temperature:</span>
            <span className="text-slate-200">{temperature}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Key Var:</span>
            <span className="text-brand-400 font-semibold">{envKeyName}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Model Var:</span>
            <span className="text-slate-300">{envModelName}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-dark-border/60 flex items-center gap-1.5 text-[11px] text-emerald-400">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Independent API Configuration Active</span>
      </div>
    </Card>
  );
};
