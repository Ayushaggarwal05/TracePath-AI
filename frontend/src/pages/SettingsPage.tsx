import React, { useState } from 'react';
import { AgentConfigCard } from '../components/settings/AgentConfigCard';
import { WebhookSettings } from '../components/settings/WebhookSettings';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Cpu,
  ShieldCheck,
  GitBranch,
  FileCode,
  Lock,
  Sliders,
  GitPullRequest,
  Check,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ai' | 'github' | 'docs' | 'automation'>('ai');
  const [savedToast, setSavedToast] = useState(false);

  // Form states
  const [defaultTargetBranch, setDefaultTargetBranch] = useState('main');
  const [syncMode, setSyncMode] = useState<'commit' | 'pr'>('pr');
  const [commitMessageTemplate, setCommitMessageTemplate] = useState(
    'docs(tracepath): auto-synchronize documentation for commit {commit_sha}'
  );
  const [trackedPatterns, setTrackedPatterns] = useState(
    'ARCHITECTURE.md\nPRD.md\nREADME.md\ndocs/**/*.md\nadr/*.md'
  );
  const [excludedPatterns, setExcludedPatterns] = useState(
    '*.test.ts\n*.spec.py\nnode_modules/**\n.venv/**\n*.lock\nbuild/**'
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System & AI Configuration</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            Manage 3 independent AI model configurations, webhook secrets, and documentation rules
          </p>
        </div>

        {savedToast && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-x-auto">
        {[
          { id: 'ai', label: 'AI Agent Engine', icon: <Cpu className="w-3.5 h-3.5" /> },
          { id: 'github', label: 'GitHub & Webhooks', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          { id: 'docs', label: 'Documentation Rules', icon: <FileCode className="w-3.5 h-3.5" /> },
          { id: 'automation', label: 'Automation & Branches', icon: <Sliders className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: AI AGENTS */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Independent 3-Agent Multi-Model Topology
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Keys strictly masked & encrypted</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AgentConfigCard
              agentNumber={1}
              name="Agent 1: Analysis Agent"
              role="Semantic Code Diff & Intent Extraction"
              defaultModel="gpt-4o-mini"
              temperature={0.1}
              envKeyName="AGENT_1_API_KEY"
              envModelName="AGENT_1_MODEL"
              isConfigured={true}
            />
            <AgentConfigCard
              agentNumber={2}
              name="Agent 2: Decision Agent"
              role="Documentation Impact Evaluation"
              defaultModel="gpt-4o"
              temperature={0.1}
              envKeyName="AGENT_2_API_KEY"
              envModelName="AGENT_2_MODEL"
              isConfigured={true}
            />
            <AgentConfigCard
              agentNumber={3}
              name="Agent 3: Doc Generator"
              role="Minimal Markdown Updates & Unified Diff"
              defaultModel="gpt-4o"
              temperature={0.2}
              envKeyName="AGENT_3_API_KEY"
              envModelName="AGENT_3_MODEL"
              isConfigured={true}
            />
          </div>

          {/* Masked Secret Storage Warning */}
          <Card className="p-4 bg-[#F7F5F0] border border-stone-200 flex items-start gap-3 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-slate-900">Security Architecture Standard</span>
              <p className="text-slate-600 leading-relaxed">
                Raw LLM API keys and GitHub App private credentials are never exposed to the client interface. All model invocations occur on isolated backend workers using environment secrets.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: GITHUB & WEBHOOKS */}
      {activeTab === 'github' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4 bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-slate-900" />
                <h3 className="text-base font-bold text-slate-900">GitHub Connection Status</h3>
              </div>
              <Badge variant="emerald">Authorized App Connected</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#F7F5F0] border border-stone-200">
                <span className="text-slate-500 text-[11px] block">Connected Account</span>
                <span className="text-slate-900 font-bold mt-0.5 block">Ayushaggarwal05</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F5F0] border border-stone-200">
                <span className="text-slate-500 text-[11px] block">OAuth Scope</span>
                <span className="text-slate-900 font-bold mt-0.5 block">repo, read:org, write:discussion</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F5F0] border border-stone-200">
                <span className="text-slate-500 text-[11px] block">Webhook Health</span>
                <span className="text-emerald-700 font-bold mt-0.5 block">Active (200 OK)</span>
              </div>
            </div>
          </Card>

          <WebhookSettings />
        </div>
      )}

      {/* TAB 3: DOCUMENTATION RULES */}
      {activeTab === 'docs' && (
        <form onSubmit={handleSave} className="space-y-6">
          <Card className="p-6 space-y-4 bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-slate-900" />
              <h3 className="text-base font-bold text-slate-900">Documentation Discovery Patterns</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Define the files and directories that TracePath AI should monitor and automatically update when relevant code changes are pushed.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Tracked Documentation Paths (Glob patterns)
                </label>
                <textarea
                  rows={6}
                  value={trackedPatterns}
                  onChange={(e) => setTrackedPatterns(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-900 leading-relaxed shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Ignored / Excluded Code Files
                </label>
                <textarea
                  rows={6}
                  value={excludedPatterns}
                  onChange={(e) => setExcludedPatterns(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-900 leading-relaxed shadow-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="sm">
                Save Documentation Rules
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* TAB 4: AUTOMATION & BRANCHES */}
      {activeTab === 'automation' && (
        <form onSubmit={handleSave} className="space-y-6">
          <Card className="p-6 space-y-5 bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-slate-900" />
              <h3 className="text-base font-bold text-slate-900">Global Automation & Branch Strategy</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Default Target Branch
                </label>
                <input
                  type="text"
                  value={defaultTargetBranch}
                  onChange={(e) => setDefaultTargetBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-900 shadow-xs"
                  placeholder="main"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Documentation Sync Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSyncMode('pr')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      syncMode === 'pr'
                        ? 'border-emerald-600 bg-emerald-50 text-slate-900 ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
                      <GitPullRequest className="w-4 h-4 text-emerald-600" />
                      <span>Pull Request</span>
                    </div>
                    <span className="text-[11px] text-slate-500">Creates automated documentation PR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSyncMode('commit')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      syncMode === 'commit'
                        ? 'border-emerald-600 bg-emerald-50 text-slate-900 ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
                      <GitBranch className="w-4 h-4 text-emerald-600" />
                      <span>Direct Commit</span>
                    </div>
                    <span className="text-[11px] text-slate-500">Pushes doc changes directly to target branch</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Commit Message Template
              </label>
              <input
                type="text"
                value={commitMessageTemplate}
                onChange={(e) => setCommitMessageTemplate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-900 shadow-xs"
              />
              <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                Placeholders available: <code>{'{commit_sha}'}</code>, <code>{'{branch}'}</code>, <code>{'{docs_list}'}</code>
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="sm">
                Save Automation Settings
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* Environment & Backend Version */}
      <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-xs">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Backend API Engine</h4>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            FastAPI + Async SQLAlchemy 2.0 + 3-Agent Autonomous Pipeline
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="emerald">API v0.2.0 Online</Badge>
          <Badge variant="slate">PostgreSQL Async Engine</Badge>
        </div>
      </Card>
    </div>
  );
};
