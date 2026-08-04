import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell, 
  Menu, 
  Wallet, 
  Activity, 
  CheckCircle2, 
  ShieldAlert, 
  ExternalLink,
  X,
  Cpu,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import showCyberToast from './CyberToast';

const Navbar = ({ onToggleMobileMenu }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const walletAddress = "0x71C...89Fa";
  const fullAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d89Fa";

  const notificationsList = [
    { id: 1, type: 'alert', title: 'Hash Integrity Verified', time: '2 mins ago', desc: 'Case SC-2026-009 logs match block hash.' },
    { id: 2, type: 'warning', title: 'New Evidence Flagged', time: '1 hour ago', desc: 'IPFS hash anomaly detected on Node #4.' },
    { id: 3, type: 'info', title: 'Smart Contract Sync Complete', time: '3 hours ago', desc: 'Batch 142 committed to Sepolia Testnet.' }
  ];

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    showCyberToast.success("Wallet address copied to clipboard", "ADDRESS_COPIED");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleWallet = () => {
    if (isWalletConnected) {
      setShowWalletModal(true);
    } else {
      setIsWalletConnected(true);
      showCyberToast.success("Web3 Security Wallet Connected", "WALLET_CONNECTED");
    }
  };

  return (
    <header className="h-16 glassmorphism border-b border-cyan-500/20 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 sticky top-0 backdrop-blur-xl">
      {/* Left: Mobile Toggle & Quick Search */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleMobileMenu}
          className="md:hidden text-cyan-400 hover:text-cyan-300 p-2 rounded-lg hover:bg-cyan-500/10 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={22} />
        </button>
        
        {/* Search Trigger */}
        <div 
          onClick={() => setShowSearchModal(true)}
          className="hidden sm:flex items-center gap-3 bg-slate-900/80 border border-slate-700/60 hover:border-cyan-500/40 text-slate-300 text-sm rounded-xl pl-3 pr-4 py-1.5 w-64 md:w-80 cursor-pointer transition-all shadow-inner group"
        >
          <Search className="text-slate-400 group-hover:text-cyan-400 transition-colors" size={16} />
          <span className="text-slate-500 text-xs flex-1">Search hash, IPFS, case ID...</span>
          <kbd className="bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono px-1.5 py-0.5 rounded shadow-sm">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right: Network Status, Notifications, Wallet */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Live Blockchain Network Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          <span className="tracking-wide">EVM MAINNET</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">#19,842,091</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800/60 rounded-xl transition-all border border-slate-800 hover:border-cyan-500/30"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,240,255,0.9)] animate-pulse"></span>
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-80 sm:w-96 glass-modal rounded-2xl p-4 shadow-2xl z-50 border border-cyan-500/30"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={16} className="text-cyan-400" />
                    <h3 className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">SECURITY_LOGS</h3>
                  </div>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-500 hover:text-slate-300 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {notificationsList.map((n) => (
                    <div 
                      key={n.id} 
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-200">{n.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-400">{n.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 text-center">
                  <button className="text-xs font-mono text-cyan-400 hover:underline">
                    VIEW_ALL_AUDIT_LOGS &gt;
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Wallet Button */}
        <button 
          onClick={toggleWallet}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-3.5 py-1.5 rounded-xl text-xs font-medium font-mono transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] border border-cyan-400/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Wallet size={15} />
          <span>{isWalletConnected ? walletAddress : 'CONNECT_WALLET'}</span>
        </button>
      </div>

      {/* Wallet Modal */}
      <AnimatePresence>
        {showWalletModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-modal max-w-md w-full rounded-2xl p-6 border border-cyan-500/40 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowWalletModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Wallet size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">WEB3_IDENTITY</h3>
                  <p className="text-xs text-cyan-400 font-mono">NODE_KEY: ACTIVE</p>
                </div>
              </div>

              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3 mb-5 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>ADDRESS:</span>
                  <button 
                    onClick={handleCopyWallet}
                    className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300"
                  >
                    <span>{walletAddress}</span>
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>NETWORK:</span>
                  <span className="text-emerald-400 font-bold">Ethereum Sepolia</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>ROLE PERMISSIONS:</span>
                  <span className="text-purple-400 font-bold">EVIDENCE_PROVER</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setIsWalletConnected(false);
                    setShowWalletModal(false);
                    showCyberToast.info("Wallet Disconnected", "DISCONNECTED");
                  }}
                  className="flex-1 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-mono font-bold border border-red-500/30 transition-all"
                >
                  DISCONNECT
                </button>
                <button 
                  onClick={() => setShowWalletModal(false)}
                  className="flex-1 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/40 transition-all"
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Search Modal */}
      <AnimatePresence>
        {showSearchModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="glass-modal max-w-xl w-full rounded-2xl p-4 border border-cyan-500/40 shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <Search className="text-cyan-400" size={20} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type evidence hash, IPFS CID, or Case Number..."
                  className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none font-mono"
                  autoFocus
                />
                <button 
                  onClick={() => setShowSearchModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 text-xs font-mono text-slate-400 text-center space-y-2">
                <p>Press <kbd className="bg-slate-800 text-cyan-400 px-2 py-0.5 rounded border border-slate-700">ESC</kbd> to exit search</p>
                {searchQuery && (
                  <div className="mt-4 text-left space-y-2">
                    <p className="text-cyan-400 text-[11px]">SEARCH_RESULTS for &quot;{searchQuery}&quot;:</p>
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-cyan-500/30 cursor-pointer">
                      <p className="font-semibold text-slate-200">Server Logs - Case SC-2026-00001</p>
                      <p className="text-[11px] text-cyan-400/80">Hash: a1b2c3d4e5f6a1b2c3d4e5f6...</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
