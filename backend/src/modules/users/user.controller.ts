import { Request, Response } from 'express';
import { UserService } from './user.service';
import { saveFavoriteSchema, saveSearchSchema, updateSavedSearchSchema } from './user.validators';
import { AuthRequest } from '../../middleware/auth';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Add to favorites
  addFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const validatedData = saveFavoriteSchema.parse(req.body);
      const favorite = await this.userService.addFavorite(req.user.id, validatedData);

      res.status(201).json({
        success: true,
        data: favorite,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to add favorite',
        });
      }
    }
  };

  // Remove from favorites
  removeFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { apartmentId } = req.params;
      const result = await this.userService.removeFavorite(req.user.id, apartmentId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to remove favorite',
        });
      }
    }
  };

  // Get user favorites
  getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this.userService.getFavorites(req.user.id, page, limit);

      res.status(200).json({
        success: true,
        data: result.apartments,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get favorites',
        });
      }
    }
  };

  // Save search
  saveSearch = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const validatedData = saveSearchSchema.parse(req.body);
      const savedSearch = await this.userService.saveSearch(req.user.id, validatedData);

      res.status(201).json({
        success: true,
        data: savedSearch,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to save search',
        });
      }
    }
  };

  // Get saved searches
  getSavedSearches = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const savedSearches = await this.userService.getSavedSearches(req.user.id);

      res.status(200).json({
        success: true,
        data: savedSearches,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get saved searches',
        });
      }
    }
  };

  // Update saved search
  updateSavedSearch = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const validatedData = updateSavedSearchSchema.parse(req.body);
      const updatedSearch = await this.userService.updateSavedSearch(req.user.id, id, validatedData);

      res.status(200).json({
        success: true,
        data: updatedSearch,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to update saved search',
        });
      }
    }
  };

  // Delete saved search
  deleteSavedSearch = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const result = await this.userService.deleteSavedSearch(req.user.id, id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to delete saved search',
        });
      }
    }
  };

  // Update last used time
  updateLastUsed = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const updatedSearch = await this.userService.updateLastUsed(req.user.id, id);

      res.status(200).json({
        success: true,
        data: updatedSearch,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to update last used time',
        });
      }
    }
  };

  // Check favorite status
  checkFavoriteStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { apartmentId } = req.params;
      const isFavorite = await this.userService.isFavorite(req.user.id, apartmentId);

      res.status(200).json({
        success: true,
        data: { isFavorite },
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to check favorite status',
        });
      }
    }
  };

  // Batch check favorite status
  batchCheckFavoriteStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { apartmentIds } = req.body;

      if (!Array.isArray(apartmentIds)) {
        res.status(400).json({ error: 'apartmentIds must be an array' });
        return;
      }

      const favoriteStatus = await this.userService.getFavoriteStatus(req.user.id, apartmentIds);

      res.status(200).json({
        success: true,
        data: favoriteStatus,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to check favorite status',
        });
      }
    }
  };
}