import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import {
  PersonRounded,
  AddRounded,
  DeleteOutlineRounded,
  EditOutlined,
  CloseRounded,
  SupervisorAccountRounded
} from '@mui/icons-material';
import api from '../services/api';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [editingUser, setEditingUser] = useState(null);
  const [editUserData, setEditUserData] = useState({
    username: '',
    email: '',
    role: 'USER',
    password: ''
  });

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to load users list:', err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenAdd = () => {
    setErrorMsg('');
    setNewUserData({ username: '', email: '', password: '' });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setErrorMsg('');
    setEditingUser(user);
    setEditUserData({
      username: user.username,
      email: user.email,
      role: user.role,
      password: ''
    });
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await api.post('/admin/users', newUserData);
      await loadUsers();
      setIsAddModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create user. Email or username might be taken.';
      setErrorMsg(msg);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await api.put(`/admin/users/${editingUser.id}`, editUserData);
      await loadUsers();
      setIsEditModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update user details.';
      setErrorMsg(msg);
    }
  };

  const handleDelete = async (id, username) => {
    if (username.toLowerCase() === 'karuppudurai') {
      alert('Security violation: Cannot delete root administrator account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete the user "${username}"?`)) return;

    try {
      await api.delete(`/admin/users/${id}`);
      await loadUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-400">Perform credential vaults administration</h3>
          <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">User Administration Console</p>
        </div>
        <Button onClick={handleOpenAdd} className="shadow-lg hover:shadow-brand-500/20">
          <AddRounded className="mr-1.5" /> Register New Account
        </Button>
      </div>

      {/* Aggregate metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <GlassCard className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <PersonRounded />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Registered Accounts</p>
            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">{users.length} Users</h4>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <SupervisorAccountRounded />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Administrators</p>
            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {users.filter(u => u.role === 'ADMIN').length} Admins
            </h4>
          </div>
        </GlassCard>
      </div>

      {/* Users table */}
      <GlassCard className="overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/30 dark:bg-slate-900/30 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/50 dark:border-slate-800/50">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4">Security Role</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150/40 dark:divide-slate-800/40">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10 transition-colors">
                  <td className="px-6 py-4.5">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                        {u.username.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4.5 text-xs text-slate-500 dark:text-slate-400">{u.email}</td>
                  <td className="px-6 py-4.5 text-xs">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold ${
                      u.role === 'ADMIN' 
                        ? 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' 
                        : 'bg-slate-200/50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-xs text-slate-400">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4.5">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-brand-500 transition-colors"
                      >
                        <EditOutlined className="h-4.5 w-4.5" />
                      </button>
                      <button
                        disabled={u.username.toLowerCase() === 'karuppudurai'}
                        onClick={() => handleDelete(u.id, u.username)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <DeleteOutlineRounded className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3.5 mb-4">
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Register User Account</h4>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-650">
                <CloseRounded />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="karuppudurai"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="karuppudurai@example.com"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">Access Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full">
                Create User Profile
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3.5 mb-4">
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">Update User Account</h4>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-650">
                <CloseRounded />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="username"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                  value={editUserData.username}
                  onChange={(e) => setEditUserData({ ...editUserData, username: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">Security Role</label>
                <select
                  disabled={editingUser?.username.toLowerCase() === 'karuppudurai'}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                  value={editUserData.role}
                  onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                >
                  <option value="USER">User (Standard)</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">
                  Reset Password (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Leave empty to keep current password"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                  value={editUserData.password}
                  onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full">
                Apply Modifications
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
