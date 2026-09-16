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
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">System & AI Configuration</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Manage 3 independent AI model configurations, webhook secrets, and documentation rules
          </p>
        </div>

        {savedToast && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-dark-border bg-dark-card px-2 rounded-t-xl">
        {[
          { id: 'ai', label: 'AI Agent Engine', icon: <Cpu className="w-3.5 h-3.5" /> },
          { id: 'github', label: 'GitHub & Webhooks', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          { id: 'docs', label: 'Documentation Rules', icon: <FileCode className="w-3.5 h-3.5" /> },
          { id: 'automation', label: 'Automation & Branches', icon: <Sliders className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-brand-400 text-brand-400 bg-brand-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
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
              <Cpu className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Independent 3-Agent Multi-Model Topology
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
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
          <Card className="p-4 bg-slate-900/40 border-dark-border flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-semibold text-slate-200">Security Architecture Standard</span>
              <p className="text-slate-400 leading-relaxed">
                Raw LLM API keys and GitHub App private credentials are never exposed to the client interface. All model invocations occur on isolated backend workers using environment secrets.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: GITHUB & WEBHOOKS */}
      {activeTab === 'github' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-brand-400" />
                <h3 className="text-base font-semibold text-slate-100">GitHub Connection Status</h3>
              </div>
              <Badge variant="emerald">Authorized App Connected</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-dark-border">
                <span className="text-slate-500 text-[11px] block">Connected Account</span>
                <span className="text-slate-200 font-semibold mt-0.5 block">Ayushaggarwal05</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-dark-border">
                <span className="text-slate-500 text-[11px] block">OAuth Scope</span>
                <span className="text-brand-400 font-semibold mt-0.5 block">repo, read:org, write:discussion</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-dark-border">
                <span className="text-slate-500 text-[11px] block">Webhook Health</span>
                <span className="text-emerald-400 font-semibold mt-0.5 block">Active (200 OK)</span>
              </div>
            </div>
          </Card>

          <WebhookSettings />
        </div>
      )}

      {/* TAB 3: DOCUMENTATION RULES */}
      {activeTab === 'docs' && (
        <form onSubmit={handleSave} className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-brand-400" />
              <h3 className="text-base font-semibold text-slate-100">Documentation Discovery Patterns</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Define the files and directories that TracePath AI should monitor and automatically update when relevant code changes are pushed.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tracked Documentation Paths (Glob patterns)
                </label>
                <textarea
                  rows={6}
                  value={trackedPatterns}
                  onChange={(e) => setTrackedPatterns(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-dark-border rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500/60 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Ignored / Excluded Code Files
                </label>
                <textarea
                  rows={6}
                  value={excludedPatterns}
                  onChange={(e) => setExcludedPatterns(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-dark-border rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500/60 leading-relaxed"
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
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-brand-400" />
              <h3 className="text-base font-semibold text-slate-100">Global Automation & Branch Strategy</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Default Target Branch
                </label>
                <input
                  type="text"
                  value={defaultTargetBranch}
                  onChange={(e) => setDefaultTargetBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-dark-border rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500/60"
                  placeholder="main"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Documentation Sync Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSyncMode('pr')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      syncMode === 'pr'
                        ? 'border-brand-500/60 bg-brand-500/10 text-slate-100'
                        : 'border-dark-border bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-brand-400 mb-1">
                      <GitPullRequest className="w-4 h-4" />
                      <span>Pull Request</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Creates automated documentation PR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSyncMode('commit')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      syncMode === 'commit'
                        ? 'border-brand-500/60 bg-brand-500/10 text-slate-100'
                        : 'border-dark-border bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-1">
                      <GitBranch className="w-4 h-4" />
                      <span>Direct Commit</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Pushes doc changes directly to target branch</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Commit Message Template
              </label>
              <input
                type="text"
                value={commitMessageTemplate}
                onChange={(e) => setCommitMessageTemplate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-dark-border rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500/60"
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
      <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-100">Backend API Engine</h4>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
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
