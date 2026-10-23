import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Edit3,
  Sparkles
} from 'lucide-react';

export default function BudgetCard({ stats, onEditBudget }) {
  if (!stats) return null;

  const {
    currency = '₹',
    monthlyBudget = 5000,
    totalSpentMonth = 0,
    totalSpentToday = 0,
    remainingBudget = 5000,
    budgetPercentUsed = 0,
    daysRemaining = 1,
    safeDailySpend = 0
  } = stats;

  // Determine budget health status
  let statusBadge = {
    text: 'Safe & On Track',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    barColor: 'bg-emerald-500',
    icon: CheckCircle2
  };

  if (budgetPercentUsed >= 90) {
    statusBadge = {
      text: 'Budget Critical Alert!',
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
      barColor: 'bg-rose-500',
      icon: AlertCircle
    };
  } else if (budgetPercentUsed >= 70) {
    statusBadge = {
      text: 'Careful! 70%+ Spent',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      barColor: 'bg-amber-500',
      icon: AlertCircle
    };
  }

  const StatusIcon = statusBadge.icon;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-5 sm:p-7">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-44 h-44 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

      {/* Top row: Header & Status Badge */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Monthly Allowance
              <button 
                onClick={onEditBudget}
                title="Change monthly allowance / budget"
                className="text-slate-400 hover:text-indigo-600 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {daysRemaining} day{daysRemaining === 1 ? '' : 's'} remaining this month
            </p>
          </div>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{statusBadge.text}</span>
        </div>
      </div>

      {/* Main Budget Numbers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Total Spent */}
        <div className="bg-slate-100/70 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Spent This Month</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {currency}{totalSpentMonth.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ {currency}{monthlyBudget.toLocaleString()}</span>
          </div>
        </div>

        {/* Safe Daily Spend (Key Student Feature!) */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-indigo-900/30 rounded-2xl p-4 border border-indigo-200/70 dark:border-indigo-800/60 relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Safe Daily Spend
            </p>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-200/70 dark:bg-indigo-800/80 text-indigo-800 dark:text-indigo-200 font-bold">
              Target
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
              {currency}{safeDailySpend.toLocaleString()}
            </span>
            <span className="text-xs text-indigo-500/80 dark:text-indigo-400/70 font-medium">/day</span>
          </div>
          <p className="text-[11px] text-indigo-600/80 dark:text-indigo-300/80 mt-1">
            Stay under this to not run out of money!
          </p>
        </div>

        {/* Today's Spent vs Daily Target */}
        <div className="bg-slate-100/70 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Spent Today</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              totalSpentToday > safeDailySpend && safeDailySpend > 0 
                ? 'text-rose-600 dark:text-rose-400' 
                : 'text-slate-900 dark:text-white'
            }`}>
              {currency}{totalSpentToday.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {totalSpentToday <= safeDailySpend
              ? `✅ ${currency}${(safeDailySpend - totalSpentToday).toLocaleString()} under today's limit`
              : `⚠️ Over limit by ${currency}${(totalSpentToday - safeDailySpend).toLocaleString()}`}
          </p>
        </div>
      </div>

      {/* Progress Bar & Percentage */}
      <div>
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {budgetPercentUsed}% of Allowance Used
          </span>
          <span className="font-bold text-slate-600 dark:text-slate-400">
            {currency}{remainingBudget.toLocaleString()} Available
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5">
          <div 
            className={`h-full rounded-full transition-all duration-700 ease-out ${statusBadge.barColor}`}
            style={{ width: `${Math.min(100, Math.max(2, budgetPercentUsed))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
