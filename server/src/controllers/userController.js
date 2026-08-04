import crypto from 'crypto';
import { User } from '../models/index.js';
import { formatResponse } from '../utils/helpers.js';
import { recordAuditLog } from './auditController.js';

// In-memory fallback users store
export const memoryUserRegistry = [
  {
    id: 'a0000001-0000-0000-0000-000000000001',
    name: 'System Admin',
    email: 'admin@sentinelchain.ai',
    role: 'admin',
    department: 'Executive Security',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    isActive: true,
    createdAt: '2026-06-01T00:00:00.000Z'
  },
  {
    id: 'a0000002-0000-0000-0000-000000000002',
    name: 'Priya Sharma',
    email: 'investigator@sentinelchain.ai',
    role: 'investigator',
    department: 'Digital Forensics Division',
    walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    isActive: true,
    createdAt: '2026-06-15T00:00:00.000Z'
  },
  {
    id: 'a0000003-0000-0000-0000-000000000003',
    name: 'Rajesh Kumar',
    email: 'analyst@sentinelchain.ai',
    role: 'analyst',
    department: 'Cyber Intelligence Unit',
    walletAddress: '0x9876543210fedcba9876543210fedcba98765432',
    isActive: true,
    createdAt: '2026-07-01T00:00:00.000Z'
  },
  {
    id: 'a0000004-0000-0000-0000-000000000004',
    name: 'Auditor Inspector',
    email: 'viewer@sentinelchain.ai',
    role: 'viewer',
    department: 'External Compliance',
    walletAddress: '0x5555555555555555555555555555555555555555',
    isActive: true,
    createdAt: '2026-07-10T00:00:00.000Z'
  }
];

// In-memory cases store
export const memoryCaseStore = [
  {
    id: 'c0000001-0000-0000-0000-000000000001',
    caseId: 'SC-2026-00001',
    title: 'Financial Server Unauthorized Access Incident',
    leadInvestigator: 'Agent Priya Sharma',
    department: 'Digital Forensics Division',
    priority: 'high',
    status: 'open',
    evidenceCount: 4,
    createdAt: '2026-07-28T08:00:00.000Z'
  },
  {
    id: 'c0000002-0000-0000-0000-000000000002',
    caseId: 'SC-2026-00002',
    title: 'Executive Phishing Campaign Investigation',
    leadInvestigator: 'Agent Meera Nair',
    department: 'Email Forensics',
    priority: 'medium',
    status: 'open',
    evidenceCount: 2,
    createdAt: '2026-07-28T06:00:00.000Z'
  },
  {
    id: 'c0000003-0000-0000-0000-000000000003',
    caseId: 'SC-2026-00003',
    title: 'DDoS & Ransomware Network Traffic Analysis',
    leadInvestigator: 'Agent Rajesh Kumar',
    department: 'Network Incident Unit',
    priority: 'critical',
    status: 'in_progress',
    evidenceCount: 3,
    createdAt: '2026-07-28T04:00:00.000Z'
  }
];

// Default Role Permissions Matrix
export let rolePermissionsMatrix = {
  admin: { upload: true, verify: true, delete: true, export: true, manageUsers: true, manageCases: true, manageSystem: true },
  investigator: { upload: true, verify: true, delete: false, export: true, manageUsers: false, manageCases: true, manageSystem: false },
  analyst: { upload: false, verify: true, delete: false, export: true, manageUsers: false, manageCases: false, manageSystem: false },
  viewer: { upload: false, verify: false, delete: false, export: false, manageUsers: false, manageCases: false, manageSystem: false }
};

export const listUsers = async (req, res, next) => {
  try {
    let users = [];
    try {
      if (User && typeof User.findAll === 'function') {
        const dbUsers = await User.findAll({ attributes: { exclude: ['password'] } });
        if (dbUsers && dbUsers.length > 0) {
          users = dbUsers.map(u => u.toJSON ? u.toJSON() : u);
        }
      }
    } catch (e) {}

    if (users.length === 0) {
      users = [...memoryUserRegistry];
    }

    res.json(formatResponse(true, users));
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    let user = memoryUserRegistry.find(u => u.id === req.params.id);
    res.json(formatResponse(true, user || memoryUserRegistry[0]));
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, role = 'investigator', department = 'Forensics', walletAddress = '' } = req.body;
    if (!name || !email) {
      return res.status(400).json(formatResponse(false, null, 'Name and email are required'));
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase().trim(),
      role,
      department,
      walletAddress: walletAddress || ('0x' + crypto.randomBytes(20).toString('hex')),
      isActive: true,
      createdAt: new Date().toISOString()
    };

    memoryUserRegistry.unshift(newUser);

    recordAuditLog({
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: newUser.id,
      userId: req.user?.id,
      userEmail: req.user?.email || 'admin@sentinelchain.ai',
      userName: req.user?.name || 'System Admin',
      details: { createdUserEmail: newUser.email, role: newUser.role }
    }).catch(() => {});

    res.status(201).json(formatResponse(true, newUser, 'User created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const index = memoryUserRegistry.findIndex(u => u.id === req.params.id);
    const { name, role, department, isActive } = req.body;

    if (index !== -1) {
      if (name) memoryUserRegistry[index].name = name;
      if (role) memoryUserRegistry[index].role = role;
      if (department) memoryUserRegistry[index].department = department;
      if (isActive !== undefined) memoryUserRegistry[index].isActive = isActive;
    }

    recordAuditLog({
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: req.params.id,
      userId: req.user?.id,
      details: { updates: req.body }
    }).catch(() => {});

    res.json(formatResponse(true, memoryUserRegistry[index !== -1 ? index : 0], 'User updated'));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const index = memoryUserRegistry.findIndex(u => u.id === req.params.id);
    if (index !== -1) {
      memoryUserRegistry.splice(index, 1);
    }
    res.json(formatResponse(true, {}, 'User deleted'));
  } catch (error) {
    next(error);
  }
};

// Roles & Permissions Endpoints
export const getRolesAndPermissions = async (req, res) => {
  res.json(formatResponse(true, rolePermissionsMatrix));
};

export const updateRolePermissions = async (req, res) => {
  if (req.body && typeof req.body === 'object') {
    rolePermissionsMatrix = { ...rolePermissionsMatrix, ...req.body };
  }
  res.json(formatResponse(true, rolePermissionsMatrix, 'Role permissions matrix updated'));
};

// Cases Management Endpoints
export const getCases = async (req, res) => {
  res.json(formatResponse(true, memoryCaseStore));
};

export const createCase = async (req, res) => {
  const { title, leadInvestigator, department, priority = 'medium' } = req.body;
  const caseId = `SC-2026-${String(memoryCaseStore.length + 1).padStart(5, '0')}`;
  const newCase = {
    id: crypto.randomUUID(),
    caseId,
    title: title || 'New Forensic Investigation',
    leadInvestigator: leadInvestigator || 'Agent Priya Sharma',
    department: department || 'Digital Forensics Division',
    priority,
    status: 'open',
    evidenceCount: 0,
    createdAt: new Date().toISOString()
  };
  memoryCaseStore.unshift(newCase);
  res.status(201).json(formatResponse(true, newCase, 'Case created successfully'));
};

export const updateCase = async (req, res) => {
  const c = memoryCaseStore.find(item => item.id === req.params.id || item.caseId === req.params.id);
  if (c) {
    if (req.body.title) c.title = req.body.title;
    if (req.body.status) c.status = req.body.status;
    if (req.body.priority) c.priority = req.body.priority;
    if (req.body.leadInvestigator) c.leadInvestigator = req.body.leadInvestigator;
  }
  res.json(formatResponse(true, c || memoryCaseStore[0], 'Case record updated'));
};

export const deleteCase = async (req, res) => {
  const idx = memoryCaseStore.findIndex(item => item.id === req.params.id || item.caseId === req.params.id);
  if (idx !== -1) memoryCaseStore.splice(idx, 1);
  res.json(formatResponse(true, {}, 'Case deleted'));
};
