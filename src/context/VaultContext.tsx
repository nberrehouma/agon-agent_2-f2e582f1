import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Credential, VaultState } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  username: string;
}

interface VaultContextType extends VaultState {
  user: User | null;
  token: string | null;
  signup: (username: string, password: string) => Promise<boolean>;
  signin: (username: string, password: string) => Promise<boolean>;
  signout: () => void;
  updateProfile: (username?: string, currentPassword?: string, newPassword?: string) => Promise<boolean>;
  changeMasterPassword: (currentMasterPassword: string, newMasterPassword: string) => Promise<boolean>;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  setupVault: (password: string) => Promise<void>;
  addCredential: (credential: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCredential: (id: string, credential: Partial<Credential>) => Promise<void>;
  deleteCredential: (id: string) => Promise<void>;
  hasVault: boolean;
  isLoading: boolean;
  showDashboard: boolean;
  setShowDashboard: (show: boolean) => void;
}

const VaultContext = createContext<VaultContextType | null>(null);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasVault, setHasVault] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('vault_token'));
  const [showDashboard, setShowDashboard] = useState(false);

  const masterPasswordHash = hasVault ? 'stored' : null;

  // Fetch the logged-in user profile if a token exists
  const fetchProfile = useCallback(async (jwtToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ id: data._id, username: data.username });
        return true;
      } else {
        localStorage.removeItem('vault_token');
        setToken(null);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('vault_token');
      setToken(null);
      setUser(null);
      return false;
    }
  }, []);

  // Check if vault has been set up for the authenticated user
  const checkVault = useCallback(async (jwtToken: string) => {
    try {
      const res = await fetch('/api/vault/has-hash', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setHasVault(data.hasVault);
      }
    } catch (error) {
      console.error('Error checking vault setup:', error);
    }
  }, []);

  // Verify and load session on mount
  useEffect(() => {
    async function initSession() {
      if (token) {
        const isValid = await fetchProfile(token);
        if (isValid) {
          await checkVault(token);
        }
      }
      setIsLoading(false);
    }
    initSession();
  }, [token, fetchProfile, checkVault]);

  const signup = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      return res.ok;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  }, []);

  const signin = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('vault_token', data.token);
        setToken(data.token);
        setUser(data.user);
        await checkVault(data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signin error:', error);
      return false;
    }
  }, [checkVault]);

  const signout = useCallback(() => {
    localStorage.removeItem('vault_token');
    setToken(null);
    setUser(null);
    setIsUnlocked(false);
    setCredentials([]);
    setHasVault(false);
    setShowDashboard(false);
  }, []);

  const updateProfile = useCallback(async (username?: string, currentPassword?: string, newPassword?: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, currentPassword, newPassword }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  }, [token]);

  const changeMasterPassword = useCallback(async (currentMasterPassword: string, newMasterPassword: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/vault/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentMasterPassword, newMasterPassword }),
      });
      return res.ok;
    } catch (error) {
      console.error('Change master password error:', error);
      return false;
    }
  }, [token]);

  const setupVault = useCallback(async (password: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/vault/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
  }, [token]);

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/vault/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsUnlocked(true);
          // Fetch credentials once successfully unlocked
          const credsRes = await fetch('/api/credentials', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
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
  }, [token]);

  const lock = useCallback(() => {
    setIsUnlocked(false);
    setCredentials([]);
  }, []);

  const addCredential = useCallback(async (credential: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!token) return;
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
          'Authorization': `Bearer ${token}`
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
  }, [token]);

  const updateCredential = useCallback(async (id: string, updates: Partial<Credential>) => {
    if (!token) return;
    const now = Date.now();
    try {
      const res = await fetch(`/api/credentials/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
  }, [token]);

  const deleteCredential = useCallback(async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/credentials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setCredentials(prev => prev.filter(cred => cred.id !== id));
      } else {
        console.error('Failed to delete credential from DB');
      }
    } catch (error) {
      console.error('Error deleting credential:', error);
    }
  }, [token]);

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
      user,
      token,
      signup,
      signin,
      signout,
      updateProfile,
      changeMasterPassword,
      showDashboard,
      setShowDashboard
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
