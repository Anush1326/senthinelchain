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
  { id: 'one_pixel_mod', label: '1-Pixel RGB Alteration Attack', category: 'Pixel Tampering' },
  { id: 'object_removal', label: 'Inpainting Object / Stamp Removal', category: 'Forgery' },
  { id: 'object_addition', label: 'Unauthorized Object Insertion', category: 'Forgery' },
  { id: 'face_blur', label: 'Facial Anonymization & Blur Tampering', category: 'Anonymization' },
  { id: 'cropping', label: 'Border Pixel Cropping (-5%)', category: 'Geometry' },
  { id: 'rotate_image', label: 'Geometric Rotation & Shear (90°)', category: 'Geometry' },
  { id: 'brightness_contrast', label: 'Brightness & Contrast Manipulation', category: 'Filter' },
  { id: 'jpeg_recompression', label: 'JPEG Re-compression (Quality 70)', category: 'Compression' },
  { id: 'exif_removal', label: 'Complete EXIF Metadata Stripping', category: 'Metadata' },
  { id: 'fake_metadata', label: 'Synthetic EXIF Header Injection', category: 'Metadata' },
  { id: 'png_to_jpg', label: 'Format Transcode (PNG to JPEG)', category: 'Format Transcode' },
  { id: 'resize_image', label: 'Bicubic Image Rescaling (4K to 1080p)', category: 'Geometry' },
  { id: 'watermark_add_remove', label: 'Watermark Addition / Removal', category: 'Forgery' },
  { id: 'copy_move', label: 'Copy-Move Region Cloning Attack', category: 'Forgery' },
  { id: 'splicing', label: 'Image Splicing & Overlay Attack', category: 'Forgery' }
];

const AttackSimulator = () => {
  const [evidenceList, setEvidenceList] = useState([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('');
  const [selectedVectorId, setSelectedVectorId] = useState('one_pixel_mod');
  
  const [executing, setExecuting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  const [activeTab, setActiveTab] = useState('verdict'); // verdict | diff | ai | timeline | report

  useEffect(() => {
    fetchEvidences();
  }, []);

  const fetchEvidences = async () => {
    try {
      const res = await api.get('/evidence');
      const items = res.data?.data?.data || res.data?.data || [];
      if (Array.isArray(items) && items.length > 0) {
        setEvidenceList(items);
        setSelectedEvidenceId(items[0].id);
      }
    } catch (e) {}
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

          {/* Tampering Vector Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 uppercase block">2. Select Simulated Modification Vector:</label>
            <select
              value={selectedVectorId}
              onChange={(e) => setSelectedVectorId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 rounded-xl border border-slate-700 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500 transition"
            >
              {ATTACK_VECTORS.map((v) => (
                <option key={v.id} value={v.id}>
                  [{v.category}] {v.label}
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
    </div>
  );
};

export default AttackSimulator;
