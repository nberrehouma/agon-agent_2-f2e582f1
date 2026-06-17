import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Lock,
  Shield,
  Grid,
  List,
  Users,
  User,
  CreditCard,
  Briefcase,
  ShoppingBag,
  Gamepad2,
  Folder,
  Filter,
  Upload,
  ChevronDown,
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

/**
 * Vault Component
 * 
 * This is the main dashboard of the application where users can view, search, 
 * filter, and manage their stored credentials. It includes functionality for 
 * importing credentials from CSV files and toggling between grid and list views.
 */
export function Vault() {
  const { credentials, lock, addCredential, setShowDashboard, user } = useVault();
  // State for the search query input
  const [search, setSearch] = useState("");
  
  // State for currently active category filters, defaults to all categories selected
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(
    categoryFilters.filter(f => f.value !== "all").map(f => f.value as Category)
  );
  
  // UI states for dropdowns and view modes
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Tracks which credential is being edited; null if adding a new one
  const [editingCredential, setEditingCredential] = useState<Credential | null>(
    null,
  );

  // Closes the category filter dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Triggers the hidden file input click event to open the file picker
   */
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Parses a single row of a CSV file, handling quoted values that might contain commas.
   * 
   * Complex Logic:
   * It iterates through characters to identify delimiters (commas) while respecting
   * content inside double quotes. If it finds a double quote inside a quoted section,
   * it handles it as an escaped quote.
   */
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

  /**
   * Processes the selected CSV file for importing credentials.
   * 
   * Complex Logic:
   * 1. Reads the file as text.
   * 2. Splits by newlines and identifies header indices (name, url, username, etc.).
   * 3. Iterates through data rows, mapping CSV columns to Credential fields.
   * 4. Automatically adds each valid row to the vault via `addCredential`.
   */
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

  /**
   * Filters the list of credentials based on search terms and selected categories.
   * Optimized with useMemo to only recalculate when dependencies change.
   */
  const filteredCredentials = useMemo(() => {
    return credentials.filter((cred) => {
      const matchesSearch =
        cred.title.toLowerCase().includes(search.toLowerCase()) ||
        cred.username.toLowerCase().includes(search.toLowerCase()) ||
        (cred.website?.toLowerCase().includes(search.toLowerCase()) ?? false);

      const matchesCategory = selectedCategories.includes(cred.category);

      return matchesSearch && matchesCategory;
    });
  }, [credentials, search, selectedCategories]);

  /**
   * Calculates statistics for the vault, such as total count and per-category breakdown.
   */
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

              {/* User Menu & Lock */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDashboard(true)}
                  className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                >
                  <User className="h-4 w-4 text-cyan-400" />
                  <span>{user?.username}'s Settings</span>
                </button>
                <button
                  type="button"
                  onClick={lock}
                  className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                >
                  <Lock className="h-4 w-4" />
                  Lock Vault
                </button>
              </div>
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
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search - takes most space */}
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

            {/* Filters & Actions */}
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {/* Category Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white transition-all whitespace-nowrap cursor-pointer"
                >
                  <Filter className="h-4 w-4 text-slate-400" />
                  <span>Category ({selectedCategories.length})</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-2 z-30 space-y-1 backdrop-blur-xl"
                    >
                      <div className="px-2 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCategories(
                              categoryFilters
                                .filter((f) => f.value !== "all")
                                .map((f) => f.value as Category),
                            )
                          }
                          className="hover:text-white transition-colors cursor-pointer"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCategories([])}
                          className="hover:text-white transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>

                      {categoryFilters
                        .filter((f) => f.value !== "all")
                        .map((filter) => {
                          const isChecked = selectedCategories.includes(
                            filter.value as Category,
                          );
                          return (
                            <label
                              key={filter.value}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedCategories((prev) =>
                                      prev.filter((c) => c !== filter.value),
                                    );
                                  } else {
                                    setSelectedCategories((prev) => [
                                      ...prev,
                                      filter.value as Category,
                                    ]);
                                  }
                                }}
                                className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500/20 h-4 w-4"
                              />
                              <filter.icon className="h-4 w-4 text-slate-400" />
                              <span>{filter.label}</span>
                            </label>
                          );
                        })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* View Toggle */}
              <div className="flex rounded-xl border border-slate-800 bg-slate-900/50 p-1">
                <button
                  type="button"
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
                  type="button"
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

              {/* CSV Input & Buttons */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={handleImportClick}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white hover:scale-105 transition-all cursor-pointer"
              >
                <Upload className="h-5 w-5" />
                Import from Chrome
              </button>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 transition-all cursor-pointer"
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
