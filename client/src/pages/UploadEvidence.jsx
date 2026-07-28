import React, { useState } from 'react';
import { UploadCloud, X, Lock, CheckCircle } from 'lucide-react';

const UploadEvidence = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Upload Evidence</h2>
        <p className="text-slate-400 text-sm mt-1">Securely hash and store files on the SentinelChain network.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glassmorphism rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-medium text-slate-200 mb-4">Evidence Details</h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                <input type="text" placeholder="e.g., Crime Scene Photos - Case 402" className="w-full bg-sentinel-dark-800/80 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea rows="3" placeholder="Provide context about this evidence..." className="w-full bg-sentinel-dark-800/80 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                  <select className="w-full bg-sentinel-dark-800/80 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                    <option>Document</option>
                    <option>Image</option>
                    <option>Video</option>
                    <option>Audio</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Tags (comma separated)</label>
                  <input type="text" placeholder="homicide, scene, priority" className="w-full bg-sentinel-dark-800/80 border border-slate-600 rounded-lg px-4 py-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
                </div>
              </div>
            </form>
          </div>

          <div className="glassmorphism rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-medium text-slate-200 mb-4">File Upload</h3>
            
            <div 
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${
                isDragging ? 'border-primary-500 bg-primary-500/10' : 'border-slate-600 hover:border-slate-500 bg-sentinel-dark-800/50'
              }`}
            >
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <UploadCloud size={32} className={isDragging ? 'text-primary-400' : 'text-slate-400'} />
              </div>
              <p className="text-slate-200 font-medium text-lg">Drag & drop your file here</p>
              <p className="text-slate-400 text-sm mt-1 mb-4">Supports PDF, JPG, PNG, MP4, MP3 (Max 50MB)</p>
              <button className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Browse Files
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glassmorphism rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-medium text-slate-200 mb-4">Security Overview</h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-slate-300">
                <Lock size={20} className="text-primary-400 shrink-0" />
                <span>File is hashed locally (SHA-256) before upload.</span>
              </li>
              <li className="flex gap-3 text-sm text-slate-300">
                <CheckCircle size={20} className="text-emerald-400 shrink-0" />
                <span>Hash is permanently recorded on the blockchain.</span>
              </li>
              <li className="flex gap-3 text-sm text-slate-300">
                <Lock size={20} className="text-primary-400 shrink-0" />
                <span>File stored securely on IPFS network.</span>
              </li>
            </ul>
          </div>

          <button className="w-full bg-gradient-to-r from-primary-600 to-accent hover:from-primary-500 hover:to-primary-400 text-white font-semibold py-3.5 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-primary-500/50 transition-all active:scale-[0.98] flex justify-center items-center gap-2">
            <UploadCloud size={20} />
            Encrypt & Submit to Chain
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadEvidence;
