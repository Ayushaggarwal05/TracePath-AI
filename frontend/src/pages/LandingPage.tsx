import React from 'react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  Github,
  Brain,
  Sparkles,
  FileCode,
  GitCommit,
  GitPullRequest,
} from 'lucide-react';

interface LandingPageProps {
  onConnectGitHub: () => void;
  onGetStarted?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onConnectGitHub,
}) => {
  const steps = [
    {
      num: '01',
      title: 'Code Changes',
      desc: 'Engineers push code or open pull requests on GitHub.',
      icon: <GitCommit className="w-5 h-5 text-indigo-400" />,
      tag: 'GitHub Event',
    },
    {
      num: '02',
      title: 'AI Understands',
      desc: 'Agent 1 parses the semantic change without hallucinating facts.',
      icon: <Brain className="w-5 h-5 text-indigo-300" />,
      tag: 'Analysis Agent',
    },
    {
      num: '03',
      title: 'Doc Impact',
      desc: 'Agent 2 correlates diffs against PRD, Architecture, and ADR docs.',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      tag: 'Decision Agent',
    },
    {
      num: '04',
      title: 'Doc Update',
      desc: 'Agent 3 generates minimal, targeted documentation edits & unified diffs.',
      icon: <FileCode className="w-5 h-5 text-emerald-400" />,
      tag: 'Generator Agent',
    },
    {
      num: '05',
      title: 'Automatic Sync',
      desc: 'Backend commits the documentation diff or opens a pull request.',
      icon: <GitPullRequest className="w-5 h-5 text-brand-400" />,
      tag: 'GitHub Sync',
    },
  ];

  return (
    <div className="space-y-24 py-12 px-6 sm:px-12 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold tracking-wide shadow-glow-emerald">
          <img src="/logo-icon.png" alt="TracePath AI" className="w-4 h-4 object-contain" />
          <span>Production Multi-Agent Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-tight sm:leading-none">
          Keep your engineering documentation{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-emerald-300 to-indigo-400">
            synchronized with your code.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Autonomous, GitHub-native synchronization. Three independent AI agents understand code changes,
          evaluate documentation impact, and commit minimal updates without manual overhead.
        </p>

        <div className="flex items-center justify-center pt-4">
          <Button
            size="lg"
            variant="primary"
            onClick={onConnectGitHub}
            leftIcon={<Github className="w-5 h-5 text-white" />}
            className="px-8 py-3.5 text-base font-semibold shadow-xl"
          >
            Connect GitHub
          </Button>
        </div>
      </section>

      {/* Interactive Workflow Visualizer */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="indigo">Autonomous Pipeline</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            How TracePath AI Keeps Docs Synchronized
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            From code commit to validated documentation pull request in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((step, idx) => (
            <Card
              key={idx}
              className="relative flex flex-col justify-between bg-dark-card/80 border-dark-border hover:border-brand-500/40 transition-all hover:shadow-glow-emerald p-5"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-extrabold text-slate-500">
                    {step.num}
                  </span>
                  <Badge variant="slate" className="text-[10px]">
                    {step.tag}
                  </Badge>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-dark-border w-fit mb-4">
                  {step.icon}
                </div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 3 AI Agents Showcase */}
      <section className="p-8 sm:p-12 rounded-3xl bg-slate-950 border border-dark-border space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="emerald">Independent AI Configurations</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Three Dedicated AI Agents, Zero Hallucinations
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Specialized agents collaborate with strict validation schemas to prevent unnecessary doc churn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 w-fit">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-100">Agent 1: Analysis Agent</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Extracts precise semantic changes, purpose, and affected components from git diffs without guessing.
              </p>
            </div>
            <div className="pt-3 border-t border-dark-border/60 text-xs font-mono text-slate-500">
              Output: Structured JSON Analysis
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 w-fit">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-100">Agent 2: Decision Agent</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Evaluates PRD.md, ARCHITECTURE.md, and ADRs. Skips bugfixes and targets only affected documents.
              </p>
            </div>
            <div className="pt-3 border-t border-dark-border/60 text-xs font-mono text-slate-500">
              Output: Per-Document Decision Plan
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-dark-card border border-dark-border space-y-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 w-fit">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-100">Agent 3: Doc Generator</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Produces minimal targeted markdown edits while preserving existing hierarchy and styling.
              </p>
            </div>
            <div className="pt-3 border-t border-dark-border/60 text-xs font-mono text-slate-500">
              Output: Minimal Unified Git Diff
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="text-center p-12 rounded-3xl bg-gradient-to-b from-brand-950/40 to-slate-950 border border-brand-500/30 shadow-glow-emerald space-y-6">
        <h2 className="text-3xl font-extrabold text-slate-100">
          Ready to eliminate documentation drift?
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Connect your GitHub account in 30 seconds and activate autonomous synchronization on your repositories.
        </p>
        <Button
          size="lg"
          variant="primary"
          onClick={onConnectGitHub}
          leftIcon={<Github className="w-5 h-5" />}
        >
          Connect GitHub Now
        </Button>
      </section>
    </div>
  );
};
