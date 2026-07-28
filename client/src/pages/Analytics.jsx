import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Activity, ShieldAlert, FileCheck, Layers } from 'lucide-react';

const activityData = [
  { name: 'Mon', uploads: 12, verified: 10, flagged: 1 },
  { name: 'Tue', uploads: 19, verified: 15, flagged: 2 },
  { name: 'Wed', uploads: 15, verified: 14, flagged: 0 },
  { name: 'Thu', uploads: 22, verified: 20, flagged: 1 },
  { name: 'Fri', uploads: 28, verified: 25, flagged: 3 },
  { name: 'Sat', uploads: 14, verified: 13, flagged: 0 },
  { name: 'Sun', uploads: 9, verified: 9, flagged: 0 },
];

const typeData = [
  { name: 'Images', value: 400 },
  { name: 'Documents', value: 300 },
  { name: 'Video', value: 200 },
  { name: 'Audio', value: 100 },
];

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">System Analytics</h2>
        <p className="text-slate-400 text-sm mt-1">Network activity and AI detection metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Scans', value: '8,432', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Integrity Maintained', value: '99.8%', icon: FileCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Tamper Attempts', value: '14', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Storage Used', value: '2.4 TB', icon: Layers, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <div key={i} className="glassmorphism p-5 rounded-xl border border-slate-700/50 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold text-slate-100 mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glassmorphism p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-lg font-medium text-slate-200 mb-6">Weekly Activity Volume</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="uploads" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorUploads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glassmorphism p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-lg font-medium text-slate-200 mb-6">Verification vs Flagged</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                  cursor={{ fill: '#334155', opacity: 0.2 }}
                />
                <Bar dataKey="verified" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="flagged" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
