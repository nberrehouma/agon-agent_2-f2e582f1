import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Lock,
  Shield,
  Grid,
  List,
  Users,
  CreditCard,
  Briefcase,
  ShoppingBag,
  Gamepad2,
  Folder,
  Filter,
  Upload,
} from "lucide-react";
import { useVault } from "../context/VaultContext";
import { CredentialCard } from "./CredentialCard";
import { AddCredentialModal } from "./AddCredentialModal";
import { Credential, Category, categoryLabels, categoryColors } from "../types";

type ViewMode = "grid" | "list";

const categoryFilters: {
  value: Category | "all";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "all", label: "All", icon: Shield },
  { value: "social", label: "Social", icon: Users },
  { value: "finance", label: "Finance", icon: CreditCard },
  { value: "work", label: "Work", icon: Briefcase },
  { value: "shopping", label: "Shopping", icon: ShoppingBag },
  { value: "entertainment", label: "Entertainment", icon: Gamepad2 },
  { value: "other", label: "Other", icon: Folder },
];

export function Vault() {
  const { credentials, lock, addCredential } = useVault();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(
    null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const parseCSVRow = (rowText: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < rowText.length; i++) {
      const char = rowText[i];
      if (char === '"') {
        if (inQuotes && rowText[i + 1] === '"') {
          current += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
      if (lines.length <= 1) return; // No data or only header

      const headerRow = parseCSVRow(lines[0]);
      const nameIdx = headerRow.findIndex(h => h.trim().toLowerCase() === "name");
      const urlIdx = headerRow.findIndex(h => h.trim().toLowerCase() === "url");
      const usernameIdx = headerRow.findIndex(h => h.trim().toLowerCase() === "username");
      const passwordIdx = headerRow.findIndex(h => h.trim().toLowerCase() === "password");
      const noteIdx = headerRow.findIndex(h => h.trim().toLowerCase() === "note");

      // Skip the header line (index 0)
      for (let i = 1; i < lines.length; i++) {
        const row = parseCSVRow(lines[i]);
        const name = nameIdx !== -1 && row[nameIdx] !== undefined ? row[nameIdx] : "";
        const url = urlIdx !== -1 && row[urlIdx] !== undefined ? row[urlIdx] : "";
        const username = usernameIdx !== -1 && row[usernameIdx] !== undefined ? row[usernameIdx] : "";
        const password = passwordIdx !== -1 && row[passwordIdx] !== undefined ? row[passwordIdx] : "";
        const note = noteIdx !== -1 && row[noteIdx] !== undefined ? row[noteIdx] : "";

        // Skip rows that don't have basic details
        if (!name && !username && !password) continue;

        await addCredential({
          title: name || "Imported Credential",
          username: username || "",
          password: password || "",
          website: url || undefined,
          notes: note || undefined,
          category: "other",
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const filteredCredentials = useMemo(() => {
    return credentials.filter((cred) => {
      const matchesSearch =
        cred.title.toLowerCase().includes(search.toLowerCase()) ||
        cred.username.toLowerCase().includes(search.toLowerCase()) ||
        (cred.website?.toLowerCase().includes(search.toLowerCase()) ?? false);

      const matchesCategory =
        categoryFilter === "all" || cred.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [credentials, search, categoryFilter]);

  const stats = useMemo(() => {
    const byCategory = credentials.reduce(
      (acc, cred) => {
        acc[cred.category] = (acc[cred.category] || 0) + 1;
        return acc;
      },
      {} as Record<Category, number>,
    );

    return {
      total: credentials.length,
      byCategory,
    };
  }, [credentials]);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-lg shadow-cyan-500/20">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">SecureVault</h1>
                  <p className="text-xs text-slate-500">Password Manager</p>
                </div>
              </div>

              {/* Lock button */}
              <button
                onClick={lock}
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Lock className="h-4 w-4" />
                Lock Vault
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            <div className="col-span-2 sm:col-span-4 lg:col-span-1 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-3xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-slate-400">Total Credentials</p>
            </div>
            {Object.entries(stats.byCategory)
              .slice(0, 6)
              .map(([cat, count]) => (
                <div
                  key={cat}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
                >
                  <p className="text-xl font-bold text-white">{count}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {categoryLabels[cat as Category]}
                  </p>
                </div>
              ))}
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search credentials..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              {categoryFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setCategoryFilter(filter.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    categoryFilter === filter.value
                      ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/20"
                      : "border border-slate-800 bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <filter.icon className="h-4 w-4" />
                  {filter.label}
                </button>
              ))}
            </div>

            {/* View Toggle & Add */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl border border-slate-800 bg-slate-900/50 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-lg p-2 transition-colors ${
                    viewMode === "grid"
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-lg p-2 transition-colors ${
                    viewMode === "list"
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={handleImportClick}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white hover:scale-105 transition-all cursor-pointer"
              >
                <Upload className="h-5 w-5" />
                Import from Chrome
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 transition-all"
              >
                <Plus className="h-5 w-5" />
                Add New
              </button>
            </div>
          </div>

          {/* Credentials Grid/List */}
          {filteredCredentials.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800/50 mb-4">
                <Shield className="h-10 w-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {credentials.length === 0
                  ? "No credentials yet"
                  : "No matches found"}
              </h3>
              <p className="text-slate-400 text-center max-w-sm mb-6">
                {credentials.length === 0
                  ? "Start by adding your first credential to keep it safe"
                  : "Try adjusting your search or filter criteria"}
              </p>
              {credentials.length === 0 && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all"
                >
                  <Plus className="h-5 w-5" />
                  Add Your First Credential
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              layout
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-3"
              }
            >
              <AnimatePresence mode="popLayout">
                {filteredCredentials.map((credential) => (
                  <CredentialCard
                    key={credential.id}
                    credential={credential}
                    onEdit={(cred) => {
                      setEditingCredential(cred);
                      setIsAddModalOpen(true);
                    }}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>
      </div>

      {/* Add/Edit Modal */}
      <AddCredentialModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCredential(null);
        }}
      />
    </div>
  );
}
