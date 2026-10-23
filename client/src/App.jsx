import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';
import Navbar from './components/Navbar';
import BudgetCard from './components/BudgetCard';
import ExpenseList from './components/ExpenseList';
import AnalyticsView from './components/AnalyticsView';
import QuickAddModal from './components/QuickAddModal';
import ConnectPhoneModal from './components/ConnectPhoneModal';
import ProfileModal from './components/ProfileModal';
import AuthView from './components/AuthView';
import BottomNav from './components/BottomNav';
import { 
  Plus, 
  TrendingUp, 
  History, 
  PieChart, 
  LayoutDashboard, 
  Smartphone,
  Sparkles,
  Coffee,
  BookOpen,
  Utensils,
  Bus
} from 'lucide-react';

function DashboardContent() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('campus_theme') === 'dark' || 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard', 'analytics', 'history', 'profile'
  const [stats, setStats] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isConnectPhoneOpen, setIsConnectPhoneOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Theme effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('campus_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('campus_theme', 'light');
    }
  }, [darkMode]);

  // Fetch stats and expenses
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, expensesRes] = await Promise.all([
        api.getStatsSummary(),
        api.getExpenses()
      ]);
      setStats(statsRes);
      setExpenses(expensesRes.expenses || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle adding or updating an expense
  const handleSaveExpense = async (expenseData) => {
    if (editingExpense) {
      await api.updateExpense(editingExpense.id, expenseData);
      setEditingExpense(null);
    } else {
      await api.createExpense(expenseData);
    }
    await fetchData();
  };

  // Handle edit trigger
  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setIsQuickAddOpen(true);
  };

  // Handle delete trigger
  const handleDeleteExpense = async (id) => {
    if (window.confirm('Delete this expense?')) {
      try {
        await api.deleteExpense(id);
        await fetchData();
      } catch (err) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const currency = stats?.currency || user?.currency || '₹';

  // Quick 1-tap presets for students from dashboard
  const handleFastAdd = (categoryName, defaultAmount) => {
    setEditingExpense({
      amount: defaultAmount,
      category: categoryName,
      description: '',
      payment_mode: 'UPI',
      date: new Date().toISOString().split('T')[0]
    });
    setIsQuickAddOpen(true);
  };

  return (
    <div className="min-h-screen pb-20 sm:pb-12 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenQuickAdd={() => { setEditingExpense(null); setIsQuickAddOpen(true); }}
        onOpenConnectPhone={() => setIsConnectPhoneOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7">
        {/* Student Welcome Banner & Desktop Tab Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Hey, {user?.name?.split(' ')[0] || 'Student'}</span>
              <span className="text-xl">👋</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {user?.college && ` • ${user.college}`}
            </p>
          </div>

          {/* Desktop Tab Switcher */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 self-start md:self-auto">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                currentTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setCurrentTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                currentTab === 'analytics'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Analytics & Trends</span>
            </button>

            <button
              onClick={() => setCurrentTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                currentTab === 'history'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>All Expenses</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Dashboard / Overview */}
        {(currentTab === 'dashboard' || (window.innerWidth < 640 && currentTab === 'dashboard')) && (
          <div className="space-y-6">
            {/* Primary Budget & Safe Daily Spend Card */}
            <BudgetCard
              stats={stats}
              onEditBudget={() => setIsProfileOpen(true)}
            />

            {/* Quick 1-Tap Student Shortcuts */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Quick Presets
                </span>
                <span className="text-[11px] text-slate-400">1-Tap Fast Log</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => handleFastAdd('Chai & Snacks', 30)}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 text-left transition active:scale-95"
                >
                  <Coffee className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Chai / Snack</p>
                    <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80">{currency}30 Preset</p>
                  </div>
                </button>

                <button
                  onClick={() => handleFastAdd('Food & Mess', 120)}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/40 text-left transition active:scale-95"
                >
                  <Utensils className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Canteen Lunch</p>
                    <p className="text-[10px] text-orange-600/80 dark:text-orange-400/80">{currency}120 Preset</p>
                  </div>
                </button>

                <button
                  onClick={() => handleFastAdd('Commute & Travel', 50)}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-900/40 text-left transition active:scale-95"
                >
                  <Bus className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Metro / Auto</p>
                    <p className="text-[10px] text-cyan-600/80 dark:text-cyan-400/80">{currency}50 Preset</p>
                  </div>
                </button>

                <button
                  onClick={() => handleFastAdd('Books & Xerox', 40)}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 text-left transition active:scale-95"
                >
                  <BookOpen className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Lab / Xerox</p>
                    <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80">{currency}40 Preset</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Expenses List */}
            <ExpenseList
              expenses={expenses}
              currency={currency}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
              onOpenQuickAdd={() => { setEditingExpense(null); setIsQuickAddOpen(true); }}
            />
          </div>
        )}

        {/* Tab 2: Analytics & Trends */}
        {currentTab === 'analytics' && (
          <AnalyticsView
            stats={stats}
            currency={currency}
          />
        )}

        {/* Tab 3: History */}
        {currentTab === 'history' && (
          <ExpenseList
            expenses={expenses}
            currency={currency}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
            onOpenQuickAdd={() => { setEditingExpense(null); setIsQuickAddOpen(true); }}
          />
        )}

        {/* Tab 4: Profile (for mobile navigation) */}
        {currentTab === 'profile' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Student Account</h2>
            <p className="text-xs text-slate-500">Logged in as {user?.email}</p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => setIsProfileOpen(true)}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-xs text-center"
              >
                Edit Budget & College Info
              </button>
              <button
                onClick={() => setIsConnectPhoneOpen(true)}
                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs text-center flex items-center justify-center gap-1.5"
              >
                <Smartphone className="w-4 h-4 text-indigo-500" />
                <span>Show Phone QR Code</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenQuickAdd={() => { setEditingExpense(null); setIsQuickAddOpen(true); }}
      />

      {/* Floating Add Button for Mobile (Floating right above bottom nav if wanted) */}
      <div className="sm:hidden fixed bottom-20 right-4 z-30">
        <button
          onClick={() => { setEditingExpense(null); setIsQuickAddOpen(true); }}
          className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center active:scale-95 transition"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Modals */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => { setIsQuickAddOpen(false); setEditingExpense(null); }}
        onAddExpense={handleSaveExpense}
        currency={currency}
        initialData={editingExpense}
      />

      <ConnectPhoneModal
        isOpen={isConnectPhoneOpen}
        onClose={() => setIsConnectPhoneOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onProfileUpdated={fetchData}
      />
    </div>
  );
}

function MainApp() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading CampusSpend...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return <DashboardContent />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
