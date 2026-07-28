import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Clock, HardDrive, Hash, FileImage, Download, Activity, ExternalLink, CheckCircle } from 'lucide-react';

const EvidenceDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glassmorphism p-6 rounded-xl border border-slate-700/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 shrink-0">
            <FileImage size={24} className="text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-100">Crime Scene Photos</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle size={12}/> Verified
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">ID: {id || 'EVD-2023-001'} • Uploaded by Agent Smith</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
            <Download size={16} /> Download
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg border border-primary-500/50">
            <Shield size={16} /> Re-verify
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Preview & Meta */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glassmorphism rounded-xl border border-slate-700/50 overflow-hidden">
            <div className="bg-sentinel-dark-900 aspect-video flex items-center justify-center relative border-b border-slate-700/50">
              <img src="https://images.unsplash.com/photo-1618218168350-6e7c81151b64?auto=format&fit=crop&q=80&w=800" alt="Evidence Preview" className="w-full h-full object-cover opacity-60 mix-blend-luminosity hover:mix-blend-normal transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-sentinel-dark-900 to-transparent"></div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-medium text-slate-200 mb-2">Description</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Photographic evidence collected from the scene. Shows signs of forced entry at the rear door. Metadata confirms timestamp and location data matches the initial report.
              </p>
              
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-md border border-slate-700">homicide</span>
                <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-md border border-slate-700">scene photos</span>
                <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-md border border-slate-700">priority</span>
              </div>
            </div>
          </div>
          
          {/* AI Analysis Placeholder */}
          <div className="glassmorphism rounded-xl p-6 border border-slate-700/50 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
             <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
               <Activity size={20} className="text-accent" />
               AI Analysis Results
             </h3>
             <div className="bg-sentinel-dark-900/50 rounded-lg p-4 border border-slate-800">
               <p className="text-sm text-slate-300 mb-3">AI Deepfake & Integrity Scan:</p>
               <div className="space-y-3">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400">Metadata Consistency</span>
                   <span className="text-emerald-400 font-medium">99.8% Match</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-1.5">
                   <div className="bg-emerald-500 h-1.5 rounded-full w-[99.8%]"></div>
                 </div>
                 
                 <div className="flex justify-between items-center text-sm mt-2">
                   <span className="text-slate-400">Tamper Detection</span>
                   <span className="text-emerald-400 font-medium">Clear</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-1.5">
                   <div className="bg-emerald-500 h-1.5 rounded-full w-full"></div>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Sidebar: Chain Info */}
        <div className="space-y-6">
          <div className="glassmorphism rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-medium text-slate-200 mb-4">Blockchain Record</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><Hash size={14}/> SHA-256 Hash</p>
                <div className="bg-sentinel-dark-900 p-2.5 rounded border border-slate-800 text-xs font-mono text-primary-400 break-all">
                  8f4d9c7a2b1e3f5c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c
                </div>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><HardDrive size={14}/> IPFS CID</p>
                <div className="bg-sentinel-dark-900 p-2.5 rounded border border-slate-800 text-xs font-mono text-slate-300 break-all flex justify-between items-start gap-2">
                  <span>QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG</span>
                  <ExternalLink size={14} className="text-slate-500 hover:text-primary-400 cursor-pointer shrink-0 mt-0.5" />
                </div>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><Activity size={14}/> Transaction</p>
                <a href="#" className="text-xs font-mono text-accent hover:underline flex items-center gap-1">
                  0x7a8b...1e2f <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          <div className="glassmorphism rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
              <Clock size={18} />
              Chain of Custody
            </h3>
            
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-primary-500 bg-sentinel-dark-900 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-sentinel-dark-800 p-3 rounded border border-slate-700 shadow ml-4 md:ml-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-slate-200 text-sm">Verified</div>
                    <time className="font-mono text-xs text-slate-500">Oct 24, 14:30</time>
                  </div>
                  <div className="text-slate-400 text-xs">System Auto-verify</div>
                </div>
              </div>
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-slate-600 bg-sentinel-dark-900 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-sentinel-dark-800 p-3 rounded border border-slate-700 shadow ml-4 md:ml-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-slate-200 text-sm">Uploaded</div>
                    <time className="font-mono text-xs text-slate-500">Oct 24, 10:15</time>
                  </div>
                  <div className="text-slate-400 text-xs">Agent Smith</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceDetail;
