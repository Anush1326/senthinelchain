import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';

/**
 * RiskScoreBadge Component
 * Renders a color-coded cybersecurity risk badge and numerical meter (0-100).
 */
const RiskScoreBadge = ({ score = 15, level = null, showMeter = true, size = 'md' }) => {
  // Determine Risk Level if not provided
  let riskLevel = level;
  if (!riskLevel) {
    if (score <= 25) riskLevel = 'LOW';
    else if (score <= 60) riskLevel = 'MEDIUM';
    else if (score <= 85) riskLevel = 'HIGH';
    else riskLevel = 'CRITICAL';
  }

  const config = {
    LOW: {
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      glowColor: 'shadow-[0_0_12px_rgba(0,240,255,0.3)]',
      progressColor: 'from-cyan-500 to-blue-500',
      icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />
    },
    MEDIUM: {
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      glowColor: 'shadow-[0_0_12px_rgba(245,158,11,0.3)]',
      progressColor: 'from-amber-500 to-yellow-400',
      icon: <Activity className="w-4 h-4 text-amber-400" />
    },
    HIGH: {
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      glowColor: 'shadow-[0_0_12px_rgba(249,115,22,0.3)]',
      progressColor: 'from-orange-500 to-amber-500',
      icon: <AlertTriangle className="w-4 h-4 text-orange-400" />
    },
    CRITICAL: {
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/40',
      glowColor: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]',
      progressColor: 'from-red-600 to-rose-400',
      icon: <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
    }
  };

  const activeConfig = config[riskLevel] || config.LOW;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-2',
    lg: 'text-sm px-4 py-2 gap-2.5'
  };

  return (
    <div className="flex flex-col space-y-1">
      <div 
        className={`inline-flex items-center rounded-xl font-mono font-bold border ${activeConfig.bgColor} ${activeConfig.borderColor} ${activeConfig.color} ${activeConfig.glowColor} ${sizeClasses[size]}`}
      >
        {activeConfig.icon}
        <span className="tracking-wider">
          RISK: {score}/100 [{riskLevel}]
        </span>
      </div>

      {showMeter && (
        <div className="w-full bg-slate-900/90 rounded-full h-1.5 border border-slate-800 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${activeConfig.progressColor} transition-all duration-500`}
            style={{ width: `${Math.min(Math.max(score, 5), 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default RiskScoreBadge;
