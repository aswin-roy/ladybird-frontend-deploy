import React, { useState } from 'react';
import { authService } from '../services/authService';
import { Loader2 } from 'lucide-react';
import { ApiError } from '../services/api';

interface LoginProps {
  onLogin: () => void;
}

type ViewType = 'login' | 'signup' | 'forgotPassword';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<ViewType>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await authService.login({ email, password });
      onLogin();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long!');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await authService.signup({ name, email, password, confirmPassword });
      alert(`Account created successfully for ${name}!`);
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setView('login');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await authService.forgotPassword({ email: resetEmail });
      alert(`Password reset link has been sent to ${resetEmail}`);
      setResetEmail('');
      setView('login');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = () => (
    <>
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-purple-600 rounded-lg mx-auto flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
          <span className="text-white font-bold text-xl">L</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-500 mt-2">Sign in to your LADYBIRD dashboard</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@boutique.com" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
            required
            disabled={isLoading}
          />
         */ <div className="flex justify-end mt-2">
            <button 
              type="button" 
              className="text-sm text-purple-600 hover:underline" 
              onClick={() => setView('forgotPassword')}
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>
        </div>/*
        
        <button 
          type="submit" 
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="animate-spin" size={20} />}
          Sign In
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button 
            type="button"
            onClick={() => setView('signup')}
            className="text-purple-600 hover:underline font-medium"
            disabled={isLoading}
          >
            Sign Up
          </button>
        </p>
      </div>
    </>
  );

  const renderSignUpForm = () => (
    <>
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-purple-600 rounded-lg mx-auto flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
          <span className="text-white font-bold text-xl">L</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-500 mt-2">Sign up for your LADYBIRD dashboard</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSignUp} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@boutique.com" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
            required
            minLength={6}
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
            required
            minLength={6}
            disabled={isLoading}
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="animate-spin" size={20} />}
          Create Account
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button 
            type="button"
            onClick={() => {
              setView('login');
              setName('');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              setError(null);
            }}
            className="text-purple-600 hover:underline font-medium"
            disabled={isLoading}
          >
            Sign In
          </button>
        </p>
      </div>
    </>
  );

  const renderForgotPasswordForm = () => (
    <>
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-purple-600 rounded-lg mx-auto flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
          <span className="text-white font-bold text-xl">L</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
        <p className="text-gray-500 mt-2">Enter your email to reset your password</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleForgotPassword} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            type="email" 
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            placeholder="admin@boutique.com" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
            required
            disabled={isLoading}
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="animate-spin" size={20} />}
          Send Reset Link
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <button 
          type="button"
          onClick={() => {
            setView('login');
            setResetEmail('');
            setError(null);
          }}
          className="text-sm text-purple-600 hover:underline font-medium"
          disabled={isLoading}
        >
          Back to Sign In
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        {view === 'login' && renderLoginForm()}
        {view === 'signup' && renderSignUpForm()}
        {view === 'forgotPassword' && renderForgotPasswordForm()}
      </div>
    </div>
  );
};
