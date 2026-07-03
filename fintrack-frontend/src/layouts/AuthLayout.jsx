import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { LightModeRounded, DarkModeRounded } from '@mui/icons-material';

const AuthLayout = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden px-4">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-150px] right-[-100px] bg-glow-blue opacity-60 dark:opacity-40" />
      <div className="absolute bottom-[-150px] left-[-100px] bg-glow-purple opacity-50 dark:opacity-35" />
      <div className="absolute top-[20%] left-[20%] bg-glow-emerald opacity-20 dark:opacity-15" />

      {/* Floating Theme Switcher */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-slate-800/80 hover:bg-white/60 dark:hover:bg-slate-900/60 shadow-lg text-slate-600 dark:text-slate-400 transition-colors"
          title="Toggle Theme"
        >
          {isDark ? (
            <LightModeRounded className="h-5 w-5 text-amber-400" />
          ) : (
            <DarkModeRounded className="h-5 w-5 text-indigo-500" />
          )}
        </button>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md relative z-10 py-12">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 shadow-xl mb-3.5">
            <span className="text-white font-extrabold text-2xl">F</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 gradient-text">
            FinTrack Pro
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Secure Expense & Budget Vault
          </p>
        </div>

        {/* View injection */}
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
