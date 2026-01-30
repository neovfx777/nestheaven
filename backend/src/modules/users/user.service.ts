import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db';
import { SaveFavoriteInput, SaveSearchInput, UpdateSavedSearchInput } from './user.validators';

export class UserService {
  // Add apartment to favorites
  async addFavorite(userId: string, data: SaveFavoriteInput) {
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_apartmentId: {
          userId,
          apartmentId: data.apartmentId,
        },
      },
    });

    if (existingFavorite) {
      throw new Error('Apartment already in favorites');
    }

    // Check if apartment exists and is visible
    const apartment = await prisma.apartment.findUnique({
      where: { id: data.apartmentId },
      select: { id: true, status: true },
    });

    if (!apartment) {
      throw new Error('Apartment not found');
    }

    if (apartment.status === 'HIDDEN') {
      throw new Error('Cannot favorite hidden apartment');
    }

    const favorite = await prisma.userFavorite.create({
      data: {
        userId,
        apartmentId: data.apartmentId,
      },
      include: {
        apartment: {
          include: {
            images: {
              take: 1,
              orderBy: { orderIndex: 'asc' },
            },
            complex: {
              select: {
                id: true,
                name: true,
                coverImage: true,
              },
            },
          },
        },
      },
    });

    return favorite;
  }

  // Remove apartment from favorites
  async removeFavorite(userId: string, apartmentId: string) {
    const favorite = await prisma.userFavorite.findUnique({
      where: {
        userId_apartmentId: {
          userId,
          apartmentId,
        },
      },
    });

    if (!favorite) {
      throw new Error('Favorite not found');
    }

    await prisma.userFavorite.delete({
      where: {
        id: favorite.id,
      },
    });

    return { success: true };
  }

  // Get user favorites
  async getFavorites(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      prisma.userFavorite.findMany({
        where: { userId },
        include: {
          apartment: {
            include: {
              images: {
                take: 1,
                orderBy: { orderIndex: 'asc' },
              },
              complex: {
                select: {
                  id: true,
                  name: true,
                  coverImage: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.userFavorite.count({ where: { userId } }),
    ]);

    const formattedApartments = favorites.map(fav => ({
      ...fav.apartment,
      isFavorite: true,
      favoritedAt: fav.createdAt,
    }));

    return {
      apartments: formattedApartments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Save search
  async saveSearch(userId: string, data: SaveSearchInput) {
    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId,
        name: data.name,
        filters: (data.filters ?? {}) as Prisma.JsonValue,
      },
    });

    return savedSearch;
  }

  // Update saved search
  async updateSavedSearch(userId: string, searchId: string, data: UpdateSavedSearchInput) {
    const savedSearch = await prisma.savedSearch.findFirst({
      where: {
        id: searchId,
        userId,
      },
    });

    if (!savedSearch) {
      throw new Error('Saved search not found');
    }

    const updatedSearch = await prisma.savedSearch.update({
      where: { id: searchId },
      data: {
        ...data,
        filters: data.filters as Prisma.JsonValue,
      },
    });

    return updatedSearch;
  }

  // Get saved searches
  async getSavedSearches(userId: string) {
    return prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, // ✅
    });
  }


  // Delete saved search
  async deleteSavedSearch(userId: string, searchId: string) {
    const savedSearch = await prisma.savedSearch.findFirst({
      where: {
        id: searchId,
        userId,
      },
    });

    if (!savedSearch) {
      throw new Error('Saved search not found');
    }

    await prisma.savedSearch.delete({
      where: { id: searchId },
    });

    return { success: true };
  }

  // Update last used time for saved search


  // Check if apartment is in favorites
  async isFavorite(userId: string, apartmentId: string): Promise<boolean> {
    const favorite = await prisma.userFavorite.findUnique({
      where: {
        userId_apartmentId: {
          userId,
          apartmentId,
        },
      },
    });

    return !!favorite;
  }

  // Get favorite status for multiple apartments
  async getFavoriteStatus(userId: string, apartmentIds: string[]): Promise<Record<string, boolean>> {
    if (apartmentIds.length === 0) {
      return {};
    }

    const favorites = await prisma.userFavorite.findMany({
      where: {
        userId,
        apartmentId: { in: apartmentIds },
      },
      select: { apartmentId: true },
    });

    const favoriteMap = new Set(favorites.map(f => f.apartmentId));
    
    return apartmentIds.reduce((acc, id) => {
      acc[id] = favoriteMap.has(id);
      return acc;
    }, {} as Record<string, boolean>);
  }
}