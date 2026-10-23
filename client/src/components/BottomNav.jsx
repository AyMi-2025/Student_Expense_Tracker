import React from 'react';
import { 
  Home, 
  PieChart, 
  Plus, 
  History, 
  User
} from 'lucide-react';

export default function BottomNav({ 
  currentTab, 
  setCurrentTab, 
  onOpenQuickAdd 
}) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'analytics', label: 'Stats', icon: PieChart },
    // Center Quick Add button
    { id: 'quick_add', isAction: true },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          if (tab.isAction) {
            return (
              <button
                key="quick_add_btn"
                onClick={onOpenQuickAdd}
                className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 active:scale-95 transition"
                aria-label="Add Expense"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            );
          }

          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition ${
                isActive 
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
