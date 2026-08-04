import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  GitCommit,
  GitMerge,
  Globe,
  Hash,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Clock,
  User,
  FileText,
  FileDiff,
  Download,
  Printer,
  ExternalLink,
  Layers,
  Cpu,
  Database,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Eye,
  Plus,
  Play,
  Share2,
  Lock,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import showCyberToast from '../components/CyberToast';
import RiskScoreBadge from '../components/RiskScoreBadge';
import TamperingDiffCard from '../components/TamperingDiffCard';
import api from '../services/api';

const MODIFICATION_TYPES = [
  { id: 'one_pixel_mod', label: '1-Pixel RGB Alteration', category: 'Pixel Edit' },
  { id: 'metadata_mod', label: 'EXIF Timestamp / Camera Shift', category: 'Metadata' },
  { id: 'exif_removal', label: 'Complete EXIF Header Stripping', category: 'Metadata' },
  { id: 'jpeg_recompression', label: 'JPEG Re-compression (Quality 70)', category: 'Compression' },
  { id: 'cropping', label: 'Border Pixel Cropping (-5%)', category: 'Geometry' },
  { id: 'object_removal', label: 'Inpainting Object / Stamp Removal', category: 'Forgery' },
  { id: 'copy_move', label: 'Copy-Move Region Cloning', category: 'Forgery' },
  { id: 'splicing', label: 'Image Splicing & Overlay', category: 'Forgery' },
  { id: 'deepfake', label: 'Deepfake Synthetic Face Swap', category: 'AI Synthetic' },
  { id: 'brightness_adj', label: 'Exposure & Brightness +15%', category: 'Filter' },
  { id: 'contrast_adj', label: 'Contrast Curve Shift +20%', category: 'Filter' },
  { id: 'watermark_removal', label: 'Watermark Removal Inpainting', category: 'Forgery' },
  { id: 'noise_addition', label: 'Gaussian Noise Injection', category: 'Noise' },
  { id: 'file_rename', label: 'Filename & Extension Change', category: 'Header' },
  { id: 'format_conversion', label: 'Format Transcode (PNG -> JPEG)', category: 'Header' },
  { id: 'pdf_text_mod', label: 'PDF Document Text Alteration', category: 'Document' },
  { id: 'log_file_mod', label: 'Access Log Timestamp Offset', category: 'Log File' }
];

const EvidenceVersioning = () => {
  const [evidenceList, setEvidenceList] = useState([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('');
  const [versionGraphData, setVersionGraphData] = useState(null);
  const [selectedVersionNode, setSelectedVersionNode] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Version Creator Form
  const [modType, setModType] = useState('metadata_mod');
  const [modReason, setModReason] = useState('');
  const [creatingVersion, setCreatingVersion] = useState(false);

  useEffect(() => {
    fetchEvidences();
  }, []);

  useEffect(() => {
    if (selectedEvidenceId) {
      fetchVersionGraph(selectedEvidenceId);
    }
  }, [selectedEvidenceId]);

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

  const fetchVersionGraph = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/evidence/${id}/version-graph`);
      if (res.data?.success) {
        setVersionGraphData(res.data.data);
        const nodes = res.data.data.versionTree || [];
        if (nodes.length > 0) {
          setSelectedVersionNode(nodes[0]);
        }
      }
    } catch (e) {
      showCyberToast.error('Failed to fetch version lineage graph');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async (e) => {
    e.preventDefault();
    if (!selectedEvidenceId) return;
    setCreatingVersion(true);

    try {
      const parentTag = selectedVersionNode?.version || 'v1.0';
      const reasonText = modReason.trim() || `Simulated ${modType.replace(/_/g, ' ').toUpperCase()} on ${parentTag}`;
      
      const res = await api.post(`/evidence/${selectedEvidenceId}/create-version`, {
        modificationType: modType,
        modificationReason: reasonText,
        parentVersion: parentTag
      });

      if (res.data?.success) {
        showCyberToast.success(
          `New Immutable Version ${res.data.data.version} created on IPFS! CID: ${res.data.data.ipfsHash.slice(0, 16)}...`,
          'NEW_IPFS_CID_GENERATED'
        );
        setModReason('');
        await fetchVersionGraph(selectedEvidenceId);
      }
    } catch (err) {
      showCyberToast.error('Failed to create new evidence version');
    } finally {
      setCreatingVersion(false);
    }
  };

  const handlePrintCourtReport = () => {
    window.print();
  };

  const selectedEvidence = evidenceList.find(e => e.id === selectedEvidenceId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Banner & Core IPFS Immutability Rules */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <GitBranch size={14} className="animate-pulse" /> IPFS Immutable Content-Addressed Lineage
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-3">
            Evidence Versioning &amp; Lineage Engine
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300">
              IPFS Rules Enforced
            </span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Preserve complete evidence lifecycle. Every content edit generates a NEW CID while keeping all previous versions untouched.
          </p>
        </div>

        <button
          onClick={handlePrintCourtReport}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-700 transition shadow-md shrink-0"
        >
          <Printer size={14} className="text-cyan-400" />
          <span>Print Court Forensic Report</span>
        </button>
      </div>

      {/* Core IPFS Architecture Rule Notice */}
      <div className="p-4 rounded-2xl glassmorphism border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 space-y-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
          <Globe size={16} className="text-cyan-400" />
          <span>STRICT IPFS ARCHITECTURE IMMUTABILITY RULE</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          Files stored on IPFS are <strong>never modified or overwritten in-place</strong>. Any modification (whether 1-pixel edit, EXIF clock shift, or deepfake swap) creates a completely new content payload, producing a <strong>NEW Content Identifier (CID_v2)</strong> while preserving original <strong>CID_v1</strong> on-chain forever.
        </p>
      </div>

      {/* Select Evidence Target & 17-Vector Simulator Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Select Target Evidence */}
        <div className="glassmorphism p-5 rounded-2xl border border-slate-700/50 space-y-3">
          <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
            Select Evidence Artifact:
          </label>
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

          {selectedEvidence && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
              <p>Case ID: <span className="text-cyan-400">{selectedEvidence.metadata?.caseId || 'SC-2026-00001'}</span></p>
              <p>Original CID: <span className="text-cyan-300 break-all">{selectedEvidence.ipfsHash}</span></p>
              <p>Polygon Block: <span className="text-amber-400">#{selectedEvidence.blockNumber || 48521000}</span></p>
            </div>
          )}
        </div>

        {/* Right: 17-Vector Modification Simulator Sandbox */}
        <div className="lg:col-span-2 glassmorphism p-5 rounded-2xl border border-amber-500/30 bg-slate-900/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Zap size={16} /> 17-Vector IPFS Evidence Version Creator
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Generates New Immutable CID</span>
          </div>

          <form onSubmit={handleCreateVersion} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-mono text-slate-400">Select Modification Vector:</label>
              <select
                value={modType}
                onChange={(e) => setModType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
              >
                {MODIFICATION_TYPES.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.category}] {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-slate-400">Reason / Description:</label>
              <input
                type="text"
                placeholder="Modification notes..."
                value={modReason}
                onChange={(e) => setModReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="md:col-span-3 flex justify-end pt-1">
              <button
                type="submit"
                disabled={creatingVersion}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-600 via-red-600 to-amber-600 hover:from-amber-500 hover:to-red-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg border border-amber-500/40 transition"
              >
                {creatingVersion ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                <span>Create New Version on IPFS (Generates New CID)</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Version Lineage Tree & Node Inspector */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 glassmorphism rounded-2xl border border-slate-800">
          <Loader2 size={32} className="animate-spin mx-auto mb-3 text-cyan-400" />
          <p className="text-sm font-mono">Loading IPFS Version Lineage Graph...</p>
        </div>
      ) : versionGraphData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Interactive Version Lineage Nodes */}
          <div className="glassmorphism p-6 rounded-2xl border border-slate-700/50 space-y-4 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2"><GitMerge size={16} className="text-cyan-400" /> Evidence Lineage Graph</span>
              <span className="text-[10px] text-cyan-400">{versionGraphData.versionTree?.length} Versions</span>
            </h3>

            <div className="space-y-4 relative pl-4 border-l-2 border-slate-800">
              {versionGraphData.versionTree?.map((node, index) => {
                const isSelected = selectedVersionNode?.version === node.version;
                const isOrig = node.isOriginal;

                return (
                  <div
                    key={node.version}
                    onClick={() => setSelectedVersionNode(node)}
                    className={`relative cursor-pointer p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Node Dot */}
                    <div className={`absolute -left-[27px] top-4 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold ${
                      isOrig
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                        : node.integrityStatus === 'FAILED_HASH_MISMATCH'
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                    }`}>
                      {index + 1}
                    </div>

                    <div className="space-y-1 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100">{node.version}</span>
                        {isOrig ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] uppercase font-bold">
                            Original Anchor
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[9px] uppercase font-bold">
                            Child Version
                          </span>
                        )}
                      </div>

                      <p className="text-slate-300 text-[11px] truncate">{node.versionName}</p>
                      <p className="text-cyan-400 text-[10px] truncate">CID: {node.ipfsHash.slice(0, 20)}...</p>
                      <p className="text-slate-500 text-[10px]">{new Date(node.uploadedAt).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 2 Columns: Detailed Selected Version Node Metadata & Multi-Hash Inspector */}
          {selectedVersionNode && (
            <div className="lg:col-span-2 space-y-6">
              <div className="glassmorphism p-6 rounded-2xl border border-cyan-500/30 space-y-6 shadow-xl">
                {/* Selected Node Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold font-mono text-white">{selectedVersionNode.versionName}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        {selectedVersionNode.version}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Reason: {selectedVersionNode.modificationReason}
                    </p>
                  </div>

                  <RiskScoreBadge
                    score={selectedVersionNode.isOriginal ? 12 : 88}
                    level={selectedVersionNode.isOriginal ? 'LOW' : 'CRITICAL'}
                    size="md"
                  />
                </div>

                {/* Multi-Hash Cryptographic Receipts (Scenario 8) */}
                <div className="space-y-3 font-mono text-xs">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Hash size={14} className="text-cyan-400" /> Multi-Algorithm Cryptographic Receipts
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase">SHA-256 Checksum:</span>
                      <p className="text-cyan-300 break-all select-all font-semibold">{selectedVersionNode.fileHash.sha256}</p>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase">MD5 Checksum:</span>
                      <p className="text-indigo-300 break-all select-all font-semibold">{selectedVersionNode.fileHash.md5}</p>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1 md:col-span-2">
                      <span className="text-[10px] text-slate-500 uppercase">SHA-512 Checksum:</span>
                      <p className="text-slate-300 break-all select-all text-[10px] font-semibold">{selectedVersionNode.fileHash.sha512}</p>
                    </div>
                  </div>
                </div>

                {/* IPFS CID & Polygon Ledger Metadata */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">IPFS Content CID:</span>
                    <span className="text-cyan-400 font-bold break-all">{selectedVersionNode.ipfsHash}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Polygon Tx Hash:</span>
                    <span className="text-amber-400 break-all">{selectedVersionNode.transactionHash}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">PKI Digital Signature:</span>
                    <span className="text-emerald-400 font-bold">{selectedVersionNode.digitalSignature}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Parent Version:</span>
                    <span className="text-slate-200 font-bold">{selectedVersionNode.parentVersion || 'Root Node (Original)'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Recorded Uploader:</span>
                    <span className="text-slate-300">{selectedVersionNode.uploadedBy}</span>
                  </div>
                </div>

                {/* Tampering Diff Component if Child Version */}
                {!selectedVersionNode.isOriginal && (
                  <TamperingDiffCard evidence={selectedEvidence} />
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default EvidenceVersioning;
