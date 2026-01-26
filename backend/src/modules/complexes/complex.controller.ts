import { Request, Response } from 'express';
import { z } from 'zod';
import { ComplexService } from './complex.service';
import { OtherApartmentsService } from './other-apartments.service';
import { 
  complexCreateSchema, 
  complexUpdateSchema, 
  complexQuerySchema,
  otherApartmentsQuerySchema,
  complexFiltersSchema // make sure this schema exists for filters
} from './complex.validators';
import { AuthRequest } from '../../middleware/auth';

export class ComplexController {
  private complexService: ComplexService;
  private otherApartmentsService: OtherApartmentsService;

  constructor() {
    this.complexService = new ComplexService();
    this.otherApartmentsService = new OtherApartmentsService();
  }

  // Create complex
  createComplex = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = complexCreateSchema.parse(req.body);
      const complex = await this.complexService.createComplex(validatedData);

      res.status(201).json({ success: true, data: complex });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Failed to create complex' });
      }
    }
  };

  // Update complex
  updateComplex = async (req: Request, res: Response): Promise<void> => {
    try {
      const complexId = req.params.id;
      const validatedData = complexUpdateSchema.parse(req.body);
      const complex = await this.complexService.updateComplex(complexId, validatedData);

      res.status(200).json({ success: true, data: complex });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Failed to update complex' });
      }
    }
  };

  // Delete complex
  deleteComplex = async (req: Request, res: Response): Promise<void> => {
    try {
      const complexId = req.params.id;
      const result = await this.complexService.deleteComplex(complexId);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Failed to delete complex' });
      }
    }
  };

  // Get complex by ID
  getComplex = async (req: Request, res: Response): Promise<void> => {
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

  // List complexes
  listComplexes = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedQuery = complexQuerySchema.parse(req.query);
      const result = await this.complexService.listComplexes(validatedQuery);

      res.status(200).json({ success: true, data: result.complexes, pagination: result.pagination });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Failed to list complexes' });
      }
    }
  };

  // Get complexes with statistics
  getComplexesWithStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const complexes = await this.complexService.getComplexesWithStats();
      res.status(200).json({ success: true, data: complexes });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Failed to get complex statistics' });
      }
    }
  };

  // Get other apartments in same complex
  getOtherApartments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const apartmentId = req.params.apartmentId;
      const validatedQuery = otherApartmentsQuerySchema.parse({ excludeApartmentId: apartmentId, ...req.query });
      const result = await this.otherApartmentsService.getOtherApartmentsInComplex(apartmentId, validatedQuery);

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Failed to get other apartments' });
      }
    }
  };

  // Get apartments by complex ID
  getApartmentsByComplex = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const complexId = req.params.complexId;
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const result = await this.otherApartmentsService.getApartmentsByComplexId(complexId, {
        limit: parseInt(req.query.limit as string) || 20,
        status: req.query.status as any,
        userId,
        userRole,
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Failed to get complex apartments' });
      }
    }
  };

  // Get complex statistics (for apartments)
  getComplexStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const complexId = req.params.complexId;
      const statistics = await this.otherApartmentsService.getComplexStatistics(complexId);
      res.status(200).json({ success: true, data: statistics });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Failed to get complex statistics' });
      }
    }
  };

  // Search complexes
  searchComplexes = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchTerm = req.query.q as string;
      if (!searchTerm || searchTerm.trim().length < 2) {
        res.status(400).json({ success: false, error: 'Search term must be at least 2 characters' });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const complexes = await this.complexService.searchComplexes(searchTerm, limit);

      res.status(200).json({ success: true, data: complexes });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Failed to search complexes' });
      }
    }
  };

  // === NEW METHODS MERGED ===

  // Get overall complex stats
  getComplexStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.complexService.getComplexStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error fetching complex stats:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch complex statistics' });
    }
  };

  // Get complexes with filters
  getComplexesWithFilters = async (req: Request, res: Response) => {
    try {
      const filters = await complexFiltersSchema.parseAsync(req.query);
      const result = await this.complexService.findComplexesWithFilters(filters);
      res.json({ success: true, data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
      }
      console.error('Error fetching filtered complexes:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch complexes' });
    }
  };
}
