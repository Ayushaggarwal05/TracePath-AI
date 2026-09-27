import React, { useState, useEffect } from 'react';
import { useUser } from './hooks/useUser';
import { DashboardLayout } from './layouts/DashboardLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { LandingPage } from './pages/LandingPage';
import { ConnectGitHubPage } from './pages/ConnectGitHubPage';
import { RepositorySelectPage } from './pages/RepositorySelectPage';
import { DashboardPage } from './pages/DashboardPage';
import { RepositoriesPage } from './pages/RepositoriesPage';
import { RepositoryDetailPage } from './pages/RepositoryDetailPage';
import { ActivityPage } from './pages/ActivityPage';
import { SettingsPage } from './pages/SettingsPage';

export type AppRoute =
  | 'landing'
  | 'connect'
  | 'select-repos'
  | 'dashboard'
  | 'repositories'
  | 'repository-detail'
  | 'activity'
  | 'settings';

const VALID_ROUTES: AppRoute[] = [
  'landing',
  'connect',
  'select-repos',
  'dashboard',
  'repositories',
  'repository-detail',
  'activity',
  'settings',
];

const getInitialRoute = (): AppRoute => {
  const isConnected = localStorage.getItem('tracepath_github_connected') === 'true';

  // 1. Check URL Hash first (e.g. #/dashboard)
  const hash = window.location.hash.replace('#/', '').replace('#', '') as AppRoute;
  if (hash && VALID_ROUTES.includes(hash)) {
    // If attempting to access protected route without being connected, fallback to landing
    const isProtected = ['dashboard', 'repositories', 'repository-detail', 'activity', 'settings'].includes(hash);
    if (isProtected && !isConnected) {
      return 'landing';
    }
    return hash;
  }

  // 2. Check localStorage persistence
  const saved = localStorage.getItem('tracepath_current_route') as AppRoute;
  if (saved && VALID_ROUTES.includes(saved)) {
    const isProtected = ['dashboard', 'repositories', 'repository-detail', 'activity', 'settings'].includes(saved);
    if (isProtected && !isConnected) {
      return 'landing';
    }
    return saved;
  }

  // 3. Default to landing page on initial visit
  return 'landing';
};

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getInitialRoute);
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(() => {
    return localStorage.getItem('tracepath_selected_repo_id') || 'repo-1';
  });
  const { user } = useUser();

  const isConnected = localStorage.getItem('tracepath_github_connected') === 'true';

  const navigateTo = (route: AppRoute) => {
    const isProtected = ['dashboard', 'repositories', 'repository-detail', 'activity', 'settings'].includes(route);
    const currentlyConnected = localStorage.getItem('tracepath_github_connected') === 'true';

    if (isProtected && !currentlyConnected) {
      // Guard protected routes: redirect to landing or connect
      setCurrentRoute('landing');
      localStorage.setItem('tracepath_current_route', 'landing');
      window.location.hash = '#/landing';
      return;
    }

    setCurrentRoute(route);
    localStorage.setItem('tracepath_current_route', route);
    window.location.hash = `#/${route}`;
  };

  // Sync route on hashchange (browser Back/Forward navigation) with safety guard
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '') as AppRoute;
      if (hash && VALID_ROUTES.includes(hash)) {
        const isProtected = ['dashboard', 'repositories', 'repository-detail', 'activity', 'settings'].includes(hash);
        const currentlyConnected = localStorage.getItem('tracepath_github_connected') === 'true';

        if (isProtected && !currentlyConnected) {
          setCurrentRoute('landing');
          localStorage.setItem('tracepath_current_route', 'landing');
          window.location.hash = '#/landing';
          return;
        }

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
    localStorage.setItem('tracepath_github_connected', 'true');
    navigateTo('dashboard');
  };

  const handleSignOut = () => {
    localStorage.removeItem('tracepath_github_connected');
    navigateTo('landing');
  };

  // Public Route Rendering
  if (currentRoute === 'landing') {
    return (
      <PublicLayout
        currentRoute="landing"
        onNavigateToApp={() => (isConnected ? navigateTo('dashboard') : navigateTo('connect'))}
        onConnectGitHub={() => navigateTo('connect')}
        onNavigateToLanding={() => navigateTo('landing')}
      >
        <LandingPage
          onGetStarted={() => navigateTo('connect')}
          onConnectGitHub={() => navigateTo('connect')}
        />
      </PublicLayout>
    );
  }

  if (currentRoute === 'connect') {
    return (
      <PublicLayout
        currentRoute="connect"
        onNavigateToApp={() => (isConnected ? navigateTo('dashboard') : navigateTo('connect'))}
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

  if (currentRoute === 'select-repos') {
    return (
      <PublicLayout
        currentRoute="select-repos"
        onNavigateToApp={() => (isConnected ? navigateTo('dashboard') : navigateTo('connect'))}
        onConnectGitHub={() => navigateTo('connect')}
        onNavigateToLanding={() => navigateTo('landing')}
      >
        <RepositorySelectPage onComplete={handleCompleteRepoSelect} />
      </PublicLayout>
    );
  }

  // Fallback guard: if someone is unauthenticated and hits protected view
  if (!isConnected) {
    return (
      <PublicLayout
        currentRoute="landing"
        onNavigateToApp={() => navigateTo('connect')}
        onConnectGitHub={() => navigateTo('connect')}
        onNavigateToLanding={() => navigateTo('landing')}
      >
        <LandingPage
          onGetStarted={() => navigateTo('connect')}
          onConnectGitHub={() => navigateTo('connect')}
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
