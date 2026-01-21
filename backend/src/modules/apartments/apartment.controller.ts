import { Request, Response } from 'express';
import { ApartmentService } from './apartment.service';
import { 
  apartmentCreateSchema, 
  apartmentUpdateSchema, 
  apartmentQuerySchema,
  ApartmentQueryInput 
} from './apartment.validators';
import { AuthRequest } from '../../middleware/auth';
import { UserRole } from '@prisma/client';

export class ApartmentController {
  private apartmentService: ApartmentService;

  constructor() {
    this.apartmentService = new ApartmentService();
  }

  // Create apartment (seller only)
  createApartment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Only SELLER can create apartments
      if (req.user.role !== UserRole.SELLER) {
        res.status(403).json({ error: 'Only sellers can create apartments' });
        return;
      }

      // Validate input
      const validatedData = apartmentCreateSchema.parse(req.body);
      
      // Get uploaded files
      const files = req.files as Express.Multer.File[];
      const imageFilenames = files ? files.map(file => file.filename) : [];

      // Create apartment
      const apartment = await this.apartmentService.createApartment(
        req.user.id,
        validatedData,
        imageFilenames
      );

      res.status(201).json({
        success: true,
        data: apartment
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to create apartment'
        });
      }
    }
  };

  // Update apartment
  updateApartment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const apartmentId = req.params.id;
      const validatedData = apartmentUpdateSchema.parse(req.body);

      const apartment = await this.apartmentService.updateApartment(
        apartmentId,
        req.user.id,
        req.user.role,
        validatedData
      );

      res.status(200).json({
        success: true,
        data: apartment
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to update apartment'
        });
      }
    }
  };

  // Delete apartment
  deleteApartment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const apartmentId = req.params.id;
      const result = await this.apartmentService.deleteApartment(
        apartmentId,
        req.user.id,
        req.user.role
      );

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to delete apartment'
        });
      }
    }
  };

  // Get apartment by ID
  getApartment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const apartmentId = req.params.id;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const apartment = await this.apartmentService.getApartmentById(
        apartmentId,
        userId,
        userRole
      );

      res.status(200).json({
        success: true,
        data: apartment
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get apartment'
        });
      }
    }
  };

  // List apartments with filtering
  listApartments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const validatedQuery = apartmentQuerySchema.parse(req.query);
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const result = await this.apartmentService.listApartments(
        validatedQuery as ApartmentQueryInput,
        userId,
        userRole
      );

      res.status(200).json({
        success: true,
        data: result.apartments,
        pagination: result.pagination
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to list apartments'
        });
      }
    }
  };

  // Get apartments by current seller
  getMyApartments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Only SELLER can see their own apartments
      if (req.user.role !== UserRole.SELLER) {
        res.status(403).json({ error: 'Only sellers can view their apartments' });
        return;
      }

      const includeHidden = req.query.includeHidden === 'true';
      const apartments = await this.apartmentService.getApartmentsBySeller(
        req.user.id,
        includeHidden
      );

      res.status(200).json({
        success: true,
        data: apartments
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get seller apartments'
        });
      }
    }
  };
}