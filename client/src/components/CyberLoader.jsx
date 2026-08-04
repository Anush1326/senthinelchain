import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Cpu, Database, Activity, Lock } from 'lucide-react';

/**
 * Cyber Radar Scope Spinner
 */
export const RadarSpinner = ({ size = 'md', label = 'PROCESSING_REQUEST...' }) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className={`relative ${sizeMap[size]} flex items-center justify-center`}>
        {/* Outer Glowing Ring */}
        <div className="absolute inset-0 rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]" />
        
        {/* Concentric Pulsing Rings */}
        <div className="absolute inset-2 rounded-full border border-sky-500/20 animate-pulse-cyan" />
        <div className="absolute inset-4 rounded-full border border-blue-600/30" />
        
        {/* Radar Sweep Arc */}
        <div className="absolute inset-0 rounded-full animate-radar overflow-hidden">
          <div className="w-1/2 h-1/2 bg-gradient-to-tr from-cyan-400/40 via-sky-500/10 to-transparent origin-bottom-right rounded-tl-full" />
        </div>

        {/* Crosshair Lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-[1px] bg-cyan-500/20" />
          <div className="h-full w-[1px] bg-cyan-500/20 absolute" />
        </div>

        {/* Center Tech Icon */}
        <motion.div 
          animate={{ scale: [0.95, 1.1, 0.95] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="relative z-10 text-cyan-400 filter drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]"
        >
          <Shield className="w-1/3 h-1/3 min-w-[16px] min-h-[16px]" />
        </motion.div>
      </div>

      {label && (
        <div className="flex items-center space-x-2 font-mono text-xs text-cyan-400 tracking-wider">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="uppercase text-shadow-[0_0_6px_rgba(0,240,255,0.6)]">{label}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Terminal Decrypting Text Loader
 */
export const TerminalLoader = ({ text = 'VERIFYING_BLOCKCHAIN_EVIDENCE_HASH' }) => {
  return (
    <div className="glass-card p-4 rounded-xl border border-cyan-500/30 max-w-md w-full my-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="text-slate-400 text-[10px] ml-2">SENTINEL_CLI_V2.4</span>
        </div>
        <Lock className="w-3.5 h-3.5 text-cyan-400" />
      </div>
      
      <div className="space-y-1.5 text-slate-300">
        <div className="text-cyan-400 font-semibold flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 animate-spin" />
          <span>STATUS: EXECUTION_IN_PROGRESS</span>
        </div>
        <p className="text-slate-400 text-[11px]">
          &gt; {text}...
        </p>
        
        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden mt-3 border border-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-sky-300"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Glassmorphism Skeleton Loader Card
 */
export const SkeletonCard = ({ rows = 3 }) => {
  return (
    <div className="glass-card p-6 rounded-2xl space-y-4 animate-pulse border border-slate-800">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-800/80 rounded w-1/3 border border-slate-700/50" />
        <div className="h-6 w-16 bg-cyan-950/40 rounded-full border border-cyan-500/20" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2 pt-1">
          <div className="h-3 bg-slate-800/60 rounded w-full" />
          <div className="h-3 bg-slate-800/40 rounded w-4/5" />
        </div>
      ))}
    </div>
  );
};

export default RadarSpinner;
