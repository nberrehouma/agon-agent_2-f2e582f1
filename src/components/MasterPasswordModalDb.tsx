import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Shield, Sparkles } from 'lucide-react';
import { useVault } from '../context/VaultContext';

interface MasterPasswordModalProps {
  isOpen: boolean;
  isSetup: boolean;
}

export function MasterPasswordModalDb({ isOpen, isSetup }: MasterPasswordModalProps) {
  const { unlock, setupVault } = useVault();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSetup) {
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        await setupVault(password);
      } else {
        const success = await unlock(password);
        if (!success) {
          setError('Incorrect master password');
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md"
          >
            <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
              {/* Glow effect */}
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
              
              {/* Header */}
              <div className="relative text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-lg shadow-cyan-500/30"
                >
                  <Shield className="h-10 w-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isSetup ? 'Create Your Vault' : 'Unlock Vault'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {isSetup 
                    ? 'Set a master password to secure your credentials' 
                    : 'Enter your master password to access your vault'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="relative space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Master Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pl-12 pr-12 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                      placeholder="Enter master password"
                      autoFocus
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {isSetup && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                        placeholder="Confirm master password"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:scale-100"
                >
                  {isLoading ? (
                    'Loading...'
                  ) : isSetup ? (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Create Vault
                    </span>
                  ) : (
                    'Unlock Vault'
                  )}
                </button>
              </form>

              {/* Security notice */}
              <p className="relative mt-6 text-center text-xs text-slate-500">
                🔒 Your data is stored securely in MongoDB database
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
