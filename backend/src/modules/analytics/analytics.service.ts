import { db } from '../../config/db';

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

    const [userGrowth, apartmentGrowth, revenueData] = await Promise.all([
      this.getUserGrowth(7),
      this.getApartmentGrowth(7),
      this.getRevenueData(3)
    ]);

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

    const users = await db.user.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by date
    const grouped = users.reduce((acc, user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array with cumulative counts
    const dates = Object.keys(grouped).sort();
    let cumulative = 0;
    return dates.map(date => {
      cumulative += grouped[date];
      return {
        date,
        count: cumulative
      };
    });
  }

  async getApartmentGrowth(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const apartments = await db.apartment.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      select: {
        createdAt: true,
        status: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by date and status
    const grouped = apartments.reduce((acc, apt) => {
      const date = apt.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { total: 0, active: 0, sold: 0, hidden: 0 };
      }
      acc[date].total++;
      acc[date][apt.status.toLowerCase() as 'active' | 'sold' | 'hidden']++;
      return acc;
    }, {} as Record<string, { total: number; active: number; sold: number; hidden: number }>);

    // Convert to array with cumulative counts
    const dates = Object.keys(grouped).sort();
    let cumulativeTotal = 0;
    let cumulativeActive = 0;
    let cumulativeSold = 0;
    let cumulativeHidden = 0;

    return dates.map(date => {
      cumulativeTotal += grouped[date].total;
      cumulativeActive += grouped[date].active;
      cumulativeSold += grouped[date].sold;
      cumulativeHidden += grouped[date].hidden;

      return {
        date,
        total: cumulativeTotal,
        active: cumulativeActive,
        sold: cumulativeSold,
        hidden: cumulativeHidden
      };
    });
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
          totalArea: 0,
          apartments: []
        };
      }
      acc[month].revenue += apt.price;
      acc[month].count += 1;
      acc[month].totalArea += apt.area;
      acc[month].apartments.push(apt);
      return acc;
    }, {} as Record<string, { revenue: number; count: number; totalArea: number; apartments: any[] }>);

    // Calculate averages
    Object.keys(monthlyData).forEach(month => {
      const data = monthlyData[month];
      monthlyData[month] = {
        ...data,
        avgPrice: data.revenue / data.count,
        avgArea: data.totalArea / data.count
      };
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
            apartments: true
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
            apartments: true
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

    // Get active and sold counts separately
    const complexPromises = topComplexes.map(async complex => {
      const [activeCount, soldCount] = await Promise.all([
        db.apartment.count({
          where: { 
            complexId: complex.id,
            status: 'ACTIVE'
          }
        }),
        db.apartment.count({
          where: { 
            complexId: complex.id,
            status: 'SOLD'
          }
        })
      ]);

      return {
        id: complex.id,
        name: complex.name,
        totalListings: complex._count.apartments,
        activeListings: activeCount,
        soldListings: soldCount,
        highestPrice: complex.apartments[0]?.price || 0
      };
    });

    const sellerPromises = topSellers.map(async seller => {
      const [activeCount, soldCount] = await Promise.all([
        db.apartment.count({
          where: { 
            createdById: seller.id,
            status: 'ACTIVE'
          }
        }),
        db.apartment.count({
          where: { 
            createdById: seller.id,
            status: 'SOLD'
          }
        })
      ]);

      return {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        totalListings: seller._count.apartments,
        activeListings: activeCount,
        soldListings: soldCount,
        highestPrice: seller.apartments[0]?.price || 0
      };
    });

    const complexes = await Promise.all(complexPromises);
    const sellers = await Promise.all(sellerPromises);

    return { complexes, sellers };
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
        status: true,
        title: true
      }
    });

    return apartments.map(apt => ({
      id: apt.id,
      coordinates: { lat: apt.lat!, lng: apt.lng! },
      price: apt.price,
      area: apt.area,
      rooms: apt.rooms,
      status: apt.status,
      title: apt.title
    }));
  }

  async getUserEngagement(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [favorites, searches, usersWithLogin] = await Promise.all([
      db.userFavorite.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        select: {
          createdAt: true
        }
      }),
      db.savedSearch.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        select: {
          createdAt: true
        }
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

    // Group by date
    const dailyData: Record<string, { favorites: number; searches: number; logins: number }> = {};
    
    favorites.forEach(fav => {
      const date = fav.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { favorites: 0, searches: 0, logins: 0 };
      }
      dailyData[date].favorites++;
    });

    searches.forEach(search => {
      const date = search.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { favorites: 0, searches: 0, logins: 0 };
      }
      dailyData[date].searches++;
    });

    usersWithLogin.forEach(user => {
      if (user.lastLoginAt) {
        const date = user.lastLoginAt.toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { favorites: 0, searches: 0, logins: 0 };
        }
        dailyData[date].logins++;
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
        createdAt: true,
        updatedAt: true,
        complex: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        price: 'desc'
      },
      take: 50
    });

    return listings.map(listing => {
      const daysActive = Math.ceil(
        (now.getTime() - listing.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        status: listing.status,
        complexName: listing.complex?.name || 'Standalone',
        daysActive,
        pricePerDay: daysActive > 0 ? listing.price / daysActive : listing.price
      };
    });
  }
}