import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  DashboardRounded,
  ReceiptLongRounded,
  AccountBalanceWalletRounded,
  TrackChangesRounded,
  AssessmentRounded,
  PersonRounded,
  LogoutRounded,
  CloseRounded,
  SupervisorAccountRounded
} from '@mui/icons-material';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const { isDark } = useTheme();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: DashboardRounded },
    { name: 'Transactions', path: '/transactions', icon: ReceiptLongRounded },
    { name: 'Budgets', path: '/budgets', icon: AccountBalanceWalletRounded },
    { name: 'Goals', path: '/goals', icon: TrackChangesRounded },
    { name: 'Reports', path: '/reports', icon: AssessmentRounded },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ name: 'Admin Panel', path: '/admin', icon: SupervisorAccountRounded });
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 h-screen transition-transform duration-300 transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white/70 dark:bg-slate-950/70 border-r border-slate-200/50 dark:border-slate-800/50 backdrop-blur-glass shadow-xl lg:shadow-none`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 shadow-md">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 gradient-text">
                FinTrack Pro
              </h1>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">Wealth Manager</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 lg:hidden text-slate-500"
          >
            <CloseRounded />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600/10 to-indigo-600/10 dark:from-brand-500/20 dark:to-indigo-500/10 text-brand-600 dark:text-brand-400 border-l-4 border-brand-600 dark:border-brand-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile Summary & Logout */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex items-center space-x-3 mb-3 p-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm shadow overflow-hidden">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user?.username ? user.username.substring(0, 2).toUpperCase() : 'FT'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">
                {user?.username || 'Guest User'}
              </p>
              <p className="text-xs text-slate-400 truncate dark:text-slate-500">{user?.email || 'guest@fintrack.pro'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-950/40 border border-rose-100/50 dark:border-rose-900/30 transition-all duration-200"
          >
            <LogoutRounded className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
