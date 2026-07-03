import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import { EmailRounded, LockOpenRounded, VisibilityRounded, VisibilityOffRounded } from '@mui/icons-material';
import api from '../services/api';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      usernameOrEmail: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      // Connect to REST API
      const response = await api.post('/auth/login', {
        usernameOrEmail: data.usernameOrEmail,
        password: data.password,
      });

      const { user, token } = response.data;
      login(user, token);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to authenticate. Please check your credentials.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Scaffold a rich mock user for testing without running backend
    const mockUser = {
      id: 1,
      username: 'Karuppudurai',
      email: 'karuppudurai@example.com',
      role: 'ADMIN'
    };
    login(mockUser, 'mock-jwt-token-value-xyz');
    navigate('/dashboard');
  };

  return (
    <GlassCard className="shadow-2xl border border-white/20 dark:border-slate-800" hoverable={false}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome Back</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Please enter your credentials to login</p>
      </div>

      {apiError && (
        <div className="mb-4 p-3.5 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email or Username */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
            Email or Username
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <EmailRounded className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="name@example.com or username"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none glass-input text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${
                errors.usernameOrEmail ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200/50 dark:border-slate-800'
              }`}
              {...register('usernameOrEmail', {
                required: 'Username or Email is required',
              })}
            />
          </div>
          {errors.usernameOrEmail && (
            <p className="text-[11px] text-rose-500 font-medium mt-1.5 pl-1">{errors.usernameOrEmail.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5 pl-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <LockOpenRounded className="h-4.5 w-4.5" />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none glass-input text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all ${
                errors.password ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200/50 dark:border-slate-800'
              }`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <VisibilityOffRounded className="h-4.5 w-4.5" /> : <VisibilityRounded className="h-4.5 w-4.5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-500 font-medium mt-1.5 pl-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <Button type="submit" loading={loading} className="w-full mt-2">
          Sign In
        </Button>
      </form>

      {/* Demo Login Option */}
      <div className="relative flex py-3 items-center">
        <div className="flex-grow border-t border-slate-200/40 dark:border-slate-850" />
        <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400">or preview dashboard</span>
        <div className="flex-grow border-t border-slate-200/40 dark:border-slate-850" />
      </div>

      <Button variant="secondary" onClick={handleDemoLogin} className="w-full">
        Launch Demo Sandbox
      </Button>

      <div className="text-center mt-6">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          New to FinTrack Pro?{' '}
          <Link to="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </GlassCard>
  );
};

export default Login;
