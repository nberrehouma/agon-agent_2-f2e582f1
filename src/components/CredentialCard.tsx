import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, EyeOff, Copy, Trash2, Edit2, Globe, ExternalLink,
  Users, CreditCard, Briefcase, ShoppingBag, Gamepad2, Folder
} from 'lucide-react';
import { Credential, categoryColors, Category } from '../types';
import { useVault } from '../context/VaultContext';

interface CredentialCardProps {
  credential: Credential;
  onEdit: (credential: Credential) => void;
}

const categoryIconComponents: Record<Category, React.ComponentType<{ className?: string }>> = {
  social: Users,
  finance: CreditCard,
  work: Briefcase,
  shopping: ShoppingBag,
  entertainment: Gamepad2,
  other: Folder,
};

export function CredentialCard({ credential, onEdit }: CredentialCardProps) {
  const { deleteCredential } = useVault();
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<'username' | 'password' | null>(null);

  const copyToClipboard = async (text: string, type: 'username' | 'password') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const IconComponent = categoryIconComponents[credential.category];
  const gradientClass = categoryColors[credential.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
      className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300"
    >
      {/* Gradient accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientClass}`} />
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradientClass} shadow-lg`}>
              <IconComponent className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{credential.title}</h3>
              {credential.website && (
                <a 
                  href={credential.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  {new URL(credential.website).hostname}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(credential)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => deleteCredential(credential.id)}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Credentials */}
        <div className="space-y-3">
          {/* Username */}
          <div className="flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 mb-0.5">Username</p>
              <p className="text-sm text-white truncate">{credential.username}</p>
            </div>
            <button
              onClick={() => copyToClipboard(credential.username, 'username')}
              className={`ml-2 rounded-lg p-2 transition-all ${
                copied === 'username' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          {/* Password */}
          <div className="flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 mb-0.5">Password</p>
              <p className="text-sm text-white font-mono truncate">
                {showPassword ? credential.password : '••••••••••••'}
              </p>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                onClick={() => copyToClipboard(credential.password, 'password')}
                className={`rounded-lg p-2 transition-all ${
                  copied === 'password' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Notes */}
        {credential.notes && (
          <p className="mt-3 text-xs text-slate-500 line-clamp-2">
            📝 {credential.notes}
          </p>
        )}
      </div>
    </motion.div>
  );
}
