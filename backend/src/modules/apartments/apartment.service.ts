import { Prisma, ApartmentStatus, UserRole } from '@prisma/client';
import { prisma } from '../../config/db';
import { 
  ApartmentCreateInput, 
  ApartmentUpdateInput, 
  ApartmentQueryInput 
} from './apartment.validators';
import { 
  createMultiLanguageRecord, 
  formatMultiLanguageResponse,
  validateMultiLanguageInput 
} from '../../utils/i18n';
import { getFileUrl } from '../../middleware/upload';

export class ApartmentService {
  // Create apartment (seller only)
  async createApartment(sellerId: string, input: ApartmentCreateInput, imageFilenames: string[] = []) {
    // Validate multi-language input
    const multiLanguageContent = {
      uz: { title: input.title.uz, description: input.description?.uz, materials: input.materials?.uz },
      ru: { title: input.title.ru, description: input.description?.ru, materials: input.materials?.ru },
      en: { title: input.title.en, description: input.description?.en, materials: input.materials?.en },
    };

    if (!validateMultiLanguageInput(multiLanguageContent)) {
      throw new Error('All languages must have a title');
    }

    // Create apartment
    const apartment = await prisma.apartment.create({
      data: {
        ...createMultiLanguageRecord(multiLanguageContent),
        price: input.price,
        rooms: input.rooms,
        area: input.area,
        floor: input.floor,
        address: input.address,
        latitude: input.latitude,
        longitude: input.longitude,
        developerName: input.developerName,
        developerId: input.developerId,
        complexId: input.complexId,
        airQualityIndex: input.airQualityIndex,
        airQualitySource: input.airQualitySource,
        infrastructure: input.infrastructure as Prisma.JsonValue,
        infrastructureNoteUz: input.infrastructureNote?.uz,
        infrastructureNoteRu: input.infrastructureNote?.ru,
        infrastructureNoteEn: input.infrastructureNote?.en,
        investmentGrowthPercent: input.investmentGrowthPercent,
        investmentGrowthNoteUz: input.investmentGrowthNote?.uz,
        investmentGrowthNoteRu: input.investmentGrowthNote?.ru,
        investmentGrowthNoteEn: input.investmentGrowthNote?.en,
        contactPhone: input.contactPhone,
        contactTelegram: input.contactTelegram,
        contactWhatsapp: input.contactWhatsapp,
        contactEmail: input.contactEmail,
        installmentOptions: input.installmentOptions as Prisma.JsonValue,
        sellerId,
        status: ApartmentStatus.ACTIVE,
      },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            fullName: true,
          }
        },
        complex: {
          select: {
            id: true,
            name: true,
            coverImage: true,
          }
        }
      }
    });

    // Create apartment images
    if (imageFilenames.length > 0) {
      const imagesData = imageFilenames.map((filename, index) => ({
        apartmentId: apartment.id,
        url: getFileUrl(filename),
        orderIndex: index,
      }));

      await prisma.apartmentImage.createMany({
        data: imagesData
      });
    }

    // Fetch apartment with images
    const apartmentWithImages = await prisma.apartment.findUnique({
      where: { id: apartment.id },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            fullName: true,
          }
        },
        complex: {
          select: {
            id: true,
            name: true,
            coverImage: true,
          }
        },
        images: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    return apartmentWithImages;
  }

  // Update apartment (seller can update their own)
  async updateApartment(apartmentId: string, userId: string, userRole: UserRole, input: ApartmentUpdateInput) {
    // Check if apartment exists and user has permission
    const existingApartment = await prisma.apartment.findUnique({
      where: { id: apartmentId }
    });

    if (!existingApartment) {
      throw new Error('Apartment not found');
    }

    // Check permission: seller can update their own, admins can update any
    const isSellerOwned = existingApartment.sellerId === userId;
    const isAdmin = [UserRole.ADMIN, UserRole.MANAGER_ADMIN, UserRole.OWNER_ADMIN].includes(userRole);
    
    if (!isSellerOwned && !isAdmin) {
      throw new Error('Not authorized to update this apartment');
    }

    // Prepare update data
    const updateData: any = {};

    // Update multi-language fields if provided
    if (input.title || input.description || input.materials) {
      const titleUz = input.title?.uz || existingApartment.titleUz;
      const titleRu = input.title?.ru || existingApartment.titleRu;
      const titleEn = input.title?.en || existingApartment.titleEn;

      updateData.titleUz = titleUz;
      updateData.titleRu = titleRu;
      updateData.titleEn = titleEn;

      if (input.description) {
        updateData.descriptionUz = input.description.uz;
        updateData.descriptionRu = input.description.ru;
        updateData.descriptionEn = input.description.en;
      }

      if (input.materials) {
        updateData.materialsUz = input.materials.uz;
        updateData.materialsRu = input.materials.ru;
        updateData.materialsEn = input.materials.en;
      }
    }

    // Update other fields
    if (input.price !== undefined) updateData.price = input.price;
    if (input.rooms !== undefined) updateData.rooms = input.rooms;
    if (input.area !== undefined) updateData.area = input.area;
    if (input.floor !== undefined) updateData.floor = input.floor;
    if (input.address !== undefined) updateData.address = input.address;
    if (input.latitude !== undefined) updateData.latitude = input.latitude;
    if (input.longitude !== undefined) updateData.longitude = input.longitude;
    if (input.developerName !== undefined) updateData.developerName = input.developerName;
    if (input.developerId !== undefined) updateData.developerId = input.developerId;
    if (input.complexId !== undefined) updateData.complexId = input.complexId;
    if (input.airQualityIndex !== undefined) updateData.airQualityIndex = input.airQualityIndex;
    if (input.airQualitySource !== undefined) updateData.airQualitySource = input.airQualitySource;
    if (input.infrastructure !== undefined) updateData.infrastructure = input.infrastructure as Prisma.JsonValue;
    if (input.investmentGrowthPercent !== undefined) updateData.investmentGrowthPercent = input.investmentGrowthPercent;
    if (input.contactPhone !== undefined) updateData.contactPhone = input.contactPhone;
    if (input.contactTelegram !== undefined) updateData.contactTelegram = input.contactTelegram;
    if (input.contactWhatsapp !== undefined) updateData.contactWhatsapp = input.contactWhatsapp;
    if (input.contactEmail !== undefined) updateData.contactEmail = input.contactEmail;
    if (input.installmentOptions !== undefined) updateData.installmentOptions = input.installmentOptions as Prisma.JsonValue;

    // Update infrastructure notes
    if (input.infrastructureNote) {
      updateData.infrastructureNoteUz = input.infrastructureNote.uz;
      updateData.infrastructureNoteRu = input.infrastructureNote.ru;
      updateData.infrastructureNoteEn = input.infrastructureNote.en;
    }

    // Update investment notes
    if (input.investmentGrowthNote) {
      updateData.investmentGrowthNoteUz = input.investmentGrowthNote.uz;
      updateData.investmentGrowthNoteRu = input.investmentGrowthNote.ru;
      updateData.investmentGrowthNoteEn = input.investmentGrowthNote.en;
    }

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
        complex: {
          select: {
            id: true,
            name: true,
            coverImage: true,
          }
        },
        images: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    return updatedApartment;
  }

  // Delete apartment (seller can delete their own)
  async deleteApartment(apartmentId: string, userId: string, userRole: UserRole) {
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      include: { images: true }
    });

    if (!apartment) {
      throw new Error('Apartment not found');
    }

    // Check permission
    const isSellerOwned = apartment.sellerId === userId;
    const isAdmin = [UserRole.ADMIN, UserRole.MANAGER_ADMIN, UserRole.OWNER_ADMIN].includes(userRole);
    
    if (!isSellerOwned && !isAdmin) {
      throw new Error('Not authorized to delete this apartment');
    }

    // Delete associated images from filesystem
    // Note: This would require additional logic in a real application

    // Delete apartment (cascade will delete images from database)
    await prisma.apartment.delete({
      where: { id: apartmentId }
    });

    return { success: true, message: 'Apartment deleted successfully' };
  }

  // Get apartment by ID
  async getApartmentById(id: string, userId?: string, userRole?: UserRole) {
    const apartment = await prisma.apartment.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            fullName: true,
          }
        },
        complex: {
          select: {
            id: true,
            name: true,
            coverImage: true,
          }
        },
        images: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!apartment) {
      throw new Error('Apartment not found');
    }

    // Check visibility: USER cannot see HIDDEN apartments
    const isUser = userRole === UserRole.USER;
    const isHidden = apartment.status === ApartmentStatus.HIDDEN;
    
    if (isUser && isHidden) {
      throw new Error('Apartment not found');
    }

    // Check if user is seller or admin for additional info
    const isSeller = apartment.sellerId === userId;
    const isAdmin = userRole && [UserRole.ADMIN, UserRole.MANAGER_ADMIN, UserRole.OWNER_ADMIN].includes(userRole);

    // Format response
    const formattedApartment = {
      ...apartment,
      multiLanguageContent: formatMultiLanguageResponse(apartment),
      // Only include seller contact info for the seller themselves or admins
      contactInfo: (isSeller || isAdmin) ? {
        phone: apartment.contactPhone,
        telegram: apartment.contactTelegram,
        whatsapp: apartment.contactWhatsapp,
        email: apartment.contactEmail,
      } : undefined,
      infrastructure: apartment.infrastructure,
      installmentOptions: apartment.installmentOptions,
    };

    return formattedApartment;
  }

  // List apartments with filtering
  async listApartments(query: ApartmentQueryInput, userId?: string, userRole?: UserRole) {
    const {
      status,
      minPrice,
      maxPrice,
      minRooms,
      maxRooms,
      minArea,
      maxArea,
      complexId,
      developerName,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    } = query;

    // Build where clause
    const where: Prisma.ApartmentWhereInput = {};

    // Status filter
    if (status) {
      where.status = status;
    } else {
      // USER cannot see HIDDEN apartments
      if (userRole === UserRole.USER) {
        where.status = { in: [ApartmentStatus.ACTIVE, ApartmentStatus.SOLD] };
      }
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Rooms range
    if (minRooms !== undefined || maxRooms !== undefined) {
      where.rooms = {};
      if (minRooms !== undefined) where.rooms.gte = minRooms;
      if (maxRooms !== undefined) where.rooms.lte = maxRooms;
    }

    // Area range
    if (minArea !== undefined || maxArea !== undefined) {
      where.area = {};
      if (minArea !== undefined) where.area.gte = minArea;
      if (maxArea !== undefined) where.area.lte = maxArea;
    }

    // Complex filter
    if (complexId) {
      where.complexId = complexId;
    }

    // Developer filter
    if (developerName) {
      where.developerName = { contains: developerName, mode: 'insensitive' };
    }

    // Search across titles and descriptions
    if (search) {
      where.OR = [
        { titleUz: { contains: search, mode: 'insensitive' } },
        { titleRu: { contains: search, mode: 'insensitive' } },
        { titleEn: { contains: search, mode: 'insensitive' } },
        { descriptionUz: { contains: search, mode: 'insensitive' } },
        { descriptionRu: { contains: search, mode: 'insensitive' } },
        { descriptionEn: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Sort
    const orderBy: Prisma.ApartmentOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    // Execute query
    const [apartments, total] = await Promise.all([
      prisma.apartment.findMany({
        where,
        include: {
          complex: {
            select: {
              id: true,
              name: true,
              coverImage: true,
            }
          },
          images: {
            take: 1, // Only get first image for listing
            orderBy: { orderIndex: 'asc' }
          }
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.apartment.count({ where }),
    ]);

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
      address: apartment.address,
      status: apartment.status,
      developerName: apartment.developerName,
      complex: apartment.complex,
      coverImage: apartment.images[0]?.url || null,
      createdAt: apartment.createdAt,
      updatedAt: apartment.updatedAt,
    }));

    return {
      apartments: formattedApartments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  // Get apartments by seller
  async getApartmentsBySeller(sellerId: string, includeHidden: boolean = false) {
    const where: Prisma.ApartmentWhereInput = { sellerId };
    
    if (!includeHidden) {
      where.status = { not: ApartmentStatus.HIDDEN };
    }

    const apartments = await prisma.apartment.findMany({
      where,
      include: {
        complex: {
          select: {
            id: true,
            name: true,
            coverImage: true,
          }
        },
        images: {
          take: 1,
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return apartments;
  }
}