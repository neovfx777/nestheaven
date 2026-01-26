import { db } from '../../config/db';
import { Prisma } from '@prisma/client';

export class AnalyticsService {
  async getPlatformOverview() {
    const [
      totalUsers,
      totalApartments,
      activeApartments,
      soldApartments,
      totalComplexes,
      totalFavorites,
      totalSavedSearches
    ] = await Promise.all([
      db.user.count(),
      db.apartment.count(),
      db.apartment.count({ where: { status: 'ACTIVE' } }),
      db.apartment.count({ where: { status: 'SOLD' } }),
      db.complex.count(),
      db.userFavorite.count(),
      db.savedSearch.count()
    ]);

    const userGrowth = await this.getUserGrowth();
    const apartmentGrowth = await this.getApartmentGrowth();
    const revenueData = await this.getRevenueData();

    return {
      totals: {
        users: totalUsers,
        apartments: totalApartments,
        activeApartments,
        soldApartments,
        complexes: totalComplexes,
        favorites: totalFavorites,
        savedSearches: totalSavedSearches
      },
      growth: {
        users: userGrowth,
        apartments: apartmentGrowth
      },
      revenue: revenueData
    };
  }

  async getUserGrowth(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const users = await db.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        _all: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return users.map(user => ({
      date: user.createdAt.toISOString().split('T')[0],
      count: user._count._all
    }));
  }

  async getApartmentGrowth(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const apartments = await db.apartment.groupBy({
      by: ['createdAt', 'status'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        _all: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const grouped = apartments.reduce((acc, apt) => {
      const date = apt.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { total: 0, active: 0, sold: 0, hidden: 0 };
      }
      acc[date].total += apt._count._all;
      acc[date][apt.status.toLowerCase()] += apt._count._all;
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(grouped).map(([date, counts]) => ({
      date,
      ...counts
    }));
  }

  async getRevenueData(months: number = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const soldApartments = await db.apartment.findMany({
      where: {
        status: 'SOLD',
        updatedAt: {
          gte: startDate
        }
      },
      select: {
        price: true,
        updatedAt: true,
        area: true,
        rooms: true
      }
    });

    // Group by month
    const monthlyData = soldApartments.reduce((acc, apt) => {
      const month = apt.updatedAt.toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = {
          revenue: 0,
          count: 0,
          avgPrice: 0,
          totalArea: 0,
          data: []
        };
      }
      acc[month].revenue += apt.price;
      acc[month].count += 1;
      acc[month].totalArea += apt.area;
      acc[month].data.push(apt);
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages
    Object.values(monthlyData).forEach((month: any) => {
      month.avgPrice = month.revenue / month.count;
      month.avgArea = month.totalArea / month.count;
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    }));
  }

  async getTopPerformers(limit: number = 10) {
    const topComplexes = await db.complex.findMany({
      include: {
        _count: {
          select: {
            apartments: true,
            apartmentsActive: {
              where: { status: 'ACTIVE' }
            },
            apartmentsSold: {
              where: { status: 'SOLD' }
            }
          }
        },
        apartments: {
          take: 1,
          orderBy: { price: 'desc' },
          select: { price: true }
        }
      },
      orderBy: {
        apartments: {
          _count: 'desc'
        }
      },
      take: limit
    });

    const topSellers = await db.user.findMany({
      where: {
        role: 'SELLER'
      },
      include: {
        _count: {
          select: {
            apartments: true,
            apartmentsActive: {
              where: { status: 'ACTIVE' }
            },
            apartmentsSold: {
              where: { status: 'SOLD' }
            }
          }
        },
        apartments: {
          take: 1,
          orderBy: { price: 'desc' },
          select: { price: true }
        }
      },
      orderBy: {
        apartments: {
          _count: 'desc'
        }
      },
      take: limit
    });

    return {
      complexes: topComplexes.map(complex => ({
        id: complex.id,
        name: complex.name,
        totalListings: complex._count.apartments,
        activeListings: complex._count.apartmentsActive,
        soldListings: complex._count.apartmentsSold,
        highestPrice: complex.apartments[0]?.price || 0
      })),
      sellers: topSellers.map(seller => ({
        id: seller.id,
        name: seller.name,
        email: seller.email,
        totalListings: seller._count.apartments,
        activeListings: seller._count.apartmentsActive,
        soldListings: seller._count.apartmentsSold,
        highestPrice: seller.apartments[0]?.price || 0
      }))
    };
  }

  async getGeographicDistribution() {
    const apartments = await db.apartment.findMany({
      where: {
        lat: { not: null },
        lng: { not: null },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        lat: true,
        lng: true,
        price: true,
        area: true,
        rooms: true,
        status: true
      }
    });

    return apartments.map(apt => ({
      id: apt.id,
      coordinates: { lat: apt.lat!, lng: apt.lng! },
      price: apt.price,
      area: apt.area,
      rooms: apt.rooms,
      status: apt.status
    }));
  }

  async getUserEngagement(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [favorites, searches, logins] = await Promise.all([
      db.userFavorite.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: startDate }
        },
        _count: { _all: true },
        orderBy: { createdAt: 'asc' }
      }),
      db.savedSearch.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: startDate }
        },
        _count: { _all: true },
        orderBy: { createdAt: 'asc' }
      }),
      db.user.findMany({
        where: {
          lastLoginAt: { gte: startDate }
        },
        select: {
          lastLoginAt: true
        }
      })
    ]);

    // Combine daily data
    const dailyData: Record<string, any> = {};
    
    favorites.forEach(fav => {
      const date = fav.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) dailyData[date] = { favorites: 0, searches: 0, logins: 0 };
      dailyData[date].favorites += fav._count._all;
    });

    searches.forEach(search => {
      const date = search.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) dailyData[date] = { favorites: 0, searches: 0, logins: 0 };
      dailyData[date].searches += search._count._all;
    });

    logins.forEach(user => {
      if (user.lastLoginAt) {
        const date = user.lastLoginAt.toISOString().split('T')[0];
        if (!dailyData[date]) dailyData[date] = { favorites: 0, searches: 0, logins: 0 };
        dailyData[date].logins += 1;
      }
    });

    return Object.entries(dailyData).map(([date, metrics]) => ({
      date,
      ...metrics
    }));
  }

  async getListingPerformance(period: 'day' | 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const listings = await db.apartment.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        id: true,
        title: true,
        price: true,
        status: true,
        views: true,
        favoritesCount: true,
        createdAt: true,
        updatedAt: true,
        complex: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        views: 'desc'
      },
      take: 50
    });

    const performanceMetrics = listings.map(listing => {
      const daysActive = Math.ceil(
        (now.getTime() - listing.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        status: listing.status,
        views: listing.views || 0,
        favorites: listing.favoritesCount || 0,
        complexName: listing.complex?.name || 'Standalone',
        daysActive,
        viewsPerDay: daysActive > 0 ? (listing.views || 0) / daysActive : 0,
        conversionRate: daysActive > 0 ? 
          (listing.status === 'SOLD' ? 100 : 0) : 0
      };
    });

    return performanceMetrics;
  }
}