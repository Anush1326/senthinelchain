import crypto from 'crypto';
import { AuditLog } from '../models/index.js';
import { formatResponse, paginate } from '../utils/helpers.js';

// Pre-populated initial in-memory audit logs store for standalone/dev mode
export const memoryAuditStore = [
  {
    id: 'a1000001-0000-0000-0000-000000000001',
    action: 'EVIDENCE_UPLOADED',
    entityType: 'Evidence',
    entityId: 'e0000001-0000-0000-0000-000000000001',
    userId: 'a0000002-0000-0000-0000-000000000002',
    userEmail: 'investigator@sentinelchain.ai',
    userName: 'Agent Priya Sharma',
    details: {
      title: 'Server Incident Access Logs – June 2026',
      caseId: 'SC-2026-00001',
      fileHash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
      ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
    },
    ipAddress: '192.168.1.105',
    createdAt: '2026-08-04T09:30:00.000Z'
  },
  {
    id: 'a1000002-0000-0000-0000-000000000002',
    action: 'BLOCKCHAIN_TRANSACTION',
    entityType: 'Blockchain',
    entityId: '0xabc123def456789abc123def456789abc123def456789abc123def456789abcd01',
    userId: 'a0000002-0000-0000-0000-000000000002',
    userEmail: 'investigator@sentinelchain.ai',
    userName: 'Agent Priya Sharma',
    details: {
      network: 'Polygon Amoy Testnet',
      blockNumber: 48521000,
      contractAddress: '0x32A4B8c90123D4e5678901234567890123456789'
    },
    ipAddress: '192.168.1.105',
    createdAt: '2026-08-04T09:31:15.000Z'
  },
  {
    id: 'a1000003-0000-0000-0000-000000000003',
    action: 'EVIDENCE_VERIFIED',
    entityType: 'Evidence',
    entityId: 'e0000001-0000-0000-0000-000000000001',
    userId: 'a0000001-0000-0000-0000-000000000001',
    userEmail: 'admin@sentinelchain.ai',
    userName: 'System Admin',
    details: {
      status: 'VERIFIED',
      verificationMethod: 'Polygon Amoy SHA-256 On-Chain Match'
    },
    ipAddress: '127.0.0.1',
    createdAt: '2026-08-04T09:35:00.000Z'
  },
  {
    id: 'a1000004-0000-0000-0000-000000000004',
    action: 'EVIDENCE_VIEWED',
    entityType: 'Evidence',
    entityId: 'e0000001-0000-0000-0000-000000000001',
    userId: 'a0000002-0000-0000-0000-000000000002',
    userEmail: 'investigator@sentinelchain.ai',
    userName: 'Agent Priya Sharma',
    details: {
      title: 'Server Incident Access Logs'
    },
    ipAddress: '192.168.1.105',
    createdAt: '2026-08-04T09:40:00.000Z'
  },
  {
    id: 'a1000005-0000-0000-0000-000000000005',
    action: 'EVIDENCE_DOWNLOADED',
    entityType: 'Evidence',
    entityId: 'e0000001-0000-0000-0000-000000000001',
    userId: 'a0000002-0000-0000-0000-000000000002',
    userEmail: 'investigator@sentinelchain.ai',
    userName: 'Agent Priya Sharma',
    details: {
      fileFormat: 'log',
      sizeBytes: 15728640
    },
    ipAddress: '192.168.1.105',
    createdAt: '2026-08-04T09:42:00.000Z'
  },
  {
    id: 'a1000006-0000-0000-0000-000000000006',
    action: 'USER_LOGIN',
    entityType: 'Auth',
    entityId: 'a0000002-0000-0000-0000-000000000002',
    userId: 'a0000002-0000-0000-0000-000000000002',
    userEmail: 'investigator@sentinelchain.ai',
    userName: 'Agent Priya Sharma',
    details: {
      authMethod: 'JWT Bearer Token',
      role: 'investigator'
    },
    ipAddress: '192.168.1.105',
    createdAt: '2026-08-04T09:45:00.000Z'
  },
  {
    id: 'a1000007-0000-0000-0000-000000000007',
    action: 'USER_LOGOUT',
    entityType: 'Auth',
    entityId: 'a0000002-0000-0000-0000-000000000002',
    userId: 'a0000002-0000-0000-0000-000000000002',
    userEmail: 'investigator@sentinelchain.ai',
    userName: 'Agent Priya Sharma',
    details: {
      sessionDuration: '1h 15m'
    },
    ipAddress: '192.168.1.105',
    createdAt: '2026-08-04T09:50:00.000Z'
  }
];

/**
 * Helper function to record audit log events across controllers
 */
export const recordAuditLog = async ({
  action,
  entityType = 'General',
  entityId = 'N/A',
  userId = null,
  userEmail = 'anonymous@sentinelchain.ai',
  userName = 'System User',
  details = {},
  ipAddress = '127.0.0.1'
}) => {
  const logEntry = {
    id: crypto.randomUUID(),
    action,
    entityType,
    entityId: String(entityId),
    userId: userId || 'a0000002-0000-0000-0000-000000000002',
    userEmail,
    userName,
    details,
    ipAddress,
    createdAt: new Date().toISOString()
  };

  // Add to memory store
  memoryAuditStore.unshift(logEntry);

  // Try PostgreSQL persistence
  try {
    if (AuditLog && typeof AuditLog.create === 'function') {
      await AuditLog.create({
        id: logEntry.id,
        action: logEntry.action,
        entityType: logEntry.entityType,
        entityId: logEntry.entityId,
        userId: logEntry.userId,
        details: { ...logEntry.details, userEmail, userName },
        ipAddress: logEntry.ipAddress
      });
    }
  } catch (err) {
    // Ignore DB offline error
  }

  return logEntry;
};

/**
 * Get audit logs list with search and action filtering
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, search, page = 1, limit = 50 } = req.query;

    let logs = [...memoryAuditStore];

    try {
      if (AuditLog && typeof AuditLog.findAndCountAll === 'function') {
        const query = {};
        if (action && action !== 'ALL') {
          query.action = action;
        }
        const dbLogs = await AuditLog.findAndCountAll({
          where: query,
          order: [['createdAt', 'DESC']],
          limit: parseInt(limit),
          offset: (parseInt(page) - 1) * parseInt(limit)
        });
        if (dbLogs && dbLogs.rows && dbLogs.rows.length > 0) {
          logs = dbLogs.rows.map(row => ({
            id: row.id,
            action: row.action,
            entityType: row.entityType,
            entityId: row.entityId,
            userId: row.userId,
            userEmail: row.details?.userEmail || 'investigator@sentinelchain.ai',
            userName: row.details?.userName || 'Agent Priya Sharma',
            details: row.details || {},
            ipAddress: row.ipAddress || '127.0.0.1',
            createdAt: row.createdAt
          }));
        }
      }
    } catch (e) {
      // Memory fallback used
    }

    // Filter by action
    if (action && action !== 'ALL') {
      logs = logs.filter(l => l.action.toUpperCase() === action.toUpperCase());
    }

    // Filter by search term
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      logs = logs.filter(l =>
        l.action.toLowerCase().includes(q) ||
        l.userEmail.toLowerCase().includes(q) ||
        l.userName.toLowerCase().includes(q) ||
        l.entityId.toLowerCase().includes(q) ||
        l.ipAddress.toLowerCase().includes(q) ||
        JSON.stringify(l.details).toLowerCase().includes(q)
      );
    }

    res.json(formatResponse(true, {
      total: logs.length,
      page: parseInt(page),
      limit: parseInt(limit),
      data: logs
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * Create audit log endpoint
 */
export const createAuditLog = async (req, res, next) => {
  try {
    const { action, entityType, entityId, details } = req.body;
    if (!action) {
      return res.status(400).json(formatResponse(false, null, 'Action name is required'));
    }

    const log = await recordAuditLog({
      action,
      entityType: entityType || 'General',
      entityId: entityId || 'N/A',
      userId: req.user?.id,
      userEmail: req.user?.email || 'investigator@sentinelchain.ai',
      userName: req.user?.name || 'Agent Priya Sharma',
      details: details || {},
      ipAddress: req.ip || '127.0.0.1'
    });

    res.status(201).json(formatResponse(true, log, 'Audit log recorded'));
  } catch (error) {
    next(error);
  }
};
