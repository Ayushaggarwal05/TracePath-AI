import React, { useState } from "react";
import {
  Github,
  Twitter,
  Linkedin,
  ShieldCheck,
  CheckCircle2,
  ArrowUp,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Zap,
  Send,
  Lock,
  Check,
  FileCode2,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Bot,
  Cpu,
  Workflow,
  FolderGit2,
  Layers,
  Terminal,
  Play,
} from "lucide-react";

interface FooterProps {
  onNavigateToLanding?: () => void;
  onConnectGitHub?: () => void;
  onNavigateToApp?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateToLanding,
  onConnectGitHub,
  onNavigateToApp,
}) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail("");
      }, 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogoClick = () => {
    if (onNavigateToLanding) {
      onNavigateToLanding();
    } else {
      scrollToTop();
    }
  };

  const handleAction = () => {
    if (onConnectGitHub) {
      onConnectGitHub();
    } else if (onNavigateToApp) {
      onNavigateToApp();
    }
  };

  return (
    <footer className="relative bg-[#070B14] text-slate-300 border-t border-slate-800/80 overflow-hidden font-sans z-0">
      {/* Dynamic Multi-Color Glow Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/60 via-purple-500/60 to-transparent" />

      {/* Living Ambient Radial Glow Mesh in Background */}
      <div className="absolute top-0 left-1/4 w-[680px] h-[340px] bg-indigo-600/12 rounded-full blur-[140px] pointer-events-none -z-0 animate-pulse-glow" />
      <div className="absolute bottom-10 right-1/4 w-[580px] h-[320px] bg-purple-600/12 rounded-full blur-[140px] pointer-events-none -z-0 animate-pulse-glow" />

      {/* =========================================================================
          TOP BANNER: Stay Ahead Newsletter + Living Agent Health Beacon
          (max-w-8xl mx-auto maintained for broad cinematic width)
         ========================================================================= */}
      <div className="relative z-10 border-b border-slate-800/80 bg-[#0B1120]/75 backdrop-blur-xl">
        <div className="max-w-8xl mx-auto px-6 sm:px-10 lg:px-16 py-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left: Typographic Narrative */}
          <div className="w-full lg:w-auto space-y-1.5 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2.5 text-white font-bold text-base sm:text-[17px] tracking-tight">
              <div className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>Stay Ahead with Autonomous Developer Tools</span>
            </div>
            <p className="text-[13px] sm:text-sm text-slate-400 font-normal leading-relaxed max-w-xl">
              Receive major AI architecture changelogs, AST analyzer updates,
              and automated documentation releases.
            </p>
          </div>

          {/* Right: Modern Subscription Input & Live Telemetry Chip */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3.5">
            <form
              onSubmit={handleSubscribe}
              className="relative w-full sm:w-84"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                required
                className="w-full pl-4 pr-28 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/25 transition-all font-mono shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:shadow-indigo-500/25"
              >
                {subscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Joined!</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <Send className="w-3 h-3 text-indigo-200" />
                  </>
                )}
              </button>
            </form>

            {/* Living Agent Telemetry Beacon */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-xs font-mono text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.12)] shrink-0 group">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </span>
              <span className="font-semibold text-emerald-200">
                3 AI Agents Active
              </span>
              <span className="text-emerald-700">·</span>
              <span className="text-emerald-400/90 text-[11px]">
                99.98% Uptime
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN MULTI-COLUMN GRID: Calibrated Typographic Hierarchy & Rich Symbols
          (max-w-8xl mx-auto maintained for broad layout)
         ========================================================================= */}
      <div className="relative z-10 max-w-8xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          {/* Column 1: Brand Info, Value Prop & Trust Badges (Spans 4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group select-none w-fit"
              onClick={handleLogoClick}
              title="TracePath AI Home"
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-500/25 blur-md rounded-full group-hover:bg-indigo-500/45 transition-all" />
                <img
                  src="/logo-icon.png"
                  alt="TracePath AI Logo"
                  className="relative w-9 h-9 object-contain drop-shadow-[0_0_14px_rgba(129,140,248,0.7)] group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex items-center gap-1 font-brand">
                <span className="font-extrabold text-2xl tracking-tight text-white group-hover:text-slate-100 transition-colors">
                  TracePath
                </span>
                <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  AI
                </span>
              </div>
            </div>

            {/* Value Proposition Narrative */}
            <p className="text-[13.5px] sm:text-sm text-slate-400 font-normal leading-relaxed max-w-sm">
              The autonomous GitHub-native documentation engine. We analyze AST
              diffs, correlate code commits, and continuously author pull
              requests to keep your PRDs, Architecture diagrams, and READMEs in
              sync without manual drift.
            </p>

            {/* Trust & Security Cards with High-Precision Symbols */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition-colors">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="text-slate-200 font-semibold block">
                    Zero Code Retention Guarantee
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Repository code is ephemeral and never used for training
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-colors">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="text-slate-200 font-semibold block">
                    Fine-Grained GitHub OAuth
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Least-privilege tokens with cryptographic verification
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="text-slate-200 font-semibold block">
                    Monorepo & Polyrepo Native
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Full support for Turborepo, Nx, and multi-package trees
                  </span>
                </div>
              </div>
            </div>

            {/* Social Links & Version Release Pill */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-slate-400 hover:text-white transition-all hover:scale-105 shadow-xs"
                title="GitHub Repository"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-slate-400 hover:text-white transition-all hover:scale-105 shadow-xs"
                title="Twitter / X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-slate-400 hover:text-white transition-all hover:scale-105 shadow-xs"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>

              <button
                onClick={handleAction}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-mono font-medium text-slate-300 hover:text-white transition-all cursor-pointer shadow-xs group"
              >
                <GitBranch className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-12 transition-transform" />
                <span>v1.0.4 Release</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            </div>
          </div>

          {/* Column 2: Product & Capabilities (Spans 2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Section Eyebrow Header: Optical Contrast Theory (11px Uppercase Monospace with Icon Badge) */}
            <div className="flex items-center gap-2 text-white font-mono font-bold text-[11px] uppercase tracking-[0.18em]">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <span>Platform</span>
            </div>

            {/* Navigation List: Calibrated 13.5px Medium Weight with Hover Physics */}
            <ul className="space-y-2.5 text-[13.5px]">
              <li>
                <a
                  href="#features"
                  className="text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-between group py-0.5"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Autonomous AST Parser
                  </span>
                  <GitCommit className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-between group py-0.5"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Multi-Agent Pipeline
                  </span>
                  <Workflow className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-between group py-0.5"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Automated PR Author
                  </span>
                  <GitPullRequest className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-between group py-0.5"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Architecture & ADR Sync
                  </span>
                  <Layers className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-between group py-0.5"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Monorepo Multi-Package
                  </span>
                  <FolderGit2 className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-slate-400 hover:text-white transition-all duration-200 flex items-center justify-between group py-0.5"
                >
                  <span className="group-hover:translate-x-1 transition-transform">
                    Changelog Generation
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors opacity-0 group-hover:opacity-100" />
                </a>
              </li>
              <li className="pt-1">
                <span className="inline-flex items-center gap-1.5 text-slate-500 text-xs font-mono">
                  <Terminal className="w-3.5 h-3.5 text-slate-600" />
                  <span>CLI Companion</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-400 border border-indigo-800/60 font-semibold">
                    v0.9 Beta
                  </span>
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Documentation Targets (Spans 2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Section Eyebrow Header: Optical Contrast Theory */}
            <div className="flex items-center gap-2 text-white font-mono font-bold text-[11px] uppercase tracking-[0.18em]">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileCode2 className="w-3.5 h-3.5" />
              </div>
              <span>Doc Targets</span>
            </div>

            {/* Rich File Target Badges with Specialized Extensions */}
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="#docs"
                  className="group flex items-center justify-between p-1.5 -mx-1.5 rounded-lg hover:bg-slate-900/80 transition-all"
                >
                  <div className="flex items-center gap-2 font-mono text-[12px] text-slate-300 group-hover:text-white transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>README.md</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-cyan-950/70 text-cyan-400 border border-cyan-800/50">
                    MD
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#docs"
                  className="group flex items-center justify-between p-1.5 -mx-1.5 rounded-lg hover:bg-slate-900/80 transition-all"
                >
                  <div className="flex items-center gap-2 font-mono text-[12px] text-slate-300 group-hover:text-white transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>PRD.md</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-amber-950/70 text-amber-400 border border-amber-800/50">
                    SPEC
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#docs"
                  className="group flex items-center justify-between p-1.5 -mx-1.5 rounded-lg hover:bg-slate-900/80 transition-all"
                >
                  <div className="flex items-center gap-2 font-mono text-[12px] text-slate-300 group-hover:text-white transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>ARCHITECTURE.md</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-purple-950/70 text-purple-400 border border-purple-800/50">
                    DIAG
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#docs"
                  className="group flex items-center justify-between p-1.5 -mx-1.5 rounded-lg hover:bg-slate-900/80 transition-all"
                >
                  <div className="flex items-center gap-2 font-mono text-[12px] text-slate-300 group-hover:text-white transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>ADR-*.md</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-950/70 text-emerald-400 border border-emerald-800/50">
                    LOG
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#docs"
                  className="group flex items-center justify-between p-1.5 -mx-1.5 rounded-lg hover:bg-slate-900/80 transition-all"
                >
                  <div className="flex items-center gap-2 font-mono text-[12px] text-slate-300 group-hover:text-white transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>OpenAPI / REST</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-rose-950/70 text-rose-400 border border-rose-800/50">
                    API
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#docs"
                  className="group flex items-center justify-between p-1.5 -mx-1.5 rounded-lg hover:bg-slate-900/80 transition-all"
                >
                  <div className="flex items-center gap-2 font-mono text-[12px] text-slate-300 group-hover:text-white transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Database Schemas</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-blue-950/70 text-blue-400 border border-blue-800/50">
                    SQL
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: AI Engine Architecture (Spans 2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Section Eyebrow Header: Optical Contrast Theory */}
            <div className="flex items-center gap-2 text-white font-mono font-bold text-[11px] uppercase tracking-[0.18em]">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span>AI Engine</span>
            </div>

            {/* Architecture Node Telemetry */}
            <ul className="space-y-2.5 text-xs font-mono">
              <li className="p-1.5 -mx-1.5 rounded-lg bg-slate-900/40 border border-slate-800/60 hover:border-purple-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-semibold">
                    Agent 1: AST
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
                  Semantic Diff Parser
                </span>
              </li>

              <li className="p-1.5 -mx-1.5 rounded-lg bg-slate-900/40 border border-slate-800/60 hover:border-purple-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-semibold">
                    Agent 2: Decision
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
                  Impact Matrix Correlator
                </span>
              </li>

              <li className="p-1.5 -mx-1.5 rounded-lg bg-slate-900/40 border border-slate-800/60 hover:border-purple-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-semibold">
                    Agent 3: Author
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
                  GitHub PR Auto-Sync
                </span>
              </li>

              <li className="pt-0.5">
                <div className="text-[11px] text-slate-400 hover:text-slate-300 transition-colors flex items-center justify-between">
                  <span>ChromaDB Vector Store</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    Memory
                  </span>
                </div>
              </li>
              <li>
                <div className="text-[11px] text-slate-400 hover:text-slate-300 transition-colors flex items-center justify-between">
                  <span>FastAPI Daemon Engine</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    Async
                  </span>
                </div>
              </li>
              <li>
                <div className="text-[11px] text-slate-400 hover:text-slate-300 transition-colors flex items-center justify-between">
                  <span>Zero Hallucination Guard</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                    Verified
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 5: Direct Action & Navigation (Spans 2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Section Eyebrow Header: Optical Contrast Theory */}
            <div className="flex items-center gap-2 text-white font-mono font-bold text-[11px] uppercase tracking-[0.18em]">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span>Get Started</span>
            </div>

            {/* Action Links & High-Contrast CTA Button */}
            <div className="space-y-3">
              {/* Primary Connect Button in Signature Crimson Red */}
              <button
                onClick={handleAction}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#A8203A] hover:bg-[#901B31] text-white text-xs font-bold shadow-lg shadow-[#A8203A]/25 border border-[#A8203A] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer group"
              >
                <Github className="w-3.5 h-3.5 text-white" />
                <span>Connect GitHub</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onNavigateToApp}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-xs group"
              >
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Developer Console</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </button>

              <ul className="space-y-2 pt-1 text-[13px]">
                <li>
                  <a
                    href="#pricing"
                    className="text-slate-400 hover:text-white transition-colors flex items-center justify-between group"
                  >
                    <span>Pricing & Tiers</span>
                    <span className="text-[10px] font-mono text-slate-500 group-hover:text-indigo-400">
                      #free
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-slate-400 hover:text-white transition-colors flex items-center justify-between group"
                  >
                    <span>Interactive Pipeline</span>
                    <Play className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
                  </a>
                </li>
                <li>
                  <span className="text-slate-500 text-xs flex items-center justify-between">
                    <span>Enterprise SLA</span>
                    <span className="text-[9px] font-mono text-slate-600">
                      99.99%
                    </span>
                  </span>
                </li>
                <li>
                  <span className="text-slate-500 text-xs flex items-center justify-between">
                    <span>Privacy Policy</span>
                    <span className="text-[9px] font-mono text-slate-600">
                      SOC2
                    </span>
                  </span>
                </li>
                <li>
                  <span className="text-slate-500 text-xs">
                    Terms of Service
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM SUB-FOOTER BAR: Monospace Precision, Zero Drift Guarantee, Smooth Top
          (max-w-8xl mx-auto maintained for broad layout)
         ========================================================================= */}
      <div className="relative z-10 border-t border-slate-800/80 bg-[#04070E] py-6 px-6 sm:px-10 lg:px-16">
        <div className="max-w-8xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          {/* Copyright & Core Mission Telemetry */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
            <span className="text-slate-300 font-semibold">
              © 2026 TracePath AI, Inc.
            </span>
            <span className="text-slate-600">·</span>
            <span>Autonomous GitHub-Native Documentation Engine</span>
            <span className="hidden lg:inline text-slate-600">·</span>
            <span className="hidden lg:inline text-indigo-400 font-medium">
              Deterministic AST Synthesis
            </span>
          </div>

          {/* Guarantee Chip & Living Back to Top Button */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-emerald-400">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Zero Manual Drift Guarantee</span>
            </div>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-xs"
              title="Scroll back to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5 text-indigo-400 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
