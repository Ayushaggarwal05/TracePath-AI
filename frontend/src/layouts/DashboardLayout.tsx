import React from "react";
import { User } from "../types/user";
import { ToastContainer } from "../components/common/ToastContainer";
import {
  LayoutDashboard,
  GitBranch,
  Activity,
  Settings,
  ShieldCheck,
  ChevronDown,
  LogOut,
} from "lucide-react";

type NavRoute = "dashboard" | "repositories" | "activity" | "settings";

interface DashboardLayoutProps {
  user: User | null;
  activeRoute: NavRoute;
  onRouteChange: (route: NavRoute | "landing" | "connect") => void;
  children: React.ReactNode;
}

const NAV_DEFINITIONS: Record<
  NavRoute,
  { id: NavRoute; label: string; icon: React.ReactNode }
> = {
  dashboard: {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  repositories: {
    id: "repositories",
    label: "Repositories",
    icon: <GitBranch className="w-4 h-4" />,
  },
  activity: {
    id: "activity",
    label: "Activity",
    icon: <Activity className="w-4 h-4" />,
  },
  settings: {
    id: "settings",
    label: "Settings",
    icon: <Settings className="w-4 h-4" />,
  },
};

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

  const [avatarError, setAvatarError] = React.useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = React.useState(false);

  // Dynamic Navigation Order State (default starts with dashboard)
  const [navOrder, setNavOrder] = React.useState<NavRoute[]>([
    "dashboard",
    "repositories",
    "activity",
    "settings",
  ]);

  // Sync and swap whenever activeRoute changes
  React.useEffect(() => {
    setNavOrder((prev) => {
      if (prev[0] === activeRoute) return prev;
      const currentIndex = prev.indexOf(activeRoute);
      if (currentIndex <= 0) return prev;
      const updated = [...prev];
      const temp = updated[0];
      updated[0] = updated[currentIndex];
      updated[currentIndex] = temp;
      return updated;
    });
  }, [activeRoute]);

  const handleNavClick = (id: NavRoute) => {
    setNavOrder((prev) => {
      if (prev[0] === id) return prev;
      const currentIndex = prev.indexOf(id);
      if (currentIndex <= 0) return prev;
      const updated = [...prev];
      const temp = updated[0];
      updated[0] = updated[currentIndex];
      updated[currentIndex] = temp;
      return updated;
    });
    onRouteChange(id);
  };

  return (
    <div className="min-h-screen bg-dark-base flex flex-col selection:bg-brand-500/20 selection:text-brand-300">
      {/* Top Navigation Header (Full Width & Spacious) */}
      <header className="sticky top-0 z-40 w-full border-b border-dark-border/90 bg-slate-950/95 backdrop-blur-md transition-all">
        <div className="w-full px-6 sm:px-10 lg:px-12 h-20 flex items-center justify-between gap-8">
          {/* Left: Logo, Brand & Main Dynamic Navigation Links */}
          <div className="flex items-center gap-10 lg:gap-14">
            <div
              onClick={() => handleNavClick("dashboard")}
              className="flex items-center gap-3.5 cursor-pointer group select-none shrink-0"
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute -inset-1 bg-indigo-500/25 blur-lg rounded-full group-hover:bg-indigo-500/40 transition-all" />
                <img
                  src="/logo-icon.png"
                  alt="TracePath AI Logo"
                  className="relative w-10 h-10 object-contain drop-shadow-[0_0_16px_rgba(129,140,248,0.75)] group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex items-center gap-2 font-brand">
                <span className="font-black text-2xl sm:text-[26px] tracking-[-0.035em] text-white group-hover:text-slate-100 transition-colors drop-shadow-[0_2px_14px_rgba(255,255,255,0.15)]">
                  TracePath
                </span>
                <span className="text-2xl sm:text-[26px] font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(168,85,247,0.65)]">
                  AI
                </span>
              </div>
            </div>

            {/* Top Navigation Tabs with Dynamic Swapping and Generous Spacing */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 pl-8 lg:pl-10 border-l border-dark-border/90 h-full">
              {navOrder.map((routeId) => {
                const item = NAV_DEFINITIONS[routeId];
                const isActive = activeRoute === routeId;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2.5 py-6 px-1 text-[15px] font-medium transition-all duration-200 group ${
                      isActive
                        ? "text-white font-semibold"
                        : "text-slate-400 hover:text-slate-100"
                    }`}
                  >
                    <span
                      className={`transition-colors ${
                        isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="relative pb-1">
                      {item.label}
                      {/* Rich Glowing Emerald Underline strictly under the words */}
                      {isActive && (
                        <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-emerald-500 rounded-full shadow-[0_1px_8px_rgba(16,185,129,0.7)]" />
                      )}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right-most: Account Information Button */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Mobile Nav Icons */}
            <div className="flex md:hidden items-center gap-1.5">
              {navOrder.map((routeId) => {
                const item = NAV_DEFINITIONS[routeId];
                const isActive = activeRoute === routeId;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`p-2.5 rounded-lg text-xs transition-all ${
                      isActive
                        ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                    title={item.label}
                  >
                    {item.icon}
                  </button>
                );
              })}
            </div>

            {/* Account Info Pill (Right-most) with Interactive Dropdown */}
            <div className="relative">
              <div
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900 border border-dark-border hover:border-brand-500/50 cursor-pointer transition-all group shadow-sm select-none"
                title="Account Menu"
              >
                <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-brand-500/15 border border-brand-500/30 flex items-center justify-center font-bold text-sm text-brand-400 group-hover:bg-brand-500/25 transition-colors shrink-0">
                  {avatarUrl && !avatarError ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="absolute inset-0 w-full h-full object-cover rounded-lg"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span className="select-none">{initial}</span>
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {displayName}
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-[11px] font-mono text-slate-400">
                    @{savedUsername}
                  </p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${isAccountMenuOpen ? 'rotate-180 text-brand-400' : ''}`} />
              </div>

              {/* Dropdown Menu */}
              {isAccountMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsAccountMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-950 border border-dark-border shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3 border-b border-dark-border/80 bg-slate-900/40 rounded-xl mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-brand-500/20 border border-brand-500/30 flex items-center justify-center font-bold text-xs text-brand-400 shrink-0">
                          {avatarUrl && !avatarError ? (
                            <img
                              src={avatarUrl}
                              alt={displayName}
                              className="absolute inset-0 w-full h-full object-cover rounded-lg"
                              onError={() => setAvatarError(true)}
                            />
                          ) : (
                            <span className="select-none">{initial}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-200 truncate">{displayName}</p>
                          <p className="text-[11px] font-mono text-emerald-400 truncate flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            @{savedUsername}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onRouteChange('settings');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors text-left"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Settings & API Keys</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          onRouteChange('connect');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out / Switch Account</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Content with Generous Left and Right Margins */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-8 sm:py-10">
        {children}
      </main>

      <ToastContainer />
    </div>
  );
};
