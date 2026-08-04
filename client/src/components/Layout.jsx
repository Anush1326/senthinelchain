import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  ShieldCheck, 
  BarChart2, 
  LogOut, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
  Lock,
  Cpu,
  Activity,
  User,
  X,
  Globe,
  Zap
} from 'lucide-react';
import Navbar from './Navbar';
import useAuthStore from '../store/authStore';
import showCyberToast from './CyberToast';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    showCyberToast.info('Logged out securely', 'SESSION_CLOSED');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Evidence Vault', path: '/evidence', icon: <FileText size={20} /> },
    { name: 'IPFS Storage', path: '/ipfs', icon: <Globe size={20} /> },
    { name: 'Attack Simulator', path: '/simulator', icon: <Zap size={20} className="text-amber-400" /> },
    { name: 'Upload Chain', path: '/evidence/upload', icon: <Upload size={20} /> },
    { name: 'Verify Hash', path: '/verify', icon: <ShieldCheck size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart2 size={20} /> },
  ];

  if (user?.role === 'admin') {
    navItems.push({ 
      name: 'Admin Panel', 
      path: '/admin', 
      icon: <Shield size={20} className="text-cyan-400" /> 
    });
  }

  const renderNavLinks = (isMobile = false) => (
    <nav className="p-3 space-y-1.5">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.name}
            to={item.path}
            onClick={() => isMobile && setMobileMenuOpen(false)}
            className={`group relative flex items-center ${
              isSidebarCollapsed && !isMobile ? 'justify-center px-2 py-3' : 'px-3.5 py-2.5'
            } rounded-xl transition-all duration-200 font-mono text-xs font-semibold ${
              isActive
                ? 'bg-gradient-to-r from-cyan-500/20 via-blue-600/10 to-transparent text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-cyan-200 border border-transparent'
            }`}
          >
            {/* Active Left Accent Line */}
            {isActive && (
              <motion.div 
                layoutId="activeTabAccent"
                className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(0,240,255,0.9)]" 
              />
            )}

            <div className={`transition-transform duration-200 group-hover:scale-110 ${
              isActive ? 'text-cyan-400 filter drop-shadow-[0_0_6px_rgba(0,240,255,0.8)]' : ''
            }`}>
              {item.icon}
            </div>

            {(!isSidebarCollapsed || isMobile) && (
              <span className="ml-3 tracking-wide truncate">{item.name}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-sentinel-dark-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Desktop Responsive Sidebar */}
      <aside 
        className={`hidden md:flex flex-col justify-between glassmorphism border-r border-cyan-500/20 transition-all duration-300 z-20 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
            <Link to="/" className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center justify-center shrink-0">
                <Shield size={20} className="text-white" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col min-w-0">
                  <h1 className="text-lg font-bold font-mono tracking-wider gradient-cyber-title truncate">
                    SENTINEL
                  </h1>
                  <span className="text-[9px] font-mono text-cyan-400/80 tracking-widest uppercase">
                    CHAIN // SECURE
                  </span>
                </div>
              )}
            </Link>

            {/* Sidebar Collapse Toggle */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-slate-400 hover:text-cyan-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Navigation Links */}
          {renderNavLinks(false)}
        </div>

        {/* Bottom Sidebar Widgets */}
        <div className="p-3 border-t border-slate-800/80 space-y-3">
          {/* System Health Status Widget */}
          {!isSidebarCollapsed && (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Activity size={12} className="text-emerald-400" />
                  THREAT_LEVEL:
                </span>
                <span className="text-emerald-400 font-bold">LOW [SECURE]</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1">
                <div className="bg-emerald-400 h-1 rounded-full w-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
            </div>
          )}

          {/* User Profile Card */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-xs font-mono font-bold text-white uppercase shadow-[0_0_12px_rgba(0,240,255,0.3)] shrink-0 border border-cyan-400/40">
                {user?.name ? user.name.slice(0, 2) : 'US'}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col truncate">
                  <p className="text-xs font-medium text-slate-200 truncate">{user?.name || 'Security Operator'}</p>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase truncate">
                    [{user?.role || 'INVESTIGATOR'}]
                  </span>
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <button
                onClick={handleLogout}
                title="Logout Session"
                className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 glass-modal z-50 md:hidden flex flex-col justify-between border-r border-cyan-500/30"
            >
              <div>
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                      <Shield size={20} className="text-white" />
                    </div>
                    <h1 className="text-lg font-bold font-mono tracking-wider gradient-cyber-title">
                      SENTINEL
                    </h1>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X size={20} />
                  </button>
                </div>
                {renderNavLinks(true)}
              </div>

              <div className="p-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-xs font-bold border border-cyan-500/30">
                      <User size={16} />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-medium text-slate-200 truncate">{user?.name || 'Operator'}</p>
                      <p className="text-[10px] font-mono text-cyan-400 uppercase">{user?.role || 'Viewer'}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="text-red-400 p-1">
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar onToggleMobileMenu={() => setMobileMenuOpen(true)} />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
