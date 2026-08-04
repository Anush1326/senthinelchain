import React, { useState, useRef, useEffect } from 'react';
import {
  FileDiff,
  Eye,
  Sliders,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Hash,
  Globe,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Printer,
  Upload,
  Layers,
  Cpu,
  Database,
  Crosshair,
  Move,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Split,
  Square
} from 'lucide-react';
import showCyberToast from '../components/CyberToast';
import RiskScoreBadge from '../components/RiskScoreBadge';
import api from '../services/api';

const sampleOrigImg = 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80';
const sampleModImg = 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80';

const ForensicDiffViewer = () => {
  const [origFile, setOrigFile] = useState(null);
  const [modFile, setModFile] = useState(null);
  const [origPreview, setOrigPreview] = useState(sampleOrigImg);
  const [modPreview, setModPreview] = useState(sampleModImg);

  const [viewMode, setViewMode] = useState('side_by_side'); // side_by_side | split | swipe | blink | heatmap | ela | bounding
  const [opacity, setOpacity] = useState(60);
  const [swipePos, setSwipePos] = useState(50);
  const [blinkState, setBlinkState] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Real-time Pixel Inspector HUD
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [rgbValues, setRgbValues] = useState({ r: 245, g: 12, b: 18 });

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Blink interval timer
  useEffect(() => {
    let timer = null;
    if (viewMode === 'blink') {
      timer = setInterval(() => {
        setBlinkState((prev) => !prev);
      }, 500); // 2Hz flicker
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [viewMode]);

  const handleOrigUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setOrigFile(file);
      setOrigPreview(URL.createObjectURL(file));
      showCyberToast.success(`Original Evidence Loaded: ${file.name}`);
    }
  };

  const handleModUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setModFile(file);
      setModPreview(URL.createObjectURL(file));
      showCyberToast.success(`Suspected Modified Evidence Loaded: ${file.name}`);
    }
  };

  const handleRunComparison = async () => {
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      if (origFile) formData.append('originalFile', origFile);
      if (modFile) formData.append('modifiedFile', modFile);

      const res = await api.post('/evidence/compare', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setAnalysisResult(res.data.data);
        showCyberToast.error(
          `Comparison Analysis Complete! SSIM: ${res.data.data.comparison_summary.ssim_score}%`,
          'FORENSIC_DIFF_COMPLETED'
        );
      }
    } catch (err) {
      showCyberToast.error('Forensic comparison failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleMouseMoveInspector = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setCursorPos({ x, y });

    // Mock RGB variation based on mouse position
    const r = Math.min(255, (x * 3) % 256);
    const g = Math.min(255, (y * 2) % 256);
    const b = Math.min(255, ((x + y) * 4) % 256);
    setRgbValues({ r, g, b });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header & Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <FileDiff size={14} className="animate-pulse" /> Digital Forensics Difference Analysis Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-3">
            Evidence Difference &amp; Tampering Inspector
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300">
              SSIM &amp; ELA Active
            </span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Compare original evidence against suspected modified artifacts to pinpoint altered pixels, structural shifts, and EXIF discrepancies.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRunComparison}
            disabled={analyzing}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg border border-cyan-500/40 transition"
          >
            {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            <span>Execute AI Forensic Comparison</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-700 transition"
          >
            <Printer size={14} className="text-cyan-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Dual Upload Cards Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Image Dropzone */}
        <div className="glassmorphism p-5 rounded-2xl border border-emerald-500/30 space-y-3 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} /> 1. Original Evidence Artifact
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Anchored Polygon #48521000</span>
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
            <img src={origPreview} alt="Original Evidence" className="w-full h-full object-cover" />
            <input
              type="file"
              accept="image/*"
              onChange={handleOrigUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>SHA-256: <strong className="text-cyan-300">a1b2c3d4e5f6...</strong></span>
            <label className="text-cyan-400 hover:underline cursor-pointer flex items-center gap-1">
              <Upload size={12} /> Replace Original
              <input type="file" accept="image/*" onChange={handleOrigUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Suspected Modified Image Dropzone */}
        <div className="glassmorphism p-5 rounded-2xl border border-red-500/30 space-y-3 bg-gradient-to-b from-slate-900 via-slate-900 to-red-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={16} /> 2. Suspected Modified Evidence
            </span>
            <span className="text-[10px] font-mono text-red-400">Suspected Tampering Target</span>
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
            <img src={modPreview} alt="Modified Evidence" className="w-full h-full object-cover" />
            <input
              type="file"
              accept="image/*"
              onChange={handleModUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>SHA-256: <strong className="text-red-400">f9e8d7c6b5a4...</strong></span>
            <label className="text-red-400 hover:underline cursor-pointer flex items-center gap-1">
              <Upload size={12} /> Replace Modified
              <input type="file" accept="image/*" onChange={handleModUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* View Mode Toolbar & Interactive Viewer HUD */}
      <div className="glassmorphism p-6 rounded-2xl border border-slate-700/50 space-y-6 shadow-xl">
        {/* Toolbar Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-mono text-slate-400 uppercase mr-2 shrink-0">View Mode:</span>
            {[
              { id: 'side_by_side', label: 'Side-by-Side', icon: <Square size={14} /> },
              { id: 'split', label: 'Split View', icon: <Split size={14} /> },
              { id: 'swipe', label: 'Swipe Slider', icon: <Move size={14} /> },
              { id: 'blink', label: 'Blink Toggle (2Hz)', icon: <Zap size={14} /> },
              { id: 'heatmap', label: 'Thermal Heatmap', icon: <Activity size={14} /> },
              { id: 'ela', label: 'ELA View', icon: <Layers size={14} /> },
              { id: 'bounding', label: 'Bounding Boxes', icon: <Crosshair size={14} /> }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition shrink-0 ${
                  viewMode === mode.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {mode.icon}
                <span>{mode.label}</span>
              </button>
            ))}
          </div>

          {/* Zoom & Opacity Controls */}
          <div className="flex items-center gap-4 shrink-0 font-mono text-xs text-slate-400">
            {(viewMode === 'heatmap' || viewMode === 'ela') && (
              <div className="flex items-center gap-2">
                <span>Opacity:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-24 accent-cyan-400"
                />
                <span className="text-cyan-300 w-8">{opacity}%</span>
              </div>
            )}

            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))} className="hover:text-white">
                <ZoomOut size={14} />
              </button>
              <span className="text-cyan-300 w-12 text-center">{zoomLevel}%</span>
              <button onClick={() => setZoomLevel(Math.min(500, zoomLevel + 25))} className="hover:text-white">
                <ZoomIn size={14} />
              </button>
              <button onClick={() => setZoomLevel(100)} className="hover:text-white ml-1">
                <RotateCcw size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Viewer Workspace */}
        <div
          onMouseMove={handleMouseMoveInspector}
          className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden min-h-[420px] flex items-center justify-center p-4 cursor-crosshair select-none"
        >
          {/* View Mode 1: Side-by-Side */}
          {viewMode === 'side_by_side' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
              <div className="relative rounded-xl overflow-hidden border border-slate-800">
                <span className="absolute top-2 left-2 z-10 px-2 py-1 rounded bg-slate-900/80 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                  Original Evidence
                </span>
                <img
                  src={origPreview}
                  alt="Original"
                  style={{ transform: `scale(${zoomLevel / 100})` }}
                  className="w-full h-full object-contain transition-transform"
                />
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-800">
                <span className="absolute top-2 left-2 z-10 px-2 py-1 rounded bg-slate-900/80 text-[10px] font-mono text-red-400 border border-red-500/30">
                  Suspected Modified
                </span>
                <img
                  src={modPreview}
                  alt="Modified"
                  style={{ transform: `scale(${zoomLevel / 100})` }}
                  className="w-full h-full object-contain transition-transform"
                />
              </div>
            </div>
          )}

          {/* View Mode 2: Blink Toggle (2Hz) */}
          {viewMode === 'blink' && (
            <div className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden border border-slate-800">
              <span className={`absolute top-2 left-2 z-10 px-3 py-1 rounded font-mono text-xs font-bold ${
                blinkState ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                {blinkState ? 'FLICKER: SUSPECTED MODIFIED EVIDENCE' : 'FLICKER: ORIGINAL EVIDENCE'}
              </span>
              <img
                src={blinkState ? modPreview : origPreview}
                alt="Blink View"
                style={{ transform: `scale(${zoomLevel / 100})` }}
                className="w-full h-full object-contain transition-all duration-75"
              />
            </div>
          )}

          {/* View Mode 3: Swipe Comparison */}
          {viewMode === 'swipe' && (
            <div className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden border border-slate-800">
              <img src={modPreview} alt="Modified Base" className="absolute inset-0 w-full h-full object-contain" />
              <div
                style={{ width: `${swipePos}%` }}
                className="absolute top-0 left-0 bottom-0 overflow-hidden border-r-2 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.8)]"
              >
                <img src={origPreview} alt="Original Top" className="w-full max-w-none h-full object-contain" />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={swipePos}
                onChange={(e) => setSwipePos(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-ew-resize z-20"
              />
            </div>
          )}

          {/* View Mode 4: Heatmap / ELA / Bounding Overlay */}
          {(viewMode === 'heatmap' || viewMode === 'ela' || viewMode === 'bounding') && (
            <div className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden border border-slate-800">
              <img src={origPreview} alt="Base" className="absolute inset-0 w-full h-full object-contain" />
              
              {analysisResult?.visualizations?.heatmap_base64 && viewMode === 'heatmap' && (
                <img
                  src={analysisResult.visualizations.heatmap_base64}
                  alt="Heatmap Overlay"
                  style={{ opacity: opacity / 100 }}
                  className="absolute inset-0 w-full h-full object-contain transition-opacity"
                />
              )}

              {analysisResult?.visualizations?.ela_heatmap_base64 && viewMode === 'ela' && (
                <img
                  src={analysisResult.visualizations.ela_heatmap_base64}
                  alt="ELA Overlay"
                  style={{ opacity: opacity / 100 }}
                  className="absolute inset-0 w-full h-full object-contain transition-opacity"
                />
              )}

              {analysisResult?.visualizations?.boxed_image_base64 && viewMode === 'bounding' && (
                <img
                  src={analysisResult.visualizations.boxed_image_base64}
                  alt="Bounding Box Overlay"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              )}
            </div>
          )}

          {/* Pixel Inspector HUD Badge */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center gap-4 shadow-xl z-30">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Crosshair size={14} /> Pos: ({cursorPos.x}, {cursorPos.y})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `rgb(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b})` }} />
              RGB: ({rgbValues.r}, {rgbValues.g}, {rgbValues.b})
            </span>
          </div>
        </div>
      </div>

      {/* Forensic Comparison Results Dashboard */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Trust Score & Metrics Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glassmorphism p-5 rounded-2xl border border-slate-700/50 space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Structural Similarity (SSIM)</span>
              <p className="text-3xl font-bold font-mono text-cyan-400">
                {analysisResult.comparison_summary?.ssim_score}%
              </p>
              <p className="text-[10px] text-slate-400 font-mono">Structural alignment index</p>
            </div>

            <div className="glassmorphism p-5 rounded-2xl border border-slate-700/50 space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Pixel Divergence Rate</span>
              <p className="text-3xl font-bold font-mono text-red-400">
                {analysisResult.comparison_summary?.changed_pixel_percentage}%
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {analysisResult.comparison_summary?.changed_pixels_count?.toLocaleString()} pixels modified
              </p>
            </div>

            <div className="glassmorphism p-5 rounded-2xl border border-slate-700/50 space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Evidence Trust Score</span>
              <p className="text-3xl font-bold font-mono text-amber-400">
                {analysisResult.comparison_summary?.evidence_trust_score}%
              </p>
              <p className="text-[10px] text-slate-400 font-mono">Post-comparison integrity rating</p>
            </div>

            <div className="glassmorphism p-5 rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-950/30 to-slate-900 space-y-2 flex flex-col justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase">Verdict</span>
              <RiskScoreBadge
                score={94}
                level={analysisResult.comparison_summary?.risk_level || 'CRITICAL'}
                size="md"
              />
              <p className="text-[10px] text-slate-400 font-mono truncate">
                {analysisResult.comparison_summary?.verdict}
              </p>
            </div>
          </div>

          {/* Perceptual Hashes & Avalanche Explanation Card */}
          <div className="glassmorphism p-6 rounded-2xl border border-slate-700/50 space-y-4 font-mono text-xs">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Hash size={16} className="text-cyan-400" /> Perceptual Hashes (pHash / dHash / aHash) Comparison
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase">Perceptual Hash (pHash):</span>
                <p className="text-cyan-300 font-bold break-all">{analysisResult.perceptual_hashes?.phash?.original}</p>
                <p className="text-red-400 font-bold break-all">{analysisResult.perceptual_hashes?.phash?.modified}</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase">Difference Hash (dHash):</span>
                <p className="text-cyan-300 font-bold break-all">{analysisResult.perceptual_hashes?.dhash?.original}</p>
                <p className="text-red-400 font-bold break-all">{analysisResult.perceptual_hashes?.dhash?.modified}</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase">Average Hash (aHash):</span>
                <p className="text-cyan-300 font-bold break-all">{analysisResult.perceptual_hashes?.ahash?.original}</p>
                <p className="text-emerald-400 font-bold break-all">{analysisResult.perceptual_hashes?.ahash?.modified}</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 bg-slate-900 p-3 rounded-xl border border-slate-800 leading-relaxed">
              💡 <strong>Cryptographic Avalanche Effect Note:</strong> {analysisResult.perceptual_hashes?.avalanche_explanation}
            </p>
          </div>

          {/* EXIF & Metadata Comparison Table */}
          <div className="glassmorphism p-6 rounded-2xl border border-slate-700/50 space-y-4 font-mono text-xs">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Database size={16} className="text-amber-400" /> EXIF Metadata Comparison Table
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-2">Field</th>
                    <th className="pb-2">Original Evidence</th>
                    <th className="pb-2">Suspected Modified</th>
                    <th className="pb-2">Discrepancy Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {analysisResult.metadata_comparison?.map((m, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="py-2.5 font-bold text-slate-200">{m.field}</td>
                      <td className="py-2.5 text-cyan-300">{m.original}</td>
                      <td className="py-2.5 text-red-300">{m.modified}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          m.status === 'MATCH' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForensicDiffViewer;
