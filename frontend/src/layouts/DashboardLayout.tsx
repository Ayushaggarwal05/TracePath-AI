import React, { useState, useEffect } from "react";
import { User } from "../types/user";
import { ToastContainer } from "../components/common/ToastContainer";
import {
  LayoutDashboard,
  FolderGit2,
  Activity,
  Settings,
  ChevronRight,
  LogOut,
  Search,
  Bell,
  Sparkles,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";

type NavRoute = "dashboard" | "repositories" | "activity" | "settings";

interface DashboardLayoutProps {
  user: User | null;
  activeRoute: NavRoute;
  onRouteChange: (route: NavRoute | "landing" | "connect") => void;
  children: React.ReactNode;
}

const NAV_ITEMS: Array<{ id: NavRoute; label: string; icon: React.ReactNode }> = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    id: "repositories",
    label: "Repositories",
    icon: <FolderGit2 className="w-4 h-4" />,
  },
  {
    id: "activity",
    label: "Activity",
    icon: <Activity className="w-4 h-4" />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="w-4 h-4" />,
  },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  activeRoute,
  onRouteChange,
  children,
}) => {
  const savedUsername =
    localStorage.getItem("tracepath_github_user") ||
    user?.github_connections?.[0]?.username ||
    "Ayushaggarwal05";
  const avatarUrl =
    localStorage.getItem("tracepath_github_avatar") ||
    user?.github_connections?.[0]?.avatar_url ||
    (savedUsername ? `https://github.com/${savedUsername}.png` : "");

  const savedName =
    localStorage.getItem("tracepath_github_name") ||
    (user?.full_name && user.full_name !== "TracePath Developer" && user.full_name !== "TracePath Dev"
      ? user.full_name
      : null) ||
    (savedUsername === "Ayushaggarwal05" ? "Ayush Aggarwal" : savedUsername);

  const displayName = savedName || savedUsername;
  const initial = displayName.charAt(0).toUpperCase();

  const [avatarError, setAvatarError] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Theme Mode: Default to 'light'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('tracepath_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('tracepath_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#080D1A] text-slate-100' : 'bg-[#F7F5F0] text-slate-900'} selection:bg-rose-500/20 selection:text-rose-900 transition-colors duration-150`}>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (Deep Navy #0B111F) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B111F] text-slate-300 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand & Logo */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800/80 shrink-0">
            <div
              onClick={() => {
                onRouteChange("dashboard");
                setIsMobileSidebarOpen(false);
              }}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute -inset-1 bg-indigo-500/30 blur-md rounded-full group-hover:bg-indigo-500/45 transition-all" />
                <img
                  src="/logo-icon.png"
                  alt="TracePath AI Logo"
                  className="relative w-8 h-8 object-contain drop-shadow-[0_0_12px_rgba(129,140,248,0.7)] group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex items-center gap-1.5 font-brand">
                <span className="font-extrabold text-xl tracking-[-0.03em] text-white group-hover:text-slate-100 transition-colors">
                  TracePath
                </span>
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  AI
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5 flex-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onRouteChange(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#A8203A] text-white font-semibold shadow-md shadow-[#A8203A]/25"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/80"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* AI-Powered Documentation Feature Card */}
          <div className="p-3 mx-3.5 mb-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#A8203A] to-indigo-600 text-white shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200">AI-Powered Documentation</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Automate. Analyze. Commit.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Profile Pill */}
        <div className="p-3.5 border-t border-slate-800/80 bg-[#0B111F] relative">
          <div
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all select-none group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-brand-400 shrink-0">
                {avatarUrl && !avatarError ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                  {displayName}
                </p>
                <p className="text-[11px] font-mono text-slate-400 truncate">
                  @{savedUsername}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
          </div>

          {/* Account Dropdown Popover: Opens to the RIGHT of the sidebar */}
          {isAccountMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsAccountMenuOpen(false)}
              />
              <div className="absolute z-50 p-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-[#0D1526] border border-stone-200 dark:border-slate-800 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-left-2 duration-150 bottom-18 left-3.5 right-3.5 md:bottom-2 md:left-[calc(100%+12px)] md:right-auto md:w-64">
                <div className="p-2.5 border-b border-stone-100 dark:border-slate-800 bg-[#F7F5F0] dark:bg-[#131D2E] rounded-xl mb-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
                  <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 truncate flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    @{savedUsername}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    onRouteChange("settings");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Settings & API Keys</span>
                </button>

                <button
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    onRouteChange("connect");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out / Switch Account</span>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* RIGHT MAIN WRAPPER */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 min-h-screen">
        {/* Top Utility Header Bar */}
        <header className={`h-16 px-4 sm:px-8 flex items-center justify-between border-b sticky top-0 z-30 transition-colors ${
          isDark
            ? 'bg-[#080D1A]/90 backdrop-blur-md border-slate-800/80 text-slate-100'
            : 'bg-[#F7F5F0]/90 backdrop-blur-md border-stone-200/80 text-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className={`md:hidden p-2 rounded-xl transition-colors ${
                isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-stone-200/60'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Input */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search repositories, commits, or workflows..."
                className={`w-56 sm:w-80 md:w-96 pl-9 pr-12 py-1.5 border rounded-xl text-xs transition-all shadow-xs ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-700 focus:bg-slate-950'
                    : 'bg-[#EEF2F5] border-stone-200/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white'
                }`}
              />
              <span className={`hidden sm:inline-flex items-center absolute right-2.5 px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                isDark ? 'text-slate-400 bg-slate-800 border-slate-700' : 'text-slate-400 bg-white border-stone-200'
              }`}>
                ⌘K
              </span>
            </div>
          </div>

          {/* Right utility items: Theme Toggle, Notifications & Quick Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-colors ${
                isDark
                  ? 'text-amber-400 hover:text-amber-300 hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-200/60'
              }`}
              title={isDark ? 'Switch to Light Mode (Default)' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              className={`p-2 rounded-xl transition-colors relative ${
                isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-stone-200/60'
              }`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#A8203A] absolute top-1.5 right-1.5" />
            </button>

            {/* Top Quick Profile Pill */}
            <div className="relative">
              <div
                onClick={() => setIsTopMenuOpen(!isTopMenuOpen)}
                className={`flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl border cursor-pointer shadow-xs transition-colors select-none ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-100'
                    : 'bg-white border-stone-200/80 hover:border-stone-300 text-slate-900'
                }`}
              >
                <div className={`relative w-6 h-6 rounded-lg overflow-hidden border flex items-center justify-center font-bold text-[10px] ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-stone-200 text-slate-700'
                }`}>
                  {avatarUrl && !avatarError ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span>{initial}</span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className={`text-xs font-bold leading-none ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{displayName}</p>
                  <p className="text-[10px] font-mono text-slate-400 leading-none mt-0.5">@{savedUsername}</p>
                </div>
              </div>

              {/* Top Bar Account Dropdown (Opens below top profile pill) */}
              {isTopMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsTopMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-11 w-64 p-2 z-50 text-slate-900 dark:text-slate-100 bg-white dark:bg-[#0D1526] border border-stone-200 dark:border-slate-800 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2.5 border-b border-stone-100 dark:border-slate-800 bg-[#F7F5F0] dark:bg-[#131D2E] rounded-xl mb-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
                      <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 truncate flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        @{savedUsername}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsTopMenuOpen(false);
                        onRouteChange("settings");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Settings & API Keys</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsTopMenuOpen(false);
                        onRouteChange("connect");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out / Switch Account</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-8">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

