import express from 'express';
import { getAuditLogs, createAuditLog } from '../controllers/auditController.js';
import { optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getAuditLogs)
  .post(optionalProtect, createAuditLog);

export default router;
