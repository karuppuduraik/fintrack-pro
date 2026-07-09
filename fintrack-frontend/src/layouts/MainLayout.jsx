import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Map route paths to page titles
  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard':
        return 'Dashboard Overview';
      case '/transactions':
        return 'Transactions History';
      case '/budgets':
        return 'Budget Planner';
      case '/goals':
        return 'Savings Goals';
      case '/reports':
        return 'Analytics & Reports';
      case '/profile':
        return 'Account Settings';
      default:
        return 'FinTrack Pro';
    }
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 relative">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-100px] left-[-100px] bg-glow-blue opacity-50 dark:opacity-30" />
      <div className="absolute bottom-[-150px] right-[-100px] bg-glow-purple opacity-40 dark:opacity-20" />
      <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 bg-glow-emerald opacity-20 dark:opacity-10" />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden lg:pl-72 relative z-10">
        {/* Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={pageTitle} />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto px-6 py-6 relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
