import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, Mail, Lock, Wallet, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import showCyberToast from '../components/CyberToast';
import useAuthStore from '../store/authStore';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'investigator',
    walletAddress: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (error) clearError();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, role, walletAddress } = formData;

    if (!name || !email || !password || !confirmPassword) {
      showCyberToast.error('Please fill in all required fields');
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

    const result = await register(name, email, password, role, walletAddress);
    if (result.success) {
      showCyberToast.success('Account created successfully!');
      navigate('/');
    } else {
      showCyberToast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-sentinel-dark-900 flex items-center justify-center p-4 relative overflow-hidden py-12">
      {/* Background Effects */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="glassmorphism w-full max-w-lg p-8 rounded-2xl border border-slate-700/50 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-tr from-primary-600 to-accent rounded-xl flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Join the SentinelChain secure evidence network.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/40 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Agent Jane Doe"
                className="w-full bg-sentinel-dark-800/80 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="agent@sentinelchain.ai"
                className="w-full bg-sentinel-dark-800/80 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-sentinel-dark-800/80 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-sentinel-dark-800/80 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Access Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-sentinel-dark-800/80 border border-slate-600 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-primary-500 text-sm"
            >
              <option value="investigator">Investigator (Full Upload & Chain of Custody)</option>
              <option value="admin">Administrator (Full Access & Verifier Control)</option>
              <option value="viewer">Viewer (Read-Only Verification Access)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Polygon Wallet Address (Optional)</label>
            <div className="relative">
              <Wallet size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleChange}
                placeholder="0x..."
                className="w-full bg-sentinel-dark-800/80 border border-slate-600 rounded-lg pl-9 pr-3 py-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 text-sm font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-semibold py-3 rounded-lg shadow-lg border border-primary-500/50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
