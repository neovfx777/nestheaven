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
        _count: { select: { apartments: true } }
      }
    });
    return complex;
  }

  // Update complex
  async updateComplex(complexId: string, input: ComplexUpdateInput) {
    const complex = await prisma.complex.findUnique({ where: { id: complexId } });
    if (!complex) throw new Error('Complex not found');

    return prisma.complex.update({
      where: { id: complexId },
      data: { name: input.name, coverImage: input.coverImage },
      include: { _count: { select: { apartments: true } } }
    });
  }

  // Delete complex (only if no apartments are linked)
  async deleteComplex(complexId: string) {
    const complexWithApartments = await prisma.complex.findUnique({
      where: { id: complexId },
      include: { _count: { select: { apartments: true } } }
    });

    if (!complexWithApartments) throw new Error('Complex not found');
    if (complexWithApartments._count.apartments > 0) {
      throw new Error('Cannot delete complex with linked apartments. Unlink apartments first.');
    }

    await prisma.complex.delete({ where: { id: complexId } });
    return { success: true, message: 'Complex deleted successfully' };
  }

  // Get complex by ID
  async getComplexById(complexId: string, includeApartments: boolean = false) {
    const complex = await prisma.complex.findUnique({
      where: { id: complexId },
      include: {
        _count: { select: { apartments: true } },
        apartments: includeApartments ? {
          where: { status: 'ACTIVE' },
          take: 10,
          include: { images: { take: 1, orderBy: { orderIndex: 'asc' } } },
          orderBy: { createdAt: 'desc' }
        } : undefined,
      }
    });

    if (!complex) throw new Error('Complex not found');
    return complex;
  }

  // List complexes with filtering
  async listComplexes(query: ComplexQueryInput) {
    const { search, page, limit, sortBy, sortOrder, withApartments, apartmentStatus } = query;

    const where: Prisma.ComplexWhereInput = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (apartmentStatus) where.apartments = { some: { status: apartmentStatus } };

    const orderBy: Prisma.ComplexOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    const include: Prisma.ComplexInclude = { _count: { select: { apartments: true } } };
    if (withApartments === 'true') {
      include.apartments = {
        where: apartmentStatus ? { status: apartmentStatus } : { status: 'ACTIVE' },
        take: 5,
        include: { images: { take: 1, orderBy: { orderIndex: 'asc' } } },
        orderBy: { createdAt: 'desc' }
      };
    }

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
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  // Get complexes with apartment counts and stats
  async getComplexesWithStats() {
    const complexes = await prisma.complex.findMany({
      include: {
        _count: { select: { apartments: true } },
        apartments: { select: { status: true, price: true } }
      },
      orderBy: { name: 'asc' }
    });

    return complexes.map(complex => {
      const apartments = complex.apartments as any[];
      const active = apartments.filter(a => a.status === 'ACTIVE');
      const sold = apartments.filter(a => a.status === 'SOLD');
      const hidden = apartments.filter(a => a.status === 'HIDDEN');
      const avgPrice = active.length ? active.reduce((sum, a) => sum + a.price, 0) / active.length : 0;

      return {
        id: complex.id,
        name: complex.name,
        coverImage: complex.coverImage,
        totalApartments: complex._count.apartments,
        activeApartments: active.length,
        soldApartments: sold.length,
        hiddenApartments: hidden.length,
        averagePrice: Math.round(avgPrice)
      };
    });
  }

  // Search complexes by name
  async searchComplexes(searchTerm: string, limit: number = 10) {
    return prisma.complex.findMany({
      where: { name: { contains: searchTerm, mode: 'insensitive' } },
      take: limit,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, coverImage: true, _count: { select: { apartments: true } } }
    });
  }

  // Get overall complex statistics
  async getComplexStats() {
    const totalComplexes = await prisma.complex.count();
    const complexesWithApartments = await prisma.complex.count({ where: { apartments: { some: {} } } });
    const complexesWithActiveApartments = await prisma.complex.count({ where: { apartments: { some: { status: 'ACTIVE' } } } });

    const averageApartmentsPerComplex = await prisma.$queryRaw<{ avg: number }[]>`
      SELECT AVG(apartment_count) as avg
      FROM (
        SELECT COUNT(*) as apartment_count
        FROM "Apartment"
        WHERE "complexId" IS NOT NULL
        GROUP BY "complexId"
      ) as counts
    `;

    return {
      totalComplexes,
      complexesWithApartments,
      complexesWithActiveApartments,
      averageApartmentsPerComplex: averageApartmentsPerComplex[0]?.avg || 0
    };
  }

  // Find complexes with advanced filters
  async findComplexesWithFilters(params: {
    search?: string;
    hasApartments?: boolean;
    hasActiveApartments?: boolean;
    sortBy?: 'name' | 'createdAt' | 'apartmentCount';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const { search = '', hasApartments, hasActiveApartments, sortBy = 'name', sortOrder = 'asc', page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (hasApartments !== undefined) where.apartments = hasApartments ? { some: {} } : { none: {} };
    if (hasActiveApartments !== undefined) where.apartments = hasActiveApartments ? { some: { status: 'ACTIVE' } } : { none: { status: 'ACTIVE' } };

    const complexes = await prisma.complex.findMany({
      where,
      include: { _count: { select: { apartments: true } } },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit
    });

    const total = await prisma.complex.count({ where });

    return {
      complexes,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }
}
