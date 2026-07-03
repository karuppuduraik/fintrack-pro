import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import {
  AccountBalanceWalletRounded,
  EditOutlined,
  WarningAmberRounded,
  CheckCircleOutlineRounded,
  NotificationsActiveRounded
} from '@mui/icons-material';
import api from '../services/api';

const Budgets = () => {
  const [budgets, setBudgets] = useState([
    { id: 1, category: 'Rent', limit: 15000, spent: 15000, color: '#3b82f6', period: 'MONTHLY' },
    { id: 2, category: 'Food', limit: 10000, spent: 6500, color: '#10b981', period: 'MONTHLY' },
    { id: 3, category: 'Shopping', limit: 8000, spent: 5800, color: '#f59e0b', period: 'MONTHLY' },
    { id: 4, category: 'Fuel', limit: 4000, spent: 2800, color: '#ec4899', period: 'MONTHLY' },
    { id: 5, category: 'Education', limit: 6000, spent: 4500, color: '#8b5cf6', period: 'MONTHLY' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [limitInput, setLimitInput] = useState('');

  useEffect(() => {
    const loadBudgets = async () => {
      try {
        const response = await api.get('/budgets');
        setBudgets(response.data);
      } catch (err) {
        console.warn('API connection refused. Operating locally.');
      }
    };
    loadBudgets();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleEditOpen = (budget) => {
    setEditingBudget(budget);
    setLimitInput(budget.limit.toString());
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const limitNum = parseFloat(limitInput);
    if (!limitNum || isNaN(limitNum)) return;

    try {
      await api.put(`/budgets/${editingBudget.id}`, { limitAmount: limitNum });
    } catch (err) {}

    setBudgets(
      budgets.map((b) => (b.id === editingBudget.id ? { ...b, limit: limitNum } : b))
    );
    setIsModalOpen(false);
  };

  const totalLimit = budgets.reduce((acc, curr) => acc + curr.limit, 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const remainingBudget = totalLimit - totalSpent;
  const overallPct = Math.min((totalSpent / totalLimit) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400">Configure thresholds & control leakage</h3>
        <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Budget Planner</p>
      </div>

      {/* Aggregate card */}
      <GlassCard className="grid grid-cols-1 md:grid-cols-3 gap-6 !p-6 items-center">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Aggregated Limit</p>
          <h4 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{formatCurrency(totalLimit)}</h4>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Across 5 active spending categories</span>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remaining Safe Balance</p>
          <h4 className={`text-3xl font-extrabold ${remainingBudget >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {formatCurrency(remainingBudget)}
          </h4>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
            {remainingBudget >= 0 ? 'Surplus cash flow' : 'Deficit overdraft'}
          </span>
        </div>

        {/* Progress Circle visual replacement */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Overall Usage Progress</span>
            <span className="text-brand-500">{overallPct.toFixed(0)}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-200/60 dark:bg-slate-800/80 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full" style={{ width: `${overallPct}%` }} />
          </div>
        </div>
      </GlassCard>

      {/* Budget alerts */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Active Alerts</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const isOver = b.spent >= b.limit;
            const isClose = b.spent >= b.limit * 0.8 && !isOver;

            if (isOver) {
              return (
                <div key={b.category} className="flex items-center p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 space-x-3">
                  <WarningAmberRounded className="text-rose-500 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold">{b.category} Overdraft Alert</p>
                    <p className="opacity-90">Spent {formatCurrency(b.spent)} which exceeds cap limit of {formatCurrency(b.limit)}.</p>
                  </div>
                </div>
              );
            }
            if (isClose) {
              return (
                <div key={b.category} className="flex items-center p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/40 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 space-x-3">
                  <NotificationsActiveRounded className="text-amber-500 shrink-0 animate-bounce" />
                  <div className="text-xs">
                    <p className="font-bold">{b.category} Warning Threshold</p>
                    <p className="opacity-90">Approaching spending limit. Currently at {((b.spent / b.limit) * 100).toFixed(0)}% allocation.</p>
                  </div>
                </div>
              );
            }
            return null;
          })}
          {totalSpent < totalLimit * 0.8 && (
            <div className="flex items-center p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 space-x-3 md:col-span-2">
              <CheckCircleOutlineRounded className="text-emerald-500 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">All Budgets Within Limit Bounds</p>
                <p className="opacity-90">Healthy budgeting practices detected. Wallet balance is in optimal green zone.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgets.map((b) => {
          const pct = Math.min((b.spent / b.limit) * 100, 100);
          const isOver = b.spent >= b.limit;

          return (
            <GlassCard key={b.category} className="flex flex-col justify-between h-[180px] group hover:border-brand-500/20" hoverable>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: b.color }} />
                    {b.category}
                  </span>
                  <button
                    onClick={() => handleEditOpen(b)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand-500 transition-colors"
                  >
                    <EditOutlined className="h-4.5 w-4.5" />
                  </button>
                </div>
                <div className="flex items-baseline space-x-1.5 mt-3">
                  <h4 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{formatCurrency(b.spent)}</h4>
                  <span className="text-[10px] text-slate-400">/ {formatCurrency(b.limit)}</span>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>Usage Rate</span>
                  <span style={{ color: isOver ? '#ef4444' : '#64748b' }}>{pct.toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200/50 dark:bg-slate-800/80 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isOver ? '#ef4444' : b.color,
                    }}
                  />
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Edit Budget Limit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3.5 mb-4">
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Adjust {editingBudget?.category} Budget Limit
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Monthly Cap Limit (₹)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Enter new budget limit"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full">
                Apply Limits Configuration
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
