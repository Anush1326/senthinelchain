import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, Cpu } from 'lucide-react';
import showCyberToast from '../components/CyberToast';
import useAuthStore from '../store/authStore';
import { RadarSpinner } from '../components/CyberLoader';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showCyberToast.warning('Please fill in all fields', 'MISSING_FIELDS');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      showCyberToast.success(`Authenticated: Welcome back ${result.data.name}`, 'ACCESS_GRANTED');
      navigate(from, { replace: true });
    } else {
      showCyberToast.error(result.message || 'Authentication Failed', 'ACCESS_DENIED');
    }
  };

  return (
    <div className="min-h-screen bg-sentinel-dark-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Cyber Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05)_0,transparent_70%)] pointer-events-none" />

      <div className="glass-modal w-full max-w-md p-8 rounded-2xl border border-cyan-500/30 shadow-[0_0_40px_rgba(0,240,255,0.15)] relative z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,240,255,0.4)] border border-cyan-300/40">
            <Shield size={32} className="text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </div>
          <h1 className="text-2xl font-bold font-mono tracking-wide gradient-cyber-title">
            SENTINEL_LOCKER
          </h1>
          <p className="text-slate-400 text-xs font-mono mt-2">
            AI-POWERED BLOCKCHAIN EVIDENCE AUTHENTICATION
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400 text-xs font-mono text-center flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5 uppercase">
              OPERATOR_EMAIL
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-3.5 text-cyan-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@sentinelchain.ai"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-xs font-mono shadow-inner"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-mono font-semibold text-slate-300 uppercase">
                SECURITY_KEY
              </label>
              <Link to="/forgot-password" className="text-[11px] font-mono text-cyan-400 hover:underline">
                Recover key?
              </Link>
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3.5 text-cyan-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-xs font-mono shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white font-mono font-bold text-xs uppercase py-3.5 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)] border border-cyan-300/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Cpu size={16} className="animate-spin text-white" />
                <span>VERIFYING_CREDENTIALS...</span>
              </div>
            ) : (
              'INITIALIZE_SESSION'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-mono text-slate-400">
          Unregistered node?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline font-bold">
            REQUEST_ACCESS
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
