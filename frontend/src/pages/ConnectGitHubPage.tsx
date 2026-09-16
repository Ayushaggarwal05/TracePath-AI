import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useToast } from '../hooks/useToast';
import { Github, ShieldCheck, Check, ArrowRight } from 'lucide-react';

interface ConnectGitHubPageProps {
  onConnected: () => void;
  onCancel: () => void;
}

export const ConnectGitHubPage: React.FC<ConnectGitHubPageProps> = ({
  onConnected,
  onCancel,
}) => {
  const [connecting, setConnecting] = useState(false);
  const { success } = useToast();

  const handleConnect = () => {
    setConnecting(true);
    // Simulate OAuth handshake
    setTimeout(() => {
      setConnecting(false);
      success('GitHub Connected', 'Successfully authorized TracePath AI GitHub App.');
      onConnected();
    }, 1200);
  };

  const permissions = [
    {
      title: 'Repository Metadata & Contents',
      desc: 'Read code diffs and commit messages to understand changes.',
      level: 'Read-only',
    },
    {
      title: 'Pull Requests & Issues',
      desc: 'Create automated documentation update pull requests.',
      level: 'Read & Write',
    },
    {
      title: 'Webhooks',
      desc: 'Receive immediate push and pull request events.',
      level: 'Subscribe',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="text-center space-y-3 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-dark-border flex items-center justify-center mx-auto text-slate-100 shadow-xl">
          <Github className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Connect GitHub Account</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Authorize TracePath AI to inspect code changes and submit autonomous documentation pull requests.
        </p>
      </div>

      <Card className="p-8 space-y-6">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Requested GitHub App Permissions
          </h4>
          <div className="space-y-3">
            {permissions.map((p, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-dark-border"
              >
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-200">{p.title}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">{p.desc}</p>
                  </div>
                </div>
                <Badge variant="slate" className="text-[10px] shrink-0">
                  {p.level}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h5 className="font-semibold text-slate-200">Security & Privacy First</h5>
            <p className="text-slate-400 mt-0.5 leading-relaxed">
              TracePath AI only analyzes code diffs on configured branches. Your full codebase is never
              stored or used for AI training.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-dark-border flex items-center justify-between">
          <Button variant="ghost" size="md" onClick={onCancel} disabled={connecting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleConnect}
            isLoading={connecting}
            leftIcon={<Github className="w-4 h-4" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Authorize TracePath AI
          </Button>
        </div>
      </Card>
    </div>
  );
};
