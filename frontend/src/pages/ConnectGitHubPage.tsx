import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import {
  Github,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Key,
  ExternalLink,
  Eye,
  EyeOff,
  Zap,
  Info,
} from 'lucide-react';

interface ConnectGitHubPageProps {
  onConnected: () => void;
  onCancel: () => void;
}

export const ConnectGitHubPage: React.FC<ConnectGitHubPageProps> = ({
  onConnected,
  onCancel,
}) => {
  const { refreshUser } = useAuth();
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

  const handleResumeSaved = async () => {
    if (!savedUser) return;
    localStorage.setItem('tracepath_github_connected', 'true');
    await refreshUser();
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
      const res = await authService.connectGitHub(
        token.trim() || undefined,
        username.trim() || undefined
      );

      const avatarUrl = res.user?.github_avatar_url || `https://github.com/${res.github_username}.png`;
      const githubName = res.user?.full_name || res.github_username;
      localStorage.setItem('tracepath_github_connected', 'true');
      localStorage.setItem('tracepath_github_user', res.github_username);
      localStorage.setItem('tracepath_github_name', githubName);
      localStorage.setItem('tracepath_github_avatar', avatarUrl);
      if (token.trim()) {
        localStorage.setItem('tracepath_has_token', 'true');
      }
      setSavedUser(res.github_username);
      setSavedAvatar(avatarUrl);

      await refreshUser();

      success(
        'GitHub Connected!',
        `Successfully linked @${res.github_username} to your account with ${res.repositories_imported} repositories imported.`
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
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 text-slate-100">
      {/* Top Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold font-mono shadow-lg">
          <Zap className="w-4 h-4 fill-emerald-400 text-emerald-400" />
          <span>High-Rate Limit GitHub Integration (5,000 req/hr)</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-brand tracking-tight">
          Connect Your GitHub Account
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
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
            <div className="p-6 sm:p-8 space-y-6 bg-[#0B111F] border border-emerald-500/30 rounded-3xl shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                    Saved Profile Found
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Session Ready
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#060913] border border-slate-800 flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-indigo-500/20 border border-indigo-500/40 shrink-0 flex items-center justify-center">
                  {savedAvatar && !avatarError ? (
                    <img
                      src={savedAvatar}
                      alt={savedUser}
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span className="font-bold text-xl text-indigo-400 select-none">
                      {savedUser.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white font-brand truncate">
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
                    className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
                  >
                    Switch Account / New Token →
                  </button>

                  <button
                    type="button"
                    onClick={handleForgetAccount}
                    className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Forget this profile
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Token Form */
            <div className="p-6 sm:p-8 space-y-6 bg-[#0B111F] border border-slate-800 rounded-3xl shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-brand">
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
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-mono transition-colors cursor-pointer"
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
                      <Key className="w-3.5 h-3.5 text-indigo-400" />
                      GitHub Personal Access Token (PAT)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                      Recommended
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="github_pat_11A... or ghp_..."
                      className="w-full pl-3.5 pr-10 py-3 rounded-xl bg-[#060913] border border-slate-700 text-white font-mono text-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-slate-500 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title={showToken ? 'Hide token' : 'Show token'}
                    >
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                    <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    Follow the step-by-step setup guide on the right to generate this token in 30 seconds.
                  </p>
                </div>

                {/* Optional Username Input (Preview Mode) */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-slate-400" />
                      Or Username (Public Repos Only)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Optional Preview</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. octocat or your-github-username"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060913] border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-500"
                  />
                </div>

                {/* Security Badge */}
                <div className="p-3.5 rounded-xl bg-[#060913] border border-emerald-500/30 flex items-start gap-3 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-white">Zero Secret Leakage Guarantee</h5>
                    <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                      Tokens are encrypted via AES-256. Raw credentials are never stored in plain text or transmitted to external servers.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={onCancel}
                    disabled={connecting}
                    className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={connecting}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="w-full sm:w-auto font-bold shadow-lg"
                  >
                    Connect & Verify Token
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Step-by-Step Box (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 sm:p-7 space-y-6 bg-[#0B111F] border border-slate-800 rounded-3xl shadow-2xl">
            {/* Box Header & Direct Link Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white font-brand">
                    Step-by-Step Token Setup
                  </h3>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                    30 Seconds
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Follow these 4 simple steps in GitHub Settings
                </p>
              </div>

              <a
                href="https://github.com/settings/tokens?type=beta"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 hover:text-white text-xs font-semibold transition-all shrink-0 self-start sm:self-auto cursor-pointer shadow-sm"
              >
                <span>Open GitHub Tokens</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Steps List */}
            <div className="space-y-3.5">
              {/* Step 1 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#0F172A] border border-slate-700/80">
                <div className="w-6 h-6 rounded-full bg-indigo-500/25 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-white">
                    Open Fine-Grained Personal Access Tokens
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Click the button above or navigate to: <span className="font-mono text-indigo-200 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700">GitHub → Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens</span>.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#0F172A] border border-slate-700/80">
                <div className="w-6 h-6 rounded-full bg-indigo-500/25 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-white">
                    Set Token Name & Expiration
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Click <strong>"Generate new token"</strong>. Name it <code className="text-indigo-200 bg-slate-900 px-1.5 py-0.5 rounded font-mono border border-slate-700">TracePath AI</code> and choose your expiration period (e.g. 90 days or 1 year).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#0F172A] border border-slate-700/80">
                <div className="w-6 h-6 rounded-full bg-indigo-500/25 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-white">
                    Choose Repository Access
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Under <strong>Repository Access</strong>, select <strong>"All repositories"</strong> (or choose specific repositories you want to monitor).
                  </p>
                </div>
              </div>

              {/* Step 4: Permissions Checklist */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#0F172A] border border-emerald-500/40">
                <div className="w-6 h-6 rounded-full bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  4
                </div>
                <div className="text-xs space-y-2.5 flex-1">
                  <h4 className="font-bold text-white">
                    Set Repository Permissions (Recommended)
                  </h4>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#060A14] border border-slate-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-mono text-slate-100 text-[11px] font-semibold">Contents</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/40 font-bold">
                        Read and write
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#060A14] border border-slate-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-mono text-slate-100 text-[11px] font-semibold">Pull requests</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/40 font-bold">
                        Read and write
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#060A14] border border-slate-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-mono text-slate-100 text-[11px] font-semibold">Webhooks</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/40 font-bold">
                        Read and write
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#060A14] border border-slate-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-slate-300 text-[11px]">Metadata</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                        Read-only (Default)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Tip */}
            <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 flex items-center gap-2.5 text-xs text-indigo-200">
              <Zap className="w-4 h-4 shrink-0 text-indigo-400 fill-indigo-400" />
              <p className="text-[11px] leading-relaxed">
                Click <strong>"Generate token"</strong> at the bottom of GitHub, copy the generated <code className="text-white font-mono bg-indigo-900/60 px-1.5 py-0.5 rounded border border-indigo-500/40">github_pat_...</code> string, and paste it into the form on the left!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectGitHubPage;
