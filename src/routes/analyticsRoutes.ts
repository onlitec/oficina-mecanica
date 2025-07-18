import { Router } from 'express';
import { 
  getAnalyticsDashboard,
  getBusinessInsights
} from '../controllers/analyticsController';

const router = Router();

// GET /api/analytics/dashboard - Dashboard de analytics geral
router.get('/dashboard', getAnalyticsDashboard);

// GET /api/analytics/insights - Insights automáticos de negócio
router.get('/insights', getBusinessInsights);

export default router;
