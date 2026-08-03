import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  File,
  FileText,
  Image as ImageIcon,
  Video,
  Mail,
  Archive,
  Cpu,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  X,
  FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const ALLOWED_EXTENSIONS = [
  'png', 'jpg', 'jpeg', 'webp', 'gif',
  'mp4', 'avi', 'mov', 'mkv',
  'pdf',
  'eml', 'msg',
  'pcap', 'pcapng', 'cap',
  'zip', 'tar', 'gz', '7z', 'rar',
  'log', 'txt'
];

const UploadEvidence = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    caseId: 'SC-2026-00001',
    title: '',
    description: '',
    investigator: user?.name || 'Agent Priya Sharma',
    department: 'Digital Forensics Division',
    priority: 'medium',
    category: 'document',
    tags: 'cybercrime, forensic-export, high-priority'
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileHashPreview, setFileHashPreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  // Handle Form Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calculate Client-Side SHA-256 Hash Preview
  const calculateSHA256 = async (file) => {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setFileHashPreview(hashHex);
    } catch (err) {
      console.warn('Browser SHA256 preview unavailable:', err);
    }
  };

  // Handle File Selection
  const processFile = (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error(`Invalid file type .${ext}! Allowed: Images, Videos, PDF, Email (.eml/.msg), PCAPs, ZIP archives.`);
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size exceeds maximum limit of 100MB.');
      return;
    }

    setSelectedFile(file);

    // Auto-detect category based on extension
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
      setFormData(prev => ({ ...prev, category: 'image' }));
    } else if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) {
      setFormData(prev => ({ ...prev, category: 'video' }));
    } else if (['eml', 'msg'].includes(ext)) {
      setFormData(prev => ({ ...prev, category: 'email' }));
    } else if (['pcap', 'pcapng', 'cap'].includes(ext)) {
      setFormData(prev => ({ ...prev, category: 'digital_forensics' }));
    } else if (['zip', 'tar', 'gz', '7z', 'rar'].includes(ext)) {
      setFormData(prev => ({ ...prev, category: 'digital_forensics' }));
    } else if (['pdf', 'doc', 'docx'].includes(ext)) {
      setFormData(prev => ({ ...prev, category: 'document' }));
    } else if (['log', 'txt'].includes(ext)) {
      setFormData(prev => ({ ...prev, category: 'log_file' }));
    }

    // Auto fill title if empty
    if (!formData.title) {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setFormData(prev => ({ ...prev, title: cleanTitle }));
    }

    calculateSHA256(file);
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Handle Submit Upload
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please select an evidence file to upload.');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter an evidence title.');
      return;
    }

    setUploading(true);
    setUploadProgress(15);

    try {
      const data = new FormData();
      data.append('file', selectedFile);
      data.append('caseId', formData.caseId);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('investigator', formData.investigator);
      data.append('department', formData.department);
      data.append('priority', formData.priority);
      data.append('tags', formData.tags);

      setUploadProgress(45);

      const response = await api.post('/evidence', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(Math.min(percent, 95));
        }
      });

      setUploadProgress(100);
      setUploading(false);
      setUploadResult(response.data.data);
      toast.success('Evidence successfully uploaded, hashed & anchored!');
    } catch (err) {
      setUploading(false);
      setUploadProgress(0);
      const msg = err.response?.data?.message || 'Evidence upload failed.';
      toast.error(msg);
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

  const getFileIcon = () => {
    if (!selectedFile) return <UploadCloud size={36} className="text-slate-400" />;
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return <ImageIcon size={36} className="text-cyan-400" />;
    if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) return <Video size={36} className="text-purple-400" />;
    if (['eml', 'msg'].includes(ext)) return <Mail size={36} className="text-amber-400" />;
    if (['pcap', 'pcapng', 'cap', 'zip', 'tar', 'gz', '7z', 'rar'].includes(ext)) return <Archive size={36} className="text-emerald-400" />;
    return <FileText size={36} className="text-primary-400" />;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-3">
            <UploadCloud className="text-primary-400" size={32} />
            Upload Evidence to Locker
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Store digital evidence, calculate cryptographic SHA-256 hash, and register immutably on SentinelChain.
          </p>
        </div>
        <div className="px-3.5 py-1.5 bg-sentinel-dark-800 border border-slate-700 rounded-xl text-xs font-mono text-slate-300 flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>SHA-256 Engine: Ready</span>
        </div>
      </div>

      {/* Success Modal / Result View */}
      {uploadResult ? (
        <div className="glassmorphism rounded-2xl p-8 border border-emerald-500/40 shadow-2xl space-y-6">
          <div className="flex items-center gap-4 text-emerald-400 pb-4 border-b border-slate-800">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Evidence Registration Successful!</h2>
              <p className="text-xs text-slate-400">Cryptographic hash and metadata stored into PostgreSQL & Polygon Amoy network.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-sentinel-dark-800/90 rounded-xl border border-slate-700/80 space-y-2">
              <span className="text-slate-400 text-[10px] uppercase font-sans tracking-wider block">Generated SHA-256 Hash</span>
              <div className="flex items-center justify-between gap-2 text-emerald-300 break-all select-all font-semibold">
                <span>{uploadResult.fileHash}</span>
                <button onClick={() => copyText(uploadResult.fileHash, 'hash')} className="text-slate-400 hover:text-white p-1">
                  {copiedField === 'hash' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="p-4 bg-sentinel-dark-800/90 rounded-xl border border-slate-700/80 space-y-2">
              <span className="text-slate-400 text-[10px] uppercase font-sans tracking-wider block">IPFS Content CID</span>
              <div className="flex items-center justify-between gap-2 text-primary-300 break-all select-all font-semibold">
                <span>{uploadResult.ipfsHash}</span>
                <button onClick={() => copyText(uploadResult.ipfsHash, 'ipfs')} className="text-slate-400 hover:text-white p-1">
                  {copiedField === 'ipfs' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-sentinel-dark-800/60 p-4 rounded-xl border border-slate-700/60 text-xs space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Case ID</span>
                <span className="font-semibold text-slate-200">{uploadResult.metadata?.caseId || 'SC-2026-00001'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Investigator</span>
                <span className="font-semibold text-slate-200">{uploadResult.metadata?.investigator}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">File Size</span>
                <span className="font-semibold text-slate-200">{formatBytes(uploadResult.fileSize)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Transaction</span>
                <span className="font-mono text-amber-400">{uploadResult.transactionHash?.slice(0, 10)}...</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => {
                setUploadResult(null);
                setSelectedFile(null);
                setFileHashPreview('');
              }}
              className="bg-primary-600 hover:bg-primary-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all text-sm"
            >
              Upload Another Evidence File
            </button>
            <button
              onClick={() => navigate('/evidence')}
              className="bg-sentinel-dark-800 hover:bg-slate-800 text-slate-200 font-medium px-5 py-2.5 rounded-xl border border-slate-700 transition-all text-sm"
            >
              Go to Evidence Locker →
            </button>
          </div>
        </div>
      ) : (
        /* Main Upload Form Layout */
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Drag & Drop File Upload + Hashes */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glassmorphism rounded-2xl p-6 border border-slate-700/50 space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center justify-between">
                <span>1. Select Evidence File</span>
                <span className="text-xs font-normal text-slate-400">Max 100MB</span>
              </h3>

              {/* Drag & Drop Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-primary-500 bg-primary-500/10 scale-[1.01]'
                    : selectedFile
                    ? 'border-emerald-500/60 bg-emerald-500/5'
                    : 'border-slate-700 hover:border-primary-500/50 bg-sentinel-dark-800/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && processFile(e.target.files[0])}
                  className="hidden"
                />

                <div className="mb-3 p-4 rounded-2xl bg-sentinel-dark-800 border border-slate-700 shadow-inner">
                  {getFileIcon()}
                </div>

                {selectedFile ? (
                  <div className="space-y-1 w-full">
                    <p className="font-semibold text-slate-200 text-sm truncate max-w-[220px] mx-auto">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-emerald-400 font-mono font-medium">
                      {formatBytes(selectedFile.size)}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setFileHashPreview('');
                      }}
                      className="mt-2 text-xs text-red-400 hover:text-red-300 underline inline-flex items-center gap-1"
                    >
                      <X size={12} /> Change File
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-200 font-medium text-sm">Drag & drop evidence file</p>
                    <p className="text-slate-400 text-xs mt-1">or click to browse local drive</p>
                  </>
                )}
              </div>

              {/* Supported File Types Badges */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Allowed Evidence Formats</span>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 bg-blue-500/15 text-blue-300 rounded border border-blue-500/30">Images (.png, .jpg, .webp)</span>
                  <span className="px-2 py-0.5 bg-purple-500/15 text-purple-300 rounded border border-purple-500/30">Videos (.mp4, .avi, .mkv)</span>
                  <span className="px-2 py-0.5 bg-cyan-500/15 text-cyan-300 rounded border border-cyan-500/30">PDF Documents</span>
                  <span className="px-2 py-0.5 bg-amber-500/15 text-amber-300 rounded border border-amber-500/30">Emails (.eml, .msg)</span>
                  <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-300 rounded border border-emerald-500/30">PCAP Capture</span>
                  <span className="px-2 py-0.5 bg-rose-500/15 text-rose-300 rounded border border-rose-500/30">Archives (.zip, .tar)</span>
                </div>
              </div>

              {/* SHA-256 Hash Preview Box */}
              {fileHashPreview && (
                <div className="p-3.5 bg-sentinel-dark-800 rounded-xl border border-slate-700/80 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block flex items-center justify-between">
                    <span>SHA-256 Checksum (Browser Preview)</span>
                    <CheckCircle2 size={12} className="text-emerald-400" />
                  </span>
                  <p className="font-mono text-[11px] text-emerald-300 break-all select-all">
                    {fileHashPreview}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Metadata Entry Form (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glassmorphism rounded-2xl p-6 border border-slate-700/50 space-y-5">
              <h3 className="text-base font-bold text-slate-100 flex items-center justify-between border-b border-slate-800 pb-3">
                <span>2. Case & Evidence Metadata</span>
                <span className="text-xs text-primary-400 font-mono">PostgreSQL Indexing</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Case ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Case Number / ID *</label>
                  <input
                    type="text"
                    name="caseId"
                    required
                    value={formData.caseId}
                    onChange={handleChange}
                    placeholder="SC-2026-00001"
                    className="w-full bg-sentinel-dark-800/80 border border-slate-600 rounded-xl px-4 py-2.5 text-slate-200 font-mono text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                {/* Evidence Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Evidence Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Server Incident Log File"
                    className="w-full bg-sentinel-dark-800/80 border border-slate-600 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Context</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide forensic context, physical location acquired, or chain of custody notes..."
                  className="w-full bg-sentinel-dark-800/80 border border-slate-600 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-primary-500 resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Investigator */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Investigator Name *</label>
                  <input
                    type="text"
                    name="investigator"
                    required
                    value={formData.investigator}
                    onChange={handleChange}
                    className="w-full bg-sentinel-dark-800/80 border border-slate-600 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department / Agency</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Cyber Crime Unit"
                    className="w-full bg-sentinel-dark-800/80 border border-slate-600 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Level *</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full bg-sentinel-dark-800/80 border border-slate-600 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-primary-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Emergency</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Evidence Type / Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-sentinel-dark-800/80 border border-slate-600 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-primary-500"
                  >
                    <option value="document">Document (PDF, Word)</option>
                    <option value="image">Image / CCTV Capture</option>
                    <option value="video">Video Recording (MP4, MKV)</option>
                    <option value="email">Email (.EML, .MSG Header)</option>
                    <option value="digital_forensics">Digital Forensics (PCAP, Memory Dump, Archive)</option>
                    <option value="log_file">Server Log File</option>
                    <option value="other">Other Digital Artifact</option>
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="homicide, pcap, incident"
                    className="w-full bg-sentinel-dark-800/80 border border-slate-600 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Upload Progress Bar */}
              {uploading && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-slate-300 font-medium">
                    <span>Hashing & Transferring to SentinelChain...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-emerald-400 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full mt-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-semibold py-3.5 rounded-xl shadow-lg border border-primary-500/50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Processing Hash & Saving to PostgreSQL...
                  </>
                ) : (
                  <>
                    <Lock size={18} /> Hash SHA-256 & Store into Evidence Locker
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default UploadEvidence;
