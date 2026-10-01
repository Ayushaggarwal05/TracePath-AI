import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
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
  Lightbulb,
} from 'lucide-react';

interface GlobalSettingsData {
  defaultTargetBranch: string;
  syncMode: 'commit' | 'pr';
  commitMessageTemplate: string;
  trackedPatterns: string;
  excludedPatterns: string;
}

const DEFAULT_GLOBAL_SETTINGS: GlobalSettingsData = {
  defaultTargetBranch: 'main',
  syncMode: 'pr',
  commitMessageTemplate: 'docs(tracepath): auto-synchronize documentation for commit {commit_sha}',
  trackedPatterns: 'ARCHITECTURE.md\nPRD.md\nREADME.md\ndocs/**/*.md\nadr/*.md',
  excludedPatterns: '*.test.ts\n*.spec.py\nnode_modules/**\n.venv/**\n*.lock\nbuild/**',
};

export const SettingsPage: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'ai' | 'github' | 'docs' | 'automation'>('ai');
  const [savedToast, setSavedToast] = useState(false);

  // Dynamic user data
  const connectedUsername =
    user?.github_connections?.[0]?.username ||
    localStorage.getItem('tracepath_github_user') ||
    'Developer';

  const tokenStatus =
    user?.token_status ||
    user?.github_connections?.[0]?.token_status ||
    'VALID';

  // Persistent Form States
  const [defaultTargetBranch, setDefaultTargetBranch] = useState(DEFAULT_GLOBAL_SETTINGS.defaultTargetBranch);
  const [syncMode, setSyncMode] = useState<'commit' | 'pr'>(DEFAULT_GLOBAL_SETTINGS.syncMode);
  const [commitMessageTemplate, setCommitMessageTemplate] = useState(DEFAULT_GLOBAL_SETTINGS.commitMessageTemplate);
  const [trackedPatterns, setTrackedPatterns] = useState(DEFAULT_GLOBAL_SETTINGS.trackedPatterns);
  const [excludedPatterns, setExcludedPatterns] = useState(DEFAULT_GLOBAL_SETTINGS.excludedPatterns);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tracepath_global_settings');
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<GlobalSettingsData>;
        if (parsed.defaultTargetBranch) setDefaultTargetBranch(parsed.defaultTargetBranch);
        if (parsed.syncMode) setSyncMode(parsed.syncMode);
        if (parsed.commitMessageTemplate) setCommitMessageTemplate(parsed.commitMessageTemplate);
        if (parsed.trackedPatterns) setTrackedPatterns(parsed.trackedPatterns);
        if (parsed.excludedPatterns) setExcludedPatterns(parsed.excludedPatterns);
      }
    } catch {}
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: GlobalSettingsData = {
        defaultTargetBranch,
        syncMode,
        commitMessageTemplate,
        trackedPatterns,
        excludedPatterns,
      };
      localStorage.setItem('tracepath_global_settings', JSON.stringify(payload));
    } catch {}

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2742] dark:text-slate-100 tracking-tight">
            System & Workflow Settings
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium font-sans">
            Customize how TracePath monitors your code, communicates with GitHub, and updates documentation.
          </p>
        </div>

        {savedToast && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in fade-in shadow-2xs">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#ECE9E2] dark:bg-[#131D2E] border border-stone-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-x-auto">
        {[
          { id: 'ai', label: '1. How AI Works', icon: <Cpu className="w-3.5 h-3.5" /> },
          { id: 'github', label: '2. GitHub & Webhooks', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          { id: 'docs', label: '3. Documentation Rules', icon: <FileCode className="w-3.5 h-3.5" /> },
          { id: 'automation', label: '4. Workflow & Branches', icon: <Sliders className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white dark:bg-[#0D1526] text-[#0F2742] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/40'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AI AGENTS */}
      {/* ========================================================================= */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          {/* Section Introduction */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-stone-200/90 dark:border-slate-800 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-[#0F2742] dark:text-slate-100">
                  How TracePath Keeps Your Docs in Sync
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Keys encrypted on server</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              Whenever you push code, TracePath runs a 3-step pipeline. Instead of blindly overwriting documentation, it first analyzes your code, checks if any docs are affected, and only writes changes when necessary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AgentConfigCard
              agentNumber={1}
              stepTitle="Semantic Code Understanding"
              name="Agent 1: Code Analyzer"
              whatItDoes="Inspects modified functions, structural changes, and the true purpose behind your commit."
              whyItMatters="Makes sure documentation changes reflect actual code logic rather than raw file diffs."
              defaultModel="gemini-3.5-flash-lite"
              temperature={0.1}
              envKeyName="AGENT_CHANGE_ANALYZER_API_KEY"
              envModelName="AGENT_CHANGE_ANALYZER_MODEL"
              isConfigured={true}
            />
            <AgentConfigCard
              agentNumber={2}
              stepTitle="Documentation Impact Decision"
              name="Agent 2: Impact Planner"
              whatItDoes="Compares your code changes against existing docs to decide if updates are truly needed."
              whyItMatters="Stops documentation spam. Internal refactors, variable renames, and test fixes won't trigger unnecessary doc changes."
              defaultModel="gemini-3.5-flash-lite"
              temperature={0.1}
              envKeyName="AGENT_IMPACT_PLANNER_API_KEY"
              envModelName="AGENT_IMPACT_PLANNER_MODEL"
              isConfigured={true}
            />
            <AgentConfigCard
              agentNumber={3}
              stepTitle="Minimal Markdown Generation"
              name="Agent 3: Doc Writer"
              whatItDoes="Drafts clean, precise markdown edits and formats them into a unified git diff."
              whyItMatters="Keeps your project documentation fresh and up to date while preserving your original tone and structure."
              defaultModel="gemini-3.5-flash-lite"
              temperature={0.2}
              envKeyName="AGENT_DOC_GENERATOR_API_KEY"
              envModelName="AGENT_DOC_GENERATOR_MODEL"
              isConfigured={true}
            />
          </div>

          {/* Privacy & Security Note */}
          <Card className="p-4 bg-[#F7F5F0] dark:bg-slate-900/60 border border-stone-200/90 dark:border-slate-800 flex items-start gap-3 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1 font-sans">
              <span className="font-bold text-slate-900 dark:text-slate-100">Enterprise Security & Privacy Standard</span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Your API keys, repository secrets, and source code are processed securely on isolated backend workers. Private credentials are never exposed in the browser, and your code is never used to train public AI models.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GITHUB & WEBHOOKS */}
      {/* ========================================================================= */}
      {activeTab === 'github' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-slate-900 dark:text-slate-100" />
                <div>
                  <h3 className="text-base font-bold text-[#0F2742] dark:text-slate-100 font-sans">GitHub Connection Status</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">Your authorized account and permissions for reading commits and synchronizing docs.</p>
                </div>
              </div>
              <Badge variant={tokenStatus === 'VALID' ? 'emerald' : tokenStatus === 'EXPIRED' ? 'amber' : 'rose'}>
                {tokenStatus === 'VALID'
                  ? 'Authorized PAT Connected'
                  : tokenStatus === 'EXPIRED'
                  ? 'PAT Expired'
                  : 'PAT Revoked'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-[#F7F5F0] dark:bg-slate-900/60 border border-stone-200/90 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-sans">Connected GitHub User</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold block">{connectedUsername}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">
                  Status: <strong className={tokenStatus === 'VALID' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{tokenStatus}</strong>
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F5F0] dark:bg-slate-900/60 border border-stone-200/90 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-sans">Repository Access Permissions</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold block">repo, read:org, write:discussion</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">Required for PRs and webhooks</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7F5F0] dark:bg-slate-900/60 border border-stone-200/90 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-sans">Real-Time Webhook Listener</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold block">Active &amp; Ready (200 OK)</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">Listening on /api/v1/github/webhooks</span>
              </div>
            </div>
          </Card>

          <WebhookSettings />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DOCUMENTATION RULES */}
      {/* ========================================================================= */}
      {activeTab === 'docs' && (
        <form onSubmit={handleSave} className="space-y-6">
          <Card className="p-6 space-y-5 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-slate-900 dark:text-slate-100" />
                <h3 className="text-base font-bold text-[#0F2742] dark:text-slate-100 font-sans">
                  Documentation Discovery & File Filters
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                Tell TracePath which documentation files it is allowed to update, and which code files should be ignored.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tracked Docs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans">
                    Documentation Files to Watch &amp; Update
                  </label>
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-400 font-semibold font-sans">
                    One pattern per line
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                  TracePath will only check and generate updates for files matching these paths.
                </p>
                <textarea
                  rows={6}
                  value={trackedPatterns}
                  onChange={(e) => setTrackedPatterns(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900/90 border border-stone-300 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-400 leading-relaxed shadow-2xs"
                  placeholder="README.md&#10;docs/**/*.md&#10;ARCHITECTURE.md"
                />
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                  <span className="font-semibold">Common examples:</span>
                  <code className="text-indigo-700 dark:text-brand-300">README.md</code>, <code className="text-indigo-700 dark:text-brand-300">docs/**/*.md</code>, <code className="text-indigo-700 dark:text-brand-300">ARCHITECTURE.md</code>
                </div>
              </div>

              {/* Ignored Code Files */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans">
                    Ignored Code Files &amp; Folders
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold font-sans">
                    Never triggers doc updates
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                  Commits modifying only these files will be automatically skipped to save compute.
                </p>
                <textarea
                  rows={6}
                  value={excludedPatterns}
                  onChange={(e) => setExcludedPatterns(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900/90 border border-stone-300 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-400 leading-relaxed shadow-2xs"
                  placeholder="*.test.ts&#10;node_modules/**&#10;*.lock&#10;.venv/**"
                />
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                  <span className="font-semibold">Common examples:</span>
                  <code className="text-rose-700 dark:text-rose-400">*.test.ts</code>, <code className="text-rose-700 dark:text-rose-400">node_modules/**</code>, <code className="text-rose-700 dark:text-rose-400">*.lock</code>
                </div>
              </div>
            </div>

            {/* Practical Tips Box */}
            <div className="p-4 rounded-2xl bg-[#F7F5F0] dark:bg-slate-900/60 border border-stone-200/90 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">
                <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Helpful Tips for Documentation Rules:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400 font-sans">
                <li>Use <code className="text-indigo-700 dark:text-brand-300 font-mono">docs/**/*.md</code> to automatically watch all markdown documents inside your docs directory.</li>
                <li>You can also override these global rules for specific repositories in the repository settings modal.</li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="sm">
                Save Documentation Rules
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AUTOMATION & BRANCHES */}
      {/* ========================================================================= */}
      {activeTab === 'automation' && (
        <form onSubmit={handleSave} className="space-y-6">
          <Card className="p-6 space-y-6 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-slate-900 dark:text-slate-100" />
                <h3 className="text-base font-bold text-[#0F2742] dark:text-slate-100 font-sans">
                  Global Automation &amp; Publishing Workflow
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                Choose how documentation updates should be applied to your repositories by default.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Default Target Branch */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans">
                  Default Branch to Monitor
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                  TracePath listens for commits and merges pushed to this branch.
                </p>
                <input
                  type="text"
                  value={defaultTargetBranch}
                  onChange={(e) => setDefaultTargetBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900/90 border border-stone-300 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-400 shadow-2xs"
                  placeholder="main"
                />
              </div>

              {/* Sync Method */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans">
                  Documentation Publishing Method
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                  Choose between human review via Pull Request or instant direct commits.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {/* Option 1: PR */}
                  <button
                    type="button"
                    onClick={() => setSyncMode('pr')}
                    className={`p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      syncMode === 'pr'
                        ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/30 text-slate-900 dark:text-slate-100 ring-1 ring-emerald-600'
                        : 'border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-400 font-sans">
                        <GitPullRequest className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Pull Request</span>
                      </div>
                      <Badge variant="emerald" className="text-[10px] px-1.5 py-0">Recommended</Badge>
                    </div>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-sans block leading-normal">
                      Creates a clean PR for your team to review and approve before merging.
                    </span>
                  </button>

                  {/* Option 2: Direct Commit */}
                  <button
                    type="button"
                    onClick={() => setSyncMode('commit')}
                    className={`p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      syncMode === 'commit'
                        ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/30 text-slate-900 dark:text-slate-100 ring-1 ring-emerald-600'
                        : 'border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-400 mb-1 font-sans">
                      <GitBranch className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Direct Commit</span>
                    </div>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-sans block leading-normal">
                      Pushes doc updates directly to your branch. Best for solo projects.
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Commit Message Template */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans">
                Automated Commit Message Template
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                The git commit message or PR title attached to documentation updates.
              </p>
              <input
                type="text"
                value={commitMessageTemplate}
                onChange={(e) => setCommitMessageTemplate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900/90 border border-stone-300 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-400 shadow-2xs"
              />
              
              <div className="p-3 rounded-xl bg-[#F7F5F0] dark:bg-slate-900/60 border border-stone-200/90 dark:border-slate-800 space-y-1.5 text-xs font-sans">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] block">
                  Available tags you can use in your message:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800">
                    <code className="text-indigo-700 dark:text-brand-300 font-bold">{'{commit_sha}'}</code>
                    <p className="text-slate-600 dark:text-slate-400 text-[10px] font-sans mt-0.5">Short trigger commit hash (e.g. 84767d5)</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800">
                    <code className="text-indigo-700 dark:text-brand-300 font-bold">{'{branch}'}</code>
                    <p className="text-slate-600 dark:text-slate-400 text-[10px] font-sans mt-0.5">The branch name (e.g. main)</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800">
                    <code className="text-indigo-700 dark:text-brand-300 font-bold">{'{docs_list}'}</code>
                    <p className="text-slate-600 dark:text-slate-400 text-[10px] font-sans mt-0.5">Names of updated files (e.g. README.md)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Practical Per-Repository Override Tip */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-brand-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 dark:text-brand-300 font-sans">
                <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-brand-400 shrink-0" />
                <span>Need Different Settings for a Specific Repository?</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                These settings act as your <strong>global defaults</strong>. You can easily choose a different target branch, select specific doc files, or toggle Pull Requests vs Direct Commits for any individual repository by clicking the <strong>⚙️ Settings</strong> button on that repository's card in the <strong>Repositories</strong> page.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="sm">
                Save Automation Settings
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* Backend Engine Footer */}
      <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h4 className="text-sm font-bold text-[#0F2742] dark:text-slate-100 font-sans">TracePath Autonomous Engine</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-sans mt-0.5">
            Powered by FastAPI, Async SQLAlchemy 2.0, and 3-Agent Multi-Model Orchestrator
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Badge variant="emerald">Engine v0.2.0 Online</Badge>
          <Badge variant="slate">Zero-Token Bot Bypass</Badge>
        </div>
      </Card>
    </div>
  );
};
