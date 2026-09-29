import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { AdminPortal } from './components/admin/AdminPortal';
import { GasStationPortal } from './components/station/GasStationPortal';
import { UserPortal } from './components/user/UserPortal';
import { ProjectSpecificationView } from './components/spec/ProjectSpecificationView';
import { BrandLogoLanding } from './components/auth/BrandLogoLanding';
import { LoginScreen } from './components/auth/LoginScreen';
import { RoleDetailsBanner } from './components/common/RoleDetailsBanner';

const AppContainer: React.FC = () => {
  const { isAuthenticated, authScreen, activeView, currentRole } = useApp();

  // 1. If viewing SRS documentation without authentication or from landing
  if (activeView === 'specification') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans antialiased">
        {isAuthenticated && <Header />}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <ProjectSpecificationView />
        </main>
      </div>
    );
  }

  // 2. Unauthenticated Flow: Logo Page First, then Login Screen
  if (!isAuthenticated) {
    if (authScreen === 'landing') {
      return <BrandLogoLanding />;
    }
    return <LoginScreen />;
  }

  // 3. Authenticated Flow: Header + Role Details Banner + Role Specific Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans antialiased pb-12">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Detail banner for Admin, Station, and User */}
        <RoleDetailsBanner />

        {currentRole === 'admin' && <AdminPortal />}
        {currentRole === 'station' && <GasStationPortal />}
        {currentRole === 'user' && <UserPortal />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContainer />
    </AppProvider>
  );
}

