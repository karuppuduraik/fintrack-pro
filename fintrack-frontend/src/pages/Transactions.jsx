import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import {
  SearchRounded,
  FilterListRounded,
  DeleteOutlineRounded,
  EditOutlined,
  AddRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  CategoryRounded
} from '@mui/icons-material';
import api from '../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  // Add/Edit transaction state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const loadTx = async () => {
    try {
      const response = await api.get('/transactions', {
        params: { 
          page: page - 1, 
          size: itemsPerPage, 
          search: search.trim() || null, 
          type: typeFilter === 'ALL' ? null : typeFilter, 
          category: categoryFilter === 'ALL' ? null : categoryFilter 
        }
      });
      const mapped = response.data.content.map(t => ({
        id: t.id,
        type: t.type,
        amount: parseFloat(t.amount),
        category: t.category ? t.category.name : 'Uncategorized',
        date: t.date,
        description: t.description
      }));
      setTransactions(mapped);
    } catch (err) {
      console.warn('API connection refused or bad request. Operating locally.');
    }
  };

  useEffect(() => {
    loadTx();
  }, [page, search, typeFilter, categoryFilter]);

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleOpenAdd = () => {
    setEditingTx(null);
    setFormData({
      type: 'EXPENSE',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx) => {
    setEditingTx(tx);
    setFormData({
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      date: tx.date,
      description: tx.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      loadTx();
    } catch (err) {
      setTransactions(transactions.filter((t) => t.id !== id));
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const amountNum = parseFloat(formData.amount);
    if (!amountNum || isNaN(amountNum)) return;

    const payload = {
      amount: amountNum,
      type: formData.type,
      categoryName: formData.category,
      date: formData.date,
      description: formData.description
    };

    if (editingTx) {
      // Edit
      try {
        await api.put(`/transactions/${editingTx.id}`, payload);
        loadTx();
      } catch (err) {
        console.error(err);
      }
    } else {
      // Add
      try {
        await api.post('/transactions', payload);
        loadTx();
      } catch (err) {
        console.error(err);
      }
    }
    setIsModalOpen(false);
  };

  // Local filter logic fallback
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
                          t.category.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    const matchesCategory = categoryFilter === 'ALL' || t.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesType && matchesCategory;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-400">Manage incomes & expenditures</h3>
          <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Transaction Manager</p>
        </div>
        <Button onClick={handleOpenAdd} className="shadow-lg hover:shadow-brand-500/20">
          <AddRounded className="mr-1.5" /> Log Transaction
        </Button>
      </div>

      {/* Filters Bar */}
      <GlassCard className="!p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <SearchRounded className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search ledger..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl outline-none glass-input text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 focus:ring-2 focus:ring-brand-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <FilterListRounded className="h-4.5 w-4.5" />
          </span>
          <select
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl outline-none glass-input text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 focus:ring-2 focus:ring-brand-500"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All Types</option>
            <option value="EXPENSE">Expenses Only</option>
            <option value="INCOME">Incomes Only</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <CategoryRounded className="h-4.5 w-4.5" />
          </span>
          <select
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl outline-none glass-input text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 focus:ring-2 focus:ring-brand-500"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All Categories</option>
            <option value="Salary">Salary</option>
            <option value="Food">Food</option>
            <option value="Rent">Rent</option>
            <option value="Shopping">Shopping</option>
            <option value="Fuel">Fuel</option>
            <option value="Education">Education</option>
            <option value="Medical">Medical</option>
            <option value="Internet">Internet</option>
            <option value="Electricity">Electricity</option>
            <option value="Entertainment">Entertainment</option>
          </select>
        </div>

        <div className="text-right text-xs font-bold text-slate-400">
          Showing {paginatedTransactions.length} of {filteredTransactions.length} records
        </div>
      </GlassCard>

      {/* Ledger Table */}
      <GlassCard className="overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/30 dark:bg-slate-900/30 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/50 dark:border-slate-800/50">
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150/40 dark:divide-slate-800/40">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm">
                    No transactions matching selected criteria
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10 transition-colors">
                    {/* Details */}
                    <td className="px-6 py-4.5">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{t.description}</p>
                        <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold rounded-md uppercase mt-1 ${
                          t.type === 'INCOME'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                        }`}>
                          {t.type}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4.5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                      {t.category}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4.5 text-xs text-slate-400">
                      {t.date}
                    </td>

                    {/* Amount */}
                    <td className={`px-6 py-4.5 text-xs font-bold text-right ${
                      t.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-100'
                    }`}>
                      {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4.5">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        >
                          <EditOutlined className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <DeleteOutlineRounded className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-100/10 dark:bg-slate-900/10">
            <span className="text-[11px] font-bold text-slate-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex space-x-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeftRounded className="h-4.5 w-4.5" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronRightRounded className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* CRUD Modal dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3.5 mb-4">
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingTx ? 'Modify Transaction' : 'Create Transaction'}
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-4">
              {/* Type selection */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      formData.type === 'EXPENSE'
                        ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    Expense (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      formData.type === 'INCOME'
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
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {formData.type === 'EXPENSE' ? (
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
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                <input
                  type="text"
                  placeholder="Enter details"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingTx ? 'Apply Changes' : 'Create Entry'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
