import React from 'react';
import { VaultProvider, useVault } from './context/VaultContext';
import { MasterPasswordModalDb } from './components/MasterPasswordModalDb';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { Vault } from './components/Vault';

function AppContent() {
  const { user, isUnlocked, hasVault, isLoading, showDashboard, showLanding } = useVault();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // Render Landing Page if showLanding is true
  if (showLanding) {
    return <LandingPage />;
  }

  // If user is not authenticated, show AuthScreen (Signup / Signin)
  if (!user) {
    return <AuthScreen />;
  }

  // If user is authenticated but vault is locked, request master password setup or unlock
  if (!isUnlocked) {
    return <MasterPasswordModalDb isOpen={true} isSetup={!hasVault} />;
  }

  // If user is authenticated, vault is unlocked, check if settings dashboard is requested
  if (showDashboard) {
    return <Dashboard />;
  }

  // Otherwise, render credentials list
  return <Vault />;
}

function App() {
  return (
    <VaultProvider>
      <AppContent />
    </VaultProvider>
  );
}

export default App;
