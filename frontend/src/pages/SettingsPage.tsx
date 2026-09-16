import React from 'react';
import { AgentConfigCard } from '../components/settings/AgentConfigCard';
import { WebhookSettings } from '../components/settings/WebhookSettings';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Cpu, ShieldCheck } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">System & AI Configuration</h2>
        <p className="text-xs text-slate-400 mt-0.5 font-mono">
          Manage 3 independent AI model configurations, webhook secrets, and pipeline rules
        </p>
      </div>

      {/* 3 AI Agents Configuration Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Independent AI Agent Engine
          </h3>
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
      </div>

      {/* Webhook & Security */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Integration & Webhook Ingestion
          </h3>
        </div>

        <WebhookSettings />
      </div>

      {/* Environment & Backend Version */}
      <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-100">Backend API Engine</h4>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            FastAPI + Async SQLAlchemy + PostgreSQL
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
