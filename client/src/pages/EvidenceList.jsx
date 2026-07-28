import React from 'react';
import { Filter, ChevronDown, MoreHorizontal, FileImage, FileText, FileVideo, CheckCircle2, Clock, AlertOctagon } from 'lucide-react';
import { Link } from 'react-router-dom';

const dummyData = [
  { id: 'EVD-2023-001', title: 'Crime Scene Photos', type: 'image', status: 'verified', hash: '0x8f4d...3b9e', date: 'Oct 24, 2023' },
  { id: 'EVD-2023-002', title: 'Suspect Interview Audio', type: 'audio', status: 'pending', hash: '0x1a2b...9c8d', date: 'Oct 23, 2023' },
  { id: 'EVD-2023-003', title: 'Security Footage - Lobby', type: 'video', status: 'flagged', hash: '0x5e6f...7a8b', date: 'Oct 22, 2023' },
  { id: 'EVD-2023-004', title: 'Financial Records - Q3', type: 'document', status: 'verified', hash: '0x9c8d...1a2b', date: 'Oct 20, 2023' },
];

const TypeIcon = ({ type }) => {
  switch(type) {
    case 'image': return <FileImage size={18} className="text-blue-400" />;
    case 'video': return <FileVideo size={18} className="text-purple-400" />;
    case 'document': return <FileText size={18} className="text-emerald-400" />;
    default: return <FileText size={18} className="text-slate-400" />;
  }
};

const StatusBadge = ({ status }) => {
  switch(status) {
    case 'verified': 
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 size={12}/> Verified</span>;
    case 'pending': 
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock size={12}/> Pending</span>;
    case 'flagged': 
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><AlertOctagon size={12}/> Flagged</span>;
    default: return null;
  }
};

const EvidenceList = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Evidence Library</h2>
          <p className="text-slate-400 text-sm mt-1">Manage and verify your blockchain-secured files.</p>
        </div>
        <Link to="/evidence/upload" className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg border border-primary-500/50">
          Upload Evidence
        </Link>
      </div>

      <div className="glassmorphism rounded-xl border border-slate-700/50 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-700/50 flex flex-wrap gap-3 items-center justify-between bg-slate-800/20">
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-sentinel-dark-800 border border-slate-700 rounded-md text-sm text-slate-300 hover:bg-slate-700 transition-colors">
              <Filter size={16} /> Filter
            </button>
            <div className="relative">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-sentinel-dark-800 border border-slate-700 rounded-md text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                Status: All <ChevronDown size={14} />
              </button>
            </div>
          </div>
          <div className="text-sm text-slate-400">
            Showing 1-4 of 1,248
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/40 text-slate-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Evidence ID</th>
                <th className="px-6 py-4">Title & Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Blockchain Hash</th>
                <th className="px-6 py-4">Date Uploaded</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {dummyData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{item.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                        <TypeIcon type={item.type} />
                      </div>
                      <span className="font-medium text-slate-200">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-primary-400 bg-primary-900/20 px-2 py-1 rounded border border-primary-800/30">
                      {item.hash}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{item.date}</td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/evidence/${item.id}`} className="text-slate-400 hover:text-primary-400 transition-colors mr-3 text-sm font-medium">View</Link>
                    <button className="text-slate-500 hover:text-slate-300 transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EvidenceList;
