import { Router } from 'express';
import AnalyticsController from './analytics.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';

const router = Router();

// Initialize controller lazily to avoid circular dependencies
let controller: AnalyticsController | null = null;

const getController = (): AnalyticsController => {
  if (!controller) {
    controller = new AnalyticsController();
  }
  return controller;
};

// All analytics routes require admin, manager, or owner roles
router.use(authenticate, requireRole(['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN']));

// Platform analytics
router.get('/overview', (req, res) => getController().getPlatformOverview(req, res));
router.get('/user-growth', (req, res) => getController().getUserGrowth(req, res));
router.get('/apartment-growth', (req, res) => getController().getApartmentGrowth(req, res));
router.get('/revenue', (req, res) => getController().getRevenueData(req, res));
router.get('/top-performers', (req, res) => getController().getTopPerformers(req, res));
router.get('/geographic', (req, res) => getController().getGeographicDistribution(req, res));
router.get('/user-engagement', (req, res) => getController().getUserEngagement(req, res));
router.get('/listing-performance', (req, res) => getController().getListingPerformance(req, res));

// Export
router.get('/export', (req, res) => getController().exportAnalytics(req, res));

export default router;