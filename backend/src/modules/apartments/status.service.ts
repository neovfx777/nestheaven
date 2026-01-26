import { db } from '../../config/db';
import { ApartmentStatus, UserRole } from '@prisma/client';
import { ChangeStatusInput, MarkAsSoldInput } from './status.validators';

export class StatusService {
  private prisma = db;

  constructor() {}

  // General status change
  async changeStatus(
    apartmentId: string,
    userId: string,
    userRole: UserRole,
    data: ChangeStatusInput
  ) {
    const apartment = await this.prisma.apartment.findUnique({
      where: { id: apartmentId },
      include: { seller: true }
    });

    if (!apartment) {
      throw new Error('Apartment not found');
    }

    // Validate transition
    const isValid = this.isValidTransition(
      apartment.status,
      data.status,
      userRole,
      apartment.sellerId === userId
    );

    if (!isValid.valid) {
      throw new Error(isValid.error);
    }

    // Update apartment
    const updatedApartment = await this.prisma.apartment.update({
      where: { id: apartmentId },
      data: { status: data.status }
    });

    // Log the change
    await this.prisma.apartmentStatusLog.create({
      data: {
        apartmentId,
        fromStatus: apartment.status,
        toStatus: data.status,
        changedById: userId,
        reason: data.reason || `Changed by ${userRole}`,
      }
    });

    return updatedApartment;
  }

  // Seller-specific mark as sold
  async markAsSold(
    apartmentId: string,
    sellerId: string,
    data: MarkAsSoldInput
  ) {
    const apartment = await this.prisma.apartment.findUnique({
      where: { id: apartmentId }
    });

    if (!apartment) {
      throw new Error('Apartment not found');
    }

    if (apartment.sellerId !== sellerId) {
      throw new Error('You can only mark your own apartments as sold');
    }

    if (apartment.status !== 'ACTIVE') {
      throw new Error('Only active apartments can be marked as sold');
    }

    // Update apartment
    const updatedApartment = await this.prisma.apartment.update({
      where: { id: apartmentId },
      data: { 
        status: 'SOLD',
        // You might want to store sold info in a separate field
      }
    });

    // Log the sale
    await this.prisma.apartmentStatusLog.create({
      data: {
        apartmentId,
        fromStatus: apartment.status,
        toStatus: 'SOLD',
        changedById: sellerId,
        reason: data.soldNotes || `Sold to ${data.soldTo || 'buyer'}`,
      }
    });

    return updatedApartment;
  }

  // Get status history
  async getStatusHistory(
    apartmentId: string,
    userId: string,
    userRole: UserRole
  ) {
    const apartment = await this.prisma.apartment.findUnique({
      where: { id: apartmentId }
    });

    if (!apartment) {
      throw new Error('Apartment not found');
    }

    // Check permission: seller can see their own, admins can see all
    const isSeller = apartment.sellerId === userId;
    const isAdmin = [UserRole.ADMIN, UserRole.MANAGER_ADMIN, UserRole.OWNER_ADMIN].includes(userRole);
    
    if (!isSeller && !isAdmin) {
      throw new Error('Not authorized to view status history');
    }

    return this.prisma.apartmentStatusLog.findMany({
      where: { apartmentId },
      include: {
        changedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Bulk status change
  async bulkChangeStatus(
    apartmentIds: string[],
    userId: string,
    userRole: UserRole,
    status: ApartmentStatus,
    reason?: string
  ) {
    // Only admins can do bulk operations
    const isAdmin = [UserRole.ADMIN, UserRole.MANAGER_ADMIN, UserRole.OWNER_ADMIN].includes(userRole);
    if (!isAdmin) {
      throw new Error('Only admins can perform bulk status changes');
    }

    const results = [];
    let successful = 0;
    let failed = 0;

    for (const apartmentId of apartmentIds) {
      try {
        const data: ChangeStatusInput = { status, reason };
        const result = await this.changeStatus(apartmentId, userId, userRole, data);
        results.push({ apartmentId, success: true, data: result });
        successful++;
      } catch (error) {
        results.push({ 
          apartmentId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        failed++;
      }
    }

    return { results, successful, failed };
  }

  // Validate status transition
  isValidTransition(
    from: ApartmentStatus,
    to: ApartmentStatus,
    userRole: UserRole,
    isOwner: boolean
  ): { valid: boolean; error?: string } {
    // Same status
    if (from === to) {
      return { valid: false, error: 'Status is already set to this value' };
    }

    // Seller permissions
    if (isOwner) {
      // Seller can only mark as SOLD
      if (from === 'ACTIVE' && to === 'SOLD') {
        return { valid: true };
      }
      return { valid: false, error: 'Sellers can only mark active apartments as sold' };
    }

    // Admin permissions
    const isAdmin = [UserRole.ADMIN, UserRole.MANAGER_ADMIN, UserRole.OWNER_ADMIN].includes(userRole);
    if (isAdmin) {
      // Admin can change between ACTIVE and HIDDEN
      if ((from === 'ACTIVE' && to === 'HIDDEN') || 
          (from === 'HIDDEN' && to === 'ACTIVE')) {
        return { valid: true };
      }
      // Admin can also mark as SOLD
      if (from === 'ACTIVE' && to === 'SOLD') {
        return { valid: true };
      }
      return { valid: false, error: 'Invalid status transition for admin' };
    }

    return { valid: false, error: 'Not authorized to change status' };
  }
}