const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class StatusService {
  constructor() {
    this.prisma = prisma;
  }

  async getStatusHistory(apartmentId, userId, userRole, options = {}) {
    const { limit = 20, offset = 0 } = options;

    // Apartmentni tekshiramiz
    const apartment = await this.prisma.apartment.findUnique({
      where: { id: apartmentId },
      select: { sellerId: true }
    });

    if (!apartment) {
      throw new Error('Apartment not found');
    }

    // Seller faqat o'z apartmentlari tarixini ko'ra oladi
    if (userRole === 'SELLER' && apartment.sellerId !== userId) {
      throw new Error('Not authorized to view this apartment history');
    }

    return this.prisma.statusHistory.findMany({
      where: { apartmentId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        changedBy: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }

  async changeStatus(apartmentId, status, adminId, reason = '') {
    return this.prisma.$transaction(async (tx) => {
      // Apartmentni yangilaymiz
      const apartment = await tx.apartment.update({
        where: { id: apartmentId },
        data: { status },
      });

      // Tarixga yozamiz
      await tx.statusHistory.create({
        data: {
          apartmentId,
          oldStatus: apartment.status,
          newStatus: status,
          changedById: adminId,
          reason,
          changeType: 'STATUS_CHANGE',
        },
      });

      return apartment;
    });
  }

  async markSold(apartmentId, sellerId, data = {}) {
    const { soldPrice, soldDate, notes = '' } = data;

    return this.prisma.$transaction(async (tx) => {
      // Avval apartment seller'ga tegishli ekanligini tekshiramiz
      const apartment = await tx.apartment.findFirst({
        where: {
          id: apartmentId,
          sellerId: sellerId,
        },
      });

      if (!apartment) {
        throw new Error('Apartment not found or not authorized');
      }

      // Sotilgan deb belgilaymiz
      const updatedApartment = await tx.apartment.update({
        where: { id: apartmentId },
        data: {
          status: 'sold',
          soldPrice: soldPrice || apartment.price,
          soldDate: soldDate || new Date(),
        },
      });

      // Tarixga yozamiz
      await tx.statusHistory.create({
        data: {
          apartmentId,
          oldStatus: apartment.status,
          newStatus: 'sold',
          changedById: sellerId,
          reason: notes,
          changeType: 'MARK_SOLD',
          metadata: {
            soldPrice: soldPrice || apartment.price,
            soldDate: soldDate || new Date(),
          },
        },
      });

      return updatedApartment;
    });
  }

  async bulkStatusChange(apartmentIds, status, adminId, reason = '') {
    return this.prisma.$transaction(async (tx) => {
      // Barcha apartmentlarni yangilaymiz
      const updatedApartments = await tx.apartment.updateMany({
        where: {
          id: {
            in: apartmentIds,
          },
        },
        data: { status },
      });

      // Har bir apartment uchun tarix yozamiz
      const historyRecords = apartmentIds.map(apartmentId => ({
        apartmentId,
        oldStatus: 'active', // Bu yerda eski statusni aniqlash kerak, lekin soddalik uchun
        newStatus: status,
        changedById: adminId,
        reason,
        changeType: 'BULK_STATUS_CHANGE',
      }));

      await tx.statusHistory.createMany({
        data: historyRecords,
      });

      return {
        count: updatedApartments.count,
        apartmentIds,
      };
    });
  }

  async bulkMarkSold(apartmentIds, sellerId, reason = '') {
    return this.prisma.$transaction(async (tx) => {
      // Faqat seller'ga tegishli apartmentlarni tekshiramiz
      const sellerApartments = await tx.apartment.findMany({
        where: {
          id: {
            in: apartmentIds,
          },
          sellerId: sellerId,
        },
      });

      const validApartmentIds = sellerApartments.map(apt => apt.id);

      if (validApartmentIds.length === 0) {
        throw new Error('No valid apartments found for this seller');
      }

      // Sotilgan deb belgilaymiz
      const updatedApartments = await tx.apartment.updateMany({
        where: {
          id: {
            in: validApartmentIds,
          },
        },
        data: {
          status: 'sold',
          soldDate: new Date(),
        },
      });

      // Tarix yozamiz
      const historyRecords = validApartmentIds.map(apartmentId => ({
        apartmentId,
        oldStatus: 'active',
        newStatus: 'sold',
        changedById: sellerId,
        reason,
        changeType: 'BULK_MARK_SOLD',
      }));

      await tx.statusHistory.createMany({
        data: historyRecords,
      });

      return {
        count: updatedApartments.count,
        apartmentIds: validApartmentIds,
      };
    });
  }
}

module.exports = new StatusService();