import React, { useState, useEffect, useRef } from "react";
import { User } from "../types/user";
import { ToastContainer } from "../components/common/ToastContainer";
import { useRepositories } from "../hooks/useRepositories";
import {
  LayoutDashboard,
  FolderGit2,
  Activity,
  Settings,
  ChevronRight,
  LogOut,
  Search,
  Bell,
  Bot,
  Menu,
  X,
  Sun,
  Moon,
  AlertTriangle,
} from "lucide-react";

type NavRoute = "dashboard" | "repositories" | "activity" | "settings";

interface DashboardLayoutProps {
  user: User | null;
  activeRoute: NavRoute;
  onRouteChange: (route: NavRoute | "landing" | "connect") => void;
  onSignOut?: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: Array<{
  id: NavRoute;
  label: string;
  icon: (isActive: boolean) => React.ReactNode;
}> = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (isActive) => (
      <LayoutDashboard
        className={`w-5 h-5 ${isActive ? "fill-white" : "fill-slate-400/30"}`}
      />
    ),
  },
  {
    id: "repositories",
    label: "Repositories",
    icon: (isActive) => (
      <FolderGit2
        className={`w-5 h-5 ${isActive ? "fill-white/30" : "fill-slate-400/30"}`}
      />
    ),
  },
  {
    id: "activity",
    label: "Activity",
    icon: (isActive) => (
      <Activity
        className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`}
      />
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (isActive) => (
      <Settings
        className={`w-5 h-5 ${isActive ? "fill-white/30" : "fill-slate-400/30"}`}
      />
    ),
  },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  activeRoute,
  onRouteChange,
  onSignOut,
  children,
}) => {
  const savedUsername =
    user?.github_username ||
    user?.github_connections?.[0]?.username ||
    (user?.email ? user.email.split("@")[0] : "Developer");
  const avatarUrl =
    user?.github_avatar_url ||
    user?.github_connections?.[0]?.avatar_url ||
    (savedUsername && savedUsername !== "Developer"
      ? `https://github.com/${savedUsername}.png`
      : "");

  const savedName = user?.full_name || savedUsername;

  const displayName = savedName || savedUsername;
  const initial = displayName.charAt(0).toUpperCase();

  const [avatarError, setAvatarError] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Theme Mode: Default to 'light'
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (
      (localStorage.getItem("tracepath_theme") as "light" | "dark") || "light"
    );
  });

  useEffect(() => {
    localStorage.setItem("tracepath_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const tokenStatus =
    user?.token_status ||
    user?.github_connections?.[0]?.token_status ||
    "VALID";
  const isTokenExpired = user?.github_connected
    ? tokenStatus !== "VALID"
    : false;

  const { repositories } = useRepositories();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Global ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredSearchRepos = searchQuery.trim()
    ? repositories.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.description || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      )
    : repositories;

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen p-2 sm:p-2.5 lg:p-3 flex gap-2 lg:gap-2.5 transition-colors duration-200 overflow-hidden ${
        isDark ? "bg-[#060913] text-slate-100" : "bg-[#ECE9E2] text-slate-900"
      } selection:bg-rose-500/20 selection:text-rose-900`}
    >
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* FLOATING CURVED SIDEBAR (Deep Navy #0B111F with rounded-3xl) */}
      <aside
        className={`fixed md:static top-2.5 bottom-2.5 left-2.5 z-50 w-72 h-[calc(100vh-16px)] sm:h-[calc(100vh-20px)] lg:h-[calc(100vh-24px)] bg-[#0B111F] text-slate-300 rounded-3xl border border-slate-800/80 shadow-2xl shadow-black/30 flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-[110%]"
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
                <span className="font-extrabold text-2xl tracking-tight text-white group-hover:text-slate-100 transition-colors">
                  TracePath
                </span>
                <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  AI
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items (Chunky, Curved Buttons) */}
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
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#A8203A] text-white shadow-lg shadow-[#A8203A]/30 scale-[1.01]"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/90"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-slate-400"}>
                    {item.icon(isActive)}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* AI-Powered Documentation Feature Card */}
          <div className="p-3.5 mx-4 mb-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-start gap-3 shadow-inner">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#A8203A] to-indigo-600 text-white shrink-0 shadow-sm">
              <Bot className="w-5 h-5 fill-white/30 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200">
                AI-Powered Documentation
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Automate. Analyze. Commit.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Profile Pill with Flyout Menu */}
        <div className="p-3.5 border-t border-slate-800/80 bg-[#0B111F] rounded-b-3xl relative">
          <div
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all select-none group shadow-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-brand-400 shrink-0">
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

          {/* Flyout Menu: Opens to the RIGHT of the sidebar */}
          {isAccountMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsAccountMenuOpen(false)}
              />
              <div className="absolute z-50 p-3 text-slate-900 dark:text-slate-100 bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-left-2 duration-150 bottom-20 left-3.5 right-3.5 md:bottom-0 md:left-[calc(100%+8px)] md:right-auto md:w-80">
                <div className="p-3.5 border-b border-stone-100 dark:border-slate-800 bg-[#F7F5F0] dark:bg-[#131D2E] rounded-2xl mb-2 flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-brand-400 shrink-0">
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
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400 truncate flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      @{savedUsername}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      onRouteChange("settings");
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span>Settings & API Keys</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      if (onSignOut) {
                        onSignOut();
                      } else {
                        onRouteChange("landing");
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* FLOATING MAIN WINDOW SHELL (Rounded 3xl with internal scroll) */}
      <div className="flex-1 min-w-0 h-[calc(100vh-16px)] sm:h-[calc(100vh-20px)] lg:h-[calc(100vh-24px)] bg-white dark:bg-[#0B101D] rounded-3xl border border-stone-200/90 dark:border-slate-800/90 shadow-xl shadow-stone-900/5 flex flex-col overflow-hidden">
        {/* Top Utility Header Bar */}
        <header className="h-20 px-5 sm:px-7 lg:px-9 border-b border-stone-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-white/90 dark:bg-[#0B101D]/90 backdrop-blur-md z-30">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2.5 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Compact Live Repository Search Input */}
            <div
              ref={searchContainerRef}
              className="relative w-64 sm:w-80 md:w-96"
            >
              <div className="relative flex items-center w-full">
                <Search className="w-4 h-4 text-[#0F2742]/60 dark:text-slate-800 absolute left-3.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!isSearchOpen) setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Search repositories & workflows..."
                  className="w-full pl-9 pr-14 py-2 border rounded-2xl text-xs sm:text-sm transition-all shadow-xs bg-[#F4F2EB] dark:bg-slate-900/90 border-stone-200/90 dark:border-slate-800 text-[#0F2742] dark:text-slate-100 placeholder-[#0F2742]/60 dark:placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 focus:bg-white dark:focus:bg-slate-950"
                />

                {searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="hidden sm:inline-flex items-center absolute right-3 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold border text-slate-400 bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-700 shadow-2xs">
                    ⌘K
                  </span>
                )}
              </div>

              {/* Live Repository Search Results Dropdown */}
              {isSearchOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSearchOpen(false)}
                  />
                  <div className="absolute left-0 top-12 w-full min-w-[320px] sm:min-w-[380px] p-2 z-50 text-slate-900 dark:text-slate-100 bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-stone-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <span>Repositories ({filteredSearchRepos.length})</span>
                      <span className="text-[10px] font-mono font-normal">
                        Click to open
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 dark:divide-slate-800/60 py-1">
                      {filteredSearchRepos.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                          No repositories matching "
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {searchQuery}
                          </span>
                          "
                        </div>
                      ) : (
                        filteredSearchRepos.slice(0, 8).map((repo) => {
                          const isActive = repo.automation?.status === "ACTIVE";
                          return (
                            <div
                              key={repo.id}
                              onClick={() => {
                                setIsSearchOpen(false);
                                onRouteChange("repositories");
                              }}
                              className="p-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`p-2 rounded-lg border shrink-0 ${
                                    isActive
                                      ? "bg-emerald-950 border-emerald-800 text-emerald-300"
                                      : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                                  }`}
                                >
                                  <FolderGit2 className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate transition-colors">
                                    {repo.name}
                                  </p>
                                  <p className="text-[11px] font-mono text-slate-400 truncate">
                                    {repo.full_name}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                    isActive
                                      ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}
                                  />
                                  {isActive ? "ACTIVE" : "INACTIVE"}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="pt-2 px-3 pb-1 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Press Esc to close</span>
                      <button
                        onClick={() => {
                          setIsSearchOpen(false);
                          onRouteChange("repositories");
                        }}
                        className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                      >
                        View all repositories →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right utility items: Theme Toggle, Notifications & Enlarged Quick Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 ml-4">
            {/* Theme Toggle Button (Enlarged) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 sm:p-3 rounded-2xl transition-all text-slate-600 dark:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800 cursor-pointer shadow-2xs"
              title={
                isDark
                  ? "Switch to Light Mode (Default)"
                  : "Switch to Dark Mode"
              }
            >
              {isDark ? (
                <Sun className="w-5 h-5 fill-amber-400 text-amber-500 drop-shadow-xs" />
              ) : (
                <Moon className="w-5 h-5 fill-indigo-400 text-indigo-500 drop-shadow-xs" />
              )}
            </button>

            {/* Notification Bell (Enlarged) */}
            <button
              type="button"
              className="p-2.5 sm:p-3 rounded-2xl transition-all relative text-slate-500 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 cursor-pointer shadow-2xs"
              title="Notifications"
            >
              <Bell className="w-5 h-5 fill-slate-300/30 dark:fill-slate-700/50 text-slate-700 dark:text-slate-200" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#A8203A] absolute top-2 right-2 border-2 border-white dark:border-slate-900" />
            </button>

            {/* Top Quick Profile Pill (Enlarged & Chunky) */}
            <div className="relative">
              <div
                onClick={() => setIsTopMenuOpen(!isTopMenuOpen)}
                className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-2xl border cursor-pointer shadow-xs hover:shadow-sm transition-all select-none bg-stone-50 dark:bg-slate-900 border-stone-200/90 dark:border-slate-800 hover:border-stone-300 text-slate-900 dark:text-slate-100"
              >
                <div className="relative w-8 h-8 rounded-xl overflow-hidden border flex items-center justify-center font-bold text-xs bg-slate-100 dark:bg-slate-800 border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shrink-0">
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
                  <p className="text-sm font-bold leading-tight text-slate-900 dark:text-slate-100">
                    {displayName}
                  </p>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                    @{savedUsername}
                  </p>
                </div>
              </div>

              {/* Top Bar Account Dropdown (Spacious & Bigger Fonts) */}
              {isTopMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsTopMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-14 w-80 p-3 z-50 text-slate-900 dark:text-slate-100 bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3.5 border-b border-stone-100 dark:border-slate-800 bg-[#F7F5F0] dark:bg-[#131D2E] rounded-2xl mb-2 flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-brand-400 shrink-0">
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
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {displayName}
                        </p>
                        <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400 truncate flex items-center gap-1.5 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          @{savedUsername}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setIsTopMenuOpen(false);
                          onRouteChange("settings");
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                        <span>Settings & API Keys</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsTopMenuOpen(false);
                          if (onSignOut) {
                            onSignOut();
                          } else {
                            onRouteChange("landing");
                          }
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
            {isTokenExpired && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {tokenStatus === "REVOKED"
                          ? "GitHub Access Token Revoked"
                          : "GitHub Personal Access Token Expired"}
                      </p>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        {tokenStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Autonomous documentation synchronization and webhook
                      commits cannot push to your repositories until you
                      reconnect your token.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onRouteChange("connect")}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  Re-authenticate GitHub
                </button>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
