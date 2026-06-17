import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ShieldAlert, KeyRound, CheckCircle2, ChevronLeft, LogOut, Shield } from 'lucide-react';
import { useVault } from '../context/VaultContext';

export function Dashboard() {
  const { user, credentials, updateProfile, changeMasterPassword, signout, setShowDashboard } = useVault();

  // Profile fields state
  const [username, setUsername] = useState(user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Vault fields state
  const [currentMaster, setCurrentMaster] = useState('');
  const [newMaster, setNewMaster] = useState('');
  const [confirmNewMaster, setConfirmNewMaster] = useState('');
  const [vaultLoading, setVaultLoading] = useState(false);
  const [vaultError, setVaultError] = useState('');
  const [vaultSuccess, setVaultSuccess] = useState('');

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (username.trim() === user?.username && !newPassword) {
      setProfileError('No changes made to update');
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        setProfileError('Current password is required to change password');
        return;
      }
      if (newPassword.length < 6) {
        setProfileError('New password must be at least 6 characters');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setProfileError('New passwords do not match');
        return;
      }
    }

    setProfileLoading(true);

    try {
      const success = await updateProfile(
        username.trim() !== user?.username ? username.trim() : undefined,
        currentPassword || undefined,
        newPassword || undefined
      );

      if (success) {
        setProfileSuccess('Profile updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setProfileError('Failed to update profile. Please verify your current password.');
      }
    } catch (err) {
      setProfileError('An unexpected error occurred.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleVaultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVaultError('');
    setVaultSuccess('');

    if (!currentMaster || !newMaster) {
      setVaultError('All master password fields are required');
      return;
    }

    if (newMaster.length < 6) {
      setVaultError('New master password must be at least 6 characters');
      return;
    }

    if (newMaster !== confirmNewMaster) {
      setVaultError('New master passwords do not match');
      return;
    }

    setVaultLoading(true);

    try {
      const success = await changeMasterPassword(currentMaster, newMaster);
      if (success) {
        setVaultSuccess('Master vault password updated successfully!');
        setCurrentMaster('');
        setNewMaster('');
        setConfirmNewMaster('');
      } else {
        setVaultError('Failed to update master password. Please verify current master password.');
      }
    } catch (err) {
      setVaultError('An unexpected error occurred.');
    } finally {
      setVaultLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setShowDashboard(false)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Vault
          </button>
          
          <button
            onClick={signout}
            className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {/* Dashboard Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white">Dashboard Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your account profile details and vault master passwords</p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Info Stats Panel */}
          <div className="md:col-span-1 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-lg shadow-cyan-500/20">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{user?.username}</h3>
                  <span className="text-xs text-cyan-400 font-semibold tracking-wider uppercase">Active User Account</span>
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-800 pt-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Total Credentials Saved</span>
                  <span className="text-white font-bold bg-slate-800 px-3 py-1 rounded-lg">{credentials.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Vault Version</span>
                  <span className="text-white font-mono bg-slate-800 px-3 py-1 rounded-lg">v2.0-secure</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 backdrop-blur-xl flex items-start gap-4">
              <ShieldAlert className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-400 text-sm">Password Security Notice</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Your master vault password is never sent or stored in plain text. It is encrypted in transit and hashed using secure cryptographic algorithms. Ensure it is unique and distinct from your account login password.
                </p>
              </div>
            </div>
          </div>

          {/* Configuration Forms */}
          <div className="md:col-span-2 space-y-8">
            {/* Form 1: Account profile */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <User className="h-5 w-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-white">Account Profile Settings</h2>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                {profileSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    {profileSuccess}
                  </div>
                )}
                {profileError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
                    ⚠️ {profileError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/20 py-2.5 px-4 text-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                    placeholder="Username"
                    disabled={profileLoading}
                  />
                </div>

                <div className="border-t border-slate-800/80 my-4 pt-4">
                  <h4 className="text-sm font-semibold text-slate-400 mb-3">Change Account Password</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/20 py-2.5 px-4 text-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 text-sm"
                        placeholder="Required only to change password"
                        disabled={profileLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/20 py-2.5 px-4 text-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 text-sm"
                        placeholder="At least 6 characters"
                        disabled={profileLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/20 py-2.5 px-4 text-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 text-sm"
                        placeholder="Confirm new password"
                        disabled={profileLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-2.5 px-6 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {profileLoading ? 'Saving...' : 'Update Account'}
                  </button>
                </div>
              </form>
            </div>

            {/* Form 2: Vault Settings */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <KeyRound className="h-5 w-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Vault Master Password</h2>
              </div>

              <form onSubmit={handleVaultSubmit} className="space-y-4">
                {vaultSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    {vaultSuccess}
                  </div>
                )}
                {vaultError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
                    ⚠️ {vaultError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Current Master Password</label>
                  <input
                    type="password"
                    value={currentMaster}
                    onChange={(e) => setCurrentMaster(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/20 py-2.5 px-4 text-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                    placeholder="Enter current master password"
                    disabled={vaultLoading}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">New Master Password</label>
                    <input
                      type="password"
                      value={newMaster}
                      onChange={(e) => setNewMaster(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/20 py-2.5 px-4 text-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 text-sm"
                      placeholder="At least 6 characters"
                      disabled={vaultLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm New Master Password</label>
                    <input
                      type="password"
                      value={confirmNewMaster}
                      onChange={(e) => setConfirmNewMaster(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/20 py-2.5 px-4 text-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 text-sm"
                      placeholder="Confirm new master password"
                      disabled={vaultLoading}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={vaultLoading}
                    className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {vaultLoading ? 'Changing...' : 'Change Master Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
