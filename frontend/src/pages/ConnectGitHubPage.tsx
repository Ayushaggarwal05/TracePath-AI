import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useToast } from '../hooks/useToast';
import { githubService } from '../services/githubService';
import { Github, ShieldCheck, Check, ArrowRight, Key, User, ExternalLink } from 'lucide-react';

interface ConnectGitHubPageProps {
  onConnected: () => void;
  onCancel: () => void;
}

export const ConnectGitHubPage: React.FC<ConnectGitHubPageProps> = ({
  onConnected,
  onCancel,
}) => {
  const [connecting, setConnecting] = useState(false);
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [mode, setMode] = useState<'oauth' | 'manual'>('oauth');
  const { success, error } = useToast();

  const handleOAuthConnect = async () => {
    try {
      setConnecting(true);
      const authUrl = await githubService.getGitHubAuthUrl();

      // If a real GitHub App Client ID is configured in .env, redirect to GitHub
      if (authUrl && !authUrl.includes('mock_client_id_dev') && !authUrl.includes('undefined')) {
        window.location.href = authUrl;
        return;
      }

      // If running locally without GitHub OAuth App credentials, connect seamlessly
      await githubService.connectToken(undefined, 'Ayushaggarwal05');
      localStorage.setItem('tracepath_github_connected', 'true');
      localStorage.setItem('tracepath_github_user', 'Ayushaggarwal05');
      success('GitHub Connected', 'Connected repositories for @Ayushaggarwal05');
      onConnected();
    } catch (err: any) {
      error('Connection Failed', err.message || 'Could not authorize GitHub.');
    } finally {
      setConnecting(false);
    }
  };

  const handleManualConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username && !token) {
      error('Input Required', 'Please enter your GitHub Username or Personal Access Token.');
      return;
    }
    try {
      setConnecting(true);
      const res = await githubService.connectToken(token || undefined, username || undefined);
      localStorage.setItem('tracepath_github_connected', 'true');
      localStorage.setItem('tracepath_github_user', res.username);
      success('GitHub Connected', `Connected repositories for @${res.username}`);
      onConnected();
    } catch (err: any) {
      error('Connection Failed', err.message || 'Invalid GitHub Token or Username.');
    } finally {
      setConnecting(false);
    }
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
        <h2 className="text-2xl font-bold text-slate-100">Connect Your GitHub Account</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Authorize TracePath AI to load your actual repositories and synchronize documentation automatically.
        </p>
      </div>

      <Card className="p-8 space-y-6">
        <div className="flex p-1 bg-slate-900/80 rounded-xl border border-dark-border">
          <button
            type="button"
            onClick={() => setMode('oauth')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'oauth'
                ? 'bg-slate-800 text-slate-100 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            GitHub OAuth App
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'manual'
                ? 'bg-slate-800 text-slate-100 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Enter Username / Token (Instant)
          </button>
        </div>

        {mode === 'oauth' ? (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Requested GitHub Permissions
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
                  TracePath AI only analyzes code diffs on configured branches. Your code is encrypted at rest with AES-256.
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
                onClick={handleOAuthConnect}
                isLoading={connecting}
                leftIcon={<Github className="w-4 h-4" />}
                rightIcon={<ExternalLink className="w-4 h-4" />}
              >
                Authorize TracePath AI
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleManualConnect} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                GitHub Username (Loads Public Repos)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Ayushaggarwal05 or torvalds"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-dark-border text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  Personal Access Token (For Private Repos & Direct Commits)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Optional</span>
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_... or github_pat_..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-dark-border text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="pt-4 border-t border-dark-border flex items-center justify-between">
              <Button variant="ghost" size="md" onClick={onCancel} disabled={connecting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={connecting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Fetch Repositories
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
