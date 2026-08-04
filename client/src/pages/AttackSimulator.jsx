import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Zap,
  Play,
  Clock,
  Globe,
  Hash,
  Lock,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  FileDiff,
  Download,
  RefreshCw,
  Eye,
  ShieldCheck,
  Radio,
  Share2,
  FileText,
  Loader2,
  ArrowRight,
  ExternalLink,
  Users,
  Activity,
  Layers,
  Database
} from 'lucide-react';
import showCyberToast from '../components/CyberToast';
import RiskScoreBadge from '../components/RiskScoreBadge';
import TamperingDiffCard from '../components/TamperingDiffCard';
import api from '../services/api';

const AttackSimulator = () => {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState('ipfs_reupload_tampering');
  const [evidenceList, setEvidenceList] = useState([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('');
  
  const [executing, setExecuting] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline'); // timeline | diff | ai | report

  useEffect(() => {
    fetchScenarios();
    fetchEvidences();
  }, []);

  const fetchScenarios = async () => {
    try {
      const res = await api.get('/evidence/attack-scenarios');
      if (res.data?.success) {
        setScenarios(res.data.data);
      }
    } catch (e) {}
  };

  const fetchEvidences = async () => {
    try {
      const res = await api.get('/evidence');
      const items = res.data?.data?.data || res.data?.data || [];
      if (Array.isArray(items) && items.length > 0) {
        setEvidenceList(items);
        setSelectedEvidenceId(items[0].id);
      }
    } catch (e) {}
  };

  const handleExecuteSimulation = async (e) => {
    if (e) e.preventDefault();
    setExecuting(true);
    setSimulationResult(null);

    try {
      const res = await api.post('/evidence/simulate-attack', {
        scenarioId: selectedScenarioId,
        evidenceId: selectedEvidenceId
      });

      if (res.data?.success) {
        setSimulationResult(res.data.data);
        showCyberToast.error(
          `Attack Simulation Executed! ${res.data.data.overallVerdict}`,
          'ATTACK_SIMULATION_RESULT'
        );
      }
    } catch (err) {
      showCyberToast.error('Failed to execute attack simulation');
    } finally {
      setExecuting(false);
    }
  };

  const activeScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];
  const targetEvidence = evidenceList.find(e => e.id === selectedEvidenceId) || evidenceList[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-red-400 uppercase tracking-widest mb-1">
            <Zap size={14} className="animate-pulse" /> Advanced Security & Integrity Testbed
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-3">
            Digital Forensics Attack Simulator
            <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-400">
              IPFS Rules Enforced
            </span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Simulate realistic attacks around decentralized storage, CID mutation, replay vectors, and AI forensic analysis.
          </p>
        </div>

        <button
          onClick={handleExecuteSimulation}
          disabled={executing}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg border border-red-500/40 transition shrink-0"
        >
          {executing ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          <span>Run Attack Scenario</span>
        </button>
      </div>

      {/* Control Sandbox Form */}
      <div className="glassmorphism p-6 rounded-2xl border border-slate-700/50 shadow-xl space-y-6">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <Activity size={16} className="text-amber-400" /> Attack Simulation Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scenario Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 uppercase block">1. Select Attack Scenario:</label>
            <select
              value={selectedScenarioId}
              onChange={(e) => setSelectedScenarioId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 rounded-xl border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-red-500 transition"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.riskLevel}] {s.name}
                </option>
              ))}
            </select>
            {activeScenario && (
              <p className="text-[11px] text-slate-400 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed">
                {activeScenario.description}
              </p>
            )}
          </div>

          {/* Evidence Target Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 uppercase block">2. Select Target Evidence Artifact:</label>
            <select
              value={selectedEvidenceId}
              onChange={(e) => setSelectedEvidenceId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 rounded-xl border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition"
            >
              {evidenceList.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.originalFileName})
                </option>
              ))}
            </select>
            {targetEvidence && (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
                <p>CID: <span className="text-cyan-300">{targetEvidence.ipfsHash || 'QmYwAP...'}</span></p>
                <p>Block: <span className="text-amber-400">#{targetEvidence.blockNumber || 48521000}</span></p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Results Dashboard */}
      {simulationResult && (
        <div className="space-y-6">
          {/* Trust Score & Status Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Trust Index Metric */}
            <div className="glassmorphism p-5 rounded-2xl border border-slate-700/50 space-y-2 flex flex-col justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase">SentinelChain Trust Score</span>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold font-mono text-red-400">
                  {simulationResult.trustScore}%
                </span>
                <span className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-[10px] font-mono font-bold">
                  TRUST_DROPPED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Platform integrity score during active simulation</p>
            </div>

            {/* Verdict Card */}
            <div className="md:col-span-2 glassmorphism p-5 rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert size={16} /> ATTACK_SIMULATION_VERDICT
                </span>
                <RiskScoreBadge score={94} level="CRITICAL" size="md" />
              </div>
              <p className="text-sm font-semibold text-slate-200 font-mono">
                {simulationResult.overallVerdict}
              </p>
            </div>
          </div>

          {/* Result Tabs Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            {[
              { id: 'timeline', label: 'Forensic Timeline', icon: <Clock size={14} /> },
              { id: 'diff', label: 'What Changed Matrix', icon: <FileDiff size={14} /> },
              { id: 'ai', label: 'AI Multi-Vector Findings', icon: <Cpu size={14} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs transition ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Forensic Timeline */}
          {activeTab === 'timeline' && (
            <div className="glassmorphism p-6 rounded-2xl border border-slate-700/50 space-y-6">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} className="text-cyan-400" /> Attack Step-By-Step Forensic Sequence
              </h3>

              <div className="relative pl-6 space-y-6 border-l-2 border-slate-800">
                {simulationResult.timeline.map((step) => (
                  <div key={step.step} className="relative group">
                    {/* Timeline Node Icon */}
                    <div className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold ${
                      step.status === 'SUCCESS' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                      step.status === 'CRITICAL' ? 'bg-red-500/20 border-red-500 text-red-400' :
                      step.status === 'WARNING' ? 'bg-amber-500/20 border-amber-500 text-amber-400' :
                      'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                    }`}>
                      {step.step}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-slate-200 text-xs font-mono">{step.title}</span>
                        <span className="text-[10px] font-mono text-slate-500">{new Date(step.time).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: What Changed Matrix */}
          {activeTab === 'diff' && (
            <TamperingDiffCard evidence={targetEvidence} />
          )}

          {/* Tab 3: AI Multi-Vector Findings */}
          {activeTab === 'ai' && (
            <div className="glassmorphism p-6 rounded-2xl border border-slate-700/50 space-y-4 font-mono text-xs">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Cpu size={16} /> AI Multi-Vector Forensic Scan Findings
              </h3>

              <div className="space-y-2">
                {simulationResult.aiAnalysis.findings.map((f, i) => (
                  <div key={i} className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-amber-300/90 flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttackSimulator;
