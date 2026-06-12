import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Credential, VaultState } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface VaultContextType extends VaultState {
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  setupVault: (password: string) => Promise<void>;
  addCredential: (credential: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCredential: (id: string, credential: Partial<Credential>) => Promise<void>;
  deleteCredential: (id: string) => Promise<void>;
  hasVault: boolean;
  isLoading: boolean;
}

const VaultContext = createContext<VaultContextType | null>(null);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasVault, setHasVault] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const masterPasswordHash = hasVault ? 'stored' : null;

  // Check if vault has been set up on mount
  useEffect(() => {
    async function checkVault() {
      try {
        const res = await fetch('/api/vault/has-hash');
        if (res.ok) {
          const data = await res.json();
          setHasVault(data.hasVault);
        }
      } catch (error) {
        console.error('Error checking vault setup:', error);
      } finally {
        setIsLoading(false);
      }
    }
    checkVault();
  }, []);

  const setupVault = useCallback(async (password: string) => {
    try {
      const res = await fetch('/api/vault/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setHasVault(true);
        setIsUnlocked(true);
        setCredentials([]);
      } else {
        throw new Error('Failed to set up vault');
      }
    } catch (error) {
      console.error('Error setting up vault:', error);
      throw error;
    }
  }, []);

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/vault/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsUnlocked(true);
          // Fetch credentials once successfully unlocked
          const credsRes = await fetch('/api/credentials');
          if (credsRes.ok) {
            const creds = await credsRes.json();
            setCredentials(creds);
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error unlocking vault:', error);
      return false;
    }
  }, []);

  const lock = useCallback(() => {
    setIsUnlocked(false);
    setCredentials([]);
  }, []);

  const addCredential = useCallback(async (credential: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newCredential: Credential = {
      ...credential,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await fetch('/api/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCredential),
      });
      if (res.ok) {
        const saved = await res.json();
        setCredentials(prev => [...prev, saved]);
      } else {
        console.error('Failed to save credential to DB');
      }
    } catch (error) {
      console.error('Error adding credential:', error);
    }
  }, []);

  const updateCredential = useCallback(async (id: string, updates: Partial<Credential>) => {
    const now = Date.now();
    try {
      const res = await fetch(`/api/credentials/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...updates, updatedAt: now }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCredentials(prev => prev.map(cred => 
          cred.id === id ? updated : cred
        ));
      } else {
        console.error('Failed to update credential in DB');
      }
    } catch (error) {
      console.error('Error updating credential:', error);
    }
  }, []);

  const deleteCredential = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/credentials/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCredentials(prev => prev.filter(cred => cred.id !== id));
      } else {
        console.error('Failed to delete credential from DB');
      }
    } catch (error) {
      console.error('Error deleting credential:', error);
    }
  }, []);

  return (
    <VaultContext.Provider value={{
      isUnlocked,
      credentials,
      masterPasswordHash,
      unlock,
      lock,
      setupVault,
      addCredential,
      updateCredential,
      deleteCredential,
      hasVault,
      isLoading,
    }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}
