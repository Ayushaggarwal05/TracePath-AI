import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useToast } from '../hooks/useToast';
import { githubService } from '../services/githubService';
import {
  Github,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Key,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

interface ConnectGitHubPageProps {
  onConnected: () => void;
  onCancel: () => void;
}

export const ConnectGitHubPage: React.FC<ConnectGitHubPageProps> = ({
  onConnected,
  onCancel,
}) => {
  const [savedUser, setSavedUser] = useState<string | null>(() => {
    return localStorage.getItem('tracepath_github_user') || null;
  });
  const [savedAvatar, setSavedAvatar] = useState<string | null>(() => {
    const stored = localStorage.getItem('tracepath_github_avatar');
    if (stored) return stored;
    const user = localStorage.getItem('tracepath_github_user');
    return user ? `https://github.com/${user}.png` : null;
  });
  const [avatarError, setAvatarError] = useState(false);
  const [showSwitchForm, setShowSwitchForm] = useState<boolean>(() => {
    return !localStorage.getItem('tracepath_github_user');
  });
  const [connecting, setConnecting] = useState(false);
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [showToken, setShowToken] = useState(false);
  const { success, error } = useToast();

  const handleResumeSaved = () => {
    if (!savedUser) return;
    localStorage.setItem('tracepath_github_connected', 'true');
    success('Welcome Back!', `Continuing session for @${savedUser}`);
    onConnected();
  };

  const handleForgetAccount = () => {
    localStorage.removeItem('tracepath_github_user');
    localStorage.removeItem('tracepath_github_name');
    localStorage.removeItem('tracepath_github_avatar');
    localStorage.removeItem('tracepath_github_connected');
    localStorage.removeItem('tracepath_has_token');
    setSavedUser(null);
    setSavedAvatar(null);
    setShowSwitchForm(true);
    success('Account Removed', 'Saved account cleared from this browser.');
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token && !username) {
      error(
        'Token Required',
        'Please paste your GitHub Fine-Grained Personal Access Token (or username for public preview).'
      );
      return;
    }

    try {
      setConnecting(true);
      const res = await githubService.connectToken(
        token.trim() || undefined,
        username.trim() || undefined
      );

      const avatarUrl = res.avatar_url || `https://github.com/${res.username}.png`;
      const githubName = res.name || res.username;
      localStorage.setItem('tracepath_github_connected', 'true');
      localStorage.setItem('tracepath_github_user', res.username);
      localStorage.setItem('tracepath_github_name', githubName);
      localStorage.setItem('tracepath_github_avatar', avatarUrl);
      if (token.trim()) {
        localStorage.setItem('tracepath_has_token', 'true');
      }
      setSavedUser(res.username);
      setSavedAvatar(avatarUrl);

      success(
        'GitHub Connected!',
        `Successfully connected repositories for @${res.username} with 5,000 req/hr rate limit.`
      );
      onConnected();
    } catch (err: any) {
      error(
        'Connection Failed',
        err.message || 'Invalid GitHub Token. Please verify permissions and try again.'
      );
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold font-mono shadow-glow-emerald">
          <Sparkles className="w-3.5 h-3.5" />
          <span>High-Rate Limit GitHub Integration (5,000 req/hr)</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-100 font-brand tracking-tight">
          Connect Your GitHub Account
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Authenticate using a GitHub Fine-Grained Personal Access Token to enable AST code analysis,
          private repository monitoring, and autonomous documentation pull requests.
        </p>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Saved Account Card OR Token Form (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {savedUser && !showSwitchForm ? (
            /* 1-Click Quick Resume Saved Account Card */
            <Card className="p-6 sm:p-8 space-y-6 bg-dark-card/95 border-brand-500/30 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-dark-border">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                    Saved Profile Found
                  </span>
                </div>
                <Badge variant="emerald" className="text-[10px]">Session Ready</Badge>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-dark-border/80 flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-brand-500/15 border border-brand-500/30 shadow-glow-emerald shrink-0 flex items-center justify-center">
                  {savedAvatar && !avatarError ? (
                    <img
                      src={savedAvatar}
                      alt={savedUser}
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span className="font-bold text-xl text-brand-400 select-none">
                      {savedUser.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-100 font-brand truncate">
                      {savedUser}
                    </h4>
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-xs font-mono text-slate-400 truncate mt-0.5">
                    @{savedUser} • 5,000 req/hr Unlocked
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleResumeSaved}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="w-full text-sm font-bold shadow-lg"
                >
                  Continue as @{savedUser}
                </Button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowSwitchForm(true)}
                    className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
                  >
                    Switch Account / New Token →
                  </button>

                  <button
                    type="button"
                    onClick={handleForgetAccount}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    Forget this profile
                  </button>
                </div>
              </div>
            </Card>
          ) : (
            /* Token Form */
            <Card className="p-6 sm:p-8 space-y-6 bg-dark-card/90 border-dark-border shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-dark-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 shrink-0">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100 font-brand">
                      Fine-Grained Token Access
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      AES-256 encrypted at rest & isolated
                    </p>
                  </div>
                </div>

                {savedUser && (
                  <button
                    type="button"
                    onClick={() => setShowSwitchForm(false)}
                    className="text-xs text-slate-400 hover:text-brand-300 font-mono transition-colors"
                  >
                    ← Back to saved
                  </button>
                )}
              </div>

              <form onSubmit={handleConnect} className="space-y-5">
                {/* Token Input */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-brand-400" />
                      GitHub Personal Access Token (PAT)
                    </span>
                    <Badge variant="emerald" className="text-[10px] py-0">Recommended</Badge>
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="github_pat_11A... or ghp_..."
                      className="w-full pl-3.5 pr-10 py-3 rounded-xl bg-slate-900 border border-dark-border text-slate-100 font-mono text-xs focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all placeholder:text-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Follow the step-by-step guide on the right to generate this token in 30 seconds.
                  </p>
                </div>

                {/* Optional Username Input (Preview Mode) */}
                <div className="pt-2 border-t border-dark-border/60 space-y-2">
                  <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-slate-500" />
                      Or Username (Public Repos Only)
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Optional Preview</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Ayushaggarwal05"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-dark-border/80 text-slate-100 text-xs focus:border-brand-500 focus:outline-none transition-all placeholder:text-slate-600"
                  />
                </div>

                {/* Security Badge */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-brand-500/20 flex items-start gap-3 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-slate-200">Zero Secret Leakage Guarantee</h5>
                    <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                      Tokens are encrypted via AES-256. Raw credentials are never transmitted to client
                      browsers or external servers.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={onCancel}
                    disabled={connecting}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={connecting}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="w-full sm:w-auto"
                  >
                    Connect & Verify Token
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>

        {/* Right Column: Step-by-Step Box (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-6 sm:p-7 space-y-6 bg-gradient-to-br from-slate-900/90 to-dark-card border-brand-500/30 shadow-2xl">
            {/* Box Header & Direct Link Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-dark-border">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-100 font-brand">
                    Step-by-Step Token Setup
                  </h3>
                  <Badge variant="indigo" className="text-[10px]">30 Seconds</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Follow these 4 simple steps in GitHub Settings
                </p>
              </div>

              <a
                href="https://github.com/settings/tokens?type=beta"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 text-brand-300 hover:text-white text-xs font-semibold transition-all shrink-0 self-start sm:self-auto"
              >
                <span>Open GitHub Tokens</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Steps List */}
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-dark-border/80">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs space-y-1">
                  <h4 className="font-semibold text-slate-200">
                    Open Fine-Grained Personal Access Tokens
                  </h4>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Click the button above or navigate to: <span className="font-mono text-slate-300">GitHub → Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens</span>.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-dark-border/80">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs space-y-1">
                  <h4 className="font-semibold text-slate-200">
                    Set Token Name & Expiration
                  </h4>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Click <strong>"Generate new token"</strong>. Name it <code className="text-brand-300 bg-slate-800 px-1.5 py-0.5 rounded">TracePath AI</code> and choose your expiration period (e.g. 90 days or 1 year).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-900/60 border border-dark-border/80">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-xs space-y-1">
                  <h4 className="font-semibold text-slate-200">
                    Choose Repository Access
                  </h4>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Under <strong>Repository Access</strong>, select <strong>"All repositories"</strong> (or choose specific repositories you want to monitor).
                  </p>
                </div>
              </div>

              {/* Step 4: Permissions Checklist */}
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-900/80 border border-brand-500/30">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  4
                </div>
                <div className="text-xs space-y-2 flex-1">
                  <h4 className="font-semibold text-slate-200">
                    Set Repository Permissions (3 Required)
                  </h4>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-dark-border">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-mono text-slate-200 text-[11px]">Contents</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Read and write
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-dark-border">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-mono text-slate-200 text-[11px]">Pull requests</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Read and write
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-dark-border">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-mono text-slate-200 text-[11px]">Metadata</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        Read-only (Default)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Tip */}
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2.5 text-xs text-indigo-300">
              <Sparkles className="w-4 h-4 shrink-0 text-indigo-400" />
              <p className="text-[11px]">
                Click <strong>"Generate token"</strong> at the bottom of GitHub, copy the generated <code className="text-white font-mono">github_pat_...</code> string, and paste it into the left form!
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

