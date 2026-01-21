import { ApartmentStatus, UserRole } from '@prisma/client';
import { prisma } from '../../config/db';
import { ChangeStatusInput, MarkAsSoldInput } from './status.validators';

export class StatusService {
  // Check if a status transition is valid
  private isValidTransition(
    fromStatus: ApartmentStatus,
    toStatus: ApartmentStatus,
    userRole: UserRole,
    isOwner: boolean
  ): { valid: boolean; message?: string } {
    
    // SELLER can only mark their own as SOLD (from ACTIVE to SOLD)
    if (userRole === UserRole.SELLER) {
      if (fromStatus === ApartmentStatus.ACTIVE && toStatus === ApartmentStatus.SOLD) {
        return { valid: true };
      }
      return { 
        valid: false, 
        message: 'Sellers can only mark ACTIVE apartments as SOLD' 
      };
    }

    // ADMIN/MANAGER/OWNER can do various transitions
    if ([UserRole.ADMIN, UserRole.MANAGER_ADMIN, UserRole.OWNER_ADMIN].includes(userRole)) {
      // Can HIDE/UNHIDE any apartment
      if (
        (fromStatus === ApartmentStatus.ACTIVE && toStatus === ApartmentStatus.HIDDEN) ||
        (fromStatus === ApartmentStatus.HIDDEN && toStatus === ApartmentStatus.ACTIVE) ||
        (fromStatus === ApartmentStatus.SOLD && toStatus === ApartmentStatus.HIDDEN) ||
        (fromStatus === ApartmentStatus.HIDDEN && toStatus === ApartmentStatus.SOLD)
      ) {
        return { valid: true };
      }

      // Can mark HIDDEN as SOLD (admin marking a hidden apartment as sold)
      if (fromStatus === ApartmentStatus.HIDDEN && toStatus === ApartmentStatus.SOLD) {
        return { valid: true };
      }

      // Cannot mark SOLD as ACTIVE (once sold, stays sold)
      if (fromStatus === ApartmentStatus.SOLD && toStatus === ApartmentStatus.ACTIVE) {
        return { 
          valid: false, 
          message: 'Cannot reactivate a SOLD apartment' 
        };
      }
    }

    // USER cannot change status
    if (userRole === UserRole.USER) {
      return { 
        valid: false, 
        message: 'Users cannot change apartment status' 
      };
    }

    return { 
      valid: false, 
      message: `Invalid status transition: ${fromStatus} -> ${toStatus}` 
    };
  }

  // Change apartment status
  async changeStatus(
    apartmentId: string,
    userId: string,
    userRole: UserRole,
    input: ChangeStatusInput
  ) {
    // Get apartment with current status
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            fullName: true,
          }
        }
      }
    });

    if (!apartment) {
      throw new Error('Apartment not found');
    }

    const isOwner = apartment.sellerId === userId;

    // Check permission based on role
    if (userRole === UserRole.SELLER && !isOwner) {
      throw new Error('Sellers can only change status of their own apartments');
    }

    // Validate status transition
    const transitionCheck = this.isValidTransition(
      apartment.status,
      input.status,
      userRole,
      isOwner
    );

    if (!transitionCheck.valid) {
      throw new Error(transitionCheck.message);
    }

    // Special handling for SOLD status
    let updateData: any = { status: input.status };
    
    if (input.status === ApartmentStatus.SOLD) {
      updateData.soldAt = new Date();
    } else if (input.status === ApartmentStatus.HIDDEN) {
      updateData.hiddenAt = new Date();
      updateData.hiddenById = userId;
    } else if (input.status === ApartmentStatus.ACTIVE && apartment.status === ApartmentStatus.HIDDEN) {
      // When unhiding, clear hidden info
      updateData.hiddenAt = null;
      updateData.hiddenById = null;
    }

    // Update apartment status
    const updatedApartment = await prisma.apartment.update({
      where: { id: apartmentId },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            fullName: true,
          }
        },
        hiddenBy: input.status === ApartmentStatus.HIDDEN ? {
          select: {
            id: true,
            email: true,
            fullName: true,
          }
        } : undefined,
      }
    });

    // Log status change
    await prisma.apartmentStatusLog.create({
      data: {
        apartmentId,
        fromStatus: apartment.status,
        toStatus: input.status,
        changedById: userId,
        reason: input.reason,
        notes: input.notes,
      }
    });

    return updatedApartment;
  }

  // Mark apartment as sold (seller-specific endpoint with additional data)
  async markAsSold(
    apartmentId: string,
    sellerId: string,
    input: MarkAsSoldInput
  ) {
    const apartment = await prisma.apartment.findUnique({
      where: { 
        id: apartmentId,
        sellerId, // Ensure seller owns this apartment
        status: ApartmentStatus.ACTIVE // Must be active to mark as sold
      }
    });

    if (!apartment) {
      throw new Error('Apartment not found or not eligible for marking as sold');
    }

    const updateData: any = {
      status: ApartmentStatus.SOLD,
      soldAt: new Date(),
    };

    // Add optional sold information
    if (input.soldPrice) updateData.soldPrice = input.soldPrice;
    if (input.soldTo) updateData.soldTo = input.soldTo;
    if (input.soldNotes) updateData.soldNotes = input.soldNotes;
    if (input.soldAt) updateData.soldAt = new Date(input.soldAt);

    const updatedApartment = await prisma.apartment.update({
      where: { id: apartmentId },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            fullName: true,
          }
        }
      }
    });

    // Log status change
    await prisma.apartmentStatusLog.create({
      data: {
        apartmentId,
        fromStatus: ApartmentStatus.ACTIVE,
        toStatus: ApartmentStatus.SOLD,
        changedById: sellerId,
        reason: 'Marked as sold by seller',
        notes: input.soldNotes || `Sold to: ${input.soldTo || 'Unknown'}, Price: ${input.soldPrice || apartment.price}`,
      }
    });

    return updatedApartment;
  }

  // Get status history for an apartment
  async getStatusHistory(apartmentId: string, userId: string, userRole: UserRole) {
    // Check permissions
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      select: {
        sellerId: true,
        status: true,
      }
    });

    if (!apartment) {
      throw new Error('Apartment not found');
    }

    const isOwner = apartment.sellerId === userId;
    const isAdmin = [UserRole.ADMIN, UserRole.MANAGER_ADMIN, UserRole.OWNER_ADMIN].includes(userRole);

    // Only seller or admin can view status history
    if (!isOwner && !isAdmin) {
      throw new Error('Not authorized to view status history');
    }

    const history = await prisma.apartmentStatusLog.findMany({
      where: { apartmentId },
      include: {
        changedBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return history;
  }

  // Bulk status change for admin (hide/unhide multiple)
  async bulkChangeStatus(
    apartmentIds: string[],
    userId: string,
    userRole: UserRole,
    status: ApartmentStatus,
    reason?: string
  ) {
    // Only admins can do bulk operations
    if (![UserRole.ADMIN, UserRole.MANAGER_ADMIN, UserRole.OWNER_ADMIN].includes(userRole)) {
      throw new Error('Only admins can perform bulk status changes');
    }

    // Validate status for bulk operations (only HIDDEN/ACTIVE allowed)
    if (status === ApartmentStatus.SOLD) {
      throw new Error('Cannot bulk mark as SOLD. Use individual endpoint.');
    }

    const results = await prisma.$transaction(async (tx) => {
      const updates = [];
      const logs = [];

      for (const apartmentId of apartmentIds) {
        const apartment = await tx.apartment.findUnique({
          where: { id: apartmentId }
        });

        if (!apartment) {
          updates.push({ id: apartmentId, success: false, error: 'Apartment not found' });
          continue;
        }

        // Validate transition
        const transitionCheck = this.isValidTransition(
          apartment.status,
          status,
          userRole,
          false // Bulk operations are admin-only, not owner-specific
        );

        if (!transitionCheck.valid) {
          updates.push({ 
            id: apartmentId, 
            success: false, 
            error: transitionCheck.message 
          });
          continue;
        }

        // Prepare update data
        const updateData: any = { status };
        
        if (status === ApartmentStatus.HIDDEN) {
          updateData.hiddenAt = new Date();
          updateData.hiddenById = userId;
        } else if (status === ApartmentStatus.ACTIVE && apartment.status === ApartmentStatus.HIDDEN) {
          updateData.hiddenAt = null;
          updateData.hiddenById = null;
        }

        // Update apartment
        try {
          const updated = await tx.apartment.update({
            where: { id: apartmentId },
            data: updateData
          });

          // Create log
          await tx.apartmentStatusLog.create({
            data: {
              apartmentId,
              fromStatus: apartment.status,
              toStatus: status,
              changedById: userId,
              reason: reason || 'Bulk status change',
              notes: `Bulk operation affecting ${apartmentIds.length} apartments`,
            }
          });

          updates.push({ id: apartmentId, success: true, apartment: updated });
        } catch (error) {
          updates.push({ id: apartmentId, success: false, error: 'Update failed' });
        }
      }

      return updates;
    });

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      details: results
    };
  }
}