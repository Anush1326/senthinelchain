import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { KeyRound, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import showCyberToast from '../components/CyberToast';
import useAuthStore from '../store/authStore';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { resetPassword, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      showCyberToast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      showCyberToast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      showCyberToast.error('Password must be at least 6 characters long');
      return;
    }

    const result = await resetPassword(token, password);
    if (result.success) {
      showCyberToast.success('Password updated successfully! Please log in.');
      navigate('/login');
    } else {
      showCyberToast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-sentinel-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="glassmorphism w-full max-w-md p-8 rounded-2xl border border-slate-700/50 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-primary-600 to-accent rounded-xl flex items-center justify-center mb-3 glow-effect">
            <KeyRound size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Reset Password</h1>
          <p className="text-slate-400 text-sm mt-1 text-center">
            Set a new secure password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-sentinel-dark-800/80 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Confirm New Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-sentinel-dark-800/80 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-semibold py-3 rounded-lg shadow-lg border border-primary-500/50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Remember your password?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
