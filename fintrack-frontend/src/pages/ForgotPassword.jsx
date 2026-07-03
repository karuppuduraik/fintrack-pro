import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import { EmailRounded, KeyboardArrowLeftRounded } from '@mui/icons-material';
import api from '../services/api';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    setSuccessMsg('');
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSuccessMsg('Reset link sent! Please check your email inbox.');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Email address not found. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="shadow-2xl border border-white/20 dark:border-slate-800" hoverable={false}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Recover Password</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Enter your email to receive a secure recovery code
        </p>
      </div>

      {apiError && (
        <div className="mb-4 p-3.5 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30">
          {apiError}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3.5 text-xs font-semibold rounded-xl text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        {/* Submit */}
        <Button type="submit" loading={loading} className="w-full mt-2">
          Send Recovery Link
        </Button>
      </form>

      <div className="text-center mt-6">
        <Link
          to="/login"
          className="inline-flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
        >
          <KeyboardArrowLeftRounded className="mr-1 h-5 w-5" />
          Back to Login
        </Link>
      </div>
    </GlassCard>
  );
};

export default ForgotPassword;
