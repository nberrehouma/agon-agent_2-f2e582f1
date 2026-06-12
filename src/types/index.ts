export interface Credential {
  id: string;
  title: string;
  username: string;
  password: string;
  website?: string;
  notes?: string;
  category: Category;
  createdAt: number;
  updatedAt: number;
}

export type Category = 'social' | 'finance' | 'work' | 'shopping' | 'entertainment' | 'other';

export interface VaultState {
  isUnlocked: boolean;
  credentials: Credential[];
  masterPasswordHash: string | null;
}

export const categoryColors: Record<Category, string> = {
  social: 'from-pink-500 to-rose-500',
  finance: 'from-emerald-500 to-teal-500',
  work: 'from-blue-500 to-indigo-500',
  shopping: 'from-amber-500 to-orange-500',
  entertainment: 'from-purple-500 to-violet-500',
  other: 'from-slate-500 to-gray-500',
};

export const categoryIcons: Record<Category, string> = {
  social: 'Users',
  finance: 'CreditCard',
  work: 'Briefcase',
  shopping: 'ShoppingBag',
  entertainment: 'Gamepad2',
  other: 'Folder',
};

export const categoryLabels: Record<Category, string> = {
  social: 'Social Media',
  finance: 'Finance & Banking',
  work: 'Work & Business',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  other: 'Other',
};
