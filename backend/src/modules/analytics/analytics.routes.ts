import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';

const router = Router();
const controller = new AnalyticsController();

// All analytics routes require admin, manager, or owner roles
router.use(authenticate, requireRole(['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN']));

// Platform analytics
router.get('/overview', controller.getPlatformOverview.bind(controller));
router.get('/user-growth', controller.getUserGrowth.bind(controller));
router.get('/apartment-growth', controller.getApartmentGrowth.bind(controller));
router.get('/revenue', controller.getRevenueData.bind(controller));
router.get('/top-performers', controller.getTopPerformers.bind(controller));
router.get('/geographic', controller.getGeographicDistribution.bind(controller));
router.get('/user-engagement', controller.getUserEngagement.bind(controller));
router.get('/listing-performance', controller.getListingPerformance.bind(controller));

// Export
router.get('/export', controller.exportAnalytics.bind(controller));

export default router;