import React from 'react';
import { Search, Sun, Moon, Bell, X, LogOut } from 'lucide-react';

export default function DashboardHeader({
  searchTerm, setSearchTerm,
  isDarkMode, toggleTheme,
  showNotifications, setShowNotifications,
  user, logout,
}) {
  return (
    <header className="h-16 px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0E14]/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between shadow-sm dark:shadow-none transition-colors duration-300">
      {/* Search */}
      <div className="relative w-96 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search services (e.g. AWS EC2)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-full pl-10 pr-10 py-1.5 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-950 transition-all placeholder:text-slate-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4 relative">
        <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-full transition-colors ${showNotifications ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0B0E14]"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Notifications</h4>
              <div className="text-sm text-slate-600 dark:text-slate-300 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                ✅ Data synced successfully
                <span className="block text-[10px] text-slate-400 mt-1">Just now</span>
              </div>
            </div>
          )}
        </div>

        {/* User + Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{user?.email}</span>
          <button
            onClick={logout}
            title="Sign out"
            className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
