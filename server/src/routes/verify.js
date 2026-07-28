import express from 'express';
import { verifyByHash, verifyOnBlockchain, checkTransactionStatus } from '../controllers/verifyController.js';

const router = express.Router();

router.post('/hash', verifyByHash);
router.post('/blockchain', verifyOnBlockchain);
router.get('/status/:txHash', checkTransactionStatus);

export default router;
