import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import {
  Brain,
  Sparkles,
  FileCode,
  ShieldCheck,
  Lock,
  FileText,
  Layers,
} from 'lucide-react';

interface AgentHealthAndCoverageCardProps {
  activeReposCount: number;
}

export const AgentHealthAndCoverageCard: React.FC<AgentHealthAndCoverageCardProps> = ({
  activeReposCount,
}) => {
  const savedUser = localStorage.getItem('tracepath_github_user') || 'Ayushaggarwal05';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Col 1 & 2: 3-Agent Multi-Agent Engine Status */}
      <Card className="p-0 overflow-hidden lg:col-span-2 bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800/90 shadow-xs">
        <div className="flex items-center justify-between p-5 border-b border-stone-100 dark:border-slate-800 bg-[#F7F5F0] dark:bg-[#131D2E]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Multi-Agent Engine Status</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                Autonomous 3-tier pipeline health & background validation
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SYSTEM ALL OPERATIONAL
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-100 dark:divide-slate-800/80 p-2 sm:p-0">
          {/* Agent 1 */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                <Brain className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Agent 1</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                Ready
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Code Understanding</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Extracts semantic AST diffs, models, endpoints, and architectural changes.
            </p>
          </div>

          {/* Agent 2 */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Agent 2</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                Active
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Drift & Decision</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Detects documentation drift; skips updates on bugfixes to avoid PR noise.
            </p>
          </div>

          {/* Agent 3 */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                <FileCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Agent 3</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                Verified
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Doc Generator</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Generates minimal markdown patches and formats verified unified git diffs.
            </p>
          </div>
        </div>
      </Card>

      {/* Col 3: Documentation Coverage & GitHub Identity */}
      <Card className="p-5 space-y-4 flex flex-col justify-between bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800/90 shadow-xs">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Protected Doc Targets</h3>
            </div>
            <Badge variant="emerald">{activeReposCount > 0 ? '100% Tracked' : '0% Active'}</Badge>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F5F0] dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700/80">
              <div className="flex items-center gap-2 font-mono text-slate-800 dark:text-slate-200 font-semibold">
                <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>README.md</span>
              </div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">Sync Enabled</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F5F0] dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700/80">
              <div className="flex items-center gap-2 font-mono text-slate-800 dark:text-slate-200 font-semibold">
                <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>ARCHITECTURE.md</span>
              </div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">Sync Enabled</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F5F0] dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700/80">
              <div className="flex items-center gap-2 font-mono text-slate-800 dark:text-slate-200 font-semibold">
                <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>docs/ directory</span>
              </div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">Sync Enabled</span>
            </div>
          </div>
        </div>

        {/* GitHub Security Badge */}
        <div className="p-3 rounded-xl bg-[#F7F5F0] dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700/80 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-800 dark:text-slate-200 font-bold truncate font-mono">@{savedUser}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
            <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            AES-256
          </span>
        </div>
      </Card>
    </div>
  );
};
