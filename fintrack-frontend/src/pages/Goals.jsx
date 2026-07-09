import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import {
  TrackChangesRounded,
  AddRounded,
  TrendingUpRounded,
  SavingsRounded,
  CheckCircleOutlineRounded,
  CalendarMonthRounded
} from '@mui/icons-material';
import api from '../services/api';

const Goals = () => {
  const [goals, setGoals] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContribOpen, setIsContribOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  
  // Forms
  const [newGoal, setNewGoal] = useState({
    name: '',
    target: '',
    current: '0',
    date: '',
  });
  const [contribAmount, setContribAmount] = useState('');

  const loadGoals = async () => {
    try {
      const response = await api.get('/goals');
      const mapped = response.data.map(g => ({
        id: g.id,
        name: g.name,
        target: parseFloat(g.targetAmount),
        current: parseFloat(g.currentAmount),
        date: g.targetDate,
        status: g.status
      }));
      setGoals(mapped);
    } catch (err) {
      console.warn('API connection refused. Operating locally.');
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleOpenContrib = (goal) => {
    setSelectedGoal(goal);
    setContribAmount('');
    setIsContribOpen(true);
  };

  const handleContribSubmit = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(contribAmount);
    if (!amountNum || isNaN(amountNum)) return;

    try {
      await api.put(`/goals/${selectedGoal.id}/contribute`, { amount: amountNum });
      await loadGoals();
      setIsContribOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    const targetNum = parseFloat(newGoal.target);
    const currentNum = parseFloat(newGoal.current) || 0;
    if (!newGoal.name || !targetNum) return;

    const payload = {
      name: newGoal.name,
      targetAmount: targetNum,
      currentAmount: currentNum,
      targetDate: newGoal.date || new Date().toISOString().split('T')[0]
    };

    try {
      await api.post('/goals', payload);
      await loadGoals();
      setIsModalOpen(false);
      setNewGoal({ name: '', target: '', current: '0', date: '' });
    } catch (err) {
      console.error('Failed to save goal to database:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-400">Save for what matters most</h3>
          <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Savings & Financial Goals</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="shadow-lg hover:shadow-brand-500/20">
          <AddRounded className="mr-1.5" /> Define Goal
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <GlassCard className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <SavingsRounded />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Saved Portfolio</p>
            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {formatCurrency(goals.reduce((acc, curr) => acc + curr.current, 0))}
            </h4>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <TrackChangesRounded />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aggregated Targets</p>
            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {formatCurrency(goals.reduce((acc, curr) => acc + curr.target, 0))}
            </h4>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircleOutlineRounded />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Achievements</p>
            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {goals.filter((g) => g.status === 'COMPLETED').length} / {goals.length} Goals
            </h4>
          </div>
        </GlassCard>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((g) => {
          const pct = Math.min((g.current / g.target) * 100, 100);
          const isComp = g.status === 'COMPLETED';

          return (
            <GlassCard key={g.id} className="flex flex-col justify-between h-[230px] group hover:border-brand-500/20" hoverable>
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{g.name}</h4>
                    <span className="text-[9px] font-bold text-slate-400 flex items-center mt-1">
                      <CalendarMonthRounded className="h-3.5 w-3.5 mr-1" /> Target Date: {g.date}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                    isComp
                      ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                      : 'bg-indigo-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400'
                  }`}>
                    {g.status}
                  </span>
                </div>

                <div className="flex items-baseline space-x-1.5 mt-5">
                  <h5 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{formatCurrency(g.current)}</h5>
                  <span className="text-xs text-slate-400">/ {formatCurrency(g.target)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Progress Tracker</span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200/50 dark:bg-slate-800/80 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {!isComp && (
                  <button
                    onClick={() => handleOpenContrib(g)}
                    className="w-full py-2 text-xs font-bold rounded-xl text-center border border-brand-500/20 text-brand-500 bg-brand-500/5 hover:bg-brand-500 hover:text-white transition-all duration-200"
                  >
                    Contribute Savings
                  </button>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Add Savings Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3.5 mb-4">
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Create Savings Goal</h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Premium Laptop, Electric Bike"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Target (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="250000"
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Initial Saved (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                    value={newGoal.current}
                    onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Target Completion Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                  value={newGoal.date}
                  onChange={(e) => setNewGoal({ ...newGoal, date: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full">
                Publish Goal Node
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {isContribOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3.5 mb-4">
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Deposit to {selectedGoal?.name}
              </h4>
              <button
                onClick={() => setIsContribOpen(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleContribSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Savings Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  autoFocus
                  placeholder="Enter saved amount to add"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full">
                Verify & Lock Savings
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
