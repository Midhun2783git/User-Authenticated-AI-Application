import React from 'react';
import { 
  Sparkles, 
  Plus, 
  Search, 
  LogOut, 
  ShieldCheck, 
  BarChart3, 
  BookOpen, 
  CheckCircle2 
} from 'lucide-react';
import type { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile;
  currentView: 'editor' | 'history' | 'insights';
  onViewChange: (view: 'editor' | 'history' | 'insights') => void;
  onNewEntry: () => void;
  onOpenSecurity: () => void;
  onSignOut: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  entriesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentView,
  onViewChange,
  onNewEntry,
  onOpenSecurity,
  onSignOut,
  searchQuery,
  onSearchChange,
  entriesCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-50/95 backdrop-blur border-b border-stone-200 text-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button 
            id="brand-home-button"
            onClick={() => onViewChange('history')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center shadow-xs group-hover:bg-stone-800 transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-stone-900 tracking-tight flex items-center gap-1.5 text-base">
                ReflectAI
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  Gemini 3.6
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">Private AI Journal & Reflections</p>
            </div>
          </button>

          {/* Navigation tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-200/70 p-1 rounded-lg">
            <button
              id="nav-history-tab"
              onClick={() => onViewChange('history')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                currentView === 'history'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Journal Archive ({entriesCount})
            </button>
            <button
              id="nav-insights-tab"
              onClick={() => onViewChange('insights')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                currentView === 'insights'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Reflection Stats
            </button>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden lg:block">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="navbar-search-input"
              type="text"
              placeholder="Search reflections, insights, tags..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 transition"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            id="new-reflection-button"
            onClick={onNewEntry}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 text-stone-50 hover:bg-stone-800 text-xs font-medium shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Reflection</span>
          </button>

          <button
            id="security-info-button"
            onClick={onOpenSecurity}
            title="View Security & Isolation Architecture"
            className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </button>

          {/* User profile info */}
          <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full ring-1 ring-stone-300 object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-stone-300 text-stone-700 flex items-center justify-center font-bold text-xs">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <span className="text-xs font-medium text-stone-700 hidden xl:inline max-w-[120px] truncate">
              {user.displayName || user.email?.split('@')[0]}
            </span>
            <button
              id="logout-button"
              onClick={onSignOut}
              title="Sign Out"
              className="p-1.5 rounded-md text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
