import express from 'express';
import { getDashboardStats, getTrends, getCategoryBreakdown, getActivityFeed } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/trends', getTrends);
router.get('/categories', getCategoryBreakdown);
router.get('/activity', getActivityFeed);

export default router;
