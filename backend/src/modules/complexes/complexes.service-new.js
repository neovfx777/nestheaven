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
      const distanceMeters = place.distanceMeters != null
        ? Number(place.distanceMeters)
        : null;
      if (distanceMeters == null || !place.name || !place.type) return null;
      return {
        type: String(place.type),
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
  const nearby = parseJsonMaybe(complex.nearby, []);
  const location = parseJsonMaybe(complex.location, {
    lat: complex.locationLat || 41.3111,
    lng: complex.locationLng || 69.2797,
    address: { uz: '', ru: '', en: '' },
  });
  const permissions = parseJsonMaybe(complex.permissions, null);
  const allowedSellers = parseJsonMaybe(complex.allowedSellers, []);

  return {
    id: complex.id,
    title,
    description,
    developer: complex.developer,
    city: complex.city,
    blockCount: complex.blockCount,
    amenities,
    nearby,
    location,
    walkability: complex.walkability,
    airQuality: complex.airQuality,
    bannerImage: complex.bannerImage,
    permissions,
    allowedSellers,
    createdAt: complex.createdAt,
    updatedAt: complex.updatedAt,
    createdById: complex.createdById,
    _count: complex._count,
  };
}

async function list(data) {
  const { page = 1, limit = 20, search, city } = data.query;
  const skip = (page - 1) * limit;

  const where = {};
  
  if (search) {
    // Search in title JSON field
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
}

async function getById(id) {
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
}

async function create(data, reqUser, baseUrl) {
  const body = data.body;
  const files = data.files || {};
  const complexId = data.meta?.complexId;

  const bannerFile = getFile(files, 'banner');
  const permission1File = getFile(files, 'permission1', 'permission_1');
  const permission2File = getFile(files, 'permission2', 'permission_2');
  const permission3File = getFile(files, 'permission3', 'permission_3');

  const bannerImageUrl = bannerFile ? buildUrl(complexId, bannerFile, baseUrl) : null;
  const permission1Url = permission1File ? buildUrl(complexId, permission1File, baseUrl) : null;
  const permission2Url = permission2File ? buildUrl(complexId, permission2File, baseUrl) : null;
  const permission3Url = permission3File ? buildUrl(complexId, permission3File, baseUrl) : null;

  // Build permissions JSON
  const permissionsJson = permission1Url && permission2Url && permission3Url
    ? JSON.stringify({
        permission1: permission1Url,
        permission2: permission2Url,
        permission3: permission3Url,
      })
    : null;

  // Normalize data
  const titleJson = JSON.stringify(body.title);
  const descriptionJson = JSON.stringify(body.description);
  const locationJson = JSON.stringify(body.location);
  const amenitiesJson = body.amenities ? JSON.stringify(normalizeAmenities(body.amenities)) : null;
  const nearbyJson = body.nearby ? JSON.stringify(normalizeNearbyPlaces(body.nearby)) : null;
  const allowedSellersJson = body.allowedSellers ? JSON.stringify(body.allowedSellers) : null;

  const created = await prisma.complex.create({
    data: {
      id: complexId,
      title: titleJson,
      description: descriptionJson,
      developer: body.developer,
      city: body.city,
      blockCount: body.blockCount,
      amenities: amenitiesJson,
      nearby: nearbyJson,
      location: locationJson,
      walkability: body.walkability ?? null,
      airQuality: body.airQuality ?? null,
      bannerImage: bannerImageUrl,
      permissions: permissionsJson,
      allowedSellers: allowedSellersJson,
      createdById: reqUser?.id ?? null,
    },
    include: {
      _count: { select: { apartments: true } },
    },
  });

  return formatComplex(created);
}

async function update(id, data, reqUser, baseUrl) {
  const existing = await prisma.complex.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Complex not found');
    err.statusCode = 404;
    throw err;
  }

  const body = data.body;
  const files = data.files || {};
  const updates = {};

  if (body.title !== undefined) {
    updates.title = JSON.stringify(body.title);
  }
  if (body.description !== undefined) {
    updates.description = JSON.stringify(body.description);
  }
  if (body.developer !== undefined) updates.developer = body.developer;
  if (body.city !== undefined) updates.city = body.city;
  if (body.blockCount !== undefined) updates.blockCount = body.blockCount;
  if (body.amenities !== undefined) {
    updates.amenities = body.amenities ? JSON.stringify(normalizeAmenities(body.amenities)) : null;
  }
  if (body.nearby !== undefined) {
    updates.nearby = body.nearby ? JSON.stringify(normalizeNearbyPlaces(body.nearby)) : null;
  }
  if (body.location !== undefined) {
    updates.location = JSON.stringify(body.location);
  }
  if (body.walkability !== undefined) updates.walkability = body.walkability;
  if (body.airQuality !== undefined) updates.airQuality = body.airQuality;
  if (body.allowedSellers !== undefined) {
    updates.allowedSellers = body.allowedSellers ? JSON.stringify(body.allowedSellers) : null;
  }

  // Handle file uploads
  const bannerFile = getFile(files, 'banner');
  const permission1File = getFile(files, 'permission1', 'permission_1');
  const permission2File = getFile(files, 'permission2', 'permission_2');
  const permission3File = getFile(files, 'permission3', 'permission_3');

  if (bannerFile) {
    deleteFileByUrl(existing.bannerImage);
    updates.bannerImage = buildUrl(id, bannerFile, baseUrl);
  }

  if (permission1File || permission2File || permission3File) {
    const nextPermission1 = permission1File ? buildUrl(id, permission1File, baseUrl) : (parseJsonMaybe(existing.permissions, {})?.permission1 || null);
    const nextPermission2 = permission2File ? buildUrl(id, permission2File, baseUrl) : (parseJsonMaybe(existing.permissions, {})?.permission2 || null);
    const nextPermission3 = permission3File ? buildUrl(id, permission3File, baseUrl) : (parseJsonMaybe(existing.permissions, {})?.permission3 || null);

    if (nextPermission1 && nextPermission2 && nextPermission3) {
      updates.permissions = JSON.stringify({
        permission1: nextPermission1,
        permission2: nextPermission2,
        permission3: nextPermission3,
      });
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
}

async function remove(id, reqUser) {
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

  deleteFileByUrl(existing.bannerImage);
  const permissions = parseJsonMaybe(existing.permissions, {});
  if (permissions.permission1) deleteFileByUrl(permissions.permission1);
  if (permissions.permission2) deleteFileByUrl(permissions.permission2);
  if (permissions.permission3) deleteFileByUrl(permissions.permission3);
  
  removeComplexDirIfEmpty(existing.id);

  await prisma.complex.delete({ where: { id } });
  return { success: true };
}

async function getForSeller(data, reqUser) {
  if (reqUser.role !== 'SELLER') {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  const { page = 1, limit = 20, search, city } = data.query;
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

  // Filter by allowedSellers
  const filtered = complexes.filter((complex) => {
    if (!complex.allowedSellers) return true; // Null means accessible to all
    try {
      const allowed = JSON.parse(complex.allowedSellers);
      return Array.isArray(allowed) && allowed.includes(reqUser.id);
    } catch {
      return false;
    }
  });

  return {
    items: filtered.map(formatComplex),
    pagination: {
      total: filtered.length,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(filtered.length / limit) || 1,
    },
  };
}

module.exports = { list, getById, create, update, remove, getForSeller };
