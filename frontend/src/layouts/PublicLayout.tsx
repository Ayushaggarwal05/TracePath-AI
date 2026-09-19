import React from 'react';
import { ToastContainer } from '../components/common/ToastContainer';
import { Button } from '../components/common/Button';
import { Github } from 'lucide-react';

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
        <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => (isConnected ? onNavigateToApp() : onConnectGitHub?.())}>
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-indigo-500/20 blur-md rounded-full group-hover:bg-indigo-500/35 transition-all" />
            <img
              src="/logo-icon.png"
              alt="TracePath AI Logo"
              className="relative w-9 h-9 object-contain drop-shadow-[0_0_15px_rgba(129,140,248,0.7)] group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="flex items-center gap-1.5 font-brand">
            <span className="font-extrabold text-xl tracking-[-0.03em] text-white group-hover:text-slate-100 transition-colors drop-shadow-[0_2px_12px_rgba(255,255,255,0.12)]">
              TracePath
            </span>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(168,85,247,0.6)]">
              AI
            </span>
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
