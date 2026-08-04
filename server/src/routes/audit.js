import express from 'express';
import { getAuditLogs, createAuditLog, getAuditLogsByEvidenceId } from '../controllers/auditController.js';
import { optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getAuditLogs)
  .post(optionalProtect, createAuditLog);

router.get('/evidence/:evidenceId', getAuditLogsByEvidenceId);

export default router;
