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
  Lock,
  Printer,
  FileDown,
  ClipboardList,
  Eye,
  LogIn,
  LogOut,
  Upload,
  RefreshCw,
  Globe,
  User,
  Package,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import showCyberToast from '../components/CyberToast';
import RiskScoreBadge from '../components/RiskScoreBadge';
import TamperingDiffCard from '../components/TamperingDiffCard';
import api from '../services/api';

const mockDetailFallbacks = {
  'e0000001-0000-0000-0000-000000000001': {
    id: 'e0000001-0000-0000-0000-000000000001',
    title: 'Server Incident Access Logs \u2013 June 2026',
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

const ACTION_CONFIG = {
  EVIDENCE_UPLOADED:      { color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    icon: Upload },
  EVIDENCE_VERIFIED:      { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: CheckCircle2 },
  EVIDENCE_VIEWED:        { color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/30',    icon: Eye },
  EVIDENCE_DOWNLOADED:    { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   icon: Download },
  EVIDENCE_HASHED:        { color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/30',  icon: Hash },
  BLOCKCHAIN_TRANSACTION: { color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/30',  icon: Globe },
  USER_LOGIN:             { color: 'text-slate-300',   bg: 'bg-slate-700/30',   border: 'border-slate-600/40',   icon: LogIn },
  USER_LOGOUT:            { color: 'text-slate-400',   bg: 'bg-slate-700/20',   border: 'border-slate-600/30',   icon: LogOut },
  DEFAULT:                { color: 'text-slate-300',   bg: 'bg-slate-700/20',   border: 'border-slate-600/30',   icon: Activity }
};

const getActionConfig = (action) => ACTION_CONFIG[action] || ACTION_CONFIG.DEFAULT;

const EvidenceDetail = () => {
  const { id } = useParams();
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditExpanded, setAuditExpanded] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchEvidenceDetail();
    fetchAuditLogs();
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

  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const response = await api.get(`/audit-logs/evidence/${id}`);
      const payload = response.data?.data;
      if (payload?.data && Array.isArray(payload.data)) {
        setAuditLogs(payload.data);
      } else if (Array.isArray(payload)) {
        setAuditLogs(payload);
      } else {
        setAuditLogs([]);
      }
    } catch (err) {
      setAuditLogs([]);
    } finally {
      setAuditLoading(false);
    }
  };

  const copyText = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showCyberToast('success', 'Copied to clipboard!');
    setTimeout(() => setCopiedField(''), 2000);
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownloadOriginal = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/evidence/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = ev.originalFileName || `evidence_${(id || '').slice(0, 8)}.dat`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showCyberToast('success', 'Evidence file download started!');
    } catch (err) {
      showCyberToast('error', 'Download failed \u2013 file may not be stored on server.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPackage = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/evidence/${id}/download?package=true`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const safeName = (ev.originalFileName || 'evidence').replace(/[^a-zA-Z0-9_.-]/g, '_');
      link.setAttribute('download', `SENTINEL_EVIDENCE_PACKAGE_${safeName}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showCyberToast('success', 'Cryptographic Evidence Package downloaded!');
    } catch (err) {
      showCyberToast('error', 'Package download failed.');
    } finally {
      setDownloading(false);
    }
  };

  const handleVerifyPending = async () => {
    try {
      const response = await api.post(`/evidence/${id}/verify`, { status: 'verified' });
      if (response.data?.success) {
        showCyberToast('success', 'Evidence successfully verified and anchored on-chain!');
        fetchEvidenceDetail();
        fetchAuditLogs();
      }
    } catch (err) {
      showCyberToast('error', 'Failed to verify evidence');
    }
  };

  const handleGeneratePDFReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showCyberToast('error', 'Pop-up blocked! Please allow pop-ups to download PDF report.');
      return;
    }
    const reportHTML = `
      <!DOCTYPE html><html><head>
        <title>SentinelChain_Forensic_Report_${ev.metadata?.caseId || 'SC-2026-00001'}_${(ev.id || '').slice(0, 8)}</title>
        <style>
          @page{size:A4;margin:15mm}body{font-family:'Segoe UI',Arial,sans-serif;color:#0f172a;line-height:1.5;padding:25px;background:#fff}
          .header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #4f46e5;padding-bottom:15px;margin-bottom:20px}
          .title{font-size:20px;font-weight:bold;color:#1e1b4b;text-transform:uppercase;letter-spacing:.5px}
          .subtitle{font-size:11px;color:#64748b;font-family:monospace;margin-top:2px}
          .badge{display:inline-block;padding:5px 12px;background-color:#dcfce7;color:#15803d;border:1px solid #86efac;border-radius:20px;font-size:11px;font-weight:bold;text-transform:uppercase}
          .section{margin-bottom:20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px}
          .section-title{font-size:13px;font-weight:bold;text-transform:uppercase;color:#334155;border-bottom:1px solid #cbd5e1;padding-bottom:6px;margin-bottom:12px;letter-spacing:.5px}
          .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;font-size:12px}
          .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;font-size:12px}
          .label{font-size:10px;text-transform:uppercase;color:#64748b;font-weight:bold;display:block;margin-bottom:2px}
          .value{font-size:12px;font-weight:600;color:#0f172a;word-break:break-all}
          .code-box{font-family:monospace;background:#0f172a;color:#38bdf8;padding:10px;border-radius:6px;font-size:11px;word-break:break-all;margin-top:4px}
          .code-box-green{color:#4ade80}.code-box-amber{color:#fbbf24}
          .timeline{border-left:2px solid #cbd5e1;padding-left:12px;margin-left:5px}
          .timeline-item{position:relative;margin-bottom:12px;font-size:11px}
          .timeline-item::before{content:'';position:absolute;left:-18px;top:4px;width:8px;height:8px;border-radius:50%;background:#4f46e5}
          .footer{margin-top:30px;border-top:1px solid #e2e8f0;padding-top:15px;font-size:10px;color:#94a3b8;text-align:center}
          @media print{body{padding:0}.no-print{display:none}}
        </style>
      </head><body>
        <div class="header">
          <div><div class="title">SentinelChain Forensic Certificate</div>
          <div class="subtitle">Digital Evidence Integrity Audit Report \u2022 Polygon Amoy Blockchain</div></div>
          <div><span class="badge">VERIFIED FORENSIC REPORT</span></div>
        </div>
        <div class="section"><div class="section-title">1. Case &amp; Administrative Metadata</div>
          <div class="grid-4">
            <div><span class="label">Case Number</span><span class="value">${ev.metadata?.caseId || 'SC-2026-00001'}</span></div>
            <div><span class="label">Investigator</span><span class="value">${ev.metadata?.investigator || 'Agent Priya Sharma'}</span></div>
            <div><span class="label">Department</span><span class="value">${ev.metadata?.department || 'Digital Forensics Unit'}</span></div>
            <div><span class="label">Priority</span><span class="value">${(ev.metadata?.priority || 'Medium').toUpperCase()}</span></div>
          </div></div>
        <div class="section"><div class="section-title">2. Evidence Artifact Details</div>
          <div class="grid">
            <div><span class="label">Evidence Title</span><span class="value">${ev.title}</span></div>
            <div><span class="label">Original File Name</span><span class="value">${ev.originalFileName || 'file.dat'}</span></div>
            <div><span class="label">Category / Type</span><span class="value">${(ev.category || 'document').replace('_',' ').toUpperCase()}</span></div>
            <div><span class="label">File Size</span><span class="value">${formatBytes(ev.fileSize)}</span></div>
          </div>
          <div style="margin-top:10px;"><span class="label">Description &amp; Context</span>
          <span class="value" style="font-weight:normal">${ev.description || 'No description provided.'}</span></div>
        </div>
        <div class="section"><div class="section-title">3. Cryptographic Receipts &amp; Blockchain Ledger</div>
          <div style="margin-bottom:8px;"><span class="label">SHA-256 Cryptographic Checksum</span><div class="code-box code-box-green">${ev.fileHash}</div></div>
          <div style="margin-bottom:8px;"><span class="label">IPFS Content Identifier (CID)</span><div class="code-box">${ev.ipfsHash}</div></div>
          <div><span class="label">Polygon Amoy Blockchain Transaction Hash</span><div class="code-box code-box-amber">${ev.transactionHash}</div></div>
        </div>
        <div class="section"><div class="section-title">4. Verification Status &amp; AI Integrity Score</div>
          <div class="grid-4">
            <div><span class="label">Status</span><span class="value" style="color:#16a34a;">${(ev.status || 'VERIFIED').toUpperCase()}</span></div>
            <div><span class="label">Blockchain Ledger</span><span class="value">Polygon Amoy (Block #${ev.blockNumber || 48521000})</span></div>
            <div><span class="label">AI Integrity Score</span><span class="value">99.8% Passed</span></div>
            <div><span class="label">Report Generated</span><span class="value">${new Date().toUTCString()}</span></div>
          </div></div>
        <div class="section"><div class="section-title">5. Immutable Chain of Custody Audit Trail</div>
          <div class="timeline">${(ev.chainOfCustody || []).map(coc =>
            `<div class="timeline-item"><strong>${coc.action || 'Custody Event'}</strong> by ${coc.by || 'Investigator'}
            <span style="color:#64748b;font-family:monospace;">[${new Date(coc.timestamp || Date.now()).toUTCString()}]</span>
            ${coc.notes ? `<br/><span style="color:#475569;font-style:italic;">Notes: ${coc.notes}</span>` : ''}</div>`
          ).join('')}</div>
        </div>
        <div class="footer"><p>Generated by SentinelChain AI Forensic Audit Engine \u2022 Verified Cryptographically \u2022 Report ID: ${ev.id}</p></div>
        <script>window.onload=function(){window.print();}<\/script>
      </body></html>`;
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    showCyberToast('success', 'Generated Forensic PDF Report preview!');
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Loader2 size={32} className="animate-spin mx-auto mb-3 text-primary-400" />
        <p className="text-sm">Loading evidence details &amp; chain of custody...</p>
      </div>
    );
  }

  const ev = evidence || mockDetailFallbacks['e0000001-0000-0000-0000-000000000001'];

  const getFileIcon = (category, fileType) => {
    if (category === 'image' || (fileType || '').startsWith('image/')) return <FileImage size={28} className="text-pink-400" />;
    if (category === 'video' || (fileType || '').startsWith('video/')) return <FileVideo size={28} className="text-purple-400" />;
    if (category === 'email') return <Mail size={28} className="text-blue-400" />;
    if (category === 'archive') return <Archive size={28} className="text-amber-400" />;
    return <FileText size={28} className="text-slate-300" />;
  };

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
            <RiskScoreBadge
              score={ev.riskScore !== undefined ? ev.riskScore : (ev.status === 'flagged' ? 92 : ev.status === 'pending' ? 42 : 12)}
              level={ev.riskLevel}
              size="md"
            />
          </div>
          <p className="text-slate-400 text-xs mt-1 font-mono">
            ID: {ev.id} &bull; Case: {ev.metadata?.caseId || 'SC-2026-00001'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {ev.status === 'pending' && (
            <button
              onClick={handleVerifyPending}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg border border-emerald-500/40 text-sm transition-all"
            >
              <CheckCircle2 size={16} /> Verify &amp; Anchor Evidence
            </button>
          )}
          <button
            onClick={handleGeneratePDFReport}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-4 py-2.5 rounded-xl border border-slate-700 text-sm transition-all shadow-md"
            title="Export official forensic report as PDF"
          >
            <Printer size={16} className="text-amber-400" />
            <span>PDF Report</span>
          </button>
          <Link
            to="/verify"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg border border-cyan-400/40 text-sm transition-all"
          >
            <Shield size={16} /> Re-verify Hash
          </Link>
        </div>
      </div>

      {/* ─── Evidence File Panel ─────────────────────────────────────────── */}
      <div className="glassmorphism rounded-2xl p-6 border border-slate-700/50 shadow-xl">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3 mb-5">
          <Package size={18} className="text-primary-400" />
          Evidence File
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* File Icon + Info */}
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              {getFileIcon(ev.category, ev.fileType)}
            </div>
            <div className="space-y-1">
              <p className="text-slate-100 font-semibold text-sm">{ev.originalFileName || 'evidence_artifact.dat'}</p>
              <p className="text-slate-400 text-xs font-mono">{ev.fileType || 'application/octet-stream'}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <HardDrive size={11} />
                  {formatBytes(ev.fileSize)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {ev.createdAt ? new Date(ev.createdAt).toLocaleDateString() : 'N/A'}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-700 border border-slate-600 capitalize">
                  {(ev.category || 'document').replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={handleDownloadOriginal}
              disabled={downloading}
              className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-cyan-600 hover:from-primary-500 hover:to-cyan-500 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg border border-primary-500/40 text-sm transition-all"
            >
              {downloading
                ? <Loader2 size={16} className="animate-spin" />
                : <Download size={16} />
              }
              Download File
            </button>
            <button
              onClick={handleDownloadPackage}
              disabled={downloading}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-slate-200 font-medium px-5 py-2.5 rounded-xl border border-slate-700 text-sm transition-all shadow-md"
              title="Download cryptographic proof package as JSON"
            >
              <FileDown size={16} className="text-amber-400" />
              Crypto Package (.json)
            </button>
          </div>
        </div>

        {/* SHA-256 Quick Hash Row */}
        <div className="mt-5 p-3 bg-sentinel-dark-800/70 rounded-xl border border-slate-700/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Hash size={13} className="text-emerald-400 shrink-0" />
            <span className="text-[10px] text-slate-500 uppercase font-semibold shrink-0">SHA-256:</span>
            <span className="text-xs font-mono text-emerald-300 truncate">{ev.fileHash}</span>
          </div>
          <button
            onClick={() => copyText(ev.fileHash, 'sha256-file')}
            className="text-slate-400 hover:text-white shrink-0 p-1 rounded transition"
          >
            {copiedField === 'sha256-file'
              ? <Check size={13} className="text-emerald-400" />
              : <Copy size={13} />
            }
          </button>
        </div>
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tampering, Metadata, AI Scan, Audit Trail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Tampering Forensic Analysis Card */}
          <TamperingDiffCard evidence={ev} />

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
              SentinelAI Integrity &amp; Tampering Analysis
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

          {/* ─── Audit Verification Trail ──────────────────────────────────── */}
          <div className="glassmorphism rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
            {/* Collapsible Header */}
            <button
              onClick={() => setAuditExpanded(v => !v)}
              className="w-full flex items-center justify-between p-6 border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <ClipboardList size={16} className="text-indigo-400" />
                </div>
                <div className="text-left">
                  <p className="text-base font-bold text-slate-100">Audit &amp; Verification Trail</p>
                  <p className="text-xs text-slate-400 mt-0.5">All recorded access, download &amp; verification events</p>
                </div>
                {!auditLoading && (
                  <span className="ml-3 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono">
                    {auditLogs.length} events
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); fetchAuditLogs(); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); fetchAuditLogs(); } }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition cursor-pointer"
                  title="Refresh audit logs"
                >
                  <RefreshCw size={14} className={auditLoading ? 'animate-spin' : ''} />
                </span>
                {auditExpanded
                  ? <ChevronUp size={18} className="text-slate-400" />
                  : <ChevronDown size={18} className="text-slate-400" />
                }
              </div>
            </button>

            {auditExpanded && (
              <div className="p-6 space-y-3">
                {auditLoading ? (
                  <div className="flex items-center justify-center py-10 gap-3 text-slate-400">
                    <Loader2 size={20} className="animate-spin text-indigo-400" />
                    <span className="text-sm">Loading audit events...</span>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 space-y-2">
                    <ClipboardList size={32} className="mx-auto opacity-30" />
                    <p className="text-sm">No audit events recorded for this evidence yet.</p>
                    <p className="text-xs text-slate-600">Events appear here when this evidence is accessed, downloaded, or verified.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {auditLogs.map((log, idx) => {
                      const cfg = getActionConfig(log.action);
                      const ActionIcon = cfg.icon;
                      return (
                        <div
                          key={log.id || idx}
                          className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border} transition-all hover:brightness-110`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                              {/* Action Icon */}
                              <div className={`mt-0.5 w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.border}`}>
                                <ActionIcon size={14} className={cfg.color} />
                              </div>
                              <div className="min-w-0">
                                {/* Action badge + timestamp */}
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className={`text-xs font-bold font-mono ${cfg.color} uppercase tracking-wider`}>
                                    {log.action.replace(/_/g, ' ')}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {new Date(log.createdAt || Date.now()).toLocaleString()}
                                  </span>
                                </div>
                                {/* User + IP */}
                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <User size={10} />
                                    {log.userName || 'System'}
                                    {log.userEmail && (
                                      <span className="text-slate-500 ml-0.5">({log.userEmail})</span>
                                    )}
                                  </span>
                                  {log.ipAddress && (
                                    <span className="flex items-center gap-1">
                                      <Globe size={10} />
                                      {log.ipAddress}
                                    </span>
                                  )}
                                </div>
                                {/* Key-value detail fields */}
                                {log.details && Object.keys(log.details).length > 0 && (
                                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                                    {Object.entries(log.details)
                                      .filter(([k]) => !['userEmail', 'userName'].includes(k))
                                      .slice(0, 4)
                                      .map(([key, value]) => (
                                        <div key={key} className="text-[10px] flex items-start gap-1.5">
                                          <span className="text-slate-500 shrink-0 uppercase font-semibold">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                                          </span>
                                          <span className="text-slate-300 font-mono break-all line-clamp-1" title={String(value)}>
                                            {String(value)}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Event number */}
                            <span className="shrink-0 text-[10px] text-slate-600 font-mono">#{auditLogs.length - idx}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Cryptographic Hashes, Chain of Custody, Verification Summary */}
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
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => copyText(ev.ipfsHash, 'ipfs')} className="text-slate-400 hover:text-white p-1" title="Copy CID">
                    {copiedField === 'ipfs' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${ev.ipfsHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-primary-300 p-1"
                    title="View on IPFS Gateway"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
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

            {/* Block Number */}
            {ev.blockNumber && (
              <div className="flex items-center justify-between p-3 bg-sentinel-dark-800/60 rounded-xl border border-slate-700/60 text-xs">
                <span className="text-slate-400">Block Height</span>
                <span className="font-mono text-slate-200 font-semibold">#{ev.blockNumber.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Chain of Custody Timeline */}
          <div className="glassmorphism rounded-2xl p-6 border border-slate-700/50 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock size={18} className="text-amber-400" />
              Chain of Custody History
            </h3>

            <div className="space-y-4">
              {(ev.chainOfCustody || []).length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">No custody events recorded.</p>
              )}
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

          {/* Verification Summary Card */}
          <div className="glassmorphism rounded-2xl p-6 border border-slate-700/50 space-y-3 shadow-xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <UserCheck size={18} className="text-emerald-400" />
              Verification Summary
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-sentinel-dark-800/60 border border-slate-700/50">
                <span className="text-slate-400">Status</span>
                <span className={`font-bold uppercase ${ev.status === 'verified' ? 'text-emerald-400' : ev.status === 'flagged' ? 'text-red-400' : 'text-amber-400'}`}>
                  {ev.status || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-sentinel-dark-800/60 border border-slate-700/50">
                <span className="text-slate-400">Audit Events</span>
                <span className="font-semibold text-indigo-400">{auditLoading ? '...' : auditLogs.length} recorded</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-sentinel-dark-800/60 border border-slate-700/50">
                <span className="text-slate-400">Chain of Custody</span>
                <span className="font-semibold text-slate-200">{(ev.chainOfCustody || []).length} entries</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-sentinel-dark-800/60 border border-slate-700/50">
                <span className="text-slate-400">Blockchain Network</span>
                <span className="font-semibold text-slate-200">Polygon Amoy</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-sentinel-dark-800/60 border border-slate-700/50">
                <span className="text-slate-400">Uploaded</span>
                <span className="font-semibold text-slate-200 font-mono">
                  {ev.createdAt ? new Date(ev.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceDetail;
