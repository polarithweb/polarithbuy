import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  BookOpen, 
  Monitor, 
  Cpu, 
  ArrowLeft, 
  Lock, 
  LogOut, 
  Database, 
  ShieldCheck, 
  KeyRound, 
  AlertCircle, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import type { Book } from '../data/booksData';
import type { PcBuild } from '../data/pcBuildsData';
import type { Accessory } from '../data/accessoriesData';
import { 
  isUserAdminAuthenticated, 
  setAdminAuthenticated, 
  verifyAdminPassword 
} from '../utils/adminAuth';
import { OrdersAdminView } from './OrdersAdminView';
import { BooksAdminPortal } from './BooksAdminPortal';
import { PcBuildsAdminPortal } from './PcBuildsAdminPortal';
import { AccessoriesAdminPortal } from './AccessoriesAdminPortal';

export type UnifiedAdminTab = 'orders' | 'books' | 'pc-builds' | 'accessories';

interface UnifiedAdminPortalProps {
  onBack: () => void;
  books: Book[];
  builds: PcBuild[];
  accessories: Accessory[];
  initialTab?: UnifiedAdminTab;
}

export function UnifiedAdminPortal({
  onBack,
  books,
  builds,
  accessories,
  initialTab = 'orders'
}: UnifiedAdminPortalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isUserAdminAuthenticated());
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<UnifiedAdminTab>(initialTab);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(passwordInput)) {
      setAdminAuthenticated(true);
      setIsAuthenticated(true);
      setAuthError(null);
      setPasswordInput('');
    } else {
      setAuthError('Incorrect master passcode. Access denied.');
      setPasswordInput('');
    }
  };

  const handleLockPortal = () => {
    setAdminAuthenticated(false);
    setIsAuthenticated(false);
    setPasswordInput('');
    setAuthError(null);
  };

  // Locked Passcode Gate
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="max-w-md mx-auto w-full px-4 py-16 sm:py-24"
      >
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5 border border-sky-100 shadow-2xs">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Polarith Unified Admin
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
            Manage Books, PC Builds, Tech Accessories inventory, and inspect live customer orders from one central desk.
          </p>

          {authError && (
            <div className="w-full mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleUnlock} className="w-full space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter Master Password"
                autoFocus
                className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-hidden text-sm text-slate-800 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                title={showPassword ? 'Hide passcode' : 'Show passcode'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm hover:shadow flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-sky-200" />
              <span>Unlock Unified Admin Portal</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 w-full flex flex-col items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Master Admin Access Protected</span>
            </div>
            
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Main Hub</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Authenticated Unified Portal
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Sleek Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Exit to Main Page & Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer"
              title="Return to Main Hub"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Exit to Main Hub</span>
              <span className="sm:hidden">Exit</span>
            </button>

            <span className="hidden sm:block h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-2xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-900 hidden md:inline">
                Polarith Admin Desk
              </span>
            </div>
          </div>

          {/* Center: 4 Department Tabs */}
          <nav className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/60 overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-white text-sky-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Package className={`w-4 h-4 ${activeTab === 'orders' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>Customer Orders</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('books')}
              className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'books'
                  ? 'bg-white text-sky-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${activeTab === 'books' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>Books</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pc-builds')}
              className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'pc-builds'
                  ? 'bg-white text-sky-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Monitor className={`w-4 h-4 ${activeTab === 'pc-builds' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>PC Builds</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('accessories')}
              className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'accessories'
                  ? 'bg-white text-sky-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Cpu className={`w-4 h-4 ${activeTab === 'accessories' ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>Accessories</span>
            </button>
          </nav>

          {/* Right: Cloud Status & Lock */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Firestore Connected</span>
            </div>

            <button
              type="button"
              onClick={handleLockPortal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              title="Lock Admin Session"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Lock</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tabbed Content Area */}
      <main className="flex-1 w-full pb-16">
        {activeTab === 'orders' && (
          <div key="tab-orders">
            <OrdersAdminView hideHeader={true} />
          </div>
        )}

        {activeTab === 'books' && (
          <div key="tab-books">
            <BooksAdminPortal
              books={books}
              onBack={onBack}
              hideHeader={true}
            />
          </div>
        )}

        {activeTab === 'pc-builds' && (
          <div key="tab-pc-builds">
            <PcBuildsAdminPortal
              builds={builds}
              onBack={onBack}
              hideHeader={true}
            />
          </div>
        )}

        {activeTab === 'accessories' && (
          <div key="tab-accessories">
            <AccessoriesAdminPortal
              accessories={accessories}
              onBack={onBack}
              hideHeader={true}
            />
          </div>
        )}
      </main>
    </div>
  );
}
