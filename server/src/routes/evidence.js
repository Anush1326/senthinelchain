import express from 'express';
import { 
  getEvidences, 
  getEvidenceById, 
  createEvidence, 
  generateHashAndSave,
  updateEvidence, 
  deleteEvidence,
  verifyEvidence,
  getChainOfCustody
} from '../controllers/evidenceController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Dedicated SHA-256 Hashing Endpoint
router.post('/hash', upload.single('file'), generateHashAndSave);

router.route('/')
  .get(getEvidences)
  .post(protect, upload.single('file'), createEvidence);

router.route('/:id')
  .get(getEvidenceById)
  .put(protect, updateEvidence)
  .delete(protect, authorize('admin'), deleteEvidence);

router.post('/:id/verify', protect, authorize('admin', 'investigator'), verifyEvidence);
router.get('/:id/chain-of-custody', getChainOfCustody);

export default router;
