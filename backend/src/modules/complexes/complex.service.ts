import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db';
import { 
  ComplexCreateInput, 
  ComplexUpdateInput, 
  ComplexQueryInput 
} from './complex.validators';

export class ComplexService {
  // Create complex
  async createComplex(input: ComplexCreateInput) {
    const complex = await prisma.complex.create({
      data: {
        name: input.name,
        coverImage: input.coverImage,
      },
      include: {
        _count: {
          select: { apartments: true }
        }
      }
    });

    return complex;
  }

  // Update complex
  async updateComplex(complexId: string, input: ComplexUpdateInput) {
    const complex = await prisma.complex.findUnique({
      where: { id: complexId }
    });

    if (!complex) {
      throw new Error('Complex not found');
    }

    const updatedComplex = await prisma.complex.update({
      where: { id: complexId },
      data: {
        name: input.name,
        coverImage: input.coverImage,
      },
      include: {
        _count: {
          select: { apartments: true }
        }
      }
    });

    return updatedComplex;
  }

  // Delete complex (only if no apartments are linked)
  async deleteComplex(complexId: string) {
    // Check if complex has apartments
    const complexWithApartments = await prisma.complex.findUnique({
      where: { id: complexId },
      include: {
        _count: {
          select: { apartments: true }
        }
      }
    });

    if (!complexWithApartments) {
      throw new Error('Complex not found');
    }

    if (complexWithApartments._count.apartments > 0) {
      throw new Error('Cannot delete complex with linked apartments. Unlink apartments first.');
    }

    await prisma.complex.delete({
      where: { id: complexId }
    });

    return { success: true, message: 'Complex deleted successfully' };
  }

  // Get complex by ID
  async getComplexById(complexId: string, includeApartments: boolean = false) {
    const complex = await prisma.complex.findUnique({
      where: { id: complexId },
      include: {
        _count: {
          select: { apartments: true }
        },
        apartments: includeApartments ? {
          where: { status: 'ACTIVE' }, // Only show active apartments by default
          take: 10,
          include: {
            images: {
              take: 1,
              orderBy: { orderIndex: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        } : undefined,
      }
    });

    if (!complex) {
      throw new Error('Complex not found');
    }

    return complex;
  }

  // List complexes with filtering
  async listComplexes(query: ComplexQueryInput) {
    const {
      search,
      page,
      limit,
      sortBy,
      sortOrder,
      withApartments,
      apartmentStatus,
    } = query;

    // Build where clause
    const where: Prisma.ComplexWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    // If filtering by apartment status
    if (apartmentStatus) {
      where.apartments = {
        some: {
          status: apartmentStatus
        }
      };
    }

    // Sort
    const orderBy: Prisma.ComplexOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    // Include apartments if requested
    const include: Prisma.ComplexInclude = {
      _count: {
        select: { apartments: true }
      }
    };

    if (withApartments === 'true') {
      include.apartments = {
        where: apartmentStatus ? { status: apartmentStatus } : { status: 'ACTIVE' },
        take: 5,
        include: {
          images: {
            take: 1,
            orderBy: { orderIndex: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      };
    }

    // Execute query
    const [complexes, total] = await Promise.all([
      prisma.complex.findMany({
        where,
        include,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.complex.count({ where }),
    ]);

    return {
      complexes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  // Get complexes with apartment counts
  async getComplexesWithStats() {
    const complexes = await prisma.complex.findMany({
      include: {
        _count: {
          select: { 
            apartments: true,
          }
        },
        apartments: {
          select: {
            status: true,
            price: true,
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Calculate statistics
    const complexesWithStats = complexes.map(complex => {
      const apartments = complex.apartments as any[];
      const activeApartments = apartments.filter(a => a.status === 'ACTIVE');
      const soldApartments = apartments.filter(a => a.status === 'SOLD');
      const hiddenApartments = apartments.filter(a => a.status === 'HIDDEN');
      
      const avgPrice = activeApartments.length > 0 
        ? activeApartments.reduce((sum, a) => sum + a.price, 0) / activeApartments.length
        : 0;

      return {
        id: complex.id,
        name: complex.name,
        coverImage: complex.coverImage,
        totalApartments: complex._count.apartments,
        activeApartments: activeApartments.length,
        soldApartments: soldApartments.length,
        hiddenApartments: hiddenApartments.length,
        averagePrice: Math.round(avgPrice),
      };
    });

    return complexesWithStats;
  }

  // Search complexes by name
  async searchComplexes(searchTerm: string, limit: number = 10) {
    const complexes = await prisma.complex.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        coverImage: true,
        _count: {
          select: { apartments: true }
        }
      }
    });

    return complexes;
  }
}