import { db } from '../../config/db';
import { ApartmentStatus, UserRole } from '@prisma/client';
import { ChangeStatusInput, MarkAsSoldInput } from './status.validators';

export class StatusService {
  private prisma = db;

  constructor() {}

  async changeStatus(apartmentId: string, userId: string, userRole: UserRole, data: ChangeStatusInput) {
    const apartment = await this.prisma.apartment.findUnique({ where: { id: apartmentId } });
    if (!apartment) throw new Error('Apartment not found');
    
    const updated = await this.prisma.apartment.update({
      where: { id: apartmentId },
      data: { status: data.status }
    });
    
    await this.prisma.apartmentStatusLog.create({
      data: {
        apartmentId,
        fromStatus: apartment.status,
        toStatus: data.status,
        changedById: userId,
        reason: data.reason || 'Changed status'
      }
    });
    
    return updated;
  }

  async markAsSold(apartmentId: string, sellerId: string, data: MarkAsSoldInput) {
    const apartment = await this.prisma.apartment.findUnique({ where: { id: apartmentId } });
    if (!apartment) throw new Error('Apartment not found');
    if (apartment.sellerId !== sellerId) throw new Error('Not your apartment');
    
    const updated = await this.prisma.apartment.update({
      where: { id: apartmentId },
      data: { status: 'SOLD' }
    });
    
    await this.prisma.apartmentStatusLog.create({
      data: {
        apartmentId,
        fromStatus: apartment.status,
        toStatus: 'SOLD',
        changedById: sellerId,
        reason: data.soldNotes || 'Marked as sold'
      }
    });
    
    return updated;
  }

  async getStatusHistory(apartmentId: string, userId: string, userRole: UserRole) {
    return this.prisma.apartmentStatusLog.findMany({
      where: { apartmentId },
      include: { changedBy: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async bulkChangeStatus(apartmentIds: string[], userId: string, userRole: UserRole, status: ApartmentStatus, reason?: string) {
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
        results.push({ apartmentId, success: false, error: (error as Error).message });
        failed++;
      }
    }

    return { results, successful, failed };
  }

  isValidTransition(from: ApartmentStatus, to: ApartmentStatus, userRole: UserRole, isOwner: boolean) {
    if (from === to) return { valid: false, error: 'Already in this status' };
    
    // Simple validation - adjust as needed
    if (isOwner && from === 'ACTIVE' && to === 'SOLD') {
      return { valid: true };
    }
    
    if (userRole !== 'USER') {
      return { valid: true }; // Admins can do anything
    }
    
    return { valid: false, error: 'Not authorized' };
  }
}
