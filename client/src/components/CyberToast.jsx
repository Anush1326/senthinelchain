import React from 'react';
import toast from 'react-hot-toast';
import { ShieldCheck, AlertTriangle, XCircle, Info, ShieldAlert } from 'lucide-react';

/**
 * Cyber Toast Custom Renderer
 */
/**
 * Cyber Toast Custom Renderer
 */
const toastMethods = {
  success: (message, title = 'SUCCESS') => {
    return toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full glass-card border border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.25)] rounded-xl pointer-events-auto flex overflow-hidden`}
      >
        <div className="w-2 bg-gradient-to-b from-cyan-400 to-blue-600" />
        <div className="flex-1 p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <ShieldCheck size={20} className="filter drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
              [{title}]
            </p>
            <p className="text-sm font-medium text-slate-200 mt-0.5">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            ✕
          </button>
        </div>
      </div>
    ));
  },

  error: (message, title = 'SECURITY_ALERT') => {
    return toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full glass-card border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.25)] rounded-xl pointer-events-auto flex overflow-hidden`}
      >
        <div className="w-2 bg-gradient-to-b from-red-500 to-rose-700" />
        <div className="flex-1 p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30">
            <ShieldAlert size={20} className="filter drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono font-bold text-red-400 tracking-wider uppercase">
              [{title}]
            </p>
            <p className="text-sm font-medium text-slate-200 mt-0.5">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            ✕
          </button>
        </div>
      </div>
    ));
  },

  info: (message, title = 'SYSTEM_NOTICE') => {
    return toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full glass-card border border-sky-500/50 shadow-[0_0_20px_rgba(56,189,248,0.25)] rounded-xl pointer-events-auto flex overflow-hidden`}
      >
        <div className="w-2 bg-gradient-to-b from-sky-400 to-blue-600" />
        <div className="flex-1 p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Info size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono font-bold text-sky-400 tracking-wider uppercase">
              [{title}]
            </p>
            <p className="text-sm font-medium text-slate-200 mt-0.5">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            ✕
          </button>
        </div>
      </div>
    ));
  },

  warning: (message, title = 'WARNING') => {
    return toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full glass-card border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.25)] rounded-xl pointer-events-auto flex overflow-hidden`}
      >
        <div className="w-2 bg-gradient-to-b from-amber-400 to-yellow-600" />
        <div className="flex-1 p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase">
              [{title}]
            </p>
            <p className="text-sm font-medium text-slate-200 mt-0.5">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            ✕
          </button>
        </div>
      </div>
    ));
  }
};

export const showCyberToast = function(typeOrMessage, message, title) {
  if (typeof typeOrMessage === 'string' && toastMethods[typeOrMessage]) {
    return toastMethods[typeOrMessage](message, title);
  }
  return toastMethods.info(typeOrMessage, message || 'SYSTEM_NOTICE');
};

Object.assign(showCyberToast, toastMethods);

export default showCyberToast;
