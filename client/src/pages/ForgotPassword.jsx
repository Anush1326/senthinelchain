import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetInfo, setResetInfo] = useState(null);
  const { forgotPassword, loading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    const result = await forgotPassword(email);
    if (result.success) {
      setSubmitted(true);
      setResetInfo(result);
      toast.success('Password reset link generated');
    } else {
      toast.error(result.message);
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
          <h1 className="text-2xl font-bold text-slate-100">Forgot Password</h1>
          <p className="text-slate-400 text-sm mt-1 text-center">
            Enter your account email to receive a password reset token.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-center">
              <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-2" />
              <h3 className="text-slate-200 font-semibold text-base mb-1">Reset Token Generated</h3>
              <p className="text-slate-400 text-xs">
                In production, an email would be dispatched. For instant testing, use the token below or click the reset link:
              </p>
              {resetInfo?.resetToken && (
                <div className="mt-3 p-2 bg-sentinel-dark-800 rounded border border-slate-700 text-xs font-mono text-emerald-300 break-all select-all">
                  Token: {resetInfo.resetToken}
                </div>
              )}
            </div>

            {resetInfo?.resetToken && (
              <Link
                to={`/reset-password/${resetInfo.resetToken}`}
                className="block text-center w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg transition-all text-sm"
              >
                Proceed to Reset Password Page
              </Link>
            )}

            <button
              onClick={() => setSubmitted(false)}
              className="w-full text-slate-400 hover:text-slate-200 text-xs text-center py-2"
            >
              Try another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investigator@sentinelchain.ai"
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
                  <Loader2 size={18} className="animate-spin" /> Requesting...
                </>
              ) : (
                'Send Reset Token'
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
