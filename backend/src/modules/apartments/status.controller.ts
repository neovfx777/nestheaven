import { Request, Response } from 'express';
import { StatusService } from './status.service';
import { changeStatusSchema, markAsSoldSchema } from './status.validators';
import { AuthRequest } from '../../middleware/auth';
import { UserRole } from '@prisma/client';

export class StatusController {
  private statusService: StatusService;

  constructor() {
    this.statusService = new StatusService();
  }

  // Change apartment status (general endpoint)
  changeStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const apartmentId = req.params.id;
      const validatedData = changeStatusSchema.parse(req.body);

      const updatedApartment = await this.statusService.changeStatus(
        apartmentId,
        req.user.id,
        req.user.role,
        validatedData
      );

      res.status(200).json({
        success: true,
        message: `Status changed to ${validatedData.status}`,
        data: updatedApartment
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
          error: 'Failed to change status'
        });
      }
    }
  };

  // Mark apartment as sold (seller-specific)
  markAsSold = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Only SELLER can use this endpoint
      if (req.user.role !== UserRole.SELLER) {
        res.status(403).json({ 
          error: 'Only sellers can mark apartments as sold using this endpoint' 
        });
        return;
      }

      const apartmentId = req.params.id;
      const validatedData = markAsSoldSchema.parse(req.body);

      const updatedApartment = await this.statusService.markAsSold(
        apartmentId,
        req.user.id,
        validatedData
      );

      res.status(200).json({
        success: true,
        message: 'Apartment marked as sold',
        data: updatedApartment
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
          error: 'Failed to mark as sold'
        });
      }
    }
  };

  // Get status history
  getStatusHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const apartmentId = req.params.id;
      const history = await this.statusService.getStatusHistory(
        apartmentId,
        req.user.id,
        req.user.role
      );

      res.status(200).json({
        success: true,
        data: history
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
          error: 'Failed to get status history'
        });
      }
    }
  };

  // Bulk status change (admin only)
  bulkChangeStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { apartmentIds, status, reason } = req.body;

      if (!Array.isArray(apartmentIds) || apartmentIds.length === 0) {
        res.status(400).json({ error: 'apartmentIds must be a non-empty array' });
        return;
      }

      if (!status) {
        res.status(400).json({ error: 'status is required' });
        return;
      }

      const result = await this.statusService.bulkChangeStatus(
        apartmentIds,
        req.user.id,
        req.user.role,
        status,
        reason
      );

      res.status(200).json({
        success: true,
        message: `Bulk status change completed: ${result.successful} successful, ${result.failed} failed`,
        data: result
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
          error: 'Failed to perform bulk status change'
        });
      }
    }
  };

  // Get available status transitions for current user
  getAvailableTransitions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const apartmentId = req.params.id;
      const apartment = await prisma.apartment.findUnique({
        where: { id: apartmentId },
        select: {
          id: true,
          status: true,
          sellerId: true,
        }
      });

      if (!apartment) {
        res.status(404).json({ error: 'Apartment not found' });
        return;
      }

      const isOwner = apartment.sellerId === req.user.id;
      const currentStatus = apartment.status;
      const userRole = req.user.role;

      const availableTransitions = [];

      // Define all possible statuses
      const allStatuses = Object.values(ApartmentStatus);

      // Check each possible transition
      for (const targetStatus of allStatuses) {
        if (targetStatus === currentStatus) continue;

        const transitionCheck = this.statusService['isValidTransition'](
          currentStatus,
          targetStatus,
          userRole,
          isOwner
        );

        if (transitionCheck.valid) {
          availableTransitions.push({
            from: currentStatus,
            to: targetStatus,
            allowed: true,
            description: this.getTransitionDescription(currentStatus, targetStatus, userRole)
          });
        }
      }

      res.status(200).json({
        success: true,
        data: {
          currentStatus,
          isOwner,
          userRole,
          availableTransitions
        }
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
          error: 'Failed to get available transitions'
        });
      }
    }
  };

  private getTransitionDescription(
    from: ApartmentStatus,
    to: ApartmentStatus,
    userRole: UserRole
  ): string {
    const descriptions: Record<string, string> = {
      'ACTIVE->SOLD': 'Mark apartment as sold',
      'ACTIVE->HIDDEN': 'Hide apartment from public view',
      'HIDDEN->ACTIVE': 'Unhide apartment (make visible)',
      'HIDDEN->SOLD': 'Mark hidden apartment as sold',
      'SOLD->HIDDEN': 'Hide sold apartment from listings',
    };

    const key = `${from}->${to}`;
    return descriptions[key] || `Change from ${from} to ${to}`;
  }
}

// Need to import prisma for the getAvailableTransitions method
import { prisma } from '../../config/db';