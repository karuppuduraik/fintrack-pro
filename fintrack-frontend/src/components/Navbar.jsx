import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  MenuRounded,
  LightModeRounded,
  DarkModeRounded,
  NotificationsRounded,
  KeyboardArrowDownRounded,
  CheckCircleOutlineRounded,
  WarningAmberRounded,
  InfoOutlined,
  LogoutRounded,
  PersonRounded
} from '@mui/icons-material';

const Navbar = ({ onMenuClick, title }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'warning',
      message: 'Rent budget has reached 85% of limit!',
      time: '10m ago',
      read: false,
    },
    {
      id: 2,
      type: 'success',
      message: 'Emergency Fund goal is 100% complete! Great job!',
      time: '2h ago',
      read: false,
    },
    {
      id: 3,
      type: 'info',
      message: 'Monthly budget has been initialized for July.',
      time: '1d ago',
      read: true,
    },
  ]);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full px-6 py-4 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-glass border-b border-slate-200/40 dark:border-slate-800/40">
      {/* Page Title & Mobile Menu toggle */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl lg:hidden hover:bg-slate-100 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400"
        >
          <MenuRounded />
        </button>
        <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
          {title}
        </h2>
      </div>

      {/* Top Navbar Actions */}
      <div className="flex items-center space-x-2.5">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400 transition-colors"
          title="Toggle Theme"
        >
          {isDark ? (
            <LightModeRounded className="h-5 w-5 text-amber-400" />
          ) : (
            <DarkModeRounded className="h-5 w-5 text-indigo-500" />
          )}
        </button>

        {/* Notifications Panel */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400 transition-colors relative"
          >
            <NotificationsRounded className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 text-[9px] font-bold text-white bg-rose-500 border border-white dark:border-slate-950 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 lg:w-96 rounded-2xl glass-card overflow-hidden shadow-2xl z-50">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-100/30 dark:bg-slate-900/30">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Alerts & Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-150/40 dark:divide-slate-800/40">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-slate-400">No alerts today</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex items-start p-4 hover:bg-slate-100/40 dark:hover:bg-slate-900/30 transition-colors ${
                        !notif.read ? 'bg-brand-50/20 dark:bg-brand-500/5' : ''
                      }`}
                    >
                      <div className="mr-3 mt-0.5">
                        {notif.type === 'warning' && <WarningAmberRounded className="text-amber-500 h-5 w-5" />}
                        {notif.type === 'success' && <CheckCircleOutlineRounded className="text-emerald-500 h-5 w-5" />}
                        {notif.type === 'info' && <InfoOutlined className="text-blue-500 h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs text-slate-700 dark:text-slate-300 leading-normal ${!notif.read ? 'font-medium' : ''}`}>
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <span className="w-px h-6 bg-slate-200 dark:bg-slate-800" />

        {/* Profile Dropdown */}
        <div className="relative animate-fade-in" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 pl-2 pr-1.5 py-1.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-900/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'FT'}
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 hidden md:inline truncate max-w-[100px]">
              {user?.username || 'Guest'}
            </span>
            <KeyboardArrowDownRounded className={`h-4 w-4 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl glass-card overflow-hidden shadow-2xl z-50">
              <div className="px-4 py-3 bg-slate-100/30 dark:bg-slate-900/30 border-b border-slate-200/50 dark:border-slate-800/50">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user?.email || 'guest@fintrack.pro'}</p>
              </div>
              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    // navigate to profile page
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <PersonRounded className="mr-2 h-4.5 w-4.5 text-slate-400" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm font-semibold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors"
                >
                  <LogoutRounded className="mr-2 h-4.5 w-4.5 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
