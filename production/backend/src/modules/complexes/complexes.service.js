const { prisma } = require('../../config/db');
const { deleteFileByUrl, removeComplexDirIfEmpty } = require('../../middleware/upload');

function getFile(files, ...names) {
  for (const name of names) {
    const file = files?.[name]?.[0];
    if (file) return file;
  }
  return null;
}

function buildUrl(complexId, file, baseUrl) {
  const relative = `/uploads/complexes/${complexId}/${file.filename}`;
  if (!baseUrl) return relative;
  return `${baseUrl}${relative}`;
}

function parseJsonMaybe(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
}

function normalizeNearbyPlaces(places) {
  if (!Array.isArray(places)) return [];
  return places
    .map((place) => {
      const distanceMeters =
        place.distanceMeters != null
          ? Number(place.distanceMeters)
          : place.distanceKm != null
          ? Math.round(Number(place.distanceKm) * 1000)
          : null;
      // Only require name, type is optional (not in validator schema)
      if (distanceMeters == null || !place.name) return null;
      return {
        type: place.type ? String(place.type) : 'other', // Default type if not provided
        name: String(place.name),
        distanceMeters,
        note: place.note ? String(place.note) : null,
      };
    })
    .filter(Boolean);
}

function normalizeAmenities(amenities) {
  if (!Array.isArray(amenities)) return [];
  return amenities.map((item) => String(item)).filter(Boolean);
}

function formatComplex(complex) {
  const title = parseJsonMaybe(complex.title, { uz: '', ru: '', en: '' });
  const description = parseJsonMaybe(complex.description, null);
  const amenities = parseJsonMaybe(complex.amenities, []);
  const nearby = parseJsonMaybe(complex.nearbyPlaces || complex.nearby, []); // Use nearbyPlaces from schema
  const location = complex.locationLat && complex.locationLng ? {
    lat: complex.locationLat,
    lng: complex.locationLng,
    address: parseJsonMaybe(complex.address || complex.locationText, { uz: '', ru: '', en: '' }),
  } : parseJsonMaybe(complex.location, {
    lat: complex.latitude || 41.3111,
    lng: complex.longitude || 69.2797,
    address: parseJsonMaybe(complex.address, { uz: '', ru: '', en: '' }),
  });
  const permissions = parseJsonMaybe(complex.permissions, null);
  const allowedSellers = parseJsonMaybe(complex.allowedSellers, []);

  return {
    id: complex.id,
    title,
    description,
    developer: complex.developer || null,
    city: complex.city,
    blockCount: complex.blockCount || 1,
    amenities,
    nearby,
    location,
    walkability: complex.walkabilityRating || complex.walkabilityScore || null,
    airQuality: complex.airQualityRating || complex.airQualityScore || null,
    bannerImage: complex.bannerImageUrl || null,
    permissions,
    allowedSellers,
    createdAt: complex.createdAt,
    updatedAt: complex.updatedAt,
    createdById: complex.createdById,
    _count: complex._count,
  };
}

async function list(data) {
  try {
    const { page = 1, limit = 20, search, city } = data.query || {};
    const skip = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { developer: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (city) {
      where.city = city;
    }

    const total = await prisma.complex.count({ where });
    const complexes = await prisma.complex.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        _count: { select: { apartments: true } },
      },
    });

    return {
      items: complexes.map(formatComplex),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  } catch (error) {
    console.error('Error in complexes.list:', error);
    throw error;
  }
}

async function getById(id) {
  try {
    const complex = await prisma.complex.findUnique({
      where: { id },
      include: {
        apartments: { select: { id: true, status: true } },
        _count: { select: { apartments: true } },
      },
    });
    
    if (!complex) {
      const err = new Error('Complex not found');
      err.statusCode = 404;
      throw err;
    }

    const formatted = formatComplex(complex);
    return {
      ...formatted,
      apartments: complex.apartments,
    };
  } catch (error) {
    console.error('Error in complexes.getById:', error);
    throw error;
  }
}

async function create(data, reqUser, baseUrl) {
  try {
    const body = data.body || {};
    const files = data.files || {};
    const complexId = data.meta?.complexId;

    if (!complexId) {
      const err = new Error('Complex ID is missing');
      err.statusCode = 400;
      throw err;
    }

    // Ensure city is set
    if (!body.city || (typeof body.city === 'string' && !body.city.trim())) {
      body.city = 'Unknown';
    }

    const bannerFile = getFile(files, 'banner');
    const permission1File = getFile(files, 'permission1', 'permission_1');
    const permission2File = getFile(files, 'permission2', 'permission_2');
    const permission3File = getFile(files, 'permission3', 'permission_3');

    const bannerImageUrl = bannerFile ? buildUrl(complexId, bannerFile, baseUrl) : null;
    const permission1Url = permission1File ? buildUrl(complexId, permission1File, baseUrl) : null;
    const permission2Url = permission2File ? buildUrl(complexId, permission2File, baseUrl) : null;
    const permission3Url = permission3File ? buildUrl(complexId, permission3File, baseUrl) : null;

    // Build permissions JSON
    let permissionsJson = null;
    if (permission1Url && permission2Url && permission3Url) {
      permissionsJson = JSON.stringify({
        permission1: permission1Url,
        permission2: permission2Url,
        permission3: permission3Url,
      });
    }

    // Handle title - can be JSON string or object
    let titleJson;
    if (typeof body.title === 'string' && body.title.trim()) {
      try {
        const parsed = JSON.parse(body.title);
        // Ensure it has the required structure
        if (parsed && typeof parsed === 'object' && parsed.uz && parsed.ru && parsed.en) {
          // Validate that at least one language has content
          const hasContent = (parsed.uz && parsed.uz.trim()) || (parsed.ru && parsed.ru.trim()) || (parsed.en && parsed.en.trim());
          if (hasContent) {
            titleJson = JSON.stringify(parsed);
          } else {
            // Empty content, use default
            titleJson = JSON.stringify({ uz: 'Complex', ru: 'Complex', en: 'Complex' });
          }
        } else {
          // Invalid structure, create default
          titleJson = JSON.stringify({ uz: body.title.trim() || 'Complex', ru: body.title.trim() || 'Complex', en: body.title.trim() || 'Complex' });
        }
      } catch {
        // Old format: plain string
        const titleStr = body.title.trim() || 'Complex';
        titleJson = JSON.stringify({ uz: titleStr, ru: titleStr, en: titleStr });
      }
    } else if (body.title && typeof body.title === 'object') {
      // Ensure all required fields exist
      const title = {
        uz: (body.title.uz && body.title.uz.trim()) || 'Complex',
        ru: (body.title.ru && body.title.ru.trim()) || 'Complex',
        en: (body.title.en && body.title.en.trim()) || 'Complex',
      };
      titleJson = JSON.stringify(title);
    } else {
      // No title provided, use default
      titleJson = JSON.stringify({ uz: 'Complex', ru: 'Complex', en: 'Complex' });
    }
    
    // Ensure name is never empty (required field) - double check
    if (!titleJson || titleJson.trim() === '' || titleJson === 'null' || titleJson === '""' || titleJson === '{}') {
      titleJson = JSON.stringify({ uz: 'Complex', ru: 'Complex', en: 'Complex' });
    }
    
    // Final validation: ensure titleJson is a valid non-empty JSON string
    try {
      const testParse = JSON.parse(titleJson);
      if (!testParse || typeof testParse !== 'object') {
        titleJson = JSON.stringify({ uz: 'Complex', ru: 'Complex', en: 'Complex' });
      }
    } catch {
      titleJson = JSON.stringify({ uz: 'Complex', ru: 'Complex', en: 'Complex' });
    }

    // Handle description
    let descriptionJson = null;
    if (body.description) {
      if (typeof body.description === 'string') {
        try {
          const parsed = JSON.parse(body.description);
          descriptionJson = JSON.stringify(parsed);
        } catch {
          descriptionJson = JSON.stringify({ uz: body.description, ru: body.description, en: body.description });
        }
      } else {
        descriptionJson = JSON.stringify(body.description);
      }
    }

    // Handle location - can be JSON string or object, or use old format
    let locationJson;
    if (body.location) {
      if (typeof body.location === 'string') {
        try {
          const parsed = JSON.parse(body.location);
          locationJson = JSON.stringify(parsed);
        } catch {
          locationJson = JSON.stringify({
            lat: body.locationLat || 41.3111,
            lng: body.locationLng || 69.2797,
            address: { uz: body.locationText || '', ru: body.locationText || '', en: body.locationText || '' },
          });
        }
      } else {
        locationJson = JSON.stringify(body.location);
      }
    } else if (body.locationLat && body.locationLng) {
      // Old format
      locationJson = JSON.stringify({
        lat: body.locationLat,
        lng: body.locationLng,
        address: {
          uz: body.locationText || '',
          ru: body.locationText || '',
          en: body.locationText || '',
        },
      });
    } else {
      locationJson = JSON.stringify({
        lat: 41.3111,
        lng: 69.2797,
        address: { uz: '', ru: '', en: '' },
      });
    }
    
    let amenitiesJson = null;
    if (body.amenities) {
      let amenitiesData = body.amenities;
      if (typeof amenitiesData === 'string') {
        try {
          amenitiesData = JSON.parse(amenitiesData);
        } catch {
          amenitiesData = [];
        }
      }
      const normalizedAmenities = normalizeAmenities(amenitiesData);
      if (normalizedAmenities.length > 0) {
        amenitiesJson = JSON.stringify(normalizedAmenities);
      }
    }

    let nearbyJson = null;
    if (body.nearby || body.nearbyPlaces) {
      const nearbyData = body.nearby || body.nearbyPlaces;
      let parsedNearby = nearbyData;
      if (typeof nearbyData === 'string') {
        try {
          parsedNearby = JSON.parse(nearbyData);
        } catch {
          parsedNearby = [];
        }
      }
      const normalizedNearby = normalizeNearbyPlaces(parsedNearby);
      if (normalizedNearby.length > 0) {
        nearbyJson = JSON.stringify(normalizedNearby);
      }
    }

    let allowedSellersJson = null;
    if (body.allowedSellers) {
      let sellersArray = body.allowedSellers;
      if (typeof sellersArray === 'string') {
        try {
          sellersArray = JSON.parse(sellersArray);
        } catch {
          sellersArray = [];
        }
      }
      if (Array.isArray(sellersArray) && sellersArray.length > 0) {
        allowedSellersJson = JSON.stringify(sellersArray);
      }
    }

    // Parse location JSON to extract lat/lng/text
    let locationLat = null;
    let locationLng = null;
    let locationText = null;
    let addressJson = null;
    
    if (locationJson) {
      try {
        const locationData = typeof locationJson === 'string' ? JSON.parse(locationJson) : locationJson;
        locationLat = locationData.lat ?? null;
        locationLng = locationData.lng ?? null;
        locationText = locationData.address?.uz || locationData.address?.en || locationData.address?.ru || null;
        addressJson = JSON.stringify(locationData.address || {});
      } catch (e) {
        console.error('Error parsing location:', e);
      }
    }

    // Prepare data object
    const createData = {
      id: complexId,
      title: titleJson,
      description: descriptionJson,
      name: titleJson, // Legacy field - required, must be non-empty string
      address: addressJson || locationJson || JSON.stringify({ uz: '', ru: '', en: '' }), // Legacy field
      city: (body.city && typeof body.city === 'string' && body.city.trim()) || 'Unknown', // Required field in schema
      developer: body.developer || null,
      blockCount: body.blockCount ? parseInt(body.blockCount) : 1,
      amenities: amenitiesJson,
      nearbyPlaces: nearbyJson,
      locationLat: locationLat,
      locationLng: locationLng,
      locationText: locationText,
      latitude: locationLat, // Legacy field
      longitude: locationLng, // Legacy field
      walkabilityRating: (body.walkability !== undefined && body.walkability !== null && body.walkability !== '') 
        ? parseInt(body.walkability) 
        : (body.walkabilityRating !== undefined && body.walkabilityRating !== null && body.walkabilityRating !== '')
          ? parseInt(body.walkabilityRating)
          : null,
      airQualityRating: (body.airQuality !== undefined && body.airQuality !== null && body.airQuality !== '')
        ? parseInt(body.airQuality)
        : (body.airQualityRating !== undefined && body.airQualityRating !== null && body.airQualityRating !== '')
          ? parseInt(body.airQualityRating)
          : null,
      walkabilityScore: (body.walkability !== undefined && body.walkability !== null && body.walkability !== '') 
        ? parseInt(body.walkability) 
        : (body.walkabilityRating !== undefined && body.walkabilityRating !== null && body.walkabilityRating !== '')
          ? parseInt(body.walkabilityRating)
          : null, // Legacy field
      airQualityScore: (body.airQuality !== undefined && body.airQuality !== null && body.airQuality !== '')
        ? parseInt(body.airQuality)
        : (body.airQualityRating !== undefined && body.airQualityRating !== null && body.airQualityRating !== '')
          ? parseInt(body.airQualityRating)
          : null, // Legacy field
      bannerImageUrl: bannerImageUrl,
      permission1Url: permission1Url,
      permission2Url: permission2Url,
      permission3Url: permission3Url,
      permissions: permissionsJson,
      allowedSellers: allowedSellersJson,
      createdById: reqUser?.id ?? null,
    };

    console.log('=== Prisma Create Data ===');
    console.log('Data keys:', Object.keys(createData));
    console.log('Name:', createData.name?.substring(0, 100));
    console.log('City:', createData.city);
    console.log('Title:', createData.title?.substring(0, 100));
    console.log('Developer:', createData.developer);
    console.log('BlockCount:', createData.blockCount);
    console.log('WalkabilityRating:', createData.walkabilityRating);
    console.log('AirQualityRating:', createData.airQualityRating);

    // Remove undefined values to avoid Prisma errors
    const cleanedData = Object.fromEntries(
      Object.entries(createData).filter(([_, v]) => v !== undefined && v !== null)
    );

    // Ensure required fields are present
    if (!cleanedData.name || cleanedData.name.trim() === '') {
      cleanedData.name = JSON.stringify({ uz: 'Complex', ru: 'Complex', en: 'Complex' });
    }
    if (!cleanedData.city || cleanedData.city.trim() === '') {
      cleanedData.city = 'Unknown';
    }

    console.log('Cleaned data keys:', Object.keys(cleanedData));
    console.log('Name value:', cleanedData.name?.substring(0, 100));
    console.log('City value:', cleanedData.city);

    console.log('Attempting Prisma create with data:', {
      id: cleanedData.id,
      name: cleanedData.name?.substring(0, 50),
      city: cleanedData.city,
      hasTitle: !!cleanedData.title,
      hasName: !!cleanedData.name,
    });

    let created;
    try {
      created = await prisma.complex.create({
        data: cleanedData,
        include: {
          _count: { select: { apartments: true } },
        },
      });
      console.log('✅ Complex created successfully:', created.id);
    } catch (prismaError) {
      console.error('❌ Prisma create error:', {
        code: prismaError.code,
        message: prismaError.message,
        meta: prismaError.meta,
      });
      throw prismaError;
    }

    return formatComplex(created);
  } catch (error) {
    console.error('Error in complexes.create:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    console.error('Request data:', {
      body: JSON.stringify(data?.body || {}, null, 2),
      hasFiles: !!data?.files,
      fileKeys: Object.keys(data?.files || {}),
      complexId: data?.meta?.complexId,
    });
    
    // Ensure error has statusCode for proper error handling
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    
    throw error;
  }
}

async function update(id, data, reqUser, baseUrl) {
  try {
    const existing = await prisma.complex.findUnique({ where: { id } });
    if (!existing) {
      const err = new Error('Complex not found');
      err.statusCode = 404;
      throw err;
    }

    const body = data.body;
    const files = data.files || {};
    const updates = {};

    // Handle title - can be JSON string or object
    if (body.title !== undefined) {
      if (typeof body.title === 'string') {
        try {
          const parsed = JSON.parse(body.title);
          updates.title = JSON.stringify(parsed);
          updates.name = JSON.stringify(parsed); // Legacy field
        } catch {
          updates.title = JSON.stringify({ uz: body.title, ru: body.title, en: body.title });
          updates.name = JSON.stringify({ uz: body.title, ru: body.title, en: body.title });
        }
      } else {
        updates.title = JSON.stringify(body.title);
        updates.name = JSON.stringify(body.title); // Legacy field
      }
    }
    
    if (body.description !== undefined) {
      if (typeof body.description === 'string') {
        try {
          const parsed = JSON.parse(body.description);
          updates.description = JSON.stringify(parsed);
        } catch {
          updates.description = JSON.stringify({ uz: body.description, ru: body.description, en: body.description });
        }
      } else {
        updates.description = body.description ? JSON.stringify(body.description) : null;
      }
    }
    
    if (body.developer !== undefined) updates.developer = body.developer;
    if (body.city !== undefined) updates.city = body.city;
    if (body.blockCount !== undefined) updates.blockCount = parseInt(body.blockCount);
    
    if (body.amenities !== undefined) {
      let amenitiesData = body.amenities;
      if (typeof amenitiesData === 'string') {
        try {
          amenitiesData = JSON.parse(amenitiesData);
        } catch {
          amenitiesData = [];
        }
      }
      updates.amenities = amenitiesData && Array.isArray(amenitiesData) && amenitiesData.length > 0
        ? JSON.stringify(normalizeAmenities(amenitiesData))
        : null;
    }
    
    if (body.nearby !== undefined || body.nearbyPlaces !== undefined) {
      const nearbyData = body.nearby || body.nearbyPlaces;
      let parsedNearby = nearbyData;
      if (typeof nearbyData === 'string') {
        try {
          parsedNearby = JSON.parse(nearbyData);
        } catch {
          parsedNearby = [];
        }
      }
      updates.nearbyPlaces = parsedNearby && Array.isArray(parsedNearby) && parsedNearby.length > 0
        ? JSON.stringify(normalizeNearbyPlaces(parsedNearby))
        : null;
    }
    
    // Handle location - parse and update locationLat, locationLng, locationText
    if (body.location !== undefined) {
      let locationData;
      if (typeof body.location === 'string') {
        try {
          locationData = JSON.parse(body.location);
        } catch {
          locationData = null;
        }
      } else {
        locationData = body.location;
      }
      
      if (locationData) {
        updates.locationLat = locationData.lat ?? null;
        updates.locationLng = locationData.lng ?? null;
        updates.locationText = locationData.address?.uz || locationData.address?.en || locationData.address?.ru || null;
        updates.latitude = locationData.lat ?? null; // Legacy field
        updates.longitude = locationData.lng ?? null; // Legacy field
        updates.address = JSON.stringify(locationData.address || {}); // Legacy field
      }
    }
    
    if (body.walkability !== undefined || body.walkabilityRating !== undefined) {
      const value = body.walkability ?? body.walkabilityRating;
      updates.walkabilityRating = value ? parseInt(value) : null;
      updates.walkabilityScore = value ? parseInt(value) : null; // Legacy field
    }
    
    if (body.airQuality !== undefined || body.airQualityRating !== undefined) {
      const value = body.airQuality ?? body.airQualityRating;
      updates.airQualityRating = value ? parseInt(value) : null;
      updates.airQualityScore = value ? parseInt(value) : null; // Legacy field
    }
    
    if (body.allowedSellers !== undefined) {
      let sellersArray = body.allowedSellers;
      if (typeof sellersArray === 'string') {
        try {
          sellersArray = JSON.parse(sellersArray);
        } catch {
          sellersArray = [];
        }
      }
      updates.allowedSellers = sellersArray && Array.isArray(sellersArray) && sellersArray.length > 0
        ? JSON.stringify(sellersArray)
        : null;
    }

    // Handle file uploads
    const bannerFile = getFile(files, 'banner');
    const permission1File = getFile(files, 'permission1', 'permission_1');
    const permission2File = getFile(files, 'permission2', 'permission_2');
    const permission3File = getFile(files, 'permission3', 'permission_3');

    if (bannerFile) {
      if (existing.bannerImageUrl) {
        deleteFileByUrl(existing.bannerImageUrl);
      }
      updates.bannerImageUrl = buildUrl(id, bannerFile, baseUrl);
    }

    // Handle permissions
    const existingPermissions = parseJsonMaybe(existing.permissions, {});
    
    if (permission1File || permission2File || permission3File) {
      const nextPermission1 = permission1File 
        ? buildUrl(id, permission1File, baseUrl) 
        : (existingPermissions.permission1 || null);
      const nextPermission2 = permission2File 
        ? buildUrl(id, permission2File, baseUrl) 
        : (existingPermissions.permission2 || null);
      const nextPermission3 = permission3File 
        ? buildUrl(id, permission3File, baseUrl) 
        : (existingPermissions.permission3 || null);

      if (nextPermission1 && nextPermission2 && nextPermission3) {
        // Delete old files if replaced
        if (permission1File && existingPermissions.permission1) {
          deleteFileByUrl(existingPermissions.permission1);
        }
        if (permission2File && existingPermissions.permission2) {
          deleteFileByUrl(existingPermissions.permission2);
        }
        if (permission3File && existingPermissions.permission3) {
          deleteFileByUrl(existingPermissions.permission3);
        }

        updates.permissions = JSON.stringify({
          permission1: nextPermission1,
          permission2: nextPermission2,
          permission3: nextPermission3,
        });
        updates.permission1Url = nextPermission1;
        updates.permission2Url = nextPermission2;
        updates.permission3Url = nextPermission3;
      }
    }

    const updated = await prisma.complex.update({
      where: { id },
      data: updates,
      include: {
        _count: { select: { apartments: true } },
      },
    });

    return formatComplex(updated);
  } catch (error) {
    console.error('Error in complexes.update:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    console.error('Error in complexes.update:', error);
    throw error;
  }
}

async function remove(id, reqUser) {
  try {
    const existing = await prisma.complex.findUnique({
      where: { id },
      include: { _count: { select: { apartments: true } } },
    });
    
    if (!existing) {
      const err = new Error('Complex not found');
      err.statusCode = 404;
      throw err;
    }

    if (existing._count.apartments > 0) {
      const err = new Error(
        'Cannot delete complex with existing apartments. Unlink or move apartments first.'
      );
      err.statusCode = 400;
      throw err;
    }

    // Delete files
    if (existing.bannerImage) {
      deleteFileByUrl(existing.bannerImage);
    }
    
    const permissions = parseJsonMaybe(existing.permissions, {});
    if (permissions.permission1) deleteFileByUrl(permissions.permission1);
    if (permissions.permission2) deleteFileByUrl(permissions.permission2);
    if (permissions.permission3) deleteFileByUrl(permissions.permission3);
    
    removeComplexDirIfEmpty(existing.id);

    await prisma.complex.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error('Error in complexes.remove:', error);
    throw error;
  }
}

async function getForSeller(data, reqUser) {
  try {
    if (!reqUser || reqUser.role !== 'SELLER') {
      const err = new Error('Access denied. Seller role required.');
      err.statusCode = 403;
      throw err;
    }

    const { page = 1, limit = 20, search, city } = data.query || {};
    const skip = (page - 1) * limit;

    // Get all complexes first (since JSON filtering is complex in Prisma)
    const allComplexes = await prisma.complex.findMany({
      include: {
        _count: { select: { apartments: true } },
      },
    });

    // Filter complexes where seller is in allowedSellers
    let filtered = allComplexes.filter((complex) => {
      // If allowedSellers is null/empty, complex is accessible to all sellers
      if (!complex.allowedSellers) return true;
      
      try {
        const allowed = JSON.parse(complex.allowedSellers);
        return Array.isArray(allowed) && allowed.includes(reqUser.id);
      } catch {
        return false;
      }
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((complex) => {
        const title = complex.title ? complex.title.toLowerCase() : '';
        const developer = complex.developer ? complex.developer.toLowerCase() : '';
        return title.includes(searchLower) || developer.includes(searchLower);
      });
    }

    // Apply city filter
    if (city) {
      filtered = filtered.filter((complex) => complex.city === city);
    }

    // Sort by createdAt desc
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate
    const paginated = filtered.slice(skip, skip + limit);

    return {
      items: paginated.map(formatComplex),
      pagination: {
        total: filtered.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(filtered.length / limit) || 1,
      },
    };
  } catch (error) {
    console.error('Error in complexes.getForSeller:', error);
    throw error;
  }
}

module.exports = { list, getById, create, update, remove, getForSeller };