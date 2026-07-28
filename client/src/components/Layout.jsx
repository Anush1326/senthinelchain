import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Upload, ShieldCheck, BarChart2, LogOut } from 'lucide-react';
import Navbar from './Navbar';
import useAuthStore from '../store/authStore';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Evidence', path: '/evidence', icon: <FileText size={20} /> },
    { name: 'Upload', path: '/evidence/upload', icon: <Upload size={20} /> },
    { name: 'Verify', path: '/verify', icon: <ShieldCheck size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart2 size={20} /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-sentinel-dark-900">
      {/* Sidebar */}
      <aside className="w-64 glassmorphism flex flex-col justify-between border-r border-slate-800 hidden md:flex">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <h1 className="text-xl font-bold gradient-text tracking-wide">SentinelChain</h1>
          </div>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30 glow-effect'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        {/* User Info Bottom */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 bg-sentinel-dark-800 rounded-lg border border-slate-700">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-accent flex items-center justify-center text-sm font-bold text-white uppercase">
              {user?.name ? user.name.slice(0, 2) : 'US'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name || 'Authenticated User'}</p>
              <p className="text-xs text-primary-400 capitalize truncate">{user?.role || 'Viewer'}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-slate-400 hover:text-red-400 transition-colors p-1"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
