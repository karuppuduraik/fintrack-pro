import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import api from '../services/api';
import {
  PersonRounded,
  EmailRounded,
  LockRounded,
  SecurityRounded,
  CheckCircleOutlineRounded,
  WarningRounded
} from '@mui/icons-material';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    role: '',
  });

  const [emailForm, setEmailForm] = useState({ email: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        setProfileData(response.data);
        setEmailForm({ email: response.data.email });
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setEmailLoading(true);
    try {
      const response = await api.put('/users/profile', { email: emailForm.email });
      setProfileData(response.data);
      setMessage('Email address updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update email.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put('/users/profile', {
        email: profileData.email,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setMessage('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h3 className="text-sm font-semibold text-slate-400">Account settings and credentials</h3>
        <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">User Profile</p>
      </div>

      {message && (
        <div className="flex items-center p-4 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-2xl text-xs font-semibold">
          <CheckCircleOutlineRounded className="mr-2.5 h-5 w-5" />
          {message}
        </div>
      )}

      {error && (
        <div className="flex items-center p-4 bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 rounded-2xl text-xs font-semibold">
          <WarningRounded className="mr-2.5 h-5 w-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <GlassCard className="md:col-span-1 flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg">
            {profileData.username ? profileData.username.substring(0, 2).toUpperCase() : 'FT'}
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">{profileData.username || 'Loading...'}</h4>
            <p className="text-xs text-slate-400 mt-1">{profileData.email}</p>
          </div>
          <span className="px-3 py-1 bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {profileData.role || 'USER'}
          </span>
        </GlassCard>

        {/* Update Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Update Email Form */}
          <GlassCard className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <EmailRounded className="mr-2 h-4.5 w-4.5 text-brand-500" />
              General Details
            </h4>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({ email: e.target.value })}
                />
              </div>
              <Button type="submit" loading={emailLoading} className="w-full sm:w-auto">
                Save Changes
              </Button>
            </form>
          </GlassCard>

          {/* Change Password Form */}
          <GlassCard className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <LockRounded className="mr-2 h-4.5 w-4.5 text-brand-500" />
              Change Password
            </h4>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Current Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">New Password</label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 transition-all"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" loading={passwordLoading} variant="primary" className="w-full sm:w-auto">
                Change Password
              </Button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Profile;
