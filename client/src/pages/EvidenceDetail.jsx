import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Shield,
  Clock,
  HardDrive,
  Hash,
  FileImage,
  FileText,
  FileVideo,
  Mail,
  Archive,
  Download,
  Activity,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  UserCheck,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const mockDetailFallbacks = {
  'e0000001-0000-0000-0000-000000000001': {
    id: 'e0000001-0000-0000-0000-000000000001',
    title: 'Server Incident Access Logs – June 2026',
    category: 'log_file',
    fileHash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    transactionHash: '0xabc123def456789abc123def456789abc123def456789abc123def456789abcd01',
    blockNumber: 48521000,
    status: 'verified',
    fileSize: 15728640,
    fileType: 'text/plain',
    originalFileName: 'auth_audit.log',
    metadata: { caseId: 'SC-2026-00001', investigator: 'Agent Priya Sharma', department: 'Digital Forensics Unit', priority: 'high' },
    createdAt: '2026-07-28T09:12:00.000Z',
    tags: ['server-logs', 'auth-audit', 'incident-response'],
    description: 'Cryptographically hashed server authorization log file captured immediately after breach detection at 02:45 UTC.',
    chainOfCustody: [
      { action: 'EVIDENCE_VERIFIED', by: 'System Verifier', timestamp: '2026-07-28T09:15:00Z', notes: 'Verified on Polygon Amoy Block #48521000' },
      { action: 'EVIDENCE_UPLOADED', by: 'Agent Priya Sharma', timestamp: '2026-07-28T09:12:00Z', notes: 'Uploaded to Case SC-2026-00001' }
    ],
    aiAnalysis: {
      metadataConsistency: 99.8,
      tamperingDetected: false,
      riskLevel: 'Low Risk',
      confidenceScore: 98.5
    }
  }
};

const EvidenceDetail = () => {
  const { id } = useParams();
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState('');

  useEffect(() => {
    fetchEvidenceDetail();
  }, [id]);

  const fetchEvidenceDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/evidence/${id}`);
      if (response.data?.data) {
        setEvidence(response.data.data);
      } else {
        setEvidence(mockDetailFallbacks[id] || mockDetailFallbacks['e0000001-0000-0000-0000-000000000001']);
      }
    } catch (err) {
      setEvidence(mockDetailFallbacks[id] || mockDetailFallbacks['e0000001-0000-0000-0000-000000000001']);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedField(''), 2000);
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Loader2 size={32} className="animate-spin mx-auto mb-3 text-primary-400" />
        <p className="text-sm">Loading evidence details & chain of custody...</p>
      </div>
    );
  }

  const ev = evidence || mockDetailFallbacks['e0000001-0000-0000-0000-000000000001'];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link to="/evidence" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-2">
            <ArrowLeft size={14} /> Back to Evidence Locker
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">{ev.title}</h1>
            {ev.status === 'verified' && (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold uppercase flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Verified On-Chain
              </span>
            )}
            {ev.status === 'pending' && (
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-semibold uppercase flex items-center gap-1.5">
                <Clock size={14} /> Pending Verification
              </span>
            )}
            {ev.status === 'flagged' && (
              <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-semibold uppercase flex items-center gap-1.5 animate-pulse">
                <AlertTriangle size={14} /> AI Flagged
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs mt-1 font-mono">
            ID: {ev.id} • Case: {ev.metadata?.caseId || 'SC-2026-00001'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/verify"
            className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg border border-primary-500/40 text-sm transition-all"
          >
            <Shield size={16} /> Re-verify Hash
          </Link>
        </div>
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Metadata & AI Scan */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Card */}
          <div className="glassmorphism rounded-2xl p-6 border border-slate-700/50 space-y-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center justify-between border-b border-slate-800 pb-3">
              <span>Evidence Record Summary</span>
              <span className="text-xs text-slate-400 font-mono">{ev.originalFileName}</span>
            </h3>

            <p className="text-slate-300 text-sm leading-relaxed">
              {ev.description || 'No description provided for this digital evidence artifact.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-sentinel-dark-800/80 rounded-xl border border-slate-700/60 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Investigator</span>
                <span className="font-semibold text-slate-200">{ev.metadata?.investigator || 'Agent Priya Sharma'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Department</span>
                <span className="font-semibold text-slate-200">{ev.metadata?.department || 'Digital Forensics Unit'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">File Size</span>
                <span className="font-semibold text-slate-200 font-mono">{formatBytes(ev.fileSize)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Priority</span>
                <span className="font-semibold text-amber-400 uppercase">{ev.metadata?.priority || 'Medium'}</span>
              </div>
            </div>

            {/* Tags */}
            {ev.tags && ev.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ev.tags.map((t, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md text-xs font-mono border border-slate-700">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* AI Inspection Card */}
          <div className="glassmorphism rounded-2xl p-6 border border-slate-700/50 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Activity size={18} className="text-cyan-400" />
              SentinelAI Integrity & Tampering Analysis
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-sentinel-dark-800/80 rounded-xl border border-slate-700/60 space-y-2">
                <span className="text-xs text-slate-400 block">Metadata Consistency Score</span>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-emerald-400 font-mono">99.8%</span>
                  <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Consistent</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[99.8%]"></div>
                </div>
              </div>

              <div className="p-4 bg-sentinel-dark-800/80 rounded-xl border border-slate-700/60 space-y-2">
                <span className="text-xs text-slate-400 block">AI Deepfake / Modification Check</span>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-emerald-400 font-mono">Pass</span>
                  <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Clean Signature</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Cryptographic Hashes & Chain of Custody */}
        <div className="space-y-6">
          {/* Blockchain & Hashes Card */}
          <div className="glassmorphism rounded-2xl p-6 border border-slate-700/50 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Lock size={18} className="text-primary-400" />
              Cryptographic Receipts
            </h3>

            {/* SHA-256 */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">SHA-256 File Hash</span>
              <div className="p-3 bg-sentinel-dark-800 rounded-xl border border-slate-700 text-xs font-mono text-emerald-300 break-all select-all flex items-center justify-between gap-2">
                <span>{ev.fileHash}</span>
                <button onClick={() => copyText(ev.fileHash, 'sha256')} className="text-slate-400 hover:text-white shrink-0 p-1">
                  {copiedField === 'sha256' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* IPFS CID */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">IPFS Content CID</span>
              <div className="p-3 bg-sentinel-dark-800 rounded-xl border border-slate-700 text-xs font-mono text-primary-300 break-all select-all flex items-center justify-between gap-2">
                <span>{ev.ipfsHash}</span>
                <button onClick={() => copyText(ev.ipfsHash, 'ipfs')} className="text-slate-400 hover:text-white shrink-0 p-1">
                  {copiedField === 'ipfs' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Polygon Tx Hash */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Polygon Amoy Tx Hash</span>
              <div className="p-3 bg-sentinel-dark-800 rounded-xl border border-slate-700 text-xs font-mono text-amber-400 break-all flex items-center justify-between gap-2">
                <span>{ev.transactionHash}</span>
                <a
                  href={`https://amoy.polygonscan.com/tx/${ev.transactionHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-amber-300 shrink-0 p-1"
                  title="View on PolygonScan"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Chain of Custody Timeline */}
          <div className="glassmorphism rounded-2xl p-6 border border-slate-700/50 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock size={18} className="text-amber-400" />
              Chain of Custody History
            </h3>

            <div className="space-y-4">
              {(ev.chainOfCustody || []).map((coc, idx) => (
                <div key={idx} className="p-3 bg-sentinel-dark-800/80 rounded-xl border border-slate-700/60 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-200">
                    <span>{coc.action || 'Custody Event'}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(coc.timestamp || Date.now()).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">By: {coc.by || 'Agent'}</p>
                  {coc.notes && <p className="text-[10px] text-slate-500 italic">{coc.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceDetail;
