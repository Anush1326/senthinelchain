import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HardDrive,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  ShieldCheck,
  FileText,
  Download,
  RefreshCw,
  FileImage,
  FileVideo,
  Mail,
  Archive,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Database,
  Layers,
  Radio,
  Eye,
  Box,
  Share2,
  Loader2,
  ShieldAlert,
  Zap,
  X,
  FileDiff,
  ArrowRight,
  Play
} from 'lucide-react';
import showCyberToast from '../components/CyberToast';
import RiskScoreBadge from '../components/RiskScoreBadge';
import TamperingDiffCard from '../components/TamperingDiffCard';
import api from '../services/api';

const mockIpfsItems = [
  {
    id: 'e0000001-0000-0000-0000-000000000001',
    title: 'Server Incident Access Logs – June 2026',
    category: 'log_file',
    fileHash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    transactionHash: '0xabc123def456789abc123def456789abc123def456789abc123def456789abcd01',
    status: 'verified',
    fileSize: 15728640,
    fileType: 'text/plain',
    originalFileName: 'auth_audit.log',
    metadata: { caseId: 'SC-2026-00001', investigator: 'Agent Priya Sharma', department: 'Digital Forensics Unit' },
    createdAt: '2026-07-28T09:12:00.000Z',
    pinStatus: 'Pinned (Pinata FRA1)',
    replication: '2 Nodes'
  },
  {
    id: 'e0000002-0000-0000-0000-000000000002',
    title: 'PostgreSQL Forensic Dump File',
    category: 'digital_forensics',
    fileHash: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    ipfsHash: 'QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX',
    transactionHash: '0xdef456789abc123def456789abc123def456789abc123def456789abc123def402',
    status: 'verified',
    fileSize: 52428800,
    fileType: 'application/sql',
    originalFileName: 'database_export.sql',
    metadata: { caseId: 'SC-2026-00001', investigator: 'Agent Priya Sharma', department: 'Digital Forensics Unit' },
    createdAt: '2026-07-28T08:45:00.000Z',
    pinStatus: 'Pinned (Pinata NYC1)',
    replication: '2 Nodes'
  },
  {
    id: 'e0000003-0000-0000-0000-000000000003',
    title: 'CCTV Camera 4 Screenshot – Server Room',
    category: 'image',
    fileHash: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    ipfsHash: 'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ',
    transactionHash: '0x123abc456def789123abc456def789123abc456def789123abc456def7891203',
    status: 'flagged',
    fileSize: 2202009,
    fileType: 'image/png',
    originalFileName: 'cctv_frame_04.png',
    metadata: { caseId: 'SC-2026-00001', investigator: 'Agent Priya Sharma', department: 'Cyber Intelligence Division' },
    createdAt: '2026-07-28T07:30:00.000Z',
    pinStatus: 'Pinned (Pinata FRA1)',
    replication: '3 Nodes'
  },
  {
    id: 'e0000004-0000-0000-0000-000000000004',
    title: 'CEO Phishing Email Header Log',
    category: 'email',
    fileHash: 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
    ipfsHash: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB',
    transactionHash: '0x789def123abc456789def123abc456789def123abc456789def123abc4567804',
    status: 'verified',
    fileSize: 46080,
    fileType: 'message/rfc822',
    originalFileName: 'phishing_header.eml',
    metadata: { caseId: 'SC-2026-00002', investigator: 'Agent Meera Nair', department: 'Email Forensics' },
    createdAt: '2026-07-28T06:15:00.000Z',
    pinStatus: 'Pinned (Pinata NYC1)',
    replication: '2 Nodes'
  }
];

const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

const IpfsVault = () => {
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedField, setCopiedField] = useState('');
  const [customCid, setCustomCid] = useState('');

  // Tampering Simulation Modal State
  const [simulatingItem, setSimulatingItem] = useState(null);
  const [tamperingType, setTamperingType] = useState('timestamp_edit');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  useEffect(() => {
    fetchIpfsEvidence();
  }, []);

  const fetchIpfsEvidence = async () => {
    setLoading(true);
    try {
      const response = await api.get('/evidence');
      const items = response.data?.data?.data || response.data?.data || [];
      if (Array.isArray(items) && items.length > 0) {
        setEvidenceItems(items);
      } else {
        setEvidenceItems(mockIpfsItems);
      }
    } catch (err) {
      setEvidenceItems(mockIpfsItems);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text, fieldId) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    showCyberToast.success('CID copied to clipboard!');
    setTimeout(() => setCopiedField(''), 2000);
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getIpfsUrl = (cid) => {
    if (!cid) return '#';
    const base = PINATA_GATEWAY.endsWith('/') ? PINATA_GATEWAY : `${PINATA_GATEWAY}/`;
    return `${base}${cid}`;
  };

  const getFileIcon = (category, fileType) => {
    if (category === 'image' || (fileType || '').startsWith('image/')) return <FileImage size={20} className="text-pink-400" />;
    if (category === 'video' || (fileType || '').startsWith('video/')) return <FileVideo size={20} className="text-purple-400" />;
    if (category === 'email') return <Mail size={20} className="text-blue-400" />;
    if (category === 'archive') return <Archive size={20} className="text-amber-400" />;
    return <FileText size={20} className="text-emerald-400" />;
  };

  const filteredItems = evidenceItems.filter((item) => {
    const cid = item.ipfsHash || '';
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title?.toLowerCase().includes(q) ||
      item.originalFileName?.toLowerCase().includes(q) ||
      cid.toLowerCase().includes(q) ||
      item.fileHash?.toLowerCase().includes(q) ||
      item.metadata?.caseId?.toLowerCase().includes(q);

    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const totalBytes = evidenceItems.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);

  const handleTestCustomCid = (e) => {
    e.preventDefault();
    if (!customCid.trim()) {
      showCyberToast.error('Please enter a valid IPFS CID');
      return;
    }
    const cleanCid = customCid.trim();
    window.open(getIpfsUrl(cleanCid), '_blank');
    showCyberToast.success(`Opening IPFS Gateway for CID: ${cleanCid.slice(0, 12)}...`);
  };

  // Run IPFS File Modification & Tampering Rules Simulation
  const runIpfsTamperingSimulation = async () => {
    if (!simulatingItem) return;
    setIsSimulating(true);

    setTimeout(async () => {
      const origCid = simulatingItem.ipfsHash || 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
      const origHash = simulatingItem.fileHash || 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';
      
      // Compute mutated CID under IPFS Content Addressing Rules
      const mutatedCid = `QmMODIFIED_${origCid.slice(10, 28)}_TAMPERED`;
      const mutatedHash = `f9e8d7c6b5a4f9e8d7c6b5a4f9e8d7c6b5a4f9e8d7c6b5a4f9e8d7c6b5a4f9e8`;
      const mutatedSize = (simulatingItem.fileSize || 15728640) + 1172;

      let modificationNote = '';
      if (tamperingType === 'timestamp_edit') {
        modificationNote = 'Altered log access timestamp from 02:45 UTC to 03:15 UTC in header payload.';
      } else if (tamperingType === 'spliced_crop') {
        modificationNote = 'Spliced 120x80 pixel patch onto original image (Timestamp overlay manipulation).';
      } else {
        modificationNote = 'Appended 1,172 bytes of unauthorized payload to the evidence file buffer.';
      }

      const simResultPayload = {
        item: simulatingItem,
        originalCid: origCid,
        mutatedCid: mutatedCid,
        originalHash: origHash,
        mutatedHash: mutatedHash,
        modificationNote: modificationNote,
        tamperingDetails: {
          isTampered: true,
          tamperingSummary: `CRITICAL_IPFS_CONTENT_ADDRESS_VIOLATION: Attempted file modification produced NEW CID (${mutatedCid.slice(0, 20)}...). Under IPFS rules, original CID (${origCid.slice(0, 16)}...) remains untouched, but modified file fails Polygon blockchain verification!`,
          anchoredHash: origHash,
          scannedHash: mutatedHash,
          changedFields: [
            {
              field: 'IPFS Content Identifier (CID)',
              original: origCid.slice(0, 24) + '...',
              current: mutatedCid.slice(0, 24) + '...',
              discrepancyStatus: 'NEW_CID_GENERATED_BY_IPFS'
            },
            {
              field: 'SHA-256 Hash Checksum',
              original: origHash.slice(0, 24) + '...',
              current: mutatedHash.slice(0, 24) + '...',
              discrepancyStatus: 'CRITICAL_MISMATCH'
            },
            {
              field: 'File Byte Length',
              original: `${formatBytes(simulatingItem.fileSize || 15728640)}`,
              current: `${formatBytes(mutatedSize)} (+1,172 bytes mutated)`,
              discrepancyStatus: 'BYTE_MUTATION_DETECTED'
            },
            {
              field: 'Modifications Applied',
              original: 'Original Unaltered Evidence State',
              current: modificationNote,
              discrepancyStatus: 'UNAUTHORIZED_EDIT'
            }
          ],
          aiForensicReport: {
            confidenceScore: 99.4,
            alteredRegions: [
              `IPFS Immutability Rule: Bitwise change generated new CID (${mutatedCid.slice(0, 16)}...)`,
              `Polygon Amoy Ledger Verification: REJECTED (Anchored hash mismatch)`,
              modificationNote
            ]
          }
        }
      };

      setSimulationResult(simResultPayload);
      setIsSimulating(false);
      showCyberToast.error('IPFS Tampering Detected! Polygon Ledger Verification REJECTED.', 'IPFS_MUTATION_ALERT');

      // Log Audit Event
      try {
        await api.post('/audit-logs', {
          action: 'EVIDENCE_TAMPERING_DETECTED',
          entityType: 'Evidence',
          entityId: simulatingItem.id,
          details: {
            simulation: true,
            originalCid: origCid,
            mutatedCid: mutatedCid,
            tamperingType
          }
        });
      } catch (e) {}
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <Radio size={14} className="animate-pulse" /> Decentralized Peer-To-Peer Storage Vault
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-3">
            IPFS Evidence Repository
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300">
              Pinata Network Active
            </span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Content-addressed immutable evidence files stored redundantly across IPFS nodes.
          </p>
        </div>

        <button
          onClick={fetchIpfsEvidence}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-700 transition shadow-md"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh IPFS Nodes</span>
        </button>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glassmorphism p-5 rounded-2xl border border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pinned Content CIDs</span>
            <HardDrive size={18} className="text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 font-mono">{evidenceItems.length}</p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={12} /> 100% Pinata Replicated
          </p>
        </div>

        <div className="glassmorphism p-5 rounded-2xl border border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">IPFS Gateway Storage</span>
            <Database size={18} className="text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 font-mono">{formatBytes(totalBytes)}</p>
          <p className="text-[11px] text-slate-400 font-mono">Distributed across nodes</p>
        </div>

        <div className="glassmorphism p-5 rounded-2xl border border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active IPFS Nodes</span>
            <Layers size={18} className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 font-mono">FRA1 &amp; NYC1</p>
          <p className="text-[11px] text-amber-400 font-mono">Multi-region redundancy</p>
        </div>

        <div className="glassmorphism p-5 rounded-2xl border border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Cryptographic Ledger</span>
            <ShieldCheck size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono">Polygon Amoy</p>
          <p className="text-[11px] text-emerald-400 font-mono">Synced on-chain</p>
        </div>
      </div>

      {/* Quick CID Direct Inspector Tool */}
      <div className="glassmorphism p-6 rounded-2xl border border-cyan-500/20 shadow-xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-mono">
              <Globe size={16} className="text-cyan-400" />
              Direct IPFS CID Inspector
            </h3>
            <p className="text-xs text-slate-400">
              Test or open any IPFS Content Identifier directly through the Pinata IPFS Gateway network.
            </p>
          </div>

          <form onSubmit={handleTestCustomCid} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Paste IPFS CID (e.g. QmYwAP...)"
              value={customCid}
              onChange={(e) => setCustomCid(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 w-full md:w-80"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs px-4 py-2 rounded-xl transition shadow-lg shrink-0"
            >
              <span>Inspect CID</span>
              <ExternalLink size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, CID, hash, case number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 rounded-xl border border-slate-700/70 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter size={14} className="text-slate-400 shrink-0" />
          {['all', 'log_file', 'digital_forensics', 'image', 'email', 'video', 'document'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-slate-700/50'
              }`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main IPFS Evidence Files Table / List */}
      <div className="glassmorphism rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            Showing <strong className="text-slate-200">{filteredItems.length}</strong> IPFS pinned evidence artifacts
          </span>
          <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
            <Radio size={10} className="text-emerald-400" /> Gateway: gateway.pinata.cloud/ipfs/
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <Loader2 size={32} className="animate-spin mx-auto mb-3 text-cyan-400" />
            <p className="text-sm">Fetching IPFS pinned artifacts...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <Box size={40} className="mx-auto opacity-30" />
            <p className="text-sm">No IPFS pinned evidence files matching your query.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredItems.map((item) => {
              const cid = item.ipfsHash || 'Qm...';
              const gatewayUrl = getIpfsUrl(cid);

              return (
                <div
                  key={item.id}
                  className="p-5 hover:bg-slate-800/30 transition-colors space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Icon & File Info */}
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                        {getFileIcon(item.category, item.fileType)}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/evidence/${item.id}`}
                            className="font-semibold text-slate-100 text-sm hover:text-cyan-300 transition truncate"
                          >
                            {item.title}
                          </Link>
                          {item.status === 'verified' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono uppercase">
                              Verified
                            </span>
                          )}
                          {item.status === 'flagged' && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-mono uppercase">
                              Flagged
                            </span>
                          )}
                          {item.status === 'pending' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono uppercase">
                              Pending
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 font-mono">
                          Filename: <span className="text-slate-300">{item.originalFileName || 'artifact.dat'}</span> &bull; Case: <span className="text-cyan-400">{item.metadata?.caseId || 'SC-2026-00001'}</span>
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                          <span>Size: {formatBytes(item.fileSize)}</span>
                          <span>Category: {(item.category || 'document').replace(/_/g, ' ')}</span>
                          <span>Pinned: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</span>
                          <span className="text-emerald-400">{item.pinStatus || 'Pinned (Pinata)'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-center">
                      <button
                        onClick={() => {
                          setSimulatingItem(item);
                          setSimulationResult(null);
                        }}
                        className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-medium text-xs px-3 py-2 rounded-xl border border-amber-500/30 transition shadow-md"
                        title="Simulate modifying this IPFS file to test Content Addressing Rules"
                      >
                        <Zap size={14} className="text-amber-400" />
                        <span>Simulate Modification</span>
                      </button>

                      <a
                        href={gatewayUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs px-3.5 py-2 rounded-xl transition shadow-md"
                      >
                        <Eye size={14} />
                        <span>View on IPFS</span>
                        <ExternalLink size={12} />
                      </a>

                      <Link
                        to={`/evidence/${item.id}`}
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3.5 py-2 rounded-xl border border-slate-700 transition"
                      >
                        <FileText size={14} className="text-cyan-400" />
                        <span>Details</span>
                      </Link>
                    </div>
                  </div>

                  {/* IPFS CID Banner */}
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
                      <Globe size={14} className="text-cyan-400 shrink-0" />
                      <span className="text-[10px] text-slate-500 uppercase font-semibold shrink-0">IPFS CID (v0/v1):</span>
                      <span className="text-cyan-300 font-mono truncate">{cid}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => copyText(cid, item.id)}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition"
                      >
                        {copiedField === item.id ? (
                          <>
                            <Check size={12} className="text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy CID</span>
                          </>
                        )}
                      </button>

                      <a
                        href={gatewayUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 transition"
                        title="Direct IPFS Gateway Link"
                      >
                        <Share2 size={12} />
                        <span>Gateway Link</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── IPFS TAMPERING & MODIFICATION SIMULATION MODAL ────────────────── */}
      {simulatingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-modal max-w-3xl w-full rounded-2xl border border-amber-500/40 p-6 space-y-6 shadow-[0_0_40px_rgba(245,158,11,0.2)] my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Zap size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-mono text-slate-100">
                    IPFS File Modification &amp; Content-Address Rules Simulator
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Test how IPFS immutability rules prevent in-place evidence tampering
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSimulatingItem(null);
                  setSimulationResult(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Evidence Target Info */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">TARGET EVIDENCE:</span>
                <span className="font-bold text-slate-200">{simulatingItem.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">ORIGINAL FILE NAME:</span>
                <span className="text-slate-300">{simulatingItem.originalFileName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">ORIGINAL ANCHORED IPFS CID:</span>
                <span className="text-cyan-300 font-bold break-all">{simulatingItem.ipfsHash}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">POLYGON AMOY BLOCK:</span>
                <span className="text-amber-400">#48521000 (ANCHORED IMMUTABLE)</span>
              </div>
            </div>

            {/* Select Modification Simulation Type */}
            {!simulationResult && (
              <div className="space-y-4">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                  Select Simulated Modification Method:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setTamperingType('timestamp_edit')}
                    className={`p-3.5 rounded-xl border text-left font-mono transition space-y-1 ${
                      tamperingType === 'timestamp_edit'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <p className="font-bold flex items-center gap-1.5">
                      <Clock size={14} /> Alter 1-Byte Timestamp
                    </p>
                    <p className="text-[10px] text-slate-400">Modifies access log timestamp from 02:45 to 03:15 UTC.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTamperingType('spliced_crop')}
                    className={`p-3.5 rounded-xl border text-left font-mono transition space-y-1 ${
                      tamperingType === 'spliced_crop'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <p className="font-bold flex items-center gap-1.5">
                      <FileDiff size={14} /> Splice Pixel Crop
                    </p>
                    <p className="text-[10px] text-slate-400">Copy-pastes a 120x80 pixel overlay onto evidence image.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTamperingType('payload_append')}
                    className={`p-3.5 rounded-xl border text-left font-mono transition space-y-1 ${
                      tamperingType === 'payload_append'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <p className="font-bold flex items-center gap-1.5">
                      <HardDrive size={14} /> Append Payload Bytes
                    </p>
                    <p className="text-[10px] text-slate-400">Appends 1,172 bytes of unauthorized binary payload.</p>
                  </button>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono space-y-1">
                  <p className="font-bold text-amber-400">ℹ️ IPFS Immutability Principle:</p>
                  <p>In IPFS, file contents are cryptographically hashed into the CID. Modifying even 1 bit prevents overwriting the original CID and forces the generation of a NEW CID, triggering immediate blockchain hash verification mismatch.</p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSimulatingItem(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={runIpfsTamperingSimulation}
                    disabled={isSimulating}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg border border-amber-500/40 transition"
                  >
                    {isSimulating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                    <span>Execute IPFS Rules Simulation</span>
                  </button>
                </div>
              </div>
            )}

            {/* Simulation Results Display */}
            {simulationResult && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-red-400">
                    <ShieldAlert size={18} />
                    <span>IPFS RULE VIOLATION &amp; TAMPERING DETECTED</span>
                  </div>
                  <p>{simulationResult.tamperingDetails.tamperingSummary}</p>
                </div>

                {/* CID Mutation Comparison Box */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                  <h4 className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-2">
                    <Globe size={14} className="text-cyan-400" />
                    IPFS Content Identifier Mutation Comparison
                  </h4>

                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Original Anchored IPFS CID (Polygon Block #48521000):</span>
                      <span className="text-emerald-400 font-semibold break-all">{simulationResult.originalCid}</span>
                    </div>

                    <div className="flex items-center justify-center py-1">
                      <ArrowRight size={16} className="text-red-400 rotate-90 sm:rotate-0" />
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Attempted Modified IPFS CID (Computed New CID):</span>
                      <span className="text-red-400 font-semibold break-all">{simulationResult.mutatedCid}</span>
                    </div>
                  </div>
                </div>

                {/* Granular Diff Component */}
                <TamperingDiffCard evidence={simulationResult.item} />

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSimulationResult(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition"
                  >
                    Run Another Simulation
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSimulatingItem(null);
                      setSimulationResult(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition shadow-lg"
                  >
                    Done &amp; Close Simulator
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IpfsVault;
