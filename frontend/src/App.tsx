import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { ConnectGitHubPage } from './pages/ConnectGitHubPage';
import { RepositorySelectPage } from './pages/RepositorySelectPage';
import { DashboardPage } from './pages/DashboardPage';
import { RepositoriesPage } from './pages/RepositoriesPage';
import { RepositoryDetailPage } from './pages/RepositoryDetailPage';
import { ActivityPage } from './pages/ActivityPage';
import { SettingsPage } from './pages/SettingsPage';

export type AppRoute =
  | 'landing'
  | 'auth'
  | 'connect'
  | 'select-repos'
  | 'dashboard'
  | 'repositories'
  | 'repository-detail'
  | 'activity'
  | 'settings';

const VALID_ROUTES: AppRoute[] = [
  'landing',
  'auth',
  'connect',
  'select-repos',
  'dashboard',
  'repositories',
  'repository-detail',
  'activity',
  'settings',
];

const getInitialRoute = (): AppRoute => {
  const hash = window.location.hash.replace('#/', '').replace('#', '') as AppRoute;
  if (hash && VALID_ROUTES.includes(hash)) {
    return hash;
  }
  const saved = localStorage.getItem('tracepath_current_route') as AppRoute;
  if (saved && VALID_ROUTES.includes(saved)) {
    return saved;
  }
  return 'landing';
};

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getInitialRoute);
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(() => {
    return localStorage.getItem('tracepath_selected_repo_id') || 'repo-1';
  });
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const isConnected = isAuthenticated && (user?.github_connected || localStorage.getItem('tracepath_github_connected') === 'true');

  const navigateTo = (route: AppRoute) => {
    setCurrentRoute(route);
    localStorage.setItem('tracepath_current_route', route);
    window.location.hash = `#/${route}`;
  };

  // Sync route on hashchange
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '') as AppRoute;
      if (hash && VALID_ROUTES.includes(hash)) {
        setCurrentRoute(hash);
        localStorage.setItem('tracepath_current_route', hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOpenRepoDetail = (repoId: string) => {
    setSelectedRepoId(repoId);
    localStorage.setItem('tracepath_selected_repo_id', repoId);
    navigateTo('repository-detail');
  };

  const handleCompleteRepoSelect = () => {
    navigateTo('dashboard');
  };

  const handleSignOut = async () => {
    await logout();
    localStorage.removeItem('tracepath_github_connected');
    localStorage.removeItem('tracepath_github_user');
    localStorage.removeItem('tracepath_github_name');
    localStorage.removeItem('tracepath_github_avatar');
    localStorage.removeItem('tracepath_has_token');
    navigateTo('landing');
  };

  // Show clean loading spinner while verifying server session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#060913] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-slate-400">Verifying secure session...</span>
        </div>
      </div>
    );
  }

  // Public Route: Auth (Sign In / Sign Up)
  if (currentRoute === 'auth') {
    return (
      <PublicLayout
        currentRoute="auth"
        onNavigateToApp={() => (isConnected ? navigateTo('dashboard') : isAuthenticated ? navigateTo('connect') : navigateTo('auth'))}
        onConnectGitHub={() => (isAuthenticated ? navigateTo('connect') : navigateTo('auth'))}
        onNavigateToLanding={() => navigateTo('landing')}
      >
        <AuthPage onSuccess={(target) => navigateTo(target)} />
      </PublicLayout>
    );
  }

  // Public Route: Landing
  if (currentRoute === 'landing') {
    return (
      <PublicLayout
        currentRoute="landing"
        onNavigateToApp={() => (isConnected ? navigateTo('dashboard') : isAuthenticated ? navigateTo('connect') : navigateTo('auth'))}
        onConnectGitHub={() => (isAuthenticated ? (isConnected ? navigateTo('dashboard') : navigateTo('connect')) : navigateTo('auth'))}
        onNavigateToLanding={() => navigateTo('landing')}
      >
        <LandingPage
          onGetStarted={() => (isAuthenticated ? (isConnected ? navigateTo('dashboard') : navigateTo('connect')) : navigateTo('auth'))}
          onConnectGitHub={() => (isAuthenticated ? (isConnected ? navigateTo('dashboard') : navigateTo('connect')) : navigateTo('auth'))}
        />
      </PublicLayout>
    );
  }

  // Onboarding Route: Connect GitHub
  if (currentRoute === 'connect') {
    if (!isAuthenticated) {
      return (
        <PublicLayout
          currentRoute="auth"
          onNavigateToApp={() => navigateTo('auth')}
          onConnectGitHub={() => navigateTo('auth')}
          onNavigateToLanding={() => navigateTo('landing')}
        >
          <AuthPage onSuccess={(target) => navigateTo(target)} />
        </PublicLayout>
      );
    }

    return (
      <PublicLayout
        currentRoute="connect"
        onNavigateToApp={() => navigateTo('dashboard')}
        onConnectGitHub={() => navigateTo('connect')}
        onNavigateToLanding={() => navigateTo('landing')}
      >
        <ConnectGitHubPage
          onConnected={() => navigateTo('dashboard')}
          onCancel={() => (isConnected ? navigateTo('dashboard') : navigateTo('landing'))}
        />
      </PublicLayout>
    );
  }

  if (currentRoute === 'select-repos') {
    return (
      <PublicLayout
        currentRoute="select-repos"
        onNavigateToApp={() => navigateTo('dashboard')}
        onConnectGitHub={() => navigateTo('connect')}
        onNavigateToLanding={() => navigateTo('landing')}
      >
        <RepositorySelectPage onComplete={handleCompleteRepoSelect} />
      </PublicLayout>
    );
  }

  // Protected View Gate: If unauthenticated, redirect to Auth
  if (!isAuthenticated) {
    return (
      <PublicLayout
        currentRoute="auth"
        onNavigateToApp={() => navigateTo('auth')}
        onConnectGitHub={() => navigateTo('auth')}
        onNavigateToLanding={() => navigateTo('landing')}
      >
        <AuthPage onSuccess={(target) => navigateTo(target)} />
      </PublicLayout>
    );
  }

  // If authenticated but not yet connected GitHub, redirect to Connect GitHub onboarding
  if (!isConnected) {
    return (
      <PublicLayout
        currentRoute="connect"
        onNavigateToApp={() => navigateTo('connect')}
        onConnectGitHub={() => navigateTo('connect')}
        onNavigateToLanding={() => navigateTo('landing')}
      >
        <ConnectGitHubPage
          onConnected={() => navigateTo('dashboard')}
          onCancel={() => navigateTo('landing')}
        />
      </PublicLayout>
    );
  }

  const activeSidebarRoute =
    currentRoute === 'repository-detail' ? 'repositories' : (currentRoute as 'dashboard' | 'repositories' | 'activity' | 'settings');

  return (
    <DashboardLayout
      user={user}
      activeRoute={activeSidebarRoute}
      onRouteChange={(route) => navigateTo(route as AppRoute)}
      onSignOut={handleSignOut}
    >
      {currentRoute === 'dashboard' && (
        <DashboardPage onNavigate={(route) => navigateTo(route as AppRoute)} />
      )}
      {currentRoute === 'repositories' && (
        <RepositoriesPage
          onImportClick={() => navigateTo('connect')}
          onSelectRepo={handleOpenRepoDetail}
        />
      )}
      {currentRoute === 'repository-detail' && (
        <RepositoryDetailPage
          repositoryId={selectedRepoId || 'repo-1'}
          onBack={() => navigateTo('repositories')}
        />
      )}
      {currentRoute === 'activity' && <ActivityPage />}
      {currentRoute === 'settings' && <SettingsPage />}
    </DashboardLayout>
  );
};

export default App;
