import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Zap,
  Play,
  Clock,
  Globe,
  Hash,
  Lock,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  FileDiff,
  Download,
  Printer,
  RefreshCw,
  Eye,
  ShieldCheck,
  Radio,
  Share2,
  FileText,
  Loader2,
  ArrowRight,
  ExternalLink,
  Users,
  Activity,
  Layers,
  Database,
  Crosshair,
  Search,
  Check
} from 'lucide-react';
import showCyberToast from '../components/CyberToast';
import RiskScoreBadge from '../components/RiskScoreBadge';
import TamperingDiffCard from '../components/TamperingDiffCard';
import api from '../services/api';

const ATTACK_VECTORS = [
  // 💥 DESTROYS (Permanent erasure of evidence data/metadata)
  { id: 'exif_removal', label: 'Complete EXIF Metadata Stripping', actionType: 'DESTROYS', category: 'Metadata Erasure', badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40' },
  { id: 'watermark_erasure', label: 'Digital Seal & Watermark Erasure', actionType: 'DESTROYS', category: 'Security Erasure', badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40' },
  { id: 'noise_injection', label: 'High-Frequency Noise Injection', actionType: 'DESTROYS', category: 'Pixel Destruction', badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40' },
  { id: 'file_truncation', label: 'Evidence Payload Byte Truncation', actionType: 'DESTROYS', category: 'Payload Destruction', badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40' },

  // ✏️ ALTERS (Modifying or fabricating evidence content)
  { id: 'one_pixel_mod', label: '1-Pixel RGB Alteration Attack', actionType: 'ALTERS', category: 'Pixel Editing', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'pdf_text_mod', label: 'Document Text & Amount Alteration', actionType: 'ALTERS', category: 'Document Forgery', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'fake_metadata', label: 'Synthetic EXIF Header Injection', actionType: 'ALTERS', category: 'Header Manipulation', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'deepfake', label: 'Deepfake Synthetic Face Swap', actionType: 'ALTERS', category: 'AI Synthetic', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'copy_move', label: 'Copy-Move Region Cloning Attack', actionType: 'ALTERS', category: 'Cloning Forgery', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'splicing', label: 'Image Splicing & Overlay Attack', actionType: 'ALTERS', category: 'Splicing Forgery', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'brightness_contrast', label: 'Brightness & Exposure Shift (+25%)', actionType: 'ALTERS', category: 'Filter Shift', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },

  // 🙈 HIDES (Obscuring, masking, or concealing evidence details)
  { id: 'object_removal', label: 'Inpainting Object / Person Removal', actionType: 'HIDES', category: 'Content Masking', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  { id: 'face_blur', label: 'Facial Obfuscation & Gaussian Blur', actionType: 'HIDES', category: 'Identity Obfuscation', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  { id: 'cropping', label: 'Border Pixel Cropping (-5%)', actionType: 'HIDES', category: 'Spatial Masking', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  { id: 'badge_blackout', label: 'Credential & License Plate Blackout', actionType: 'HIDES', category: 'Credential Masking', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' }
];

const AttackSimulator = () => {
  const [evidenceList, setEvidenceList] = useState([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL'); // ALL | DESTROYS | ALTERS | HIDES

  const filteredVectors = ATTACK_VECTORS.filter(
    v => actionFilter === 'ALL' || v.actionType === actionFilter
  );
  const [verifying, setVerifying] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [activeTab, setActiveTab] = useState('verdict');

  const [attackHistory, setAttackHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchEvidences();
    fetchAttackHistory();
  }, []);

  const fetchAttackHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/evidence/attack-history');
      if (res.data?.success) {
        setAttackHistory(res.data.data?.data || res.data.data || []);
      }
    } catch (e) {
      console.warn('Failed to fetch attack history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.delete('/evidence/attack-history');
      setAttackHistory([]);
      showCyberToast.success('Attack history cleared', 'HISTORY_CLEARED');
    } catch (e) {
      showCyberToast.error('Failed to clear attack history');
    }
  };

  const handleLaunchAttack = async (e) => {
    if (e) e.preventDefault();
    setExecuting(true);
    setSimulationResult(null);
    setVerificationResult(null);

    try {
      const res = await api.post('/evidence/simulate-attack', {
        scenarioId: selectedVectorId,
        evidenceId: selectedEvidenceId
      });

      if (res.data?.success) {
        setSimulationResult(res.data.data);
        showCyberToast.error(
          `Attack Simulation Executed! New Modified CID: ${res.data.data.modifiedRecord.ipfsCid.slice(0, 16)}...`,
          'ATTACK_EXECUTED'
        );
        fetchAttackHistory();
      }
    } catch (err) {
      showCyberToast.error('Failed to execute attack simulation');
    } finally {
      setExecuting(false);
    }
  };

  const handleRunVerification = async () => {
    if (!simulationResult) return;
    setVerifying(true);

    setTimeout(() => {
      setVerificationResult(simulationResult.verificationResult);
      setVerifying(false);
      if (simulationResult.verificationResult.matched) {
        showCyberToast.success('✓ ORIGINAL EVIDENCE VERIFIED', 'BLOCKCHAIN_MATCH');
      } else {
        showCyberToast.error('❌ TAMPERED EVIDENCE DETECTED! SHA-256 & CID Mismatch', 'INTEGRITY_FAILED');
      }
    }, 1000);
  };

  const targetEvidence = evidenceList.find(e => e.id === selectedEvidenceId) || evidenceList[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header & Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-red-400 uppercase tracking-widest mb-1">
            <Zap size={14} className="animate-pulse" /> Advanced Forensic Security Testbed
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-3">
            Digital Evidence Attack &amp; Verification Simulator
            <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-400">
              IPFS Rules Enforced
            </span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Simulate realistic evidence tampering attacks. Test IPFS CID immutability rules and Polygon blockchain hash verification.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-700 transition shrink-0"
        >
          <Printer size={14} className="text-cyan-400" />
          <span>Print Forensic Report</span>
        </button>
      </div>

      {/* Control Configuration Sandbox */}
      <div className="glassmorphism p-6 rounded-2xl border border-slate-700/50 shadow-xl space-y-6">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <Activity size={16} className="text-amber-400" /> Attack Simulation Sandbox
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Evidence Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 uppercase block">1. Select Ingested Target Evidence:</label>
            <select
              value={selectedEvidenceId}
              onChange={(e) => setSelectedEvidenceId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 rounded-xl border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition"
            >
              {evidenceList.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.originalFileName})
                </option>
              ))}
            </select>
            {targetEvidence && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
                <p>Original CID (CID_v1): <span className="text-cyan-300 font-bold">{targetEvidence.ipfsHash || 'QmYwAP...'}</span></p>
                <p>Polygon Amoy Block: <span className="text-amber-400 font-bold">#{targetEvidence.blockNumber || 48521000}</span></p>
              </div>
            )}
          </div>

          {/* Tampering Vector Selection Grouped by Legal Action Type */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-slate-400 uppercase block">2. Select Legal Attack Action Vector:</label>
              
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1">
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'DESTROYS', label: '💥 Destroys' },
                  { id: 'ALTERS', label: '✏️ Alters' },
                  { id: 'HIDES', label: '🙈 Hides' }
                ].map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => {
                      setActionFilter(pill.id);
                      const available = ATTACK_VECTORS.filter(v => pill.id === 'ALL' || v.actionType === pill.id);
                      if (available.length > 0) setSelectedVectorId(available[0].id);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition ${
                      actionFilter === pill.id
                        ? pill.id === 'DESTROYS' ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : pill.id === 'ALTERS' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : pill.id === 'HIDES' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            <select
              value={selectedVectorId}
              onChange={(e) => setSelectedVectorId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 rounded-xl border border-slate-700 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500 transition"
            >
              {filteredVectors.map((v) => (
                <option key={v.id} value={v.id}>
                  [{v.actionType}] [{v.category}] {v.label}
                </option>
              ))}
            </select>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleLaunchAttack}
                disabled={executing}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg border border-red-500/40 transition w-full md:w-auto justify-center"
              >
                {executing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                <span>⚡ Launch Tampering Attack</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario 1: Original vs Modified Evidence Cards Display */}
      {simulationResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Ingest Evidence Card */}
            <div className="glassmorphism p-5 rounded-2xl border border-emerald-500/30 bg-slate-900/80 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={16} /> Original Anchored Evidence (v1.0)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-bold">
                  Verified
                </span>
              </div>

              <div className="space-y-2 text-slate-300">
                <p>Title: <span className="text-white font-bold">{simulationResult.originalRecord.title}</span></p>
                <p>Original SHA-256: <span className="text-cyan-300 break-all select-all">{simulationResult.originalRecord.sha256}</span></p>
                <p>Original IPFS CID (CID_v1): <span className="text-cyan-400 font-bold break-all">{simulationResult.originalRecord.ipfsCid}</span></p>
                <p>Polygon Tx Hash: <span className="text-amber-400 break-all">{simulationResult.originalRecord.transactionHash}</span></p>
                <p>Block Height: <span className="text-amber-300">#{simulationResult.originalRecord.blockNumber}</span></p>
                <p>Uploader: <span className="text-slate-400">{simulationResult.originalRecord.uploader}</span></p>
              </div>
            </div>

            {/* Modified Evidence Card (After Attack) */}
            <div className="glassmorphism p-5 rounded-2xl border border-red-500/30 bg-slate-900/80 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert size={16} /> Modified Evidence State (Version 2)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] uppercase font-bold">
                  Tampered
                </span>
              </div>

              <div className="space-y-2 text-slate-300">
                <p>Modification Vector: <span className="text-amber-300 font-bold">{simulationResult.modifiedRecord.modificationType}</span></p>
                <p>Modified SHA-256: <span className="text-red-400 break-all select-all font-bold">{simulationResult.modifiedRecord.sha256}</span></p>
                <p>Modified IPFS CID (CID_v2): <span className="text-red-400 font-bold break-all">{simulationResult.modifiedRecord.ipfsCid}</span></p>
                <p>Timestamp: <span className="text-slate-400">{new Date(simulationResult.modifiedRecord.modificationTime).toLocaleString()}</span></p>
                
                <div className="pt-2">
                  <button
                    onClick={handleRunVerification}
                    disabled={verifying}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg border border-cyan-500/40 transition w-full justify-center"
                  >
                    {verifying ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                    <span>🔍 Verify Evidence On-Chain</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Results & Verdict Cards */}
          {verificationResult && (
            <div className="space-y-6">
              {/* Verdict Header Banner */}
              <div className={`p-6 rounded-2xl border glassmorphism shadow-2xl space-y-3 ${
                verificationResult.matched
                  ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 text-emerald-300'
                  : 'border-red-500/40 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 text-red-300'
              }`}>
                <div className="flex items-center justify-between font-mono">
                  <div className="flex items-center gap-3">
                    {verificationResult.matched ? (
                      <CheckCircle2 size={28} className="text-emerald-400" />
                    ) : (
                      <ShieldAlert size={28} className="text-red-400 animate-pulse" />
                    )}
                    <div>
                      <h2 className="text-xl font-bold font-mono tracking-wider">{verificationResult.verdictTitle}</h2>
                      <p className="text-xs text-slate-400 font-mono">Recommendation: {verificationResult.recommendation}</p>
                    </div>
                  </div>
                  <RiskScoreBadge score={verificationResult.matched ? 10 : 94} level={verificationResult.matched ? 'SAFE' : 'CRITICAL'} size="md" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
                  {verificationResult.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-300">
                      <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Tabs for Forensic Details */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                {[
                  { id: 'verdict', label: 'Verdict & Metrics', icon: <Activity size={14} /> },
                  { id: 'diff', label: 'Granular Diff Matrix', icon: <FileDiff size={14} /> },
                  { id: 'ai', label: 'AI Forensic Scan', icon: <Cpu size={14} /> },
                  { id: 'timeline', label: 'Chain of Custody Timeline', icon: <Clock size={14} /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs transition ${
                      activeTab === tab.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab 1: Verdict Metrics */}
              {activeTab === 'verdict' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glassmorphism p-5 rounded-2xl border border-slate-700/50 space-y-2">
                    <span className="text-xs font-mono text-slate-400 uppercase">Structural Similarity (SSIM)</span>
                    <p className="text-3xl font-bold font-mono text-cyan-400">{simulationResult.forensicAnalysis.ssimPercentage}%</p>
                    <p className="text-[10px] text-slate-400 font-mono">Structural alignment score</p>
                  </div>

                  <div className="glassmorphism p-5 rounded-2xl border border-slate-700/50 space-y-2">
                    <span className="text-xs font-mono text-slate-400 uppercase">Pixel Divergence Rate</span>
                    <p className="text-3xl font-bold font-mono text-red-400">{simulationResult.forensicAnalysis.changedPixelsPercentage}%</p>
                    <p className="text-[10px] text-slate-400 font-mono">{simulationResult.forensicAnalysis.changedPixelsCount?.toLocaleString()} pixels mutated</p>
                  </div>

                  <div className="glassmorphism p-5 rounded-2xl border border-slate-700/50 space-y-2">
                    <span className="text-xs font-mono text-slate-400 uppercase">AI Forensic Confidence</span>
                    <p className="text-3xl font-bold font-mono text-emerald-400">{simulationResult.forensicAnalysis.confidenceScore}%</p>
                    <p className="text-[10px] text-slate-400 font-mono">Algorithm confidence rating</p>
                  </div>

                  <div className="glassmorphism p-5 rounded-2xl border border-slate-700/50 space-y-2">
                    <span className="text-xs font-mono text-slate-400 uppercase">Evidence Trust Score</span>
                    <p className="text-3xl font-bold font-mono text-amber-400">{simulationResult.trustScore}%</p>
                    <p className="text-[10px] text-slate-400 font-mono">Integrity trust rating</p>
                  </div>
                </div>
              )}

              {/* Tab 2: Granular Diff Matrix */}
              {activeTab === 'diff' && (
                <TamperingDiffCard evidence={targetEvidence} />
              )}

              {/* Tab 3: AI Forensic Scan */}
              {activeTab === 'ai' && (
                <div className="glassmorphism p-6 rounded-2xl border border-slate-700/50 space-y-4 font-mono text-xs">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Cpu size={16} /> Multi-Vector AI Forensics Scan Findings
                  </h3>

                  <div className="space-y-2">
                    {simulationResult.forensicAnalysis.findings.map((f, i) => (
                      <div key={i} className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-amber-300 flex items-start gap-2">
                        <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Chain of Custody Timeline */}
              {activeTab === 'timeline' && (
                <div className="glassmorphism p-6 rounded-2xl border border-slate-700/50 space-y-6">
                  <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Clock size={16} className="text-cyan-400" /> Complete Audit Trail &amp; Chain of Custody
                  </h3>

                  <div className="relative pl-6 space-y-6 border-l-2 border-slate-800">
                    {simulationResult.timeline.map((step) => (
                      <div key={step.step} className="relative">
                        <div className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold ${
                          step.status === 'SUCCESS' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                          step.status === 'CRITICAL' ? 'bg-red-500/20 border-red-500 text-red-400' :
                          step.status === 'WARNING' ? 'bg-amber-500/20 border-amber-500 text-amber-400' :
                          'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                        }`}>
                          {step.step}
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 font-mono text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{step.title}</span>
                            <span className="text-[10px] text-slate-500">{new Date(step.time).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Persistent History of Executed Tampering Attacks Section */}
      <div className="glassmorphism p-6 rounded-2xl border border-slate-700/50 shadow-xl space-y-6 font-mono text-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} className="text-red-400" /> Historical Attack Audit Ledger
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Logs of all simulated evidence tampering attacks, mutated CIDs, trust scores, and AI forensic reports.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchAttackHistory}
              disabled={loadingHistory}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <RefreshCw size={13} className={loadingHistory ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 bg-red-950/40 hover:bg-red-900/40 text-red-300 text-xs px-3 py-1.5 rounded-lg border border-red-800/40 transition"
            >
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {loadingHistory ? (
          <div className="py-8 text-center text-slate-400">
            <Loader2 size={24} className="animate-spin mx-auto mb-2 text-cyan-400" />
            <p>Fetching attack history logs...</p>
          </div>
        ) : attackHistory.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800 uppercase">
                <tr>
                  <th className="p-3">ATTACK VECTOR</th>
                  <th className="p-3">TARGET EVIDENCE</th>
                  <th className="p-3">MUTATED CID (CID_v2)</th>
                  <th className="p-3">TRUST SCORE</th>
                  <th className="p-3">TIMESTAMP</th>
                  <th className="p-3">AI FORENSIC EXPLANATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                {attackHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-bold text-amber-300">
                      <div className="space-y-0.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          item.actionType === 'DESTROYS' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          item.actionType === 'HIDES' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {item.actionType || 'ALTERS'}
                        </span>
                        <p className="text-slate-200 font-semibold">{item.scenarioName}</p>
                      </div>
                    </td>
                    <td className="p-3 text-slate-200">{item.evidenceTitle}</td>
                    <td className="p-3 text-red-400 break-all max-w-[180px] text-[11px]">{item.mutatedIpfsCid}</td>
                    <td className="p-3 font-bold">
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        {item.trustScore}%
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 text-[10px]">{new Date(item.timestamp).toLocaleString()}</td>
                    <td className="p-3 text-slate-300 text-[11px] max-w-[280px]">{item.aiSummary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
            <p>No attack simulation logs recorded yet. Launch an attack above to populate history.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttackSimulator;
