import React from 'react';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  CreditCard, 
  AlertTriangle, 
  Award,
  Calendar
} from 'lucide-react';
import { getCategoryMeta, CATEGORY_CONFIG } from '../utils/categoryIcons';

export default function AnalyticsView({ stats, currency = '₹' }) {
  if (!stats) return null;

  const {
    categoryStats = [],
    paymentModeStats = [],
    dailyHistory = [],
    totalSpentMonth = 0,
    monthlyBudget = 5000
  } = stats;

  // Compute percentages for categories
  const categoryWithPercentages = categoryStats.map(item => {
    const percent = totalSpentMonth > 0 ? Math.round((item.total / totalSpentMonth) * 100) : 0;
    const meta = getCategoryMeta(item.category);
    return { ...item, percent, meta };
  });

  // Find max daily spend to scale bar charts
  const maxDaily = Math.max(...dailyHistory.map(d => d.total), 1);

  // Top spending category
  const topCategory = categoryWithPercentages.length > 0 ? categoryWithPercentages[0] : null;

  // SVG Donut calculation
  let cumulativeAngle = 0;
  const donutSegments = categoryWithPercentages.map(cat => {
    const fraction = totalSpentMonth > 0 ? cat.total / totalSpentMonth : 0;
    const angle = fraction * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;

    // SVG arc coordinates
    const radius = 38;
    const cx = 50;
    const cy = 50;
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (startAngle + angle - 90) * (Math.PI / 180);

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;
    const d = fraction >= 0.999
      ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius}`
      : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

    return {
      category: cat.category,
      color: cat.meta.color,
      d,
      percent: cat.percent,
      total: cat.total
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Spending Highlight */}
      {topCategory && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 rounded-2xl p-4 sm:p-5 border border-amber-200/60 dark:border-amber-900/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${topCategory.meta.color}20`, color: topCategory.meta.color }}
            >
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Highest Expense Category This Month
              </p>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {topCategory.category} — {currency}{topCategory.total.toLocaleString()} ({topCategory.percent}%)
              </h4>
            </div>
          </div>
          <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm">
            {topCategory.count} transaction{topCategory.count === 1 ? '' : 's'}
          </span>
        </div>
      )}

      {/* Grid: Donut Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Donut & Percentages */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-500" />
              Category Breakdown
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Current Month</span>
          </div>

          {categoryWithPercentages.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No expense data recorded yet for this month.</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Donut SVG */}
              <div className="relative w-40 h-40 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="12" className="text-slate-100 dark:text-slate-800" />
                  {donutSegments.map((seg, idx) => (
                    <path
                      key={idx}
                      d={seg.d}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="12"
                      strokeLinecap="round"
                      className="transition-all duration-500 hover:opacity-80"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Spent</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {currency}{totalSpentMonth.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-2 w-full min-w-0">
                {categoryWithPercentages.slice(0, 5).map((item) => (
                  <div key={item.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.meta.color }} />
                      <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold text-slate-900 dark:text-white">{currency}{item.total.toLocaleString()}</span>
                      <span className="text-slate-400 text-[11px] w-8 text-right font-mono">{item.percent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Payment Methods (UPI vs Cash vs Card) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-500" />
              Payment Methods
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">UPI / Cash / Card</span>
          </div>

          {paymentModeStats.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No payment transactions recorded.</p>
          ) : (
            <div className="space-y-3.5">
              {paymentModeStats.map((item) => {
                const percent = totalSpentMonth > 0 ? Math.round((item.total / totalSpentMonth) * 100) : 0;
                return (
                  <div key={item.payment_mode} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.payment_mode || 'UPI'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{currency}{item.total.toLocaleString()}</span>
                        <span className="text-slate-400 font-mono text-[11px]">({percent}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Daily Spending Trend (Last 14 Days Bar Chart) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            Daily Spending Trend (Recent Activity)
          </h3>
          <span className="text-xs text-slate-400">Peak: {currency}{maxDaily.toLocaleString()}</span>
        </div>

        {dailyHistory.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No daily history available yet.</p>
        ) : (
          <div className="pt-4">
            <div className="flex items-end gap-2 sm:gap-3 h-40 w-full overflow-x-auto pb-2">
              {dailyHistory.map((item) => {
                const heightPercent = Math.max(8, Math.round((item.total / maxDaily) * 100));
                const dayLabel = item.date.slice(8); // get DD
                return (
                  <div key={item.date} className="flex-1 flex flex-col items-center gap-1.5 min-w-[28px] group">
                    <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                      {currency}{item.total}
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg h-32 flex items-end p-0.5">
                      <div
                        className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-t-md transition-all duration-300"
                        style={{ height: `${heightPercent}%` }}
                        title={`${item.date}: ${currency}${item.total}`}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
