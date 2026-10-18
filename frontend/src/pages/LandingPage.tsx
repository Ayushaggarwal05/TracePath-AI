import React, { useState } from "react";
import { Modal } from "../components/common/Modal";
import {
  Github,
  Brain,
  Zap,
  Bot,
  Cpu,
  FileCheck2,
  ArrowRight,
  Play,
  ShieldCheck,
  Sparkles,
  Check,
  CheckCircle2,
  FileText,
  Code2,
  FolderGit2,
  Lock,
  Activity,
  Workflow,
  ChevronDown,
  FileCode2,
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
  const [activePipelineStep, setActivePipelineStep] = useState<number>(0);
  const [activeDocTab, setActiveDocTab] = useState<string>("readme");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [billingAnnual, setBillingAnnual] = useState(true);

  const handleAction = () => {
    if (onConnectGitHub) {
      onConnectGitHub();
    } else if (onGetStarted) {
      onGetStarted();
    }
  };

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
----------------------------------------------------
Title: docs: sync ARCHITECTURE.md and ADR-004 with commit 7c4e2a1
Branch: tracepath/docs-update-7c4e2a1 -> main
Status: All CI checks passed (2 modified documentation files)

Reviewers: @sarahchen, @dev-lead
"Documentation synchronized autonomously by TracePath AI without manual drift."`,
    },
  ];

  const docTargets = [
    {
      id: "readme",
      name: "README.md",
      type: "Markdown Guide",
      badge: "MD",
      badgeColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      description:
        "Installation, environment variables, quickstart commands, and CLI documentation.",
      preview: `# Authentication Engine

## Token Rotation
TracePath AI keeps your developer quickstarts up to date.
- \`npm install @acme/auth\`
- Supports **OAuth2 Refresh Token Rotation (RTR)** with automatic revocation.

\`\`\`bash
# Start with auto-synced configuration
acme-auth --verify-tokens
\`\`\``,
    },
    {
      id: "arch",
      name: "ARCHITECTURE.md",
      type: "System Blueprint",
      badge: "DIAG",
      badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
      description:
        "Component topology, data flow, token lifecycle, and service boundaries.",
      preview: `## 4. Security & Token Architecture

\`\`\`mermaid
flowchart LR
    Client -->|Refresh Token| AuthServer[Auth Service]
    AuthServer -->|Revoke Old| TokenStore[(Redis Store)]
    AuthServer -->|Issue New Pair| Client
\`\`\`

When a refresh token is exchanged, the previous token is immediately added to the revocation blacklist.`,
    },
    {
      id: "prd",
      name: "PRD.md",
      type: "Product Specs",
      badge: "SPEC",
      badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      description:
        "User requirements, acceptance criteria, and technical constraints.",
      preview: `## Feature Spec: Token Revocation Protocol

### User Story
As an authenticated engineer, I require token family revocation so compromised sessions cannot be replayed.

### Acceptance Criteria
- [x] Rotate refresh token on every exchange request.
- [x] Invalidate token family upon detecting replayed revoked tokens.
- [x] Maintain sub-50ms token generation latency.`,
    },
    {
      id: "adr",
      name: "ADR-004-AUTH.md",
      type: "Decision Log",
      badge: "LOG",
      badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      description:
        "Architecture Decision Records with context, decision, and consequences.",
      preview: `# ADR-004: Refresh Token Rotation (RTR) Strategy

## Status
Accepted (Auto-synced from Commit 7c4e2a1)

## Context
Replay attacks pose risks if long-lived refresh tokens are intercepted.

## Decision
Adopt strict Refresh Token Rotation with token family tracking.

## Consequences
- Requires Redis-backed revocation blacklist.
- Eliminates replay vulnerabilities across public clients.`,
    },
    {
      id: "api",
      name: "OPENAPI / REST",
      type: "Endpoints & Models",
      badge: "API",
      badgeColor: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      description:
        "RESTful route definitions, parameter schemas, and response types.",
      preview: `paths:
  /api/v2/auth/refresh:
    post:
      summary: Rotate OAuth2 Token Pair
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [refresh_token, client_id]
      responses:
        '200':
          description: New token pair issued`,
    },
  ];

  const faqs = [
    {
      q: "How does TracePath AI prevent hallucinations in technical documentation?",
      tag: "AST Accuracy",
      highlight: "Tree-sitter AST Syntax Verification · 0% Guesswork",
      a: "TracePath AI uses Tree-sitter AST (Abstract Syntax Tree) parsing to extract exact function signatures, endpoints, and schema diffs directly from code. Agent 2 uses deterministic prompt guardrails with confidence thresholds—if code has no architectural impact, it skips editing rather than guessing.",
    },
    {
      q: "Do you store or train AI models on our proprietary codebase?",
      tag: "Zero-Trust Security",
      highlight: "Ephemeral In-Memory RAM · Never Stored or Used for Training",
      a: "Zero Code Retention. Code is processed ephemerally in RAM during webhook evaluation and discarded immediately after generating the pull request. Your proprietary code is never cached, stored on permanent disk, or used to train any model.",
    },
    {
      q: "Can our engineering team review doc edits before anything merges to main?",
      tag: "Pull Request Guardrails",
      highlight: "Reviewable GitHub PR · Complete Human-in-the-Loop Control",
      a: "Yes! By default, TracePath AI opens a reviewable GitHub Pull Request with clear commit explanations, diff highlights, and assigned reviewers. You retain full control to inspect, edit, or approve changes before they hit production.",
    },
    {
      q: "How does TracePath AI handle large monorepos (Turborepo, Nx, Lerna)?",
      tag: "Monorepo Scalability",
      highlight: "Boundary-Aware Correlator · Zero Noisy Workspace Updates",
      a: "TracePath AI understands package boundaries. When a pull request touches `packages/api`, it correlates changes only to the relevant package READMEs and root architecture specs, avoiding noisy updates across unaffected workspaces.",
    },
    {
      q: "What GitHub permissions and OAuth scopes are required?",
      tag: "Fine-Grained Scopes",
      highlight: "Least-Privilege Repo Scope · No Org Admin Rights",
      a: "Only fine-grained repository access. We require read access to code for diff extraction and write access to pull requests. We never request organization admin, billing, or unrelated repository scopes.",
    },
  ];

  return (
    <div
      id="home"
      className="bg-[#FFFFFF] text-slate-900 min-h-screen overflow-x-clip overflow-y-visible"
    >
      {/* =========================================================================
          HERO SECTION (3D Robot, Purple Agent Halo, 4 Floating Cards & Sandwich Z-Stack)
         ========================================================================= */}
      <section className="relative pt-4 sm:pt-6 lg:pt-8 pb-16 sm:pb-24 pl-6 sm:pl-10 lg:pl-16 pr-0 w-full overflow-x-clip overflow-y-visible">
        {/* Soft Background Radial Ambient Glows */}
        <div className="absolute top-10 right-0 w-[730px] h-[730px] bg-gradient-to-br from-indigo-200/35 via-purple-200/20 to-cyan-200/25 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center min-h-[660px] lg:min-h-[720px] w-full">
          {/* LEFT COLUMN: Punchy Copy, Badges & CTAs (Elevated higher in front with z-30) */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-5 sm:space-y-6 text-left relative z-30 pr-4 sm:pr-8 transform -translate-y-6 sm:-translate-y-10 lg:-translate-y-14 xl:-translate-y-18 transition-transform">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF2FF] border border-[#C7D2FE] text-[#4F46E5] text-xs sm:text-[13px] font-semibold tracking-wide shadow-xs">
              <Sparkles className="w-4 h-4 text-[#4F46E5] fill-[#4F46E5]/20" />
              <span>Autonomous Multi-Agent Documentation Engine</span>
            </div>

            {/* Main Headline (Tri-Color Lifecycle Gradient) */}
            <h1 className="text-5xl sm:text-6xl lg:text-[4.25rem] xl:text-[5rem] font-black tracking-[-0.04em] text-[#0F172A] leading-[1.0] lg:leading-[0.98]">
              Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600">
                Code.
              </span>
              <br />
              Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500">
                Docs.
              </span>
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

            {/* Bottom 4-Column Feature Highlights Bar */}
            <div className="pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2 items-center relative z-30">
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

              <div className="flex items-center gap-2.5 sm:border-l sm:border-slate-200/80 sm:pl-3">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
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
          <div className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-end min-h-[580px] sm:min-h-[660px] lg:min-h-[720px] overflow-visible w-full">
            {/* Robot Container with Margin Offset to Prevent Stacking Context Trapping */}
            <div className="relative w-full max-w-[580px] sm:max-w-[660px] lg:max-w-[760px] xl:max-w-[840px] flex items-center justify-end -mt-10 sm:-mt-16 lg:-mt-20 xl:-mt-24 mr-0 lg:-mr-4 xl:-mr-8">
              {/* Layer 1 (Bottom of Sandwich): Purple Halo Ring at z-0 with bottom chord clipped */}
              <div className="absolute top-[3%] left-1/2 -translate-x-1/2 w-[540px] sm:w-[640px] lg:w-[740px] xl:w-[820px] h-[540px] sm:h-[640px] lg:h-[740px] xl:h-[820px] rounded-full bg-gradient-to-b from-purple-200/40 via-purple-100/30 to-indigo-100/20 border-[2px] border-white shadow-[0_0_60px_rgba(168,85,247,0.22)] pointer-events-none z-0 scale-100 sm:scale-105 lg:scale-115 xl:scale-120 [clip-path:inset(-80px_-80px_20%_-80px)]">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_14px_rgba(99,102,241,0.9)]" />
                <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)]" />
                <div className="absolute top-1/3 -left-1.5 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.9)]" />
              </div>

              {/* Layer 3 (Top of Sandwich, In Front of Header): Robot Image at z-10 */}
              <img
                src={heroRobotAgentImg}
                alt="TracePath AI Futuristic Android Engine"
                className="w-full h-auto object-contain select-none pointer-events-none relative z-10 scale-100 sm:scale-105 lg:scale-115 xl:scale-120 drop-shadow-[0_20px_45px_rgba(79,70,229,0.14)]"
              />

              {/* FLOATING CARD 1: Analyzing Repository... */}
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
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative mt-1">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full w-3/4 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* FLOATING CARD 2: Generating Documentation... */}
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
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative mt-1">
                    <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full w-4/5 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* FLOATING CARD 3: Compact GitHub Doc Checklist */}
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

              {/* FLOATING CARD 4: Code / Sync Terminal */}
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
          ECOSYSTEM & STACK COMPATIBILITY RIBBON (Directly Below Hero)
         ========================================================================= */}
      <section className="py-7 border-y border-stone-200/80 bg-white/60 backdrop-blur-sm">
        <div className="max-w-8xl mx-auto px-6 sm:px-10 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 uppercase tracking-widest shrink-0">
            <Activity className="w-4 h-4 text-indigo-500" />
            <span>Compatible Stacks & Monorepos</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-mono font-semibold text-slate-600">
            <span className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200 transition-colors">
              TypeScript / JS
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200 transition-colors">
              Python (FastAPI / Django)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200 transition-colors">
              Go (Golang)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200 transition-colors">
              Rust
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200 transition-colors">
              Turborepo & Nx
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200 transition-colors">
              Next.js
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200 transition-colors">
              Docker / K8s
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: INTERACTIVE LIVE CODE ➔ DOCS PIPELINE (How It Works)
         ========================================================================= */}
      <section
        id="features"
        className="py-24 bg-[#EAE2D4] border-b border-[#D8CEBC]"
      >
        <div className="max-w-8xl mx-auto px-6 sm:px-10 lg:px-16 space-y-14">
          {/* Header */}
          <div className="text-center space-y-4 max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs">
              <Workflow className="w-3.5 h-3.5 text-indigo-600" />
              <span>Interactive Pipeline Engine</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4rem] font-black text-[#0F172A] tracking-tight leading-[1.08]">
              Watch Code Changes Translate to Docs in Real-Time
            </h2>
            <p className="text-base sm:text-lg text-indigo-900 leading-relaxed font-medium max-w-2xl mx-auto">
              Click any stage in the autonomous 5-node pipeline to inspect the
              live AST diff, decision scoring, and generated pull request.
            </p>
          </div>

          {/* Interactive 5 Stage Navigator */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {demoStages.map((stage, idx) => {
              const isActive = activePipelineStep === idx;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActivePipelineStep(idx)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isActive
                      ? "bg-white border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/20"
                      : "bg-white/90 border-[#D8CEBC] hover:border-slate-400 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold ${isActive ? "text-indigo-600" : "text-slate-500"}`}
                    >
                      0{idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "bg-[#DDD3C2] text-slate-700 font-semibold"
                      }`}
                    >
                      {stage.badge}
                    </span>
                  </div>

                  <div>
                    <h3
                      className={`text-xs font-bold ${isActive ? "text-slate-900" : "text-slate-800"}`}
                    >
                      {stage.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {stage.agent}
                    </p>
                  </div>

                  <div
                    className={`h-1 w-full rounded-full ${isActive ? "bg-indigo-600" : "bg-[#DDD3C2]"}`}
                  />
                </button>
              );
            })}
          </div>

          {/* Live Dark Console Playground */}
          <div className="rounded-3xl bg-[#070B14] border border-slate-800 shadow-2xl overflow-hidden">
            {/* Console Window Header */}
            <div className="px-6 py-4 bg-[#0B1120] border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  tracepath-daemon · {demoStages[activePipelineStep].agent}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Deterministic 100%</span>
                </span>
                <span className="text-xs font-mono text-slate-400 px-2 py-1 rounded bg-slate-900 border border-slate-800">
                  Step {activePipelineStep + 1} of 5
                </span>
              </div>
            </div>

            {/* Console Code View */}
            <div className="p-6 sm:p-8 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto leading-relaxed">
              <pre className="whitespace-pre-wrap">
                {demoStages[activePipelineStep].content}
              </pre>
            </div>

            {/* Bottom Pipeline Progress Bar */}
            <div className="px-6 py-3.5 bg-[#0B1120]/70 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Ready for automatic review & merge</span>
              <button
                onClick={() =>
                  setActivePipelineStep(
                    (prev) => (prev + 1) % demoStages.length,
                  )
                }
                className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors font-semibold cursor-pointer"
              >
                <span>Next Stage ➔</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: MULTI-AGENT COMMAND CENTER (3 Specialized AI Agents)
         ========================================================================= */}
      <section className="py-24 bg-white border-b border-stone-200/80">
        <div className="max-w-8xl mx-auto px-6 sm:px-10 lg:px-16 space-y-14">
          {/* Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold font-mono bg-purple-50 text-purple-700 border border-purple-200/80 shadow-xs">
              <Bot className="w-3.5 h-3.5 text-purple-600" />
              <span>Multi-Agent Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight">
              Three Specialized AI Agents Working in Harmony
            </h2>
            <p className="text-base text-slate-500 leading-relaxed">
              Each AI agent executes an isolated, specialized responsibility to
              ensure zero hallucinations and surgical precision.
            </p>
          </div>

          {/* 3-Agent Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Agent 1 Card */}
            <div className="group relative p-8 rounded-3xl bg-[#FAF9F6] border border-stone-200 hover:border-indigo-500/50 hover:shadow-xl transition-all duration-300 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600">
                    <Brain className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                    Agent 1
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Change Analyzer Agent
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Parses raw AST syntax diffs across Git commits. Extracts
                  modified routes, function signatures, data models, and
                  architectural implications without guessing.
                </p>

                <div className="p-3 rounded-xl bg-white border border-stone-200 font-mono text-[11px] text-slate-600 space-y-1.5 shadow-inner">
                  <div className="flex items-center justify-between text-indigo-700 font-bold">
                    <span>Tree-Sitter Engine</span>
                    <span className="text-emerald-600">Active</span>
                  </div>
                  <p>• Function: rotate_refresh_token()</p>
                  <p>• Intent: FEATURE_ENHANCEMENT</p>
                  <p>• Schema: OAuth2 Token Rotation</p>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200/70 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Zero Hallucination</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>

            {/* Agent 2 Card */}
            <div className="group relative p-8 rounded-3xl bg-[#FAF9F6] border border-stone-200 hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                    Agent 2
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
                  Impact Planner Agent
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Correlates code changes against your existing documentation
                  matrix. Evaluates PRDs, Architecture diagrams, and ADRs with
                  confidence scores to eliminate spam PRs.
                </p>

                <div className="p-3 rounded-xl bg-white border border-stone-200 font-mono text-[11px] text-slate-600 space-y-1.5 shadow-inner">
                  <div className="flex items-center justify-between text-amber-700 font-bold">
                    <span>Impact Decision Matrix</span>
                    <span className="text-emerald-600">99.4% Match</span>
                  </div>
                  <p>• ARCHITECTURE.md: UPDATE REQUIRED</p>
                  <p>• ADR-004-AUTH.md: UPDATE REQUIRED</p>
                  <p>• PRD.md: SKIPPED (Up to Date)</p>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200/70 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Spam Filtered</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>

            {/* Agent 3 Card */}
            <div className="group relative p-8 rounded-3xl bg-[#FAF9F6] border border-stone-200 hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    Agent 3
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Documentation Generator
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Applies minimal, surgical Markdown diffs preserving your exact
                  formatting, line breaks, and heading hierarchy. Opens
                  ready-to-merge GitHub Pull Requests autonomously.
                </p>

                <div className="p-3 rounded-xl bg-white border border-stone-200 font-mono text-[11px] text-slate-600 space-y-1.5 shadow-inner">
                  <div className="flex items-center justify-between text-emerald-700 font-bold">
                    <span>Pull Request Author</span>
                    <span className="text-indigo-600">PR Ready</span>
                  </div>
                  <p>• Unified git diff formatting</p>
                  <p>• Preserves headings & styling</p>
                  <p>• Automated CI check pass</p>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200/70 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Autonomous Git Sync</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: TARGET DOCUMENT SPEC SWITCHER (Interactive File Previews)
         ========================================================================= */}
      <section className="py-24 bg-[#EAE2D4] border-b border-[#D8CEBC]">
        <div className="max-w-8xl mx-auto px-6 sm:px-10 lg:px-16 space-y-14">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold font-mono bg-cyan-50 text-cyan-800 border border-cyan-200/80 shadow-xs">
              <FileCode2 className="w-3.5 h-3.5 text-cyan-600" />
              <span>Supported Document Formats</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight">
              Surgically Maintained Without Format Drift
            </h2>
            <p className="text-base text-indigo-900 leading-relaxed font-medium">
              TracePath AI updates your standard documentation targets while
              strictly respecting your team's markdown conventions.
            </p>
          </div>

          {/* Interactive Document Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Tab List */}
            <div className="lg:col-span-5 space-y-3">
              {docTargets.map((doc) => {
                const isSelected = activeDocTab === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDocTab(doc.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-4 ${
                      isSelected
                        ? "bg-white border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/15"
                        : "bg-white/90 border-[#D8CEBC] hover:border-slate-400 hover:bg-white"
                    }`}
                  >
                    <div
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border shrink-0 ${doc.badgeColor}`}
                    >
                      {doc.badge}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900">
                          {doc.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-sans">
                          ({doc.type})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {doc.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Live File Preview Card */}
            <div className="lg:col-span-7 rounded-3xl bg-[#0B1120] border border-slate-800 shadow-2xl p-6 sm:p-8 text-slate-200 font-mono text-xs sm:text-sm leading-relaxed space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold">
                    {docTargets.find((d) => d.id === activeDocTab)?.name}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[10px]">
                  Syntax Verified
                </span>
              </div>

              <pre className="whitespace-pre-wrap overflow-x-auto text-slate-300">
                {docTargets.find((d) => d.id === activeDocTab)?.preview}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: ENTERPRISE CRYPTOGRAPHIC SECURITY (Bento Grid)
         ========================================================================= */}
      <section className="py-24 bg-white border-b border-stone-200/80">
        <div className="max-w-8xl mx-auto px-6 sm:px-10 lg:px-16 space-y-14">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero Trust Security</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight">
              Enterprise Cryptographic Privacy & Security
            </h2>
            <p className="text-base text-slate-500 leading-relaxed">
              Engineered with strict zero-code-retention protocols so your
              proprietary repository logic is never exposed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-7 rounded-3xl bg-[#FAF9F6] border border-stone-200 space-y-3 shadow-xs hover:shadow-md transition-all">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 w-fit">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Zero Code Retention
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Repository code is processed ephemerally in RAM and immediately
                discarded. Never cached, stored, or trained on.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#FAF9F6] border border-stone-200 space-y-3 shadow-xs hover:shadow-md transition-all">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 w-fit">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                AES-256 Token Encryption
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                GitHub credentials and personal access tokens are encrypted at
                rest using Fernet-authenticated cryptographic keys.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#FAF9F6] border border-stone-200 space-y-3 shadow-xs hover:shadow-md transition-all">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 border border-purple-500/20 w-fit">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Fine-Grained Scopes
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect only specific repositories with minimal read/write pull
                request permissions. No organization admin scopes needed.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#FAF9F6] border border-stone-200 space-y-3 shadow-xs hover:shadow-md transition-all">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 w-fit">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                HMAC-SHA256 Signatures
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every incoming webhook request is validated against your GitHub
                secret using constant-time cryptographic verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: DEVELOPER PRICING TIERS (#pricing)
         ========================================================================= */}
      <section
        id="pricing"
        className="py-24 bg-[#EAE2D4] border-b border-[#D8CEBC]"
      >
        <div className="max-w-8xl mx-auto px-6 sm:px-10 lg:px-16 space-y-14">
          {/* Header & Toggle */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Transparent Developer Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight">
              Predictable Plans for Every Stage
            </h2>
            <p className="text-base text-indigo-900 leading-relaxed font-medium">
              Start free forever on open-source and individual projects. Scale
              up for multi-package monorepos and team workflows.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <span
                className={`text-xs font-semibold ${!billingAnnual ? "text-slate-900" : "text-slate-500"}`}
              >
                Monthly
              </span>
              <button
                onClick={() => setBillingAnnual(!billingAnnual)}
                className="w-12 h-6 rounded-full bg-slate-300 p-1 relative transition-colors cursor-pointer"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-indigo-600 transition-transform ${billingAnnual ? "translate-x-6" : "translate-x-0"}`}
                />
              </button>
              <span
                className={`text-xs font-semibold ${billingAnnual ? "text-indigo-600" : "text-slate-500"}`}
              >
                Annual{" "}
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.06fr_1fr] gap-6 xl:gap-8 items-center pt-6 pb-8">
            {/* Plan 1: Developer / Open Source */}
            <div className="p-8 rounded-3xl bg-white border border-[#D8CEBC] space-y-6 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Open Source & Personal
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Developer
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Everything you need to automate documentation across public
                  repositories and side projects.
                </p>

                <div className="pt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">
                    $0
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    / forever
                  </span>
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-stone-100 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Unlimited Public Repositories</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Automated AST Diff Analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>README & PRD Synchronization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>GitHub Pull Request Authoring</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleAction}
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                Get Started Free
              </button>
            </div>

            {/* Plan 2: Team / Monorepo (Featured & Zoomed Pop-Up) */}
            <div className="p-8 sm:p-9 lg:p-10 lg:py-12 rounded-3xl bg-[#0B1120] text-white border-2 border-indigo-500 space-y-7 flex flex-col justify-between shadow-[0_25px_60px_-15px_rgba(79,70,229,0.35)] relative z-20 lg:scale-[1.05] xl:scale-[1.07] ring-1 ring-indigo-400/40 transition-all duration-300 hover:scale-[1.08] hover:shadow-[0_30px_70px_-15px_rgba(79,70,229,0.45)]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-[11px] font-mono font-extrabold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/30 flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                <span>Most Popular</span>
              </div>

              <div className="space-y-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                  Growing Teams & Monorepos
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">Team Pro</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Full multi-repository engine with Turborepo support and
                  priority webhook execution.
                </p>

                <div className="pt-2 flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-white">
                    {billingAnnual ? "$24" : "$29"}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    / repository · mo
                  </span>
                </div>

                <ul className="space-y-3 pt-4 border-t border-slate-800 text-xs sm:text-[13px] text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Everything in Developer, plus:</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Private Repositories Supported</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Turborepo & Nx Monorepo Awareness</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>ARCHITECTURE & ADR-*.md Sync</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Priority Webhook Execution Queue</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleAction}
                className="w-full py-4 rounded-2xl bg-[#A8203A] hover:bg-[#901B31] text-white font-extrabold text-sm shadow-xl shadow-[#A8203A]/30 transition-all cursor-pointer hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99]"
              >
                Connect GitHub & Start
              </button>
            </div>

            {/* Plan 3: Enterprise */}
            <div className="p-8 rounded-3xl bg-white border border-[#D8CEBC] space-y-6 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Custom Architecture & SLA
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Enterprise
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tailored deployments for enterprise organizations with custom
                  security and compliance needs.
                </p>

                <div className="pt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">
                    Custom
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    / annual SLA
                  </span>
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-stone-100 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Self-Hosted & VPC Runners</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Bring-Your-Own LLM API Keys</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>SSO, SAML & Okta Integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dedicated 99.99% Uptime SLA</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleAction}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Talk to Engineering
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: DEVELOPER FAQ ACCORDION (Interactive 2-Column Split)
         ========================================================================= */}
      <section className="py-24 bg-white border-b border-stone-200/80">
        <div className="max-w-8xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Authoritative Editorial Header & Direct Trust Card */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Developer Knowledge Base</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-[1.08]">
                  Everything You Need to Know
                </h2>
                <p className="text-base text-slate-600 leading-relaxed font-medium">
                  Engineered for mission-critical codebases. Transparent answers about AST parsing, zero-retention security, and automated Git pull request guardrails.
                </p>
              </div>

              {/* Developer Trust Card (Amber & Green Touch, No Navy Blue) */}
              <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#141510] via-[#16140D] to-[#0F1410] text-white border border-stone-800/80 shadow-2xl space-y-4 relative overflow-hidden">
                {/* Ambient Amber & Green Radial Glows */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-6 -left-6 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-start gap-3.5 relative z-10">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 text-amber-400 shrink-0 shadow-inner">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Enterprise Compliance Ready</h4>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                        VPC / SSO
                      </span>
                    </div>
                    <p className="text-xs text-stone-300/90 leading-relaxed">
                      Self-hosted VPC runners, custom LLM keys, and SSO integrations are available for security-first engineering teams.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Elevated Accordion Cards */}
            <div className="lg:col-span-7 space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden relative ${
                      isOpen
                        ? "bg-white border-emerald-600 shadow-xl shadow-emerald-500/15 ring-2 ring-emerald-500/20"
                        : "bg-[#FAF9F6] border-stone-200/90 hover:border-slate-300 hover:bg-white hover:shadow-md"
                    }`}
                  >
                    {/* Left Glowing Indicator Accent */}
                    {isOpen && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-600 via-teal-500 to-emerald-700" />
                    )}

                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-5 sm:p-6 text-left flex items-start sm:items-center justify-between gap-4 cursor-pointer group"
                    >
                      <div className="flex items-start sm:items-center gap-3.5 flex-1">
                        {/* Number Index */}
                        <span
                          className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                            isOpen
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-stone-200/80 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700"
                          }`}
                        >
                          0{idx + 1}
                        </span>

                        <div className="space-y-1">
                          {/* Tag */}
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                                isOpen
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold"
                                  : "bg-stone-200/60 text-slate-500"
                              }`}
                            >
                              {faq.tag}
                            </span>
                          </div>

                          <h3
                            className={`text-sm sm:text-base font-bold transition-colors ${
                              isOpen
                                ? "text-slate-900"
                                : "text-slate-800 group-hover:text-emerald-700"
                            }`}
                          >
                            {faq.q}
                          </h3>
                        </div>
                      </div>

                      {/* Rotating Tactile Chevron */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isOpen
                            ? "rotate-180 bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
                            : "bg-stone-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-700"
                        }`}
                      >
                        <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </button>

                    {/* Expanded Answer Body */}
                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-stone-100/90 space-y-3.5">
                        <p>{faq.a}</p>

                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] sm:text-xs font-mono text-emerald-800 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{faq.highlight}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: BOTTOM CALL TO ACTION BANNER
         ========================================================================= */}
      <section className="py-20 bg-[#EAE2D4]">
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="relative rounded-3xl bg-[#070B14] text-white p-8 sm:p-14 overflow-hidden shadow-2xl border border-slate-800">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center space-y-6 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Zero Manual Documentation Drift</span>
              </span>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                Ready to sync your documentation forever?
              </h2>

              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Connect your GitHub repository in 30 seconds. TracePath AI
                handles AST parsing, decision correlation, and pull request
                authoring automatically.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleAction}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#A8203A] hover:bg-[#901B31] text-white font-bold text-base shadow-xl shadow-[#A8203A]/30 border border-[#A8203A] transition-all cursor-pointer group"
                >
                  <Github className="w-5 h-5 text-white" />
                  <span>Connect GitHub</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE DEMO MODAL (For Header Demo Button)
         ========================================================================= */}
      <Modal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        title="TracePath AI Interactive Multi-Agent Pipeline Demo"
        maxWidth="2xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1.5 bg-stone-100 rounded-2xl">
            {demoStages.map((stage, idx) => (
              <button
                key={stage.id}
                onClick={() => setDemoStep(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                  demoStep === idx
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-stone-200/60"
                }`}
              >
                {stage.title}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
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

            <pre className="p-4 rounded-2xl bg-[#0B1120] text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
              {demoStages[demoStep].content}
            </pre>
          </div>

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
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 cursor-pointer"
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
