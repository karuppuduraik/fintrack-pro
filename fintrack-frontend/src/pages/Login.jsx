import React, { useState, useEffect } from 'react';
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

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    setApiError('');
    try {
      const idToken = response.credential;
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      const email = payload.email;
      const name = payload.name || payload.given_name || email.split('@')[0];
      const picture = payload.picture;

      let loginResponse;
      try {
        loginResponse = await api.post('/auth/login', {
          usernameOrEmail: email,
          password: 'GoogleOAuthPassword123!',
        });
      } catch (err) {
        // Auto-register
        await api.post('/auth/register', {
          username: name.toLowerCase().replace(/\s+/g, '_').substring(0, 45),
          email: email,
          password: 'GoogleOAuthPassword123!',
          profilePicture: picture
        });
        loginResponse = await api.post('/auth/login', {
          usernameOrEmail: email,
          password: 'GoogleOAuthPassword123!',
        });
      }

      const { user, token } = loginResponse.data;
      login(user, token);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setApiError('Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const simulateGoogleLogin = async () => {
    setLoading(true);
    setApiError('');
    const googleUser = {
      username: 'google_user',
      email: 'google.user@example.com',
      password: 'GoogleOAuthPassword123!',
      profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    };

    try {
      let loginResponse;
      try {
        loginResponse = await api.post('/auth/login', {
          usernameOrEmail: googleUser.email,
          password: googleUser.password,
        });
      } catch (err) {
        await api.post('/auth/register', {
          username: googleUser.username,
          email: googleUser.email,
          password: googleUser.password,
          role: 'USER',
          profilePicture: googleUser.profilePicture
        });
        loginResponse = await api.post('/auth/login', {
          usernameOrEmail: googleUser.email,
          password: googleUser.password,
        });
      }

      const { user, token } = loginResponse.data;
      login(user, token);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setApiError('Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "1036489397-dummyclientid.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        const btnContainer = document.getElementById("googleSignInButton");
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            width: btnContainer.offsetWidth || 350,
          });
        }
      } catch (err) {
        console.warn("Google Sign-In initialization failed:", err);
      }
    }
  }, []);

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

      <div className="relative flex items-center justify-center my-5">
        <hr className="w-full border-slate-200/60 dark:border-slate-800/80" />
        <span className="absolute px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-white/95 dark:bg-slate-900 rounded-full">
          Or Continue With
        </span>
      </div>

      <div id="googleSignInButton" className="w-full flex justify-center mt-2"></div>

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
