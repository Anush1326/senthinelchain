import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  FileDiff, 
  Hash, 
  Clock, 
  HardDrive, 
  Lock, 
  Cpu, 
  CheckCircle2, 
  XCircle,
  FileSearch,
  ArrowRight
} from 'lucide-react';
import RiskScoreBadge from './RiskScoreBadge';

/**
 * TamperingDiffCard Component
 * Displays a granular breakdown of what changed after tampering.
 */
const TamperingDiffCard = ({ evidence }) => {
  if (!evidence) return null;

  const isTampered = evidence.status === 'flagged' || evidence.status === 'tampered' || evidence.tamperingDetails?.isTampered;
  const details = evidence.tamperingDetails || {};
  const changedFields = details.changedFields || [];
  const aiReport = details.aiForensicReport || {};
  const score = evidence.riskScore !== undefined ? evidence.riskScore : (isTampered ? 92 : 12);
  const riskLevel = evidence.riskLevel || (isTampered ? 'CRITICAL' : 'LOW');

  return (
    <div className={`glass-card rounded-2xl p-6 border ${
      isTampered ? 'border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'border-cyan-500/30 shadow-[0_0_20px_rgba(0,240,255,0.1)]'
    } relative overflow-hidden space-y-6 font-sans`}>
      {/* Background Subtle Gradient */}
      <div className={`absolute top-0 right-0 w-80 h-80 ${
        isTampered ? 'bg-red-500/10' : 'bg-cyan-500/10'
      } rounded-full blur-[100px] pointer-events-none`} />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${
            isTampered ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
          }`}>
            {isTampered ? <ShieldAlert size={26} className="animate-pulse" /> : <CheckCircle2 size={26} />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold font-mono text-white">
                {isTampered ? 'TAMPERING_ANALYSIS_REPORT' : 'INTEGRITY_VERIFICATION_REPORT'}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                isTampered ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}>
                {isTampered ? 'TAMPERING_DETECTED' : 'CHAIN_INTACT'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Forensic Hash Audit & Metadata Change Comparison
            </p>
          </div>
        </div>

        <RiskScoreBadge score={score} level={riskLevel} size="lg" />
      </div>

      {/* Summary Message Banner */}
      <div className={`p-4 rounded-xl border text-xs font-mono relative z-10 ${
        isTampered 
          ? 'bg-red-950/40 border-red-500/30 text-red-300 shadow-inner' 
          : 'bg-slate-900/80 border-cyan-500/30 text-cyan-300'
      }`}>
        <p className="font-semibold flex items-center gap-2">
          {isTampered ? <AlertTriangle size={16} className="text-red-400" /> : <Lock size={16} className="text-cyan-400" />}
          <span>{details.tamperingSummary || (isTampered ? 'Critical discrepancies detected between original on-chain hash and current file scan.' : 'File hash matches original blockchain registration block.')}</span>
        </p>
      </div>

      {/* Cryptographic Hash Comparison (Anchored vs Scanned) */}
      <div className="space-y-3 relative z-10">
        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Hash size={14} className="text-cyan-400" />
          CRYPTOGRAPHIC_HASH_COMPARISON
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {/* Original On-Chain Anchored Hash */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block">
              ORIGINAL ANCHORED HASH (BLOCKCHAIN)
            </span>
            <p className="text-cyan-400 break-all font-semibold select-all">
              {details.anchoredHash || evidence.fileHash || 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2'}
            </p>
          </div>

          {/* Current Scanned Hash */}
          <div className={`p-3.5 rounded-xl bg-slate-900/90 border space-y-1 ${
            isTampered ? 'border-red-500/40 bg-red-950/20' : 'border-slate-800'
          }`}>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block">
              CURRENT SCANNED FILE HASH
            </span>
            <p className={`break-all font-semibold select-all ${isTampered ? 'text-red-400' : 'text-cyan-400'}`}>
              {details.scannedHash || evidence.fileHash}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed What Changed Matrix (Tampering Diff Table) */}
      {isTampered && changedFields.length > 0 && (
        <div className="space-y-3 relative z-10 pt-2">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <FileDiff size={14} className="text-red-400" />
            DETAILED_TAMPERING_MODIFICATIONS_MATRIX (WHAT CHANGED)
          </h4>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-950/80 text-slate-400 text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3">ATTRIBUTE / FIELD</th>
                  <th className="p-3">ORIGINAL (ON-CHAIN)</th>
                  <th className="p-3 text-red-400">AFTER TAMPERING</th>
                  <th className="p-3">DISCREPANCY STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {changedFields.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-slate-200">{item.field}</td>
                    <td className="p-3 text-cyan-300 bg-cyan-950/10">{item.original}</td>
                    <td className="p-3 text-red-400 bg-red-950/20 font-semibold">{item.current}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        {item.discrepancyStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Forensic Pixel & Content Region Anomalies */}
      {isTampered && aiReport.alteredRegions?.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 relative z-10 font-mono text-xs">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Cpu size={14} className="text-amber-400" />
            AI_FORENSIC_TAMPERED_REGIONS_DETECTED
          </h4>
          <ul className="space-y-1.5 list-disc list-inside text-slate-300">
            {aiReport.alteredRegions.map((region, i) => (
              <li key={i} className="text-amber-300/90">
                {region}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TamperingDiffCard;
