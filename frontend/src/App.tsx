import React, { useState } from 'react';
import { useUser } from './hooks/useUser';
import { DashboardLayout } from './layouts/DashboardLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { LandingPage } from './pages/LandingPage';
import { ConnectGitHubPage } from './pages/ConnectGitHubPage';
import { RepositorySelectPage } from './pages/RepositorySelectPage';
import { DashboardPage } from './pages/DashboardPage';
import { RepositoriesPage } from './pages/RepositoriesPage';
import { ActivityPage } from './pages/ActivityPage';
import { SettingsPage } from './pages/SettingsPage';

export type AppRoute =
  | 'landing'
  | 'connect'
  | 'select-repos'
  | 'dashboard'
  | 'repositories'
  | 'activity'
  | 'settings';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('dashboard');
  const { user } = useUser();

  // Route Rendering
  if (currentRoute === 'landing') {
    return (
      <PublicLayout onNavigateToApp={() => setCurrentRoute('dashboard')}>
        <LandingPage
          onGetStarted={() => setCurrentRoute('dashboard')}
          onConnectGitHub={() => setCurrentRoute('connect')}
        />
      </PublicLayout>
    );
  }

  if (currentRoute === 'connect') {
    return (
      <PublicLayout onNavigateToApp={() => setCurrentRoute('dashboard')}>
        <ConnectGitHubPage
          onConnected={() => setCurrentRoute('select-repos')}
          onCancel={() => setCurrentRoute('dashboard')}
        />
      </PublicLayout>
    );
  }

  if (currentRoute === 'select-repos') {
    return (
      <PublicLayout onNavigateToApp={() => setCurrentRoute('dashboard')}>
        <RepositorySelectPage onComplete={() => setCurrentRoute('dashboard')} />
      </PublicLayout>
    );
  }

  return (
    <DashboardLayout
      user={user}
      activeRoute={currentRoute as 'dashboard' | 'repositories' | 'activity' | 'settings'}
      onRouteChange={(route) => setCurrentRoute(route as AppRoute)}
    >
      {currentRoute === 'dashboard' && (
        <DashboardPage onNavigate={(route) => setCurrentRoute(route as AppRoute)} />
      )}
      {currentRoute === 'repositories' && (
        <RepositoriesPage onImportClick={() => setCurrentRoute('connect')} />
      )}
      {currentRoute === 'activity' && <ActivityPage />}
      {currentRoute === 'settings' && <SettingsPage />}
    </DashboardLayout>
  );
};

export default App;
