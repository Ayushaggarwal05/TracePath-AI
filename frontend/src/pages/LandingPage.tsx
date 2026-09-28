import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Github,
  Brain,
  FileCode,
  GitCommit,
  GitPullRequest,
  Zap,
  Bot,
  Cpu,
  FileCheck2,
  ArrowRight,
  Play,
  ShieldCheck,
  Layers,
} from 'lucide-react';

interface LandingPageProps {
  onConnectGitHub: () => void;
  onGetStarted?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onConnectGitHub,
}) => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoStep, setDemoStep] = useState<number>(0);

  const steps = [
    {
      num: '01',
      title: 'Code Changes',
      desc: 'Engineers push code or open pull requests to your GitHub repository.',
      icon: <GitCommit className="w-5 h-5 text-indigo-600" />,
      tag: 'GitHub Event',
      bgIcon: 'bg-indigo-50 border-indigo-100',
    },
    {
      num: '02',
      title: 'AI Understands',
      desc: 'Agent 1 parses the semantic AST change without hallucinating facts.',
      icon: <Brain className="w-5 h-5 text-purple-600" />,
      tag: 'Analysis Agent',
      bgIcon: 'bg-purple-50 border-purple-100',
    },
    {
      num: '03',
      title: 'Doc Impact',
      desc: 'Agent 2 correlates diffs against PRD, Architecture, and ADR docs.',
      icon: <Cpu className="w-5 h-5 text-amber-600" />,
      tag: 'Decision Agent',
      bgIcon: 'bg-amber-50 border-amber-100',
    },
    {
      num: '04',
      title: 'Doc Update',
      desc: 'Agent 3 generates minimal, targeted documentation edits & unified diffs.',
      icon: <FileCheck2 className="w-5 h-5 text-emerald-600" />,
      tag: 'Generator Agent',
      bgIcon: 'bg-emerald-50 border-emerald-100',
    },
    {
      num: '05',
      title: 'Automatic Sync',
      desc: 'Backend commits the documentation diff or opens a pull request.',
      icon: <GitPullRequest className="w-5 h-5 text-blue-600" />,
      tag: 'GitHub Sync',
      bgIcon: 'bg-blue-50 border-blue-100',
    },
  ];

  const demoStages = [
    {
      id: 'diff',
      title: '1. Developer Push',
      agent: 'GitHub Webhook',
      badge: 'Git Commit',
      content: `commit: 7c4e2a1 (HEAD -> main)
Author: Sarah Chen <sarah@acme.dev>
Date:   Today at 14:32:10 UTC

feat(auth): add OAuth2 refresh token rotation & revocation

diff --git a/backend/app/core/auth.py b/backend/app/core/auth.py
+ async def rotate_refresh_token(old_token: str, client_id: str) -> TokenPair:
+     """Validates previous token, invalidates family, issues new pair."""
+     await token_revocation_service.revoke(old_token)
+     return await issue_tokens(user_id=decoded.sub, family_id=decoded.family)`,
    },
    {
      id: 'agent1',
      title: '2. Analysis Agent',
      agent: 'Agent 1: AST Parser',
      badge: 'Semantic JSON',
      content: `{
  "commit_hash": "7c4e2a1",
  "intent": "FEATURE_ENHANCEMENT",
  "summary": "Introduced OAuth2 refresh token rotation with token family revocation",
  "affected_components": [
    "Authentication Engine",
    "Token Lifecycle Storage",
    "Security Revocation Service"
  ],
  "api_changes": [
    {
      "function": "rotate_refresh_token",
      "visibility": "public",
      "signature": "(old_token: str, client_id: str) -> TokenPair"
    }
  ]
}`,
    },
    {
      id: 'agent2',
      title: '3. Decision Agent',
      agent: 'Agent 2: Doc Matrix',
      badge: 'Impact Analysis',
      content: `[DECISION MATRIX: 3 Target Files Evaluated]
--------------------------------------------------
1. docs/ARCHITECTURE.md  ->  [UPDATE REQUIRED]
   Reason: Section 4.2 (Authentication Flow) must document token rotation & family revocation.
   Confidence: 99.4%

2. docs/ADR-004-AUTH.md  ->  [UPDATE REQUIRED]
   Reason: New architecture decision for replay attack mitigation via token family revocation.
   Confidence: 98.1%

3. docs/PRD.md           ->  [NO UPDATE NEEDED]
   Reason: High-level requirements already specify standard secure authentication.
   Confidence: 96.7%`,
    },
    {
      id: 'agent3',
      title: '4. Doc Generator',
      agent: 'Agent 3: Minimal Diff',
      badge: 'Unified Diff',
      content: `diff --git a/docs/ARCHITECTURE.md b/docs/ARCHITECTURE.md
--- a/docs/ARCHITECTURE.md
+++ b/docs/ARCHITECTURE.md
@@ -42,6 +42,12 @@
-### 4.2 Token Refresh Flow
-Clients exchange refresh tokens directly for a new access token.
+### 4.2 Token Rotation & Replay Mitigation
+The authentication engine utilizes **Refresh Token Rotation (RTR)**.
+When a refresh token is exchanged:
+1. The previous token is immediately added to the revocation blacklist.
+2. A new access token and cryptographically unique refresh token pair are issued.
+3. If an expired or replayed token is detected, the entire token family is revoked.`,
    },
    {
      id: 'sync',
      title: '5. Pull Request Created',
      agent: 'GitHub Integration',
      badge: 'PR Ready',
      content: `🚀 Pull Request #142 Created Automatically
--------------------------------------------------
Title: docs: sync ARCHITECTURE.md and ADR-004 with commit 7c4e2a1
Branch: tracepath/docs-update-7c4e2a1 -> main
Status: All CI checks passed (2 modified documentation files)

Reviewers: @sarahchen, @dev-lead
"Documentation synchronized autonomously by TracePath AI without manual drift."`,
    },
  ];

  return (
    <div className="bg-[#FAF9F6] text-slate-900 min-h-full">
      <div className="space-y-24 py-12 px-6 sm:px-12 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="text-center space-y-6 pt-8 sm:pt-14 relative">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold tracking-wide shadow-sm">
            <img src="/logo-icon.png" alt="TracePath AI" className="w-4 h-4 object-contain" />
            <span>Autonomous Multi-Agent Documentation Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-[1.1]">
            Keep your engineering documentation{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600">
              synchronized with your code.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Autonomous, GitHub-native synchronization. Three independent AI agents understand code changes,
            evaluate documentation impact, and commit minimal updates without manual overhead.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Button
              size="lg"
              variant="primary"
              onClick={onConnectGitHub}
              leftIcon={<Github className="w-5 h-5 text-white" />}
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold shadow-lg shadow-indigo-500/20"
            >
              Connect GitHub
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setIsDemoModalOpen(true)}
              leftIcon={<Play className="w-4 h-4 text-indigo-600 fill-indigo-600/30" />}
              className="w-full sm:w-auto px-6 py-3.5 text-base font-semibold border-slate-300 bg-white hover:bg-slate-50 text-slate-800 shadow-sm"
            >
              See How It Works (Demo)
            </Button>
          </div>

          {/* Quick Metrics / Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-200/80">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-left">
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Hallucinations</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Strict AST token verification prevents fabricated API facts.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-left">
              <div className="flex items-center gap-2 text-purple-600 text-xs font-bold font-mono">
                <FileCode className="w-4 h-4" />
                <span>Minimal Diffs</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Preserves headings, formatting, and markdown structure.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-left">
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold font-mono">
                <Zap className="w-4 h-4" />
                <span>5,000 req/hr</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Fine-grained PAT integration with GitHub API rate limits.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-left">
              <div className="flex items-center gap-2 text-amber-600 text-xs font-bold font-mono">
                <Bot className="w-4 h-4" />
                <span>3 AI Agents</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Analysis, Decision, and Generator work in discrete stages.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Workflow Visualizer */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              <Layers className="w-3.5 h-3.5" />
              Autonomous Pipeline
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How TracePath AI Keeps Docs Synchronized
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              From code commit to validated documentation pull request in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {steps.map((step, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setDemoStep(idx);
                  setIsDemoModalOpen(true);
                }}
                className="group relative flex flex-col justify-between bg-white border border-slate-200/90 hover:border-indigo-400/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-extrabold text-slate-400 group-hover:text-indigo-600 transition-colors">
                      {step.num}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {step.tag}
                    </span>
                  </div>
                  <div className={`p-3 rounded-xl border w-fit mb-4 ${step.bgIcon}`}>
                    {step.icon}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-indigo-600 font-semibold font-mono">
                  <span>Inspect Step</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3 AI Agents Showcase */}
        <section className="p-8 sm:p-12 rounded-3xl bg-slate-100/80 border border-slate-200/90 space-y-8">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <Bot className="w-3.5 h-3.5" />
              Independent AI Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Three Dedicated AI Agents, Zero Hallucinations
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Specialized agents collaborate with strict validation schemas to prevent unnecessary doc churn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 w-fit">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-indigo-600">Stage 1</span>
                <h4 className="text-base font-bold text-slate-900">Agent 1: Analysis Agent</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Extracts precise semantic changes, purpose, and affected components from git diffs without guessing.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-xs font-mono text-slate-500 flex items-center justify-between">
                <span>Output Format</span>
                <span className="text-indigo-600 font-bold">Structured JSON</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 w-fit">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-amber-600">Stage 2</span>
                <h4 className="text-base font-bold text-slate-900">Agent 2: Decision Agent</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Evaluates PRD.md, ARCHITECTURE.md, and ADRs. Skips bugfixes and targets only affected documents.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-xs font-mono text-slate-500 flex items-center justify-between">
                <span>Output Format</span>
                <span className="text-amber-600 font-bold">Decision Matrix</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 w-fit">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-emerald-600">Stage 3</span>
                <h4 className="text-base font-bold text-slate-900">Agent 3: Doc Generator</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Produces minimal targeted markdown edits while preserving existing hierarchy and styling.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-xs font-mono text-slate-500 flex items-center justify-between">
                <span>Output Format</span>
                <span className="text-emerald-600 font-bold">Unified Git Diff</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="text-center p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to eliminate documentation drift?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Connect your GitHub account in 30 seconds and activate autonomous synchronization on your repositories.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              variant="primary"
              onClick={onConnectGitHub}
              leftIcon={<Github className="w-5 h-5 text-white" />}
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold shadow-xl"
            >
              Connect GitHub Now
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setIsDemoModalOpen(true)}
              leftIcon={<Play className="w-4 h-4 text-slate-200" />}
              className="w-full sm:w-auto px-6 py-3.5 text-base font-semibold bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Watch Pipeline Walkthrough
            </Button>
          </div>
        </section>
      </div>

      {/* Interactive Pipeline Demo Modal */}
      <Modal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        title="Autonomous Pipeline Walkthrough"
        subtitle="See how TracePath AI processes code diffs and writes precision documentation updates without hallucinations."
        maxWidth="4xl"
        variant="default"
      >
        <div className="space-y-6">
          {/* Stage Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
            {demoStages.map((stage, idx) => (
              <button
                key={stage.id}
                onClick={() => setDemoStep(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  demoStep === idx
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{stage.title}</span>
              </button>
            ))}
          </div>

          {/* Active Stage Detail */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-slate-700">
                  {demoStages[demoStep].agent}
                </span>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold">
                {demoStages[demoStep].badge}
              </span>
            </div>

            {/* Code / Content Box */}
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed shadow-inner max-h-72">
              <pre>{demoStages[demoStep].content}</pre>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <button
                disabled={demoStep === 0}
                onClick={() => setDemoStep((prev) => Math.max(0, prev - 1))}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
              >
                ← Previous Stage
              </button>
              <button
                disabled={demoStep === demoStages.length - 1}
                onClick={() => setDemoStep((prev) => Math.min(demoStages.length - 1, prev + 1))}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
              >
                Next Stage →
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsDemoModalOpen(false);
                onConnectGitHub();
              }}
              leftIcon={<Github className="w-4 h-4 text-white" />}
            >
              Connect GitHub to Automate Repos
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
