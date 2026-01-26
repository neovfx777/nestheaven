import { Request, Response } from 'express';
import { z } from 'zod';
import { ComplexService } from './complex.service';
import { OtherApartmentsService } from './other-apartments.service';
import { 
  complexCreateSchema, 
  complexUpdateSchema, 
  complexQuerySchema,
  otherApartmentsQuerySchema,
  complexFiltersSchema
} from './complex.validators';
import { AuthRequest } from '../../middleware/auth';

export class ComplexController {
  private complexService: ComplexService;
  private otherApartmentsService: OtherApartmentsService;

  constructor() {
    this.complexService = new ComplexService();
    this.otherApartmentsService = new OtherApartmentsService();
  }

  // ===== Route-compatible methods =====

  // GET /complexes
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedQuery = complexQuerySchema.parse(req.query);
      const result = await this.complexService.listComplexes(validatedQuery);
      res.status(200).json({ 
        success: true, 
        data: result.complexes, 
        pagination: result.pagination 
      });
    } catch (error) {
      this.handleError(error, res, 'Failed to list complexes');
    }
  };

  // GET /complexes/search
  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchTerm = req.query.q as string;
      if (!searchTerm || searchTerm.trim().length < 2) {
        res.status(400).json({ 
          success: false, 
          error: 'Search term must be at least 2 characters' 
        });
        return;
      }
      const limit = parseInt(req.query.limit as string) || 10;
      const complexes = await this.complexService.searchComplexes(searchTerm, limit);
      res.status(200).json({ success: true, data: complexes });
    } catch (error) {
      this.handleError(error, res, 'Failed to search complexes');
    }
  };

  // GET /complexes/:id
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const complexId = req.params.id;
      const includeApartments = req.query.includeApartments === 'true';
      const complex = await this.complexService.getComplexById(complexId, includeApartments);
      res.status(200).json({ success: true, data: complex });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Failed to get complex' });
      }
    }
  };

  // GET /complexes/:id/apartments
  getOtherApartments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const complexId = req.params.id;
      const result = await this.otherApartmentsService.getApartmentsByComplexId(
        complexId, 
        {
          limit: parseInt(req.query.limit as string) || 20,
          status: req.query.status as any,
          userId: req.user?.id,
          userRole: req.user?.role,
        }
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res, 'Failed to get other apartments');
    }
  };

  // GET /complexes/:id/stats
  getComplexStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const complexId = req.params.id;
      const statistics = await this.otherApartmentsService.getComplexStatistics(complexId);
      res.status(200).json({ success: true, data: statistics });
    } catch (error) {
      this.handleError(error, res, 'Failed to get complex statistics');
    }
  };

  // POST /complexes
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = complexCreateSchema.parse(req.body);
      const complex = await this.complexService.createComplex(validatedData);
      res.status(201).json({ success: true, data: complex });
    } catch (error) {
      this.handleError(error, res, 'Failed to create complex');
    }
  };

  // PUT /complexes/:id
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const complexId = req.params.id;
      const validatedData = complexUpdateSchema.parse(req.body);
      const complex = await this.complexService.updateComplex(complexId, validatedData);
      res.status(200).json({ success: true, data: complex });
    } catch (error) {
      this.handleError(error, res, 'Failed to update complex');
    }
  };

  // DELETE /complexes/:id
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const complexId = req.params.id;
      const result = await this.complexService.deleteComplex(complexId);
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res, 'Failed to delete complex');
    }
  };

  // ===== Additional routes =====

  // GET /complexes/apartments/:apartmentId/other
  getOtherApartmentsByApartmentId = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const apartmentId = req.params.apartmentId;
      const validatedQuery = otherApartmentsQuerySchema.parse({ 
        excludeApartmentId: apartmentId, 
        ...req.query 
      });
      const result = await this.otherApartmentsService.getOtherApartmentsInComplex(apartmentId, validatedQuery);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      this.handleError(error, res, 'Failed to get other apartments');
    }
  };

  // GET /complexes/admin/filtered
  getComplexesWithFilters = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = await complexFiltersSchema.parseAsync(req.query);
      const result = await this.complexService.findComplexesWithFilters(filters);
      res.json({ success: true, data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          error: 'Validation error', 
          details: error.errors 
        });
      } else {
        console.error('Error fetching filtered complexes:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Failed to fetch complexes' 
        });
      }
    }
  };

  // GET /complexes/admin/stats (overall platform stats)
  getAdminStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.complexService.getComplexesWithStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error fetching complex stats:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch complex statistics' 
      });
    }
  };

  // ===== Helper methods =====

  // Alias for backward compatibility
  listComplexes = this.getAll;
  searchComplexes = this.search;
  getComplex = this.getById;
  getComplexStatistics = this.getComplexStats;
  createComplex = this.create;
  updateComplex = this.update;
  deleteComplex = this.delete;

  // Centralized error handler
  private handleError(error: unknown, res: Response, defaultMessage: string): void {
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      console.error(defaultMessage, error);
      res.status(500).json({ success: false, error: defaultMessage });
    }
  }
}