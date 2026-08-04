import express from 'express';
import { 
  getEvidences, 
  getEvidenceById, 
  createEvidence, 
  generateHashAndSave,
  updateEvidence, 
  deleteEvidence,
  verifyEvidence,
  getChainOfCustody,
  downloadEvidence,
  getAttackScenarios,
  simulateAttack,
  getAttackHistory,
  clearAttackHistory
} from '../controllers/evidenceController.js';
import { protect, optionalProtect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Attack Simulation Endpoints
router.get('/attack-scenarios', getAttackScenarios);
router.post('/simulate-attack', optionalProtect, simulateAttack);
router.get('/attack-history', getAttackHistory);
router.delete('/attack-history', optionalProtect, clearAttackHistory);

// Dedicated SHA-256 Hashing Endpoint
router.post('/hash', upload.single('file'), generateHashAndSave);

router.route('/')
  .get(getEvidences)
  .post(optionalProtect, upload.single('file'), createEvidence);

router.route('/:id')
  .get(getEvidenceById)
  .put(protect, updateEvidence)
  .delete(protect, authorize('admin'), deleteEvidence);

router.get('/:id/download', optionalProtect, downloadEvidence);
router.post('/:id/verify', protect, authorize('admin', 'investigator'), verifyEvidence);
router.get('/:id/chain-of-custody', getChainOfCustody);

export default router;
