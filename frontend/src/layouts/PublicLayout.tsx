import React from 'react';
import { ToastContainer } from '../components/common/ToastContainer';
import { Button } from '../components/common/Button';
import { Github, LayoutDashboard, Home } from 'lucide-react';

interface PublicLayoutProps {
  onNavigateToApp: () => void;
  onConnectGitHub?: () => void;
  onNavigateToLanding?: () => void;
  currentRoute?: string;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  onNavigateToApp,
  onConnectGitHub,
  onNavigateToLanding,
  currentRoute = 'landing',
  children,
}) => {
  const isConnected = localStorage.getItem('tracepath_github_connected') === 'true';
  const savedUser = localStorage.getItem('tracepath_github_user');

  const handleLogoClick = () => {
    if (onNavigateToLanding) {
      onNavigateToLanding();
    }
  };

  const isLanding = currentRoute === 'landing';

  return (
    <div
      className={`min-h-screen flex flex-col justify-between ${
        isLanding
          ? 'bg-[#FAF9F6] text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900'
          : 'bg-[#060913] text-slate-100 selection:bg-rose-500/20 selection:text-rose-300'
      }`}
    >
      {/* Navy Header */}
      <header className="h-20 border-b border-slate-800/80 bg-[#0B111F]/95 backdrop-blur-md px-6 sm:px-12 flex items-center justify-between sticky top-0 z-40">
        <div
          className="flex items-center gap-3.5 cursor-pointer group"
          onClick={handleLogoClick}
          title="Go to Home / Landing Page"
        >
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
          {!isLanding && onNavigateToLanding && (
            <button
              onClick={onNavigateToLanding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Landing Page</span>
            </button>
          )}

          {isConnected ? (
            <Button
              variant="primary"
              size="sm"
              onClick={onNavigateToApp}
              leftIcon={<LayoutDashboard className="w-4 h-4" />}
            >
              Go to Dashboard
            </Button>
          ) : savedUser ? (
            <Button
              variant="primary"
              size="sm"
              onClick={onConnectGitHub || onNavigateToApp}
              leftIcon={<Github className="w-4 h-4 text-white" />}
            >
              {currentRoute === 'connect' ? `Continue as @${savedUser}` : `Sign In (@${savedUser})`}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={onConnectGitHub || onNavigateToApp}
              leftIcon={<Github className="w-4 h-4 text-white" />}
            >
              {currentRoute === 'connect' ? 'Sign In / Connect' : 'Connect GitHub'}
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Navy Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B111F] py-10 px-6 sm:px-12 text-center text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TracePath AI. Autonomous GitHub-native documentation synchronization.</p>
          <p className="text-slate-400">Powered by 3 Independent AI Agents</p>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
};

export default PublicLayout;
