import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  Download, 
  Users, 
  Tag, 
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { getCategoryMeta, getPaymentModeIcon, CATEGORY_CONFIG } from '../utils/categoryIcons';

export default function ExpenseList({ 
  expenses = [], 
  currency = '₹', 
  onEdit, 
  onDelete, 
  onOpenQuickAdd 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('All');

  // Filter expenses locally for instant zero-latency feedback
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = 
      !searchTerm ||
      exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.split_with?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
    const matchesPayment = selectedPaymentMode === 'All' || exp.payment_mode === selectedPaymentMode;

    return matchesSearch && matchesCategory && matchesPayment;
  });

  // Calculate filtered sum
  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by date
  const grouped = filteredExpenses.reduce((acc, exp) => {
    const d = exp.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(exp);
    return acc;
  }, {});

  const formatDateHeader = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    const yDate = new Date();
    yDate.setDate(yDate.getDate() - 1);
    const yesterday = yDate.toISOString().split('T')[0];

    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';

    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const handleExportCsv = () => {
    const token = localStorage.getItem('campus_token');
    window.open(`/api/expenses/export/csv?token=${token}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Header bar: Title, Count & Export button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Recent Expenses
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {filteredExpenses.length} entries
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total in this view: <strong className="text-slate-900 dark:text-white">{currency}{filteredTotal.toLocaleString()}</strong>
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition self-start sm:self-auto border border-slate-200/60 dark:border-slate-700"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search expenses, notes, friend splits..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Category horizontal scroll pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-400 text-[11px] font-medium shrink-0 mr-1">Category:</span>
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 rounded-lg shrink-0 font-medium transition text-xs ${
              selectedCategory === 'All'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All
          </button>
          {Object.keys(CATEGORY_CONFIG).map((catName) => (
            <button
              key={catName}
              onClick={() => setSelectedCategory(catName)}
              className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition text-xs ${
                selectedCategory === catName
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {catName}
            </button>
          ))}
        </div>

        {/* Payment mode filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <span className="text-slate-400 text-[11px] font-medium shrink-0 mr-1">Payment:</span>
          {['All', 'UPI', 'Cash', 'Card', 'Net Banking'].map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedPaymentMode(mode)}
              className={`px-2.5 py-0.5 rounded-lg shrink-0 font-medium transition text-[11px] ${
                selectedPaymentMode === mode
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Expense Items List */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No expenses found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1 mb-4">
            {searchTerm || selectedCategory !== 'All' || selectedPaymentMode !== 'All'
              ? 'Try adjusting your search or filters.'
              : 'Keep track of your chai, canteen bills, books and transport.'}
          </p>
          <button
            onClick={onOpenQuickAdd}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm transition"
          >
            + Add First Expense
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([dateStr, items]) => (
            <div key={dateStr} className="space-y-2">
              {/* Group Date Header */}
              <div className="flex items-center justify-between px-2 pt-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  {formatDateHeader(dateStr)}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {currency}{items.reduce((s, i) => s + i.amount, 0).toLocaleString()}
                </span>
              </div>

              {/* Items in this date */}
              <div className="space-y-2">
                {items.map((expense) => {
                  const meta = getCategoryMeta(expense.category);
                  const Icon = meta.icon;
                  const PaymentIcon = getPaymentModeIcon(expense.payment_mode);

                  return (
                    <div
                      key={expense.id}
                      className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-800/80 transition-all shadow-sm"
                    >
                      {/* Left: Icon & Description */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                          style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {expense.category}
                            </span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              <PaymentIcon className="w-2.5 h-2.5" />
                              {expense.payment_mode || 'UPI'}
                            </span>
                            {expense.split_with && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                                <Users className="w-2.5 h-2.5" />
                                {expense.split_with}
                              </span>
                            )}
                          </div>
                          {expense.description ? (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {expense.description}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {currency}{expense.amount.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => onEdit(expense)}
                            title="Edit expense"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(expense.id)}
                            title="Delete expense"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
