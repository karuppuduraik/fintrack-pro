import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import { EmailRounded, LockOpenRounded, PersonRounded } from '@mui/icons-material';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    setSuccessMsg('');
    try {
      await api.post('/auth/register', {
        username: data.username,
        email: data.email,
        password: data.password,
      });

      setSuccessMsg('Account registered successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to create account. Username or email may already be in use.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="shadow-2xl border border-white/20 dark:border-slate-800" hoverable={false}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Create Account</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Get started with a premium wallet vault</p>
      </div>

      {apiError && (
        <div className="mb-4 p-3.5 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30">
          {apiError}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3.5 text-xs font-semibold rounded-xl text-emerald-655 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
            Username
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <PersonRounded className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="karuppudurai"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none glass-input text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${
                errors.username ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200/50 dark:border-slate-800'
              }`}
              {...register('username', {
                required: 'Username is required',
                minLength: { value: 3, message: 'Username must be at least 3 characters' },
              })}
            />
          </div>
          {errors.username && (
            <p className="text-[11px] text-rose-500 font-medium mt-1.5 pl-1">{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <EmailRounded className="h-4.5 w-4.5" />
            </span>
            <input
              type="email"
              placeholder="name@example.com"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none glass-input text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${
                errors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200/50 dark:border-slate-800'
              }`}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-500 font-medium mt-1.5 pl-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <LockOpenRounded className="h-4.5 w-4.5" />
            </span>
            <input
              type="password"
              placeholder="••••••••"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none glass-input text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${
                errors.password ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200/50 dark:border-slate-800'
              }`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-500 font-medium mt-1.5 pl-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
            Confirm Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <LockOpenRounded className="h-4.5 w-4.5" />
            </span>
            <input
              type="password"
              placeholder="••••••••"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none glass-input text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${
                errors.confirmPassword ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200/50 dark:border-slate-800'
              }`}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === password || 'Passwords do not match',
              })}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] text-rose-500 font-medium mt-1.5 pl-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <Button type="submit" loading={loading} className="w-full mt-2">
          Create Free Account
        </Button>
      </form>

      <div className="text-center mt-6">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </GlassCard>
  );
};

export default Register;
