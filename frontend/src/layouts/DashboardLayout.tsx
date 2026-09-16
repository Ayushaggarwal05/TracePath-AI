import React from 'react';
import { User } from '../types/user';
import { ToastContainer } from '../components/common/ToastContainer';
import {
  LayoutDashboard,
  GitBranch,
  Activity,
  Settings,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface DashboardLayoutProps {
  user: User | null;
  activeRoute: 'dashboard' | 'repositories' | 'activity' | 'settings';
  onRouteChange: (route: 'dashboard' | 'repositories' | 'activity' | 'settings' | 'landing' | 'connect') => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  activeRoute,
  onRouteChange,
  children,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'repositories',
      label: 'Repositories',
      icon: <GitBranch className="w-4 h-4" />,
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex h-screen bg-dark-base overflow-hidden selection:bg-brand-500/20 selection:text-brand-300">
      {/* Sidebar */}
      <aside className="w-64 border-r border-dark-border bg-slate-950 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div
            onClick={() => onRouteChange('landing')}
            className="p-5 flex items-center gap-3 border-b border-dark-border cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 group-hover:shadow-glow-emerald transition-all">
              <Zap className="w-5 h-5 fill-brand-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-100">TracePath</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 font-mono">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">Autonomous Doc Sync</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = activeRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onRouteChange(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-brand-400' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-400" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User & GitHub info bottom */}
        <div className="p-3 border-t border-dark-border bg-slate-950/80">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-dark-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-brand-400">
              {user?.full_name?.charAt(0) || 'D'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {user?.full_name || 'TracePath Dev'}
                </span>
                <span title="Connected"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" /></span>
              </div>
              <p className="text-[11px] font-mono text-slate-500 truncate">
                @{user?.github_connections?.[0]?.username || 'tracepath-dev'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-dark-border bg-dark-card/50 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {activeRoute}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onRouteChange('connect')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-xs font-mono text-slate-300 hover:border-brand-500/50 hover:text-white transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5 text-brand-400" />
              <span>Import Repositories</span>
            </button>
            <button
              onClick={() => onRouteChange('landing')}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <span>Landing</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
