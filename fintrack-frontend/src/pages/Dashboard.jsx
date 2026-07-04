import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import {
  TrendingUpRounded,
  TrendingDownRounded,
  AccountBalanceWalletRounded,
  SavingsRounded,
  AddRounded,
  WarningAmberRounded,
  ArrowForwardRounded,
  CategoryRounded
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {

  const { user } = useAuth();
  // State for dashboard calculations
  const [stats, setStats] = useState({
    income:0,
    expense:0,
    savings:0,
    balance:0
});


const [transactions, setTransactions] = useState([]);

const [budgets, setBudgets] = useState([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTx, setNewTx] = useState({
    type: 'EXPENSE',
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Load from API if backend is running
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await api.get('/dashboard/stats');
        setStats(statsRes.data);
        const txRes = await api.get('/transactions?size=5');
        setTransactions(txRes.data.content);
        const budgetRes = await api.get('/budgets/status');
        setBudgets(budgetRes.data);
      } catch (err) {
        console.warn('Backend offline or not configured. Operating in local sandbox mode.');
      }
    };
    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const chartData = [];

  // Pie chart breakdown
  const pieData = [];

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(newTx.amount);
    if (!amountNum || isNaN(amountNum)) return;

    const tx = {
      id: Date.now(),
      type: newTx.type,
      amount: amountNum,
      category: newTx.category,
      date: newTx.date,
      description: newTx.description || `${newTx.category} Transaction`,
    };

    // Update local state
    setTransactions([tx, ...transactions]);
    
    // Update summary counters
    setStats(prev => {
      const isInc = newTx.type === 'INCOME';
      const incDiff = isInc ? amountNum : 0;
      const expDiff = !isInc ? amountNum : 0;
      const newInc = prev.income + incDiff;
      const newExp = prev.expense + expDiff;
      return {
        income: newInc,
        expense: newExp,
        balance: newInc - newExp,
        savings: prev.savings,
      };
    });

    // Update budgets list if expense
    if (newTx.type === 'EXPENSE') {
      setBudgets(prev =>
        prev.map(b => {
          if (b.category.toLowerCase() === newTx.category.toLowerCase()) {
            return { ...b, spent: b.spent + amountNum };
          }
          return b;
        })
      );
    }

    // Try posting to backend
    api.post('/transactions', tx).catch(() => {});

    setIsAddModalOpen(false);
    setNewTx({
      type: 'EXPENSE',
      amount: '',
      category: 'Food',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Add */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-400">Welcome to your secure wealth hub</h3>
          <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
    {user?.username || "Guest"}'s Workspace
</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="shadow-lg hover:shadow-brand-500/20">
          <AddRounded className="mr-1.5" /> New Transaction
        </Button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GlassCard className="relative overflow-hidden group hover:border-emerald-500/30" hoverable>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Monthly Income</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUpRounded />
            </div>
          </div>
          <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(stats.income)}</h4>
          <span className="text-[11px] text-emerald-500 font-semibold flex items-center mt-2">
            +12.5% <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">vs previous month</span>
          </span>
        </GlassCard>

        <GlassCard className="relative overflow-hidden group hover:border-rose-500/30" hoverable>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Monthly Expenses</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDownRounded />
            </div>
          </div>
          <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(stats.expense)}</h4>
          <span className="text-[11px] text-rose-500 font-semibold flex items-center mt-2">
            +4.3% <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">vs previous month</span>
          </span>
        </GlassCard>

        <GlassCard className="relative overflow-hidden group hover:border-indigo-500/30" hoverable>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Balance</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <AccountBalanceWalletRounded />
            </div>
          </div>
          <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(stats.balance)}</h4>
          <span className="text-[11px] text-brand-500 font-semibold flex items-center mt-2">
            Healthy <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">cash flow status</span>
          </span>
        </GlassCard>

        <GlassCard className="relative overflow-hidden group hover:border-purple-500/30" hoverable>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Savings Track</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <SavingsRounded />
            </div>
          </div>
          <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(stats.savings)}</h4>
          <span className="text-[11px] text-purple-500 font-semibold flex items-center mt-2">
            Target 92% <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">of monthly target</span>
          </span>
        </GlassCard>
      </div>

      {/* Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Trends Area Chart */}
        <GlassCard className="lg:col-span-2 flex flex-col h-[380px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Financial Cashflow</h4>
              <p className="text-xs text-slate-400">Weekly activity trends</p>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="Expense" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Expenses Distribution Pie */}
        <GlassCard className="flex flex-col h-[380px]">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Expenses Breakdown</h4>
            <p className="text-xs text-slate-400">July categorization</p>
          </div>
          <div className="flex-1 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total spent</span>
              <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatCurrency(stats.expense)}</span>
            </div>
          </div>
          {/* Pie Legends */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-200/30 dark:border-slate-800/40 pt-4">
            {pieData.slice(0, 5).map((e) => (
              <div key={e.name} className="flex items-center justify-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                <span>{e.name}</span>
              </div>
            ))}
            <div className="flex items-center justify-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <span>Others</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Budgets Progress and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budgets Tracker */}
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Category Budgets</h4>
              <p className="text-xs text-slate-400">Current limits tracker</p>
            </div>
            <span className="text-xs font-semibold text-brand-500 flex items-center hover:underline cursor-pointer">
              Adjust <ArrowForwardRounded className="ml-1 h-3.5 w-3.5" />
            </span>
          </div>

          <div className="space-y-4">
            {budgets.map((b) => {
              const pct = Math.min((b.spent / b.limit) * 100, 100);
              const isOver = b.spent >= b.limit;
              const isClose = b.spent >= b.limit * 0.8 && !isOver;

              return (
                <div key={b.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{b.category}</span>
                    <div className="space-x-1 font-bold text-slate-500 dark:text-slate-400">
                      <span className="text-slate-800 dark:text-slate-100">{formatCurrency(b.spent)}</span>
                      <span>/</span>
                      <span>{formatCurrency(b.limit)}</span>
                    </div>
                  </div>
                  {/* Progress Line */}
                  <div className="w-full h-2 rounded-full bg-slate-200/60 dark:bg-slate-800/80 overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: b.color }}
                    />
                  </div>
                  {/* Warnings */}
                  {isOver && (
                    <span className="text-[10px] font-bold text-rose-500 flex items-center">
                      <WarningAmberRounded className="h-3.5 w-3.5 mr-1" /> Budget exceeded for {b.category}!
                    </span>
                  )}
                  {isClose && (
                    <span className="text-[10px] font-bold text-amber-500 flex items-center">
                      <WarningAmberRounded className="h-3.5 w-3.5 mr-1" /> Reaching 80% threshold limits.
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Recent Ledger */}
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent Transactions</h4>
              <p className="text-xs text-slate-400">Latest ledger entries</p>
            </div>
            <span className="text-xs font-semibold text-brand-500 flex items-center hover:underline cursor-pointer">
              View All <ArrowForwardRounded className="ml-1 h-3.5 w-3.5" />
            </span>
          </div>

          <div className="divide-y divide-slate-150/40 dark:divide-slate-800/40">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3 group">
                <div className="flex items-center space-x-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                    t.type === 'INCOME'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                      : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                  }`}>
                    <CategoryRounded className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-brand-500 transition-colors">
                      {t.description}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-semibold">
                      <span className="bg-slate-200/50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded-md uppercase">{t.category}</span>
                      <span>•</span>
                      <span>{t.date}</span>
                    </div>
                  </div>
                </div>
                <span className={`text-sm font-bold ${
                  t.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-100'
                }`}>
                  {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-2xl p-6 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3.5 mb-4">
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Add Transaction</h4>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                {/* Transaction Type */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewTx({ ...newTx, type: 'EXPENSE' })}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        newTx.type === 'EXPENSE'
                          ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      Expense (-)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTx({ ...newTx, type: 'INCOME' })}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        newTx.type === 'INCOME'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      Income (+)
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="Enter amount"
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                    value={newTx.category}
                    onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                  >
                    {newTx.type === 'EXPENSE' ? (
                      <>
                        <option value="Food">Food</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Fuel">Fuel</option>
                        <option value="Education">Education</option>
                        <option value="Rent">Rent</option>
                        <option value="Medical">Medical</option>
                        <option value="Internet">Internet</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Entertainment">Entertainment</option>
                      </>
                    ) : (
                      <>
                        <option value="Salary">Salary</option>
                        <option value="Investment">Investment Returns</option>
                        <option value="Freelance">Freelance Gig</option>
                        <option value="Refund">Refunds</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Transaction Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                    value={newTx.date}
                    onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                  <input
                    type="text"
                    placeholder="Enter short details"
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                    value={newTx.description}
                    onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Commit Transaction
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
