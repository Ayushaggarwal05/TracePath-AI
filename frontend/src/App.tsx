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
  // 1. Check URL Hash first (e.g. #/dashboard)
  const hash = window.location.hash.replace('#/', '').replace('#', '') as AppRoute;
  if (hash && VALID_ROUTES.includes(hash)) {
    return hash;
  }
  // 2. Check localStorage persistence
  const saved = localStorage.getItem('tracepath_current_route') as AppRoute;
  if (saved && VALID_ROUTES.includes(saved)) {
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

  const navigateTo = (route: AppRoute) => {
    setCurrentRoute(route);
    localStorage.setItem('tracepath_current_route', route);
    window.location.hash = `#/${route}`;
  };

  // Sync route on hashchange (browser Back/Forward navigation)
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
    localStorage.setItem('tracepath_github_connected', 'true');
    navigateTo('dashboard');
  };

  // Route Rendering
  if (currentRoute === 'landing') {
    return (
      <PublicLayout
        onNavigateToApp={() => navigateTo('dashboard')}
        onConnectGitHub={() => navigateTo('connect')}
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
        onNavigateToApp={() => navigateTo('dashboard')}
        onConnectGitHub={() => navigateTo('connect')}
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
        onNavigateToApp={() => navigateTo('dashboard')}
        onConnectGitHub={() => navigateTo('connect')}
      >
        <RepositorySelectPage onComplete={handleCompleteRepoSelect} />
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
