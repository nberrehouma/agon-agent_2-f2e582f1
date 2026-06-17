import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, User, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useVault } from '../context/VaultContext';

export function AuthScreen() {
  const { signin, signup } = useVault();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const success = await signin(username, password);
        if (!success) {
          setError('Invalid username or password');
        }
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        const success = await signup(username, password);
        if (success) {
          setSuccessMsg('Account created successfully! Please sign in.');
          setIsLogin(true);
          setPassword('');
          setConfirmPassword('');
        } else {
          setError('Username already exists or registration failed');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
          {/* Top glowing decorations */}
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />

          {/* Logo & Header */}
          <div className="relative text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1, stiffness: 120 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-lg shadow-cyan-500/30"
            >
              <Shield className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              {isLogin
                ? 'Sign in to access your secure password vaults'
                : 'Sign up to configure your own personal vault'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative space-y-5">
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm text-center font-medium"
              >
                {successMsg}
              </motion.div>
            )}

            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/40 py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  placeholder="Enter username"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/40 py-3 pl-12 pr-12 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                  placeholder="At least 6 characters"
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

            {/* Confirm Password (only on Signup) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/40 py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                      placeholder="Confirm password"
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-400 text-sm text-center font-medium"
                >
                  ⚠️ {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:scale-100 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isLogin ? (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Sign Up
                </>
              )}
            </button>

            {/* Toggle Switch */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleToggle}
                className="text-sm text-slate-400 hover:text-cyan-400 transition-colors font-medium cursor-pointer"
              >
                {isLogin ? (
                  <span>Don't have an account? <strong className="text-cyan-500">Sign Up</strong></span>
                ) : (
                  <span>Already have an account? <strong className="text-cyan-500">Sign In</strong></span>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
