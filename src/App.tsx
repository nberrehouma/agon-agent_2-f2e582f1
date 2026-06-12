import React from 'react';
import { VaultProvider, useVault } from './context/VaultContext';
import { MasterPasswordModalDb } from './components/MasterPasswordModalDb';
import { Vault } from './components/Vault';

function AppContent() {
  const { isUnlocked, hasVault, isLoading } = useVault();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!isUnlocked) {
    return <MasterPasswordModalDb isOpen={true} isSetup={!hasVault} />;
  }

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
