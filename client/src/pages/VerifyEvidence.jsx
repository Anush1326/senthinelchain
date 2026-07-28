import React, { useState } from 'react';
import { ShieldCheck, Search, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

const VerifyEvidence = () => {
  const [status, setStatus] = useState('idle'); // idle, verifying, success, fail

  const handleVerify = (e) => {
    e.preventDefault();
    setStatus('verifying');
    setTimeout(() => {
      setStatus('success'); // mockup
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 mt-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-tr from-primary-600 to-accent rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(99,102,241,0.4)]">
          <ShieldCheck size={32} className="text-white" />
        </div>
        <h2 className="text-3xl font-bold text-slate-100">Verify Evidence Integrity</h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Enter an evidence hash, ID, or upload a local file to cryptographically verify its integrity against the blockchain record.
        </p>
      </div>

      <div className="glassmorphism rounded-2xl p-6 sm:p-8 border border-slate-700/50 shadow-xl relative z-10">
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Enter SHA-256 Hash or Evidence ID..." 
              className="w-full bg-sentinel-dark-900 border border-slate-600 rounded-xl pl-12 pr-4 py-3.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 shadow-inner"
            />
          </div>
          
          <div className="flex items-center gap-4 py-2">
            <div className="h-px bg-slate-700 flex-1"></div>
            <span className="text-xs text-slate-500 uppercase font-semibold">OR</span>
            <div className="h-px bg-slate-700 flex-1"></div>
          </div>

          <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center hover:border-slate-500 transition-colors bg-sentinel-dark-900/50 cursor-pointer">
             <FileText size={24} className="text-slate-400 mx-auto mb-2" />
             <p className="text-sm text-slate-300 font-medium">Select a file to verify</p>
             <p className="text-xs text-slate-500 mt-1">File is hashed locally, never uploaded.</p>
          </div>

          <button 
            type="submit"
            disabled={status === 'verifying'}
            className="w-full mt-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-semibold py-3.5 rounded-xl shadow-lg border border-primary-500/50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === 'verifying' ? 'Verifying against Blockchain...' : 'Verify Evidence'}
          </button>
        </form>
      </div>

      {/* Results Area */}
      {status === 'success' && (
        <div className="glassmorphism rounded-xl p-6 border border-emerald-500/30 bg-emerald-500/5 animated-border">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-400 mt-1">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-400">Verification Successful</h3>
              <p className="text-slate-300 text-sm mt-1">The file matches the cryptographic hash stored on the blockchain. It has not been tampered with since upload.</p>
              
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-500">Evidence ID</span>
                  <span className="text-slate-300 font-mono">EVD-2023-001</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 py-2">
                  <span className="text-slate-500">Timestamp</span>
                  <span className="text-slate-300">Oct 24, 2023 10:15 UTC</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500">Block Number</span>
                  <span className="text-slate-300 font-mono">#18439201</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyEvidence;
