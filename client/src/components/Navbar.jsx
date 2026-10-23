import React from 'react';
import { 
  GraduationCap, 
  Smartphone, 
  Sun, 
  Moon, 
  LogOut, 
  User, 
  PlusCircle,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ 
  darkMode, 
  setDarkMode, 
  onOpenQuickAdd, 
  onOpenConnectPhone, 
  onOpenProfile 
}) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 glass bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                  CampusSpend
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Student Edition
                </span>
              </div>
              <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400">
                {user?.college ? user.college : 'College Daily Expense & Budget Tracker'}
              </p>
            </div>
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Add Expense button (desktop/tablet) */}
            <button
              onClick={onOpenQuickAdd}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm shadow-indigo-500/25 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Expense</span>
            </button>

            {/* Connect Phone Button */}
            <button
              onClick={onOpenConnectPhone}
              title="Open on your phone via Wi-Fi"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition border border-slate-200/60 dark:border-slate-700"
            >
              <Smartphone className="w-4 h-4 text-indigo-500" />
              <span className="hidden sm:inline">Use on Phone</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Profile Pill */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <div className="hidden lg:block text-xs leading-tight">
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                  {user?.name || 'Student'}
                </p>
                <p className="text-slate-400 text-[10px] truncate max-w-[100px]">
                  Budget: {user?.currency}{user?.monthly_budget}
                </p>
              </div>
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              title="Log out"
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
