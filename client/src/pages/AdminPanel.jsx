import React, { useState, useEffect } from 'react';
import {
  Users,
  FolderGit2,
  FileText,
  Shield,
  Key,
  Activity,
  BarChart2,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  UserCheck,
  UserX,
  Building,
  Mail,
  Loader2,
  RefreshCw,
  Sliders
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');

  // Users State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'investigator', department: 'Digital Forensics Unit' });

  // Cases State
  const [cases, setCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [showCreateCaseModal, setShowCreateCaseModal] = useState(false);
  const [newCaseForm, setNewCaseForm] = useState({ title: '', leadInvestigator: 'Agent Priya Sharma', department: 'Digital Forensics Division', priority: 'medium' });

  // Role Permissions Matrix State
  const [permissions, setPermissions] = useState({
    admin: { upload: true, verify: true, delete: true, export: true, manageUsers: true, manageCases: true },
    investigator: { upload: true, verify: true, delete: false, export: true, manageUsers: false, manageCases: true },
    analyst: { upload: false, verify: true, delete: false, export: true, manageUsers: false, manageCases: false },
    viewer: { upload: false, verify: false, delete: false, export: false, manageUsers: false, manageCases: false }
  });

  // Evidence Overview State
  const [evidenceList, setEvidenceList] = useState([]);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditSearch, setAuditSearch] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchCases();
    fetchPermissions();
    fetchEvidence();
    fetchAuditLogs();
  }, []);

  // API Call Handlers
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/users');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.warn('Users fetch notice:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchCases = async () => {
    setLoadingCases(true);
    try {
      const res = await api.get('/users/cases');
      if (res.data?.data && Array.isArray(res.data.data)) {
        setCases(res.data.data);
      }
    } catch (err) {
      console.warn('Cases fetch notice:', err);
    } finally {
      setLoadingCases(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await api.get('/users/permissions');
      if (res.data?.data) {
        setPermissions(res.data.data);
      }
    } catch (err) {}
  };

  const fetchEvidence = async () => {
    setLoadingEvidence(true);
    try {
      const res = await api.get('/evidence');
      const items = res.data?.data?.data || res.data?.data;
      if (Array.isArray(items)) setEvidenceList(items);
    } catch (err) {
    } finally {
      setLoadingEvidence(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/audit-logs');
      const logs = res.data?.data?.data || res.data?.data;
      if (Array.isArray(logs)) setAuditLogs(logs);
    } catch (err) {}
  };

  // User CRUD Handlers
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users', newUserForm);
      if (res.data?.success) {
        toast.success('New user account created!');
        setShowCreateUserModal(false);
        setNewUserForm({ name: '', email: '', role: 'investigator', department: 'Digital Forensics Unit' });
        fetchUsers();
      }
    } catch (err) {
      toast.error('Failed to create user account');
    }
  };

  const handleToggleUserStatus = async (userObj) => {
    try {
      await api.put(`/users/${userObj.id}`, { isActive: !userObj.isActive });
      toast.success(`User ${userObj.name} status updated!`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User account removed');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  // Case CRUD Handlers
  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/cases', newCaseForm);
      if (res.data?.success) {
        toast.success('New forensic investigation case created!');
        setShowCreateCaseModal(false);
        setNewCaseForm({ title: '', leadInvestigator: 'Agent Priya Sharma', department: 'Digital Forensics Division', priority: 'medium' });
        fetchCases();
      }
    } catch (err) {
      toast.error('Failed to create case');
    }
  };

  const handleDeleteCase = async (id) => {
    if (!window.confirm('Are you sure you want to delete this case?')) return;
    try {
      await api.delete(`/users/cases/${id}`);
      toast.success('Case record removed');
      fetchCases();
    } catch (err) {
      toast.error('Failed to delete case');
    }
  };

  // Permission Matrix Handler
  const handlePermissionToggle = async (role, permissionKey) => {
    const updated = {
      ...permissions,
      [role]: {
        ...permissions[role],
        [permissionKey]: !permissions[role][permissionKey]
      }
    };
    setPermissions(updated);
    try {
      await api.put('/users/permissions', updated);
      toast.success(`Updated ${role.toUpperCase()} permissions`);
    } catch (err) {}
  };

  // Evidence Delete Handler
  const handleDeleteEvidence = async (id) => {
    if (!window.confirm('Are you sure you want to delete this evidence record?')) return;
    try {
      await api.delete(`/evidence/${id}`);
      toast.success('Evidence record deleted');
      fetchEvidence();
    } catch (err) {
      toast.error('Failed to delete evidence');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-3">
            <Shield className="text-primary-400" size={32} />
            SentinelChain Admin Control Panel
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage Users, Cases, Evidence Records, Roles, Permissions Matrix, Audit Trails & Analytics.
          </p>
        </div>
        <div className="px-3.5 py-1.5 bg-primary-500/10 border border-primary-500/30 rounded-xl text-xs font-mono text-primary-300 flex items-center gap-2">
          <Key size={16} />
          <span>Role: Administrator</span>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glassmorphism rounded-2xl p-5 border border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
            <Users size={20} className="text-primary-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 font-mono">{users.length}</p>
          <p className="text-[11px] text-emerald-400 font-medium">Active System Accounts</p>
        </div>

        <div className="glassmorphism rounded-2xl p-5 border border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Cases</span>
            <FolderGit2 size={20} className="text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 font-mono">{cases.length}</p>
          <p className="text-[11px] text-cyan-400 font-medium">Forensic Investigations</p>
        </div>

        <div className="glassmorphism rounded-2xl p-5 border border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Evidence Items</span>
            <FileText size={20} className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 font-mono">{evidenceList.length}</p>
          <p className="text-[11px] text-amber-400 font-medium">Anchored on Polygon</p>
        </div>

        <div className="glassmorphism rounded-2xl p-5 border border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Audit Trail Events</span>
            <Activity size={20} className="text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 font-mono">{auditLogs.length}</p>
          <p className="text-[11px] text-purple-400 font-medium">System Security Logs</p>
        </div>
      </div>

      {/* Admin Management Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'users', label: 'Users Management', icon: <Users size={16} /> },
          { id: 'cases', label: 'Cases Management', icon: <FolderGit2 size={16} /> },
          { id: 'evidence', label: 'Evidence Control', icon: <FileText size={16} /> },
          { id: 'permissions', label: 'Roles & Permissions', icon: <Key size={16} /> },
          { id: 'audit', label: 'System Audit Stream', icon: <Activity size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                : 'bg-sentinel-dark-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="glassmorphism rounded-2xl p-6 border border-slate-700/50 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">System Users Registry</h2>
              <p className="text-xs text-slate-400">Manage user roles, departments, active status & credentials</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full bg-sentinel-dark-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-primary-500"
                />
              </div>
              <button
                onClick={() => setShowCreateUserModal(true)}
                className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0"
              >
                <Plus size={14} /> Add User
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">User & Email</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-semibold text-slate-200">{u.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize border ${
                        u.role === 'admin' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' :
                        u.role === 'investigator' ? 'bg-primary-500/15 text-primary-300 border-primary-500/30' :
                        u.role === 'analyst' ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' :
                        'bg-slate-500/15 text-slate-400 border-slate-500/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{u.department || 'Digital Forensics'}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        u.isActive !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {u.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 border border-slate-700"
                        >
                          {u.isActive !== false ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1 hover:text-red-400 text-slate-500 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CASES MANAGEMENT */}
      {activeTab === 'cases' && (
        <div className="glassmorphism rounded-2xl p-6 border border-slate-700/50 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Forensic Investigation Cases</h2>
              <p className="text-xs text-slate-400">Create & assign case numbers, lead investigators, and priorities</p>
            </div>
            <button
              onClick={() => setShowCreateCaseModal(true)}
              className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
            >
              <Plus size={14} /> Create Case
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cases.map((c) => (
              <div key={c.id} className="p-4 bg-sentinel-dark-800/90 rounded-xl border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary-400">{c.caseId}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    c.priority === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    c.priority === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-slate-500/20 text-slate-300'
                  }`}>
                    {c.priority}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-100 text-sm">{c.title}</h3>
                <div className="text-xs text-slate-400 space-y-1 font-mono">
                  <p>Lead: <span className="text-slate-200 font-sans">{c.leadInvestigator}</span></p>
                  <p>Dept: <span className="text-slate-200 font-sans">{c.department}</span></p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
                  <span className="text-slate-500">{c.evidenceCount || 0} Evidence Files</span>
                  <button onClick={() => handleDeleteCase(c.id)} className="text-slate-500 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EVIDENCE CONTROL */}
      {activeTab === 'evidence' && (
        <div className="glassmorphism rounded-2xl p-6 border border-slate-700/50 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Evidence Records Control</h2>
              <p className="text-xs text-slate-400">Manage digital evidence, inspect SHA-256 hashes & override statuses</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Title & Case</th>
                  <th className="py-3 px-3">SHA-256 Hash</th>
                  <th className="py-3 px-3">IPFS CID</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {evidenceList.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-semibold text-slate-200">{e.title}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{e.metadata?.caseId || 'SC-2026-00001'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {e.fileHash ? `${e.fileHash.slice(0, 10)}...` : 'N/A'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-primary-300">
                      {e.ipfsHash ? `${e.ipfsHash.slice(0, 10)}...` : 'N/A'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                        {e.status || 'verified'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button onClick={() => handleDeleteEvidence(e.id)} className="text-slate-500 hover:text-red-400 p-1">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ROLES & PERMISSIONS MATRIX */}
      {activeTab === 'permissions' && (
        <div className="glassmorphism rounded-2xl p-6 border border-slate-700/50 space-y-6 shadow-2xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-100">Role Permissions Matrix</h2>
            <p className="text-xs text-slate-400">Configure feature access privileges for Admin, Investigator, Analyst, and Viewer roles</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Permission Feature</th>
                  <th className="py-3 px-3 text-center">Admin</th>
                  <th className="py-3 px-3 text-center">Investigator</th>
                  <th className="py-3 px-3 text-center">Analyst</th>
                  <th className="py-3 px-3 text-center">Viewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {[
                  { key: 'upload', name: 'Upload Evidence' },
                  { key: 'verify', name: 'Verify & Anchor On-Chain' },
                  { key: 'delete', name: 'Delete Evidence Records' },
                  { key: 'export', name: 'Generate PDF / Export Data' },
                  { key: 'manageUsers', name: 'Manage System Users' },
                  { key: 'manageCases', name: 'Manage Forensic Cases' }
                ].map((feature) => (
                  <tr key={feature.key} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-200">{feature.name}</td>
                    {['admin', 'investigator', 'analyst', 'viewer'].map((role) => (
                      <td key={role} className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={permissions[role]?.[feature.key] || false}
                          onChange={() => handlePermissionToggle(role, feature.key)}
                          className="w-4 h-4 rounded border-slate-700 bg-sentinel-dark-800 text-primary-600 focus:ring-primary-500 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM AUDIT STREAM */}
      {activeTab === 'audit' && (
        <div className="glassmorphism rounded-2xl p-6 border border-slate-700/50 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">System Security Audit Stream</h2>
              <p className="text-xs text-slate-400">Complete immutable audit logs of logins, uploads, verifications, and blockchain transactions</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">User Email</th>
                  <th className="py-3 px-3">IP Address</th>
                  <th className="py-3 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-500/15 text-primary-300 border border-primary-500/30">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-200">{log.userEmail}</td>
                    <td className="py-3 px-3 text-slate-400">{log.ipAddress || '192.168.1.105'}</td>
                    <td className="py-3 px-3 text-right text-slate-400 max-w-[200px] truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Add User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glassmorphism rounded-2xl p-6 border border-slate-700 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Create New System User</h3>
              <button onClick={() => setShowCreateUserModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="e.g. Agent Meera Nair"
                  className="w-full bg-sentinel-dark-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="meera@sentinelchain.ai"
                  className="w-full bg-sentinel-dark-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">System Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full bg-sentinel-dark-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-primary-500"
                  >
                    <option value="admin">Administrator</option>
                    <option value="investigator">Investigator</option>
                    <option value="analyst">Analyst</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Department</label>
                  <input
                    type="text"
                    value={newUserForm.department}
                    onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                    className="w-full bg-sentinel-dark-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg mt-2"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Case Modal */}
      {showCreateCaseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glassmorphism rounded-2xl p-6 border border-slate-700 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">Create Investigation Case</h3>
              <button onClick={() => setShowCreateCaseModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Case Title *</label>
                <input
                  type="text"
                  required
                  value={newCaseForm.title}
                  onChange={(e) => setNewCaseForm({ ...newCaseForm, title: e.target.value })}
                  placeholder="e.g. Ransomware Network Intrusion"
                  className="w-full bg-sentinel-dark-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Lead Investigator</label>
                  <input
                    type="text"
                    value={newCaseForm.leadInvestigator}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, leadInvestigator: e.target.value })}
                    className="w-full bg-sentinel-dark-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Priority</label>
                  <select
                    value={newCaseForm.priority}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, priority: e.target.value })}
                    className="w-full bg-sentinel-dark-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-primary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical Emergency</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg mt-2"
              >
                Create Case Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
