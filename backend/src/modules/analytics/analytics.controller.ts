import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { z } from 'zod';

const analyticsService = new AnalyticsService();

const analyticsQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(365).optional().default(30),
  months: z.coerce.number().int().positive().max(60).optional().default(12),
  period: z.enum(['day', 'week', 'month', 'year']).optional().default('month')
});

export class AnalyticsController {
  async getPlatformOverview(req: Request, res: Response) {
    try {
      const data = await analyticsService.getPlatformOverview();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching platform overview:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch platform overview' 
      });
    }
  }

  async getUserGrowth(req: Request, res: Response) {
    try {
      const { days } = analyticsQuerySchema.parse(req.query);
      const data = await analyticsService.getUserGrowth(days);
      res.json({ success: true, data });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Validation error', 
          details: error.errors 
        });
      }
      console.error('Error fetching user growth:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch user growth data' 
      });
    }
  }

  async getApartmentGrowth(req: Request, res: Response) {
    try {
      const { days } = analyticsQuerySchema.parse(req.query);
      const data = await analyticsService.getApartmentGrowth(days);
      res.json({ success: true, data });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Validation error', 
          details: error.errors 
        });
      }
      console.error('Error fetching apartment growth:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch apartment growth data' 
      });
    }
  }

  async getRevenueData(req: Request, res: Response) {
    try {
      const { months } = analyticsQuerySchema.parse(req.query);
      const data = await analyticsService.getRevenueData(months);
      res.json({ success: true, data });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Validation error', 
          details: error.errors 
        });
      }
      console.error('Error fetching revenue data:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch revenue data' 
      });
    }
  }

  async getTopPerformers(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const data = await analyticsService.getTopPerformers(limit);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching top performers:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch top performers' 
      });
    }
  }

  async getGeographicDistribution(req: Request, res: Response) {
    try {
      const data = await analyticsService.getGeographicDistribution();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching geographic distribution:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch geographic distribution' 
      });
    }
  }

  async getUserEngagement(req: Request, res: Response) {
    try {
      const { days } = analyticsQuerySchema.parse(req.query);
      const data = await analyticsService.getUserEngagement(days);
      res.json({ success: true, data });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Validation error', 
          details: error.errors 
        });
      }
      console.error('Error fetching user engagement:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch user engagement data' 
      });
    }
  }

  async getListingPerformance(req: Request, res: Response) {
    try {
      const { period } = analyticsQuerySchema.parse(req.query);
      const data = await analyticsService.getListingPerformance(period);
      res.json({ success: true, data });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Validation error', 
          details: error.errors 
        });
      }
      console.error('Error fetching listing performance:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch listing performance data' 
      });
    }
  }

  async exportAnalytics(req: Request, res: Response) {
    try {
      const { type } = req.query;
      
      // Get all analytics data
      const [
        overview,
        userGrowth,
        apartmentGrowth,
        revenueData,
        topPerformers,
        userEngagement,
        listingPerformance
      ] = await Promise.all([
        analyticsService.getPlatformOverview(),
        analyticsService.getUserGrowth(365),
        analyticsService.getApartmentGrowth(365),
        analyticsService.getRevenueData(60),
        analyticsService.getTopPerformers(50),
        analyticsService.getUserEngagement(365),
        analyticsService.getListingPerformance('year')
      ]);

      const exportData = {
        overview,
        userGrowth,
        apartmentGrowth,
        revenueData,
        topPerformers,
        userEngagement,
        listingPerformance,
        exportedAt: new Date().toISOString()
      };

      if (type === 'csv') {
        // Convert to CSV (simplified)
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=analytics-export.csv');
        // Simplified CSV export logic would go here
        res.send('CSV export would be implemented here');
      } else {
        res.json({ success: true, data: exportData });
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to export analytics data' 
      });
    }
  }
}