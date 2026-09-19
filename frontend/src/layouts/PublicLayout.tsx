import React from 'react';
import { ToastContainer } from '../components/common/ToastContainer';
import { Button } from '../components/common/Button';
import { Zap, Github } from 'lucide-react';

interface PublicLayoutProps {
  onNavigateToApp: () => void;
  onConnectGitHub?: () => void;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  onNavigateToApp,
  onConnectGitHub,
  children,
}) => {
  const isConnected = localStorage.getItem('tracepath_github_connected') === 'true';

  return (
    <div className="min-h-screen bg-dark-base flex flex-col justify-between selection:bg-brand-500/20 selection:text-brand-300">
      {/* Header */}
      <header className="h-20 border-b border-dark-border/80 bg-slate-950/70 backdrop-blur-md px-6 sm:px-12 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => (isConnected ? onNavigateToApp() : onConnectGitHub?.())}>
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-glow-emerald">
            <Zap className="w-5 h-5 fill-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-100">TracePath</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 font-mono">
                AI
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isConnected ? (
            <Button
              variant="primary"
              size="sm"
              onClick={onNavigateToApp}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={onConnectGitHub || onNavigateToApp}
              leftIcon={<Github className="w-4 h-4" />}
            >
              Connect GitHub
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-dark-border/80 bg-slate-950 py-10 px-6 sm:px-12 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TracePath AI. Autonomous GitHub-native documentation synchronization.</p>
          <p className="text-slate-400">Powered by 3 Independent AI Agents</p>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
};
