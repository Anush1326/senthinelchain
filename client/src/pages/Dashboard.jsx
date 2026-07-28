import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  FileCheck,
  Clock,
  AlertTriangle,
  Upload,
  Search,
  ExternalLink,
  Cpu,
  Database,
  ArrowUpRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Filter,
  Eye
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

// Sample Chart Data
const intakeTrendData = [
  { name: 'Mon', uploaded: 24, verified: 20, flagged: 1 },
  { name: 'Tue', uploaded: 38, verified: 35, flagged: 2 },
  { name: 'Wed', uploaded: 45, verified: 40, flagged: 0 },
  { name: 'Thu', uploaded: 52, verified: 48, flagged: 3 },
  { name: 'Fri', uploaded: 68, verified: 62, flagged: 1 },
  { name: 'Sat', uploaded: 30, verified: 28, flagged: 0 },
  { name: 'Sun', uploaded: 42, verified: 39, flagged: 1 },
];

const categoryDistribution = [
  { name: 'Server Logs', value: 342, color: '#6366F1' },
  { name: 'Digital Forensics', value: 245, color: '#06B6D4' },
  { name: 'Video / CCTV', value: 189, color: '#10B981' },
  { name: 'Email Headers', value: 156, color: '#F59E0B' },
  { name: 'Documents', value: 124, color: '#EC4899' },
];

const mockRecentEvidence = [
  {
    id: 'e0000001-0000-0000-0000-000000000001',
    title: 'Server Access Logs – June 2026',
    category: 'Log File',
    hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    ipfs: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    status: 'verified',
    uploader: 'Agent Priya Sharma',
    uploaderRole: 'Investigator',
    size: '15.7 MB',
    time: '10 mins ago',
    caseNumber: 'SC-2026-00001'
  },
  {
    id: 'e0000002-0000-0000-0000-000000000002',
    title: 'Database Export Dump',
    category: 'Document',
    hash: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    ipfs: 'QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX',
    status: 'verified',
    uploader: 'Agent Priya Sharma',
    uploaderRole: 'Investigator',
    size: '52.4 MB',
    time: '45 mins ago',
    caseNumber: 'SC-2026-00001'
  },
  {
    id: 'e0000003-0000-0000-0000-000000000003',
    title: 'CCTV Screenshot – Server Room',
    category: 'Image',
    hash: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    ipfs: 'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ',
    status: 'flagged',
    uploader: 'Agent Priya Sharma',
    uploaderRole: 'Investigator',
    size: '2.1 MB',
    time: '2 hours ago',
    caseNumber: 'SC-2026-00001'
  },
  {
    id: 'e0000004-0000-0000-0000-000000000004',
    title: 'Phishing Email Headers',
    category: 'Email',
    hash: 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
    ipfs: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB',
    status: 'verified',
    uploader: 'Agent Meera Nair',
    uploaderRole: 'Investigator',
    size: '45 KB',
    time: '3 hours ago',
    caseNumber: 'SC-2026-00002'
  },
  {
    id: 'e0000006-0000-0000-0000-000000000006',
    title: 'Ransomware Binary Executable',
    category: 'Forensics',
    hash: 'f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
    ipfs: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn',
    status: 'pending',
    uploader: 'Agent Priya Sharma',
    uploaderRole: 'Investigator',
    size: '3.1 MB',
    time: '5 hours ago',
    caseNumber: 'SC-2026-00003'
  }
];

const mockBlockchainTx = [
  {
    txHash: '0xabc123def456789abc123def456789abc123def456789abc123def456789abcd01',
    blockNumber: 48521000,
    txType: 'Evidence Submission',
    status: 'Confirmed',
    fee: '0.0043 MATIC',
    time: '12 mins ago'
  },
  {
    txHash: '0xdef456789abc123def456789abc123def456789abc123def456789abc123def402',
    blockNumber: 48521050,
    txType: 'Evidence Verification',
    status: 'Confirmed',
    fee: '0.0028 MATIC',
    time: '30 mins ago'
  },
  {
    txHash: '0x789abc123def456789abc123def456789abc123def456789abc123def456789c03',
    blockNumber: 48522100,
    txType: 'Custody Transfer',
    status: 'Confirmed',
    fee: '0.0048 MATIC',
    time: '1 hour ago'
  },
  {
    txHash: '0x999abc123def456789abc123def456789abc123def456789abc123def456789f06',
    blockNumber: 48523400,
    txType: 'Evidence Submission',
    status: 'Pending',
    fee: '0.0030 MATIC',
    time: '2 hours ago'
  }
];

const mockActivities = [
  {
    id: 1,
    action: 'EVIDENCE_VERIFIED',
    title: 'Server Access Logs hash verified on Polygon Amoy',
    user: 'Admin Rajesh Kumar',
    time: '12 mins ago',
    type: 'success'
  },
  {
    id: 2,
    action: 'AI_ANALYSIS_COMPLETED',
    title: 'AI Tampering detection completed for CCTV Screenshot',
    user: 'SentinelAI Engine',
    time: '45 mins ago',
    type: 'warning'
  },
  {
    id: 3,
    action: 'CUSTODY_TRANSFERRED',
    title: 'Custody transferred to Analyst Arjun Patel',
    user: 'Agent Priya Sharma',
    time: '1 hour ago',
    type: 'info'
  },
  {
    id: 4,
    action: 'EVIDENCE_UPLOADED',
    title: 'New evidence uploaded to Case SC-2026-0002',
    user: 'Agent Meera Nair',
    time: '3 hours ago',
    type: 'info'
  }
];

const Dashboard = () => {
  const { user } = useAuthStore();
  const [copiedHash, setCopiedHash] = useState('');
  const [filterType, setFilterType] = useState('all');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    toast.success('Hash copied to clipboard!');
    setTimeout(() => setCopiedHash(''), 2000);
  };

  const filteredEvidence = filterType === 'all'
    ? mockRecentEvidence
    : mockRecentEvidence.filter(e => e.status === filterType);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-sentinel-dark-800/80 via-sentinel-dark-800/50 to-primary-950/30 p-6 rounded-2xl border border-slate-700/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
              Welcome back, <span className="gradient-text">{user?.name || 'Agent'}</span>
            </h1>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Amoy Testnet: Active
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            SentinelChain AI & Blockchain Evidence Integrity Monitor • <span className="text-primary-400 font-mono">Chain ID: 80002</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            to="/evidence/upload"
            className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg border border-primary-500/40 active:scale-[0.98]"
          >
            <Upload size={16} />
            <span>Upload Evidence</span>
          </Link>
          <Link
            to="/verify"
            className="flex items-center gap-2 bg-sentinel-dark-800 hover:bg-slate-800 text-slate-200 px-4 py-2.5 rounded-xl font-medium text-sm border border-slate-700 transition-all active:scale-[0.98]"
          >
            <Search size={16} />
            <span>Verify Hash</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1: Total Evidence */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="glassmorphism rounded-2xl p-6 border border-slate-700/50 relative overflow-hidden group shadow-xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-primary-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Evidence</p>
              <h3 className="text-3xl font-bold text-slate-100 mt-2 font-mono">1,248</h3>
            </div>
            <div className="p-3.5 rounded-xl bg-primary-500/20 text-primary-400 border border-primary-500/30">
              <Shield size={24} />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs relative z-10 pt-2 border-t border-slate-800/80">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp size={14} /> +14.2%
            </span>
            <span className="text-slate-500">Across 24 Active Cases</span>
          </div>
        </motion.div>

        {/* Stat 2: Verified Evidence */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="glassmorphism rounded-2xl p-6 border border-slate-700/50 relative overflow-hidden group shadow-xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Verified On-Chain</p>
              <h3 className="text-3xl font-bold text-emerald-400 mt-2 font-mono">1,092</h3>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileCheck size={24} />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs relative z-10 pt-2 border-t border-slate-800/80">
            <span className="text-emerald-400 font-semibold">87.5% Integrity Rate</span>
            <span className="text-slate-500">Polygon Anchored</span>
          </div>
        </motion.div>

        {/* Stat 3: Pending Verification */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="glassmorphism rounded-2xl p-6 border border-slate-700/50 relative overflow-hidden group shadow-xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pending Verification</p>
              <h3 className="text-3xl font-bold text-amber-400 mt-2 font-mono">134</h3>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Clock size={24} />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs relative z-10 pt-2 border-t border-slate-800/80">
            <span className="text-amber-400 font-semibold">Queue Processing</span>
            <Link to="/verify" className="text-primary-400 hover:text-primary-300 font-medium">Verify Now →</Link>
          </div>
        </motion.div>

        {/* Stat 4: Tampered / AI Flagged */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="glassmorphism rounded-2xl p-6 border border-red-500/30 relative overflow-hidden group shadow-xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/15 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-red-500/25 transition-all"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Tampered / Flagged</p>
              <h3 className="text-3xl font-bold text-red-400 mt-2 font-mono">22</h3>
            </div>
            <div className="p-3.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
              <AlertTriangle size={24} />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs relative z-10 pt-2 border-t border-slate-800/80">
            <span className="text-red-400 font-semibold">Requires Forensic Audit</span>
            <span className="text-slate-500">1.76% Flag Rate</span>
          </div>
        </motion.div>
      </div>

      {/* Analytics & Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Evidence Intake & Verification Trends */}
        <div className="lg:col-span-2 glassmorphism rounded-2xl p-6 border border-slate-700/50 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Activity size={20} className="text-primary-400" />
                Evidence Intake & Verification Velocity
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">Daily volume of uploaded vs verified blockchain evidence records</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="w-3 h-3 rounded-full bg-primary-500"></span> Uploaded
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Verified
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={intakeTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUploaded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="uploaded" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUploaded)" />
                <Area type="monotone" dataKey="verified" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVerified)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="glassmorphism rounded-2xl p-6 border border-slate-700/50 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-1">
              <Database size={20} className="text-cyan-400" />
              Category Breakdown
            </h3>
            <p className="text-slate-400 text-xs mb-4">Evidence items categorized by type</p>

            <div className="h-52 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#F8FAFC'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold text-slate-100 font-mono">1,056</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Files</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-4 pt-4 border-t border-slate-800">
            {categoryDistribution.slice(0, 3).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-mono text-slate-400 font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Evidence & Live Blockchain/Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Uploads Table (2 columns on LG) */}
        <div className="lg:col-span-2 glassmorphism rounded-2xl p-6 border border-slate-700/50 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Shield size={20} className="text-primary-400" />
                Recent Evidence Locker Uploads
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">Anchored digital evidence files with SHA-256 integrity check</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-sentinel-dark-900/90 p-1 rounded-xl border border-slate-700/80">
              {['all', 'verified', 'pending', 'flagged'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                    filterType === type
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-2">Evidence / Case</th>
                  <th className="pb-3 px-2">Category</th>
                  <th className="pb-3 px-2">SHA-256 Hash</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredEvidence.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3.5 px-2">
                      <div>
                        <p className="font-semibold text-slate-200 group-hover:text-primary-400 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">{item.caseNumber} • {item.size}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-2">
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md text-[11px] font-medium border border-slate-700">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-400 text-[11px]">
                          {item.hash.slice(0, 8)}...{item.hash.slice(-6)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(item.hash)}
                          className="text-slate-500 hover:text-slate-300 transition-colors"
                          title="Copy full hash"
                        >
                          {copiedHash === item.hash ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-2">
                      {item.status === 'verified' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full text-[11px] font-medium">
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full text-[11px] font-medium">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                      {item.status === 'flagged' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/15 text-red-400 border border-red-500/30 rounded-full text-[11px] font-medium animate-pulse">
                          <AlertTriangle size={12} /> Flagged
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-2 text-right">
                      <Link
                        to={`/evidence/${item.id}`}
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-primary-400 font-medium transition-colors"
                      >
                        <Eye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar Column: Blockchain Ledger & Live Activity */}
        <div className="space-y-6">
          {/* Blockchain Transactions Card */}
          <div className="glassmorphism rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Zap size={18} className="text-amber-400" />
                Polygon Amoy Ledger
              </h3>
              <span className="text-[11px] font-mono text-slate-500">Chain #80002</span>
            </div>

            <div className="space-y-3">
              {mockBlockchainTx.map((tx, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-sentinel-dark-800/80 rounded-xl border border-slate-700/60 hover:border-slate-600 transition-all text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200">{tx.txType}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      tx.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {tx.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Block #{tx.blockNumber || 'Pending'}</span>
                    <span>{tx.fee}</span>
                  </div>

                  <div className="mt-1.5 pt-1.5 border-t border-slate-700/40 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-500 truncate max-w-[180px]">{tx.txHash}</span>
                    <span className="text-slate-500">{tx.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-Time Activity Log Feed */}
          <div className="glassmorphism rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
              <Activity size={18} className="text-cyan-400" />
              Live Audit Stream
            </h3>

            <div className="space-y-4">
              {mockActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 relative">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                    act.type === 'success' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]' :
                    act.type === 'warning' ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]' :
                    'bg-primary-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 line-clamp-1">{act.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                      <span>{act.user}</span>
                      <span>{act.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
