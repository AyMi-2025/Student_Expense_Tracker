import React from 'react';
import {
  Utensils,
  Coffee,
  BookOpen,
  Home,
  Bus,
  Wifi,
  Film,
  ShoppingBag,
  Activity,
  MoreHorizontal,
  CreditCard,
  Banknote,
  Smartphone,
  Building2
} from 'lucide-react';

export const CATEGORY_CONFIG = {
  'Food & Mess': {
    icon: Utensils,
    color: '#f97316',
    bgColor: 'bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400',
    borderColor: 'border-orange-200 dark:border-orange-800'
  },
  'Chai & Snacks': {
    icon: Coffee,
    color: '#eab308',
    bgColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-800'
  },
  'Books & Xerox': {
    icon: BookOpen,
    color: '#3b82f6',
    bgColor: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  'Hostel & Rent': {
    icon: Home,
    color: '#8b5cf6',
    bgColor: 'bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  'Commute & Travel': {
    icon: Bus,
    color: '#06b6d4',
    bgColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400',
    borderColor: 'border-cyan-200 dark:border-cyan-800'
  },
  'Recharge & WiFi': {
    icon: Wifi,
    color: '#10b981',
    bgColor: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800'
  },
  'Outings & Movies': {
    icon: Film,
    color: '#ec4899',
    bgColor: 'bg-pink-100 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400',
    borderColor: 'border-pink-200 dark:border-pink-800'
  },
  'Personal & Laundry': {
    icon: ShoppingBag,
    color: '#6366f1',
    bgColor: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400',
    borderColor: 'border-indigo-200 dark:border-indigo-800'
  },
  'Medical & Health': {
    icon: Activity,
    color: '#ef4444',
    bgColor: 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
    borderColor: 'border-rose-200 dark:border-rose-800'
  },
  'Miscellaneous': {
    icon: MoreHorizontal,
    color: '#64748b',
    bgColor: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    borderColor: 'border-slate-200 dark:border-slate-700'
  }
};

export function getCategoryMeta(categoryName) {
  return CATEGORY_CONFIG[categoryName] || CATEGORY_CONFIG['Miscellaneous'];
}

export function getPaymentModeIcon(mode) {
  switch ((mode || '').toUpperCase()) {
    case 'UPI':
      return Smartphone;
    case 'CASH':
      return Banknote;
    case 'CARD':
      return CreditCard;
    case 'NET BANKING':
      return Building2;
    default:
      return Smartphone;
  }
}
