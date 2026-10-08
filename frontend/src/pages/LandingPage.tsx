import React, { useState } from "react";
import { Modal } from "../components/common/Modal";
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
  Sparkles,
  Check,
  FileText,
  Code2,
  Shield,
  FolderGit2,
  Lock,
  GitBranch,
} from "lucide-react";
import heroRobotAgentImg from "../assets/hero-robot-agent.png";

interface LandingPageProps {
  onConnectGitHub: () => void;
  onGetStarted?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onConnectGitHub,
  onGetStarted,
}) => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoStep, setDemoStep] = useState<number>(0);

  const handleAction = () => {
    if (onConnectGitHub) {
      onConnectGitHub();
    } else if (onGetStarted) {
      onGetStarted();
    }
  };

  const steps = [
    {
      num: "01",
      title: "Code Changes",
      desc: "Engineers push commits or open pull requests to your connected GitHub repositories.",
      icon: <GitCommit className="w-5 h-5 text-indigo-600" />,
      tag: "GitHub Webhook",
      bgIcon: "bg-indigo-50 border-indigo-100",
    },
    {
      num: "02",
      title: "AI Understands",
      desc: "Agent 1 extracts semantic AST diffs, models, endpoints, and architectural changes without hallucinating.",
      icon: <Brain className="w-5 h-5 text-purple-600" />,
      tag: "Analysis Agent",
      bgIcon: "bg-purple-50 border-purple-100",
    },
    {
      num: "03",
      title: "Doc Impact",
      desc: "Agent 2 correlates diffs against PRD, Architecture, and ADR docs to eliminate unnecessary noise.",
      icon: <Cpu className="w-5 h-5 text-amber-600" />,
      tag: "Decision Agent",
      bgIcon: "bg-amber-50 border-amber-100",
    },
    {
      num: "04",
      title: "Doc Update",
      desc: "Agent 3 generates minimal, targeted documentation edits preserving headings and exact styling.",
      icon: <FileCheck2 className="w-5 h-5 text-emerald-600" />,
      tag: "Generator Agent",
      bgIcon: "bg-emerald-50 border-emerald-100",
    },
    {
      num: "05",
      title: "Automatic Sync",
      desc: "Backend directly commits the unified diff or opens a clean reviewable Pull Request on GitHub.",
      icon: <GitPullRequest className="w-5 h-5 text-blue-600" />,
      tag: "GitHub Sync",
      bgIcon: "bg-blue-50 border-blue-100",
    },
  ];

  const demoStages = [
    {
      id: "diff",
      title: "1. Developer Push",
      agent: "GitHub Webhook",
      badge: "Git Commit",
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
      id: "agent1",
      title: "2. Analysis Agent",
      agent: "Agent 1: AST Parser",
      badge: "Semantic JSON",
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
      id: "agent2",
      title: "3. Decision Agent",
      agent: "Agent 2: Doc Matrix",
      badge: "Impact Analysis",
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
      id: "agent3",
      title: "4. Doc Generator",
      agent: "Agent 3: Minimal Diff",
      badge: "Unified Diff",
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
      id: "sync",
      title: "5. Pull Request Created",
      agent: "GitHub Integration",
      badge: "PR Ready",
      content: `🚀 Pull Request #142 Created Automatically
---------------------------------------------------
Title: docs: sync ARCHITECTURE.md and ADR-004 with commit 7c4e2a1
Branch: tracepath/docs-update-7c4e2a1 -> main
Status: All CI checks passed (2 modified documentation files)

Reviewers: @sarahchen, @dev-lead
"Documentation synchronized autonomously by TracePath AI without manual drift."`,
    },
  ];

  return (
    <div
      id="home"
      className="bg-[#FFFFFF] text-slate-900 min-h-screen overflow-x-hidden"
    >
      {/* =========================================================================
          HERO SECTION (Matching user reference with 3D Robot, Purple Agent Halo & Floating Cards)
         ========================================================================= */}
      <section className="relative pt-6 sm:pt-10 lg:pt-12 pb-16 sm:pb-24 pl-6 sm:pl-10 lg:pl-16 pr-0 w-full overflow-hidden">
        {/* Soft Background Radial Ambient Glows */}
        <div className="absolute top-10 right-0 w-[730px] h-[730px] bg-gradient-to-br from-indigo-200/35 via-purple-200/20 to-cyan-200/25 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center min-h-[660px] lg:min-h-[720px] w-full">
          {/* LEFT COLUMN: Punchy Copy, Badges & CTAs (Elevated in front with z-30) */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6 sm:space-y-7 text-left relative z-30 pr-4 sm:pr-8">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF2FF] border border-[#C7D2FE] text-[#4F46E5] text-xs sm:text-[13px] font-semibold tracking-wide shadow-xs">
              <Sparkles className="w-4 h-4 text-[#4F46E5] fill-[#4F46E5]/20" />
              <span>Autonomous Multi-Agent Documentation Engine</span>
            </div>

            {/* Main Headline (Huge, Bold, Punchy) */}
            <h1 className="text-5xl sm:text-6xl lg:text-[4.25rem] xl:text-[5rem] font-black tracking-[-0.04em] text-[#0F172A] leading-[1.0] lg:leading-[0.98]">
              Your Code.
              <br />
              Your Docs.
              <br />
              Always in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B4EFF] via-[#8B5CF6] to-[#06B6D4]">
                Sync.
              </span>
            </h1>

            {/* Description Subtitle */}
            <p className="text-base sm:text-[17px] text-slate-500 font-normal max-w-xl leading-relaxed">
              TracePath AI automatically analyzes your code, understands your
              repository, and keeps your documentation in sync — always.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
              <button
                onClick={handleAction}
                className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#A8203A] hover:bg-[#901B31] text-white font-bold text-sm sm:text-base shadow-xl shadow-[#A8203A]/25 hover:shadow-[#A8203A]/35 hover:-translate-y-0.5 active:translate-y-0 border border-[#A8203A] transition-all cursor-pointer group"
              >
                <Github className="w-5 h-5 text-white" />
                <span>Connect GitHub</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-bold text-sm sm:text-base shadow-xs hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 text-indigo-600 fill-indigo-600/30" />
                <span>See How It Works (Demo)</span>
              </button>
            </div>

            {/* Bottom 4-Column Feature Highlights Bar (Guaranteed in front with z-30) */}
            <div className="pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2 items-center relative z-30">
              {/* Feature 1 */}
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    Auto-Docs
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    PRD, Architecture, README
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-2.5 sm:border-l sm:border-slate-200/80 sm:pl-3">
                <Code2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    Multi-Repo
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    GitHub OAuth + Triggers
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-2.5 sm:border-l sm:border-slate-200/80 sm:pl-3">
                <Bot className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    AI Agents
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Plan · Build · Document
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-center gap-2.5 sm:border-l sm:border-slate-200/80 sm:pl-3">
                <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    Production Ready
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Secure · Reliable · Scalable
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Full-Scale 3D AI Robot Engine + Halo + 4 Flanking Floating Cards */}
          <div className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-end min-h-[580px] sm:min-h-[660px] lg:min-h-[720px] z-0 overflow-visible w-full">
            {/* Robot Container with Full Size & Elevation */}
            <div className="relative w-full max-w-[580px] sm:max-w-[660px] lg:max-w-[760px] xl:max-w-[840px] z-0 flex items-center justify-end transform -translate-y-10 sm:-translate-y-16 lg:-translate-y-20 xl:-translate-y-24 scale-100 sm:scale-105 lg:scale-115 xl:scale-120 mr-0 lg:-mr-4 xl:-mr-8 transition-transform">
              {/* Outer light purple agent boundary ring behind head with 2px white border (Enlarged) */}
              <div className="absolute top-[3%] left-1/2 -translate-x-1/2 w-[540px] sm:w-[640px] lg:w-[740px] xl:w-[820px] h-[540px] sm:h-[640px] lg:h-[740px] xl:h-[820px] rounded-full bg-gradient-to-b from-purple-200/40 via-purple-100/30 to-indigo-100/20 border-[2px] border-white shadow-[0_0_60px_rgba(168,85,247,0.22)] pointer-events-none z-0">
                {/* Glowing node at top */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_14px_rgba(99,102,241,0.9)]" />
                {/* Glowing node at right */}
                <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)]" />
                {/* Glowing node at left */}
                <div className="absolute top-1/3 -left-1.5 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.9)]" />
              </div>

              {/* Armored Robot Image on Transparent Background */}
              <img
                src={heroRobotAgentImg}
                alt="TracePath AI Futuristic Android Engine"
                className="w-full h-auto object-contain select-none pointer-events-none relative z-10 drop-shadow-[0_20px_45px_rgba(79,70,229,0.14)]"
              />

              {/* FLOATING CARD 1 (Flank Left of Head/Ear): Analyzing Repository... */}
              <div className="absolute top-[20%] -left-8 sm:-left-12 lg:-left-16 xl:-left-20 z-30 animate-float-slow">
                <div className="flex flex-col gap-1.5 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/90 shadow-[0_16px_36px_rgba(15,23,42,0.09)] min-w-[210px] sm:min-w-[240px]">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Analyzing Repository...
                    </span>
                  </div>
                  {/* Glowing Purple Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative mt-1">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full w-3/4 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* FLOATING CARD 2 (Flank Left of Neck/Chest): Generating Documentation... */}
              <div className="absolute top-[42%] -left-10 sm:-left-14 lg:-left-20 xl:-left-32 z-30 animate-float-delayed">
                <div className="flex flex-col gap-1.5 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/90 shadow-[0_16px_36px_rgba(15,23,42,0.09)] min-w-[220px] sm:min-w-[250px]">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Generating Documentation...
                    </span>
                  </div>
                  {/* Glowing Teal Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative mt-1">
                    <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full w-4/5 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* FLOATING CARD 3 (Flank Right of Head/Ear): Compact GitHub Doc Checklist */}
              <div className="absolute top-[14%] right-2 sm:right-4 lg:right-6 xl:right-16 z-30 animate-float-slow">
                <div className="p-3.5 sm:p-4 rounded-[18px] bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_12px_28px_rgba(15,23,42,0.07)] space-y-2.5 min-w-[125px] sm:min-w-[138px]">
                  <div>
                    <Github className="w-6 h-6 text-slate-900 fill-slate-900" />
                  </div>
                  <div className="space-y-1.5 text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-1.5 text-blue-500">
                      <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                      <span className="text-slate-700 font-medium">PRD</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-500">
                      <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                      <span className="text-slate-700 font-medium">
                        Architecture
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-500">
                      <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                      <span className="text-slate-700 font-medium">README</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-500">
                      <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                      <span className="text-slate-700 font-medium">ADR</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FLOATING CARD 4 (Flank Right of Shoulder): Code / Sync Terminal */}
              <div className="absolute top-[44%] right-2 sm:right-4 lg:right-6 xl:right-8 z-30 animate-float-delayed">
                <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_16px_36px_rgba(15,23,42,0.08)] font-mono text-xs space-y-1 min-w-[185px] sm:min-w-[205px]">
                  <p className="text-indigo-400/80">// sync complete</p>
                  <p className="text-indigo-400/80">// docs updated</p>
                  <p className="text-indigo-400/80">// repository analyzed</p>
                  <div className="pt-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: HOW IT WORKS (Autonomous 5-Step Pipeline)
         ========================================================================= */}
      <section
        id="how-it-works"
        className="py-20 bg-[#F9F8F6] border-t border-stone-200/80"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-12">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              <Layers className="w-3.5 h-3.5" />
              Autonomous Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              How TracePath AI Keeps Docs Synchronized
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
              From code commit to validated documentation pull request in
              seconds.
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
                className="group relative flex flex-col justify-between bg-white border border-stone-200/90 hover:border-indigo-400/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-extrabold text-slate-400 group-hover:text-indigo-600 transition-colors">
                      {step.num}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-slate-600 border border-stone-200">
                      {step.tag}
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded-xl border w-fit mb-4 ${step.bgIcon}`}
                  >
                    {step.icon}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] font-semibold text-indigo-600 group-hover:text-indigo-700">
                  <span>View Stage</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: 3 INDEPENDENT AI AGENTS SHOWCASE
         ========================================================================= */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-12">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono bg-purple-50 text-purple-700 border border-purple-200/80">
              <Bot className="w-3.5 h-3.5" />
              Multi-Agent Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Three Specialized Agents Working in Harmony
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
              Each AI agent executes an isolated responsibility to maintain 100%
              deterministic accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agent 1 Card */}
            <div className="p-7 rounded-3xl bg-[#FAF9F6] border border-stone-200/90 shadow-xs space-y-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Brain className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-100/70 text-indigo-800">
                  Agent 1
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Change Analyzer Agent
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Parses the raw commit diff and extracts semantic intent, changed
                functions, API routes, data models, and architectural
                implications.
              </p>
              <div className="pt-2 border-t border-stone-200/60 font-mono text-[11px] text-slate-500 space-y-1">
                <p>✓ AST syntax tree parsing</p>
                <p>✓ Structured JSON schema output</p>
                <p>✓ Zero-hallucination verification</p>
              </div>
            </div>

            {/* Agent 2 Card */}
            <div className="p-7 rounded-3xl bg-[#FAF9F6] border border-stone-200/90 shadow-xs space-y-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                  <Cpu className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-100/70 text-amber-800">
                  Agent 2
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Impact Planner Agent
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Evaluates existing documentation against the code analysis to
                determine which specific files require updates, and skips when
                docs are already accurate.
              </p>
              <div className="pt-2 border-t border-stone-200/60 font-mono text-[11px] text-slate-500 space-y-1">
                <p>✓ Prevents spam PRs on refactors</p>
                <p>✓ Multi-document cross checking</p>
                <p>✓ Confidence score thresholds</p>
              </div>
            </div>

            {/* Agent 3 Card */}
            <div className="p-7 rounded-3xl bg-[#FAF9F6] border border-stone-200/90 shadow-xs space-y-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <FileCode className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-100/70 text-emerald-800">
                  Agent 3
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Documentation Generator
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Applies minimal, surgical Markdown diffs to the affected files
                while strictly maintaining existing headings, formatting, and
                codebase style.
              </p>
              <div className="pt-2 border-t border-stone-200/60 font-mono text-[11px] text-slate-500 space-y-1">
                <p>✓ Unified git diff formatting</p>
                <p>✓ Preserves Markdown formatting</p>
                <p>✓ Direct commit or Pull Request</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: ENTERPRISE & SECURITY HIGHLIGHTS (Docs & Pricing Anchor)
         ========================================================================= */}
      <section
        id="docs"
        className="py-20 bg-[#FAF9F6] border-t border-stone-200/80"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-12">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              <ShieldCheck className="w-3.5 h-3.5" />
              Security First
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Enterprise-Grade Security & Privacy
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
              Your source code and tokens are protected with industry-standard
              cryptographic guarantees.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900">
                AES-256 Encryption
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                GitHub Personal Access Tokens are encrypted at rest using Fernet
                authenticated cryptography.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-2">
              <FolderGit2 className="w-5 h-5 text-purple-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Multi-Tenant Isolation
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Row-Level Security (RLS) and user-scoped database queries ensure
                strict tenant separation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-2">
              <GitBranch className="w-5 h-5 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Granular Scopes
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Supports Fine-Grained GitHub Tokens limited only to specific
                documentation repositories.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-2">
              <Zap className="w-5 h-5 text-amber-600" />
              <h4 className="text-sm font-bold text-slate-900">
                HMAC-SHA256 Signatures
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every webhook payload is authenticated against your GitHub
                secret in constant time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: PRICING / CALL TO ACTION BANNER
         ========================================================================= */}
      <section
        id="pricing"
        className="py-20 bg-white border-t border-stone-200/80"
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <div className="relative rounded-3xl bg-[#0B111F] text-white p-8 sm:p-14 overflow-hidden shadow-2xl">
            {/* Ambient Background Glow in Dark Banner */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center space-y-6 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                <Sparkles className="w-3.5 h-3.5" />
                Free for Public & Private Repositories
              </span>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                Never write or debug stale documentation again.
              </h2>

              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Connect your GitHub account in 30 seconds and let TracePath AI
                maintain your documentation autonomously.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleAction}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#A8203A] hover:bg-[#901B31] text-white font-bold text-base shadow-xl shadow-[#A8203A]/30 border border-[#A8203A] transition-all cursor-pointer"
                >
                  <Github className="w-5 h-5 text-white" />
                  <span>Get Started with GitHub</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE DEMO MODAL
         ========================================================================= */}
      <Modal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        title="TracePath AI Interactive Multi-Agent Pipeline Demo"
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Stage Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1.5 bg-stone-100 rounded-2xl">
            {demoStages.map((stage, idx) => (
              <button
                key={stage.id}
                onClick={() => setDemoStep(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                  demoStep === idx
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-stone-200/60"
                }`}
              >
                {stage.title}
              </button>
            ))}
          </div>

          {/* Active Stage Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  {demoStages[demoStep].agent}
                </span>
                <span className="text-xs text-slate-500">
                  {demoStages[demoStep].badge}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Stage {demoStep + 1} of 5
              </span>
            </div>

            {/* Code / Output Container */}
            <pre className="p-4 rounded-2xl bg-[#0B111F] text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
              {demoStages[demoStep].content}
            </pre>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200">
            <button
              disabled={demoStep === 0}
              onClick={() => setDemoStep((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
            >
              ← Previous Step
            </button>

            <div className="flex items-center gap-2">
              {demoStep < demoStages.length - 1 ? (
                <button
                  onClick={() =>
                    setDemoStep((prev) =>
                      Math.min(demoStages.length - 1, prev + 1),
                    )
                  }
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 cursor-pointer"
                >
                  <span>Next Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsDemoModalOpen(false);
                    handleAction();
                  }}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 cursor-pointer"
                >
                  <span>Connect GitHub Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LandingPage;
