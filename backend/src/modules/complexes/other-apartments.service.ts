import { prisma } from '../../config/db';
import { OtherApartmentsQueryInput } from './complex.validators';

export class OtherApartmentsService {
  // Get other apartments in the same complex
  async getOtherApartmentsInComplex(
    apartmentId: string,
    query: OtherApartmentsQueryInput
  ) {
    const { excludeApartmentId, limit, status } = query;

    // Get the target apartment to find its complex
    const targetApartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      select: {
        complexId: true,
        complex: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!targetApartment) {
      throw new Error('Apartment not found');
    }

    if (!targetApartment.complexId) {
      return {
        complex: null,
        otherApartments: [],
        message: 'This apartment is not part of a complex'
      };
    }

    // Get other apartments in the same complex
    const otherApartments = await prisma.apartment.findMany({
      where: {
        complexId: targetApartment.complexId,
        id: { not: excludeApartmentId },
        status: status,
      },
      include: {
        images: {
          take: 1,
          orderBy: { orderIndex: 'asc' }
        },
        seller: {
          select: {
            id: true,
            fullName: true,
          }
        }
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    // Format response
    const formattedApartments = otherApartments.map(apartment => ({
      id: apartment.id,
      titleUz: apartment.titleUz,
      titleRu: apartment.titleRu,
      titleEn: apartment.titleEn,
      price: apartment.price,
      rooms: apartment.rooms,
      area: apartment.area,
      floor: apartment.floor,
      status: apartment.status,
      coverImage: apartment.images[0]?.url || null,
      sellerName: apartment.seller.fullName,
    }));

    return {
      complex: targetApartment.complex,
      otherApartments: formattedApartments,
      totalInComplex: await prisma.apartment.count({
        where: {
          complexId: targetApartment.complexId,
          status: status,
        }
      })
    };
  }

  // Get apartments by complex ID
  async getApartmentsByComplexId(
    complexId: string,
    options: {
      excludeApartmentId?: string;
      limit?: number;
      status?: 'ACTIVE' | 'SOLD' | 'HIDDEN';
      userId?: string;
      userRole?: string;
    } = {}
  ) {
    const {
      excludeApartmentId,
      limit = 20,
      status = 'ACTIVE',
      userId,
      userRole
    } = options;

    // Check if complex exists
    const complex = await prisma.complex.findUnique({
      where: { id: complexId }
    });

    if (!complex) {
      throw new Error('Complex not found');
    }

    // Build where clause
    const where: any = {
      complexId,
    };

    if (excludeApartmentId) {
      where.id = { not: excludeApartmentId };
    }

    if (status) {
      where.status = status;
    }

    // USER cannot see HIDDEN apartments
    if (userRole === 'USER') {
      where.status = { in: ['ACTIVE', 'SOLD'] };
    }

    const apartments = await prisma.apartment.findMany({
      where,
      include: {
        images: {
          take: 1,
          orderBy: { orderIndex: 'asc' }
        },
        seller: {
          select: {
            id: true,
            fullName: true,
          }
        }
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    // Format response
    const formattedApartments = apartments.map(apartment => ({
      id: apartment.id,
      titleUz: apartment.titleUz,
      titleRu: apartment.titleRu,
      titleEn: apartment.titleEn,
      price: apartment.price,
      rooms: apartment.rooms,
      area: apartment.area,
      floor: apartment.floor,
      status: apartment.status,
      coverImage: apartment.images[0]?.url || null,
      sellerName: apartment.seller.fullName,
      // Only include detailed info for seller or admin
      details: (userId === apartment.sellerId || ['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN'].includes(userRole || ''))
        ? {
            address: apartment.address,
            contactPhone: apartment.contactPhone,
            descriptionUz: apartment.descriptionUz,
            descriptionRu: apartment.descriptionRu,
            descriptionEn: apartment.descriptionEn,
          }
        : undefined,
    }));

    return {
      complex,
      apartments: formattedApartments,
      total: await prisma.apartment.count({ where: { complexId } }),
      activeCount: await prisma.apartment.count({ 
        where: { complexId, status: 'ACTIVE' } 
      }),
      soldCount: await prisma.apartment.count({ 
        where: { complexId, status: 'SOLD' } 
      }),
    };
  }

  // Get complex statistics
  async getComplexStatistics(complexId: string) {
    const apartments = await prisma.apartment.findMany({
      where: { complexId },
      select: {
        status: true,
        price: true,
        area: true,
        rooms: true,
        floor: true,
        createdAt: true,
      }
    });

    if (apartments.length === 0) {
      return {
        total: 0,
        byStatus: { ACTIVE: 0, HIDDEN: 0, SOLD: 0 },
        priceRange: { min: 0, max: 0, avg: 0 },
        areaRange: { min: 0, max: 0, avg: 0 },
        roomDistribution: {},
        recentActivity: 0,
      };
    }

    const activeApartments = apartments.filter(a => a.status === 'ACTIVE');
    const prices = activeApartments.map(a => a.price);
    const areas = activeApartments.map(a => a.area);

    // Calculate room distribution
    const roomDistribution: Record<number, number> = {};
    apartments.forEach(apartment => {
      roomDistribution[apartment.rooms] = (roomDistribution[apartment.rooms] || 0) + 1;
    });

    // Calculate recent activity (apartments added in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentActivity = apartments.filter(a => 
      new Date(a.createdAt) > thirtyDaysAgo
    ).length;

    return {
      total: apartments.length,
      byStatus: {
        ACTIVE: apartments.filter(a => a.status === 'ACTIVE').length,
        HIDDEN: apartments.filter(a => a.status === 'HIDDEN').length,
        SOLD: apartments.filter(a => a.status === 'SOLD').length,
      },
      priceRange: {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0,
        avg: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
      },
      areaRange: {
        min: areas.length > 0 ? Math.min(...areas) : 0,
        max: areas.length > 0 ? Math.max(...areas) : 0,
        avg: areas.length > 0 ? Math.round(areas.reduce((a, b) => a + b, 0) / areas.length) : 0,
      },
      roomDistribution,
      recentActivity,
    };
  }
}