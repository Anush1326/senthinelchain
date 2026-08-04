import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileImage,
  FileText,
  FileVideo,
  Headphones,
  Mail,
  Archive,
  Copy,
  Check,
  Eye,
  Plus,
  Shield,
  Loader2,
  Calendar,
  User,
  Building,
  FolderGit2,
  Hash,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const mockEvidenceList = [
  {
    id: 'e0000001-0000-0000-0000-000000000001',
    title: 'Server Incident Access Logs – June 2026',
    category: 'log_file',
    fileHash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    status: 'verified',
    fileSize: 15728640,
    originalFileName: 'auth_audit.log',
    metadata: { caseId: 'SC-2026-00001', investigator: 'Agent Priya Sharma', department: 'Digital Forensics Unit', priority: 'high' },
    createdAt: '2026-07-28T09:12:00.000Z'
  },
  {
    id: 'e0000002-0000-0000-0000-000000000002',
    title: 'PostgreSQL Forensic Dump File',
    category: 'digital_forensics',
    fileHash: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    ipfsHash: 'QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX',
    status: 'verified',
    fileSize: 52428800,
    originalFileName: 'database_export.sql',
    metadata: { caseId: 'SC-2026-00001', investigator: 'Agent Priya Sharma', department: 'Digital Forensics Unit', priority: 'medium' },
    createdAt: '2026-07-28T08:45:00.000Z'
  },
  {
    id: 'e0000003-0000-0000-0000-000000000003',
    title: 'CCTV Camera 4 Screenshot – Server Room',
    category: 'image',
    fileHash: 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    ipfsHash: 'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ',
    status: 'flagged',
    fileSize: 2202009,
    originalFileName: 'cctv_frame_04.png',
    metadata: { caseId: 'SC-2026-00001', investigator: 'Agent Priya Sharma', department: 'Cyber Intelligence Division', priority: 'critical' },
    createdAt: '2026-07-28T07:30:00.000Z'
  },
  {
    id: 'e0000004-0000-0000-0000-000000000004',
    title: 'CEO Phishing Email Header Log',
    category: 'email',
    fileHash: 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
    ipfsHash: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB',
    status: 'verified',
    fileSize: 46080,
    originalFileName: 'phishing_header.eml',
    metadata: { caseId: 'SC-2026-00002', investigator: 'Agent Meera Nair', department: 'Email Forensics', priority: 'medium' },
    createdAt: '2026-07-28T06:15:00.000Z'
  },
  {
    id: 'e0000005-0000-0000-0000-000000000005',
    title: 'Network Packet Capture (PCAP)',
    category: 'digital_forensics',
    fileHash: 'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
    ipfsHash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn',
    status: 'pending',
    fileSize: 32505856,
    originalFileName: 'traffic_dump.pcapng',
    metadata: { caseId: 'SC-2026-00003', investigator: 'Agent Rajesh Kumar', department: 'Network Incident Unit', priority: 'high' },
    createdAt: '2026-07-28T04:20:00.000Z'
  }
];

const CategoryIcon = ({ category }) => {
  switch (category) {
    case 'image': return <FileImage size={18} className="text-blue-400" />;
    case 'video': return <FileVideo size={18} className="text-purple-400" />;
    case 'audio': return <Headphones size={18} className="text-pink-400" />;
    case 'email': return <Mail size={18} className="text-amber-400" />;
    case 'digital_forensics': return <Archive size={18} className="text-emerald-400" />;
    default: return <FileText size={18} className="text-primary-400" />;
  }
};

const EvidenceList = () => {
  const [evidenceItems, setEvidenceItems] = useState(mockEvidenceList);
  const [loading, setLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Search & Filter State
  const [filters, setFilters] = useState({
    search: '',
    caseId: '',
    evidenceId: '',
    investigator: '',
    department: '',
    category: 'all',
    status: 'all',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    page: 1,
    limit: 10
  });

  // Pagination Response State
  const [paginationInfo, setPaginationInfo] = useState({
    total: mockEvidenceList.length,
    totalPages: 1,
    currentPage: 1
  });

  const [copiedHash, setCopiedHash] = useState('');

  useEffect(() => {
    fetchEvidences();
  }, [
    filters.search,
    filters.caseId,
    filters.evidenceId,
    filters.investigator,
    filters.department,
    filters.category,
    filters.status,
    filters.startDate,
    filters.endDate,
    filters.sortBy,
    filters.sortOrder,
    filters.page,
    filters.limit
  ]);

  const fetchEvidences = async () => {
    setLoading(true);
    try {
      const response = await api.get('/evidence', { params: filters });
      const payload = response.data?.data;

      if (payload && Array.isArray(payload.data)) {
        setEvidenceItems(payload.data);
        setPaginationInfo({
          total: payload.total || payload.data.length,
          totalPages: payload.totalPages || Math.ceil((payload.total || payload.data.length) / filters.limit) || 1,
          currentPage: payload.currentPage || filters.page
        });
      }
    } catch (err) {
      console.warn('Evidence search fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      caseId: '',
      evidenceId: '',
      investigator: '',
      department: '',
      category: 'all',
      status: 'all',
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      page: 1,
      limit: 10
    });
    toast.success('Search filters reset to default');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    toast.success('Hash copied to clipboard!');
    setTimeout(() => setCopiedHash(''), 2000);
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-3">
            <Shield size={32} className="text-primary-400" />
            Digital Evidence Locker
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Advanced Search & Filtering across Case ID, Evidence ID, Investigator, Department, Date & Status.
          </p>
        </div>

        <Link
          to="/evidence/upload"
          className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg border border-primary-500/40 transition-all text-sm"
        >
          <Plus size={16} />
          <span>Upload New Evidence</span>
        </Link>
      </div>

      {/* Main Search & Filter Control Card */}
      <div className="glassmorphism rounded-2xl p-5 border border-slate-700/50 space-y-4 shadow-xl">
        {/* Top Search Bar + Advanced Toggle */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Main Search Input */}
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by title, SHA-256 hash, or keywords..."
              className="w-full bg-sentinel-dark-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Quick Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="bg-sentinel-dark-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 text-xs focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified On-Chain</option>
              <option value="pending">Pending Verification</option>
              <option value="flagged">Tampered / Flagged</option>
            </select>

            {/* Quick Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="bg-sentinel-dark-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 text-xs focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Types</option>
              <option value="document">Document</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="email">Email</option>
              <option value="digital_forensics">Digital Forensics</option>
              <option value="log_file">Server Log</option>
            </select>

            {/* Advanced Search Toggle Button */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                showAdvancedFilters
                  ? 'bg-primary-600/20 text-primary-300 border-primary-500/50'
                  : 'bg-sentinel-dark-800 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>{showAdvancedFilters ? 'Hide Filters' : 'Advanced Search'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* 1. Case ID */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <FolderGit2 size={12} className="text-primary-400" /> Case ID
              </label>
              <input
                type="text"
                value={filters.caseId}
                onChange={(e) => handleFilterChange('caseId', e.target.value)}
                placeholder="e.g. SC-2026-00001"
                className="w-full bg-sentinel-dark-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-primary-500 font-mono"
              />
            </div>

            {/* 2. Evidence ID */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Hash size={12} className="text-cyan-400" /> Evidence ID
              </label>
              <input
                type="text"
                value={filters.evidenceId}
                onChange={(e) => handleFilterChange('evidenceId', e.target.value)}
                placeholder="e.g. e0000001"
                className="w-full bg-sentinel-dark-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-primary-500 font-mono"
              />
            </div>

            {/* 3. Investigator */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User size={12} className="text-emerald-400" /> Investigator
              </label>
              <input
                type="text"
                value={filters.investigator}
                onChange={(e) => handleFilterChange('investigator', e.target.value)}
                placeholder="e.g. Agent Priya Sharma"
                className="w-full bg-sentinel-dark-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* 4. Department */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Building size={12} className="text-amber-400" /> Department
              </label>
              <input
                type="text"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                placeholder="e.g. Digital Forensics Unit"
                className="w-full bg-sentinel-dark-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* 5. Start Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar size={12} className="text-purple-400" /> From Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full bg-sentinel-dark-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-primary-500 font-mono"
              />
            </div>

            {/* 6. End Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar size={12} className="text-purple-400" /> To Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full bg-sentinel-dark-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-primary-500 font-mono"
              />
            </div>

            {/* 7. Sort By */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <ArrowUpDown size={12} className="text-blue-400" /> Sort Field
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full bg-sentinel-dark-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-primary-500"
              >
                <option value="createdAt">Date Created</option>
                <option value="title">Evidence Title</option>
                <option value="fileSize">File Size</option>
              </select>
            </div>

            {/* 8. Sort Direction & Reset */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Order</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="w-full bg-sentinel-dark-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-primary-500 font-mono"
                >
                  <option value="DESC">Descending (Newest / Largest)</option>
                  <option value="ASC">Ascending (Oldest / Smallest)</option>
                </select>
              </div>

              <button
                onClick={handleResetFilters}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all flex items-center gap-1 text-xs shrink-0"
                title="Reset Filters"
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Evidence Table */}
      <div className="glassmorphism rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/40">
                <th className="py-3.5 px-4">Evidence Title & Case</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Investigator & Department</th>
                <th className="py-3.5 px-4">SHA-256 Hash</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">File Size</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-primary-400" />
                    Searching digital evidence locker...
                  </td>
                </tr>
              ) : evidenceItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No evidence records found matching your advanced search criteria.
                  </td>
                </tr>
              ) : (
                evidenceItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-sentinel-dark-800 border border-slate-700 shrink-0">
                          <CategoryIcon category={item.category} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200 group-hover:text-primary-400 transition-colors">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Case: {item.metadata?.caseId || item.caseId || 'SC-2026-00001'} • ID: {item.id?.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md text-[11px] font-medium border border-slate-700 capitalize">
                        {(item.category || 'document').replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div>
                        <p className="text-slate-300 font-medium">{item.metadata?.investigator || 'Agent Priya Sharma'}</p>
                        <p className="text-[10px] text-slate-500">{item.metadata?.department || 'Digital Forensics Unit'}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px] bg-sentinel-dark-800 px-2 py-1 rounded border border-slate-700">
                          {item.fileHash ? `${item.fileHash.slice(0, 8)}...${item.fileHash.slice(-6)}` : 'N/A'}
                        </span>
                        {item.fileHash && (
                          <button
                            onClick={() => copyToClipboard(item.fileHash)}
                            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                            title="Copy full SHA-256 hash"
                          >
                            {copiedHash === item.fileHash ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
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

                    <td className="py-4 px-4 font-mono text-slate-400">
                      {formatBytes(item.fileSize)}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/evidence/${item.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs border border-slate-700 transition-all"
                      >
                        <Eye size={14} /> View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-slate-400">
            Showing Page <span className="font-semibold text-slate-200">{paginationInfo.currentPage}</span> of{' '}
            <span className="font-semibold text-slate-200">{paginationInfo.totalPages}</span>{' '}
            <span className="font-mono text-slate-500">({paginationInfo.total} Total Evidence Records)</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Limit Selector */}
            <div className="flex items-center gap-2 text-slate-400">
              <span>Per Page:</span>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                className="bg-sentinel-dark-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Prev / Next Page Buttons */}
            <div className="flex items-center gap-1">
              <button
                disabled={filters.page <= 1}
                onClick={() => handleFilterChange('page', filters.page - 1)}
                className="p-1.5 rounded-lg bg-sentinel-dark-800 border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="px-3 py-1 bg-sentinel-dark-800 border border-slate-700 rounded-lg font-mono text-slate-200">
                {filters.page}
              </span>

              <button
                disabled={filters.page >= paginationInfo.totalPages}
                onClick={() => handleFilterChange('page', filters.page + 1)}
                className="p-1.5 rounded-lg bg-sentinel-dark-800 border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceList;
