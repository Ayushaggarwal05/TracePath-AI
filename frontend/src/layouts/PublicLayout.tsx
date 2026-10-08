import React from 'react';
import { useAuth } from '../context/AuthContext';
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
  const { user, isAuthenticated } = useAuth();
  const isConnected = isAuthenticated && (user?.github_connected || localStorage.getItem('tracepath_github_connected') === 'true');

  const handleLogoClick = () => {
    if (onNavigateToLanding) {
      onNavigateToLanding();
    }
  };

  const isLanding = currentRoute === 'landing';
  const isAuthPage = currentRoute === 'auth';

  return (
    <div
      className={`min-h-screen flex flex-col justify-between ${
        isLanding
          ? 'bg-[#FAF9F6] text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900'
          : 'bg-[#060913] text-slate-100 selection:bg-rose-500/20 selection:text-rose-300'
      }`}
    >
      {/* Header Bar */}
      {isLanding ? (
        <header className="border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
          <div className="w-full px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group select-none"
              onClick={handleLogoClick}
              title="TracePath AI"
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-500/20 blur-md rounded-full group-hover:bg-indigo-500/35 transition-all" />
                <img
                  src="/logo-icon.png"
                  alt="TracePath AI Logo"
                  className="relative w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-[0_0_12px_rgba(129,140,248,0.7)] group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex items-center gap-1 font-brand">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#0F172A] group-hover:text-indigo-950 transition-colors">
                  TracePath
                </span>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-indigo-600">
                  AI
                </span>
              </div>
            </div>

            {/* Center Navigation Menu */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
              <a
                href="#home"
                className="relative text-indigo-600 font-bold hover:text-indigo-700 transition-colors py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600 after:rounded-full"
              >
                Home
              </a>
              <a
                href="#features"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                How It Works
              </a>
              <a
                href="#docs"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Docs
              </a>
              <a
                href="#pricing"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Pricing
              </a>
            </nav>

            {/* Right Action Button */}
            <div className="flex items-center gap-3">
              {isConnected ? (
                <button
                  onClick={onNavigateToApp}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#A8203A] hover:bg-[#901B31] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#A8203A]/25 border border-[#A8203A] transition-all cursor-pointer group"
                >
                  <LayoutDashboard className="w-4 h-4 text-white/90" />
                  <span>Go to Dashboard</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              ) : isAuthenticated ? (
                <button
                  onClick={onConnectGitHub || onNavigateToApp}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#A8203A] hover:bg-[#901B31] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#A8203A]/25 border border-[#A8203A] transition-all cursor-pointer group"
                >
                  <Github className="w-4 h-4 text-white/90" />
                  <span>Connect GitHub</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              ) : (
                <button
                  onClick={onConnectGitHub || onNavigateToApp}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#A8203A] hover:bg-[#901B31] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#A8203A]/25 border border-[#A8203A] transition-all cursor-pointer group"
                >
                  <span>Sign In / Get Started</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              )}
            </div>
          </div>
        </header>
      ) : (
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
            {onNavigateToLanding && (
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
            ) : isAuthPage ? null : isAuthenticated ? (
              <Button
                variant="primary"
                size="sm"
                onClick={onConnectGitHub || onNavigateToApp}
                leftIcon={<Github className="w-4 h-4 text-white" />}
              >
                Connect GitHub
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={onConnectGitHub || onNavigateToApp}
              >
                Sign In / Get Started
              </Button>
            )}
          </div>
        </header>
      )}

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
