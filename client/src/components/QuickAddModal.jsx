import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Smartphone, 
  Banknote, 
  CreditCard, 
  Building2, 
  Users, 
  Calendar as CalendarIcon,
  Tag
} from 'lucide-react';
import { CATEGORY_CONFIG } from '../utils/categoryIcons';

const PAYMENT_MODES = [
  { id: 'UPI', label: 'UPI', icon: Smartphone, highlight: true },
  { id: 'Cash', label: 'Cash', icon: Banknote },
  { id: 'Card', label: 'Card', icon: CreditCard },
  { id: 'Net Banking', label: 'Net Banking', icon: Building2 },
];

const PRESET_AMOUNTS = [20, 50, 100, 200, 500];

export default function QuickAddModal({ 
  isOpen, 
  onClose, 
  onAddExpense, 
  currency = '₹',
  initialData = null 
}) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Mess');
  const [description, setDescription] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [splitWith, setSplitWith] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount ? String(initialData.amount) : '');
      setCategory(initialData.category || 'Food & Mess');
      setDescription(initialData.description || '');
      setPaymentMode(initialData.payment_mode || 'UPI');
      setSplitWith(initialData.split_with || '');
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
    } else {
      setAmount('');
      setCategory('Food & Mess');
      setDescription('');
      setPaymentMode('UPI');
      setSplitWith('');
      setDate(new Date().toISOString().split('T')[0]);
    }
    setError('');
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleQuickAddAmount = (addVal) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + addVal));
  };

  const handleSetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid expense amount.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onAddExpense({
        amount: parsedAmount,
        category,
        description,
        payment_mode: paymentMode,
        split_with: splitWith,
        date
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Modal Dialog (Bottom sheet on mobile, centered card on laptop) */}
      <div 
        className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {initialData ? 'Edit Expense' : 'Log Daily Expense'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
              {error}
            </div>
          )}

          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Expense Amount ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                {currency}
              </span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                autoFocus
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition"
              />
            </div>

            {/* Quick Presets (+20, +50, +100, +200, +500) */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 self-center mr-1">Quick Add:</span>
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => handleQuickAddAmount(amt)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition border border-slate-200/60 dark:border-slate-700"
                >
                  +{currency}{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Student Category Selection Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(CATEGORY_CONFIG).map(([name, config]) => {
                const Icon = config.icon;
                const isSelected = category === name;
                return (
                  <button
                    type="button"
                    key={name}
                    onClick={() => setCategory(name)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border text-left transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-600'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div 
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${config.color}20`, color: config.color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Payment Mode
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PAYMENT_MODES.map((pm) => {
                const Icon = pm.icon;
                const isSelected = paymentMode === pm.id;
                return (
                  <button
                    type="button"
                    key={pm.id}
                    onClick={() => setPaymentMode(pm.id)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-medium border transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-600'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="truncate text-[11px]">{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description / Item / Store Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Description / Notes (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Canteen lunch, Xerox printouts, Auto fare"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Split with Roommate / Friend (Key Student Feature!) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              Split with Friend / Roommate (Optional)
            </label>
            <input
              type="text"
              value={splitWith}
              onChange={(e) => setSplitWith(e.target.value)}
              placeholder="e.g. Rahul owes ₹50, Shared with 3 roommates"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Date Picker with Quick Yesterday / Today */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                Date
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSetYesterday}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Yesterday
                </button>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <button
                  type="button"
                  onClick={handleSetToday}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Today
                </button>
              </div>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{initialData ? 'Update Expense' : 'Save Expense'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
