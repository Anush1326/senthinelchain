import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Unauthorized = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-sentinel-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="glassmorphism w-full max-w-md p-8 rounded-2xl border border-red-500/30 shadow-2xl text-center relative z-10">
        <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/40">
          <ShieldAlert size={36} />
        </div>

        <h1 className="text-2xl font-bold text-slate-100 mb-2">Access Denied</h1>
        <p className="text-slate-400 text-sm mb-6">
          Your account role <span className="font-semibold text-red-400 uppercase">({user?.role || 'Guest'})</span> does not have sufficient permissions to view this resource.
        </p>

        <div className="bg-sentinel-dark-800/80 p-4 rounded-xl border border-slate-700/50 mb-6 text-left text-xs text-slate-300">
          <p className="font-medium mb-1">Required Permissions:</p>
          <p className="text-slate-400">Contact your SentinelChain system administrator if you believe your assigned security clearance should be upgraded.</p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 px-4 rounded-lg border border-slate-600 transition-all"
        >
          <ArrowLeft size={18} /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
