import React from 'react';
import { Search, Bell, Menu, Wallet } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="h-16 glassmorphism border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-slate-400 hover:text-slate-200 transition-colors">
          <Menu size={24} />
        </button>
        
        <div className="hidden sm:flex items-center relative">
          <Search className="absolute left-3 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search evidence hash, ID, tags..."
            className="bg-sentinel-dark-800 border border-slate-700 text-slate-300 text-sm rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <button className="relative text-slate-400 hover:text-slate-200 transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full glow-effect"></span>
        </button>
        
        <button className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg border border-primary-500/50">
          <Wallet size={16} />
          <span className="hidden sm:inline">Connect Wallet</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
