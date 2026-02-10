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
      if (distanceMeters == null || !place.name) return null;
      return {
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

function buildPermissionsPayload(urls) {
  const items = [];
  if (urls.permission1Url) items.push({ id: 'permission1', url: urls.permission1Url });
  if (urls.permission2Url) items.push({ id: 'permission2', url: urls.permission2Url });
  if (urls.permission3Url) items.push({ id: 'permission3', url: urls.permission3Url });
  return items.length ? JSON.stringify(items) : null;
}

function formatComplex(complex) {
  const permissions = parseJsonMaybe(complex.permissions, null);
  const nearbyPlaces = parseJsonMaybe(complex.nearbyPlaces, []);
  const amenities = parseJsonMaybe(complex.amenities, []);
  const parsedName = parseJsonMaybe(complex.name, complex.name);
  const parsedAddress = parseJsonMaybe(complex.address, complex.address);
  const title =
    complex.title ||
    (typeof parsedName === 'string'
      ? parsedName
      : parsedName?.en || parsedName?.uz || parsedName?.ru || '');
  const locationText =
    complex.locationText ||
    (typeof parsedAddress === 'string'
      ? parsedAddress
      : parsedAddress?.en || parsedAddress?.uz || parsedAddress?.ru || '');

  return {
    id: complex.id,
    title,
    description: complex.description,
    locationText,
    locationLat: complex.locationLat ?? complex.latitude,
    locationLng: complex.locationLng ?? complex.longitude,
    bannerImageUrl: complex.bannerImageUrl,
    permission1Url: complex.permission1Url,
    permission2Url: complex.permission2Url,
    permission3Url: complex.permission3Url,
    walkabilityRating: complex.walkabilityRating ?? complex.walkabilityScore,
    airQualityRating: complex.airQualityRating ?? complex.airQualityScore,
    nearbyNote: complex.nearbyNote ?? complex.nearbyInfrastructure,
    nearbyPlaces,
    amenities,
    createdAt: complex.createdAt,
    updatedAt: complex.updatedAt,
    createdById: complex.createdById ?? null,
    _count: complex._count,

    // legacy fields for compatibility
    name: parsedName,
    address: parsedAddress,
    city: complex.city,
    latitude: complex.latitude,
    longitude: complex.longitude,
    walkabilityScore: complex.walkabilityScore,
    airQualityScore: complex.airQualityScore,
    airQualityNote: complex.airQualityNote,
    nearbyInfrastructure: complex.nearbyInfrastructure,
    permissions,
    coverImage: complex.bannerImageUrl || null,
  };
}

async function list(data) {
  const { page = 1, limit = 20, title } = data.query;
  const skip = (page - 1) * limit;

  const where = {};
  if (title) {
    where.OR = [
      { title: { contains: title, mode: 'insensitive' } },
      { name: { contains: title, mode: 'insensitive' } },
    ];
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
  const permission1Url = permission1File
    ? buildUrl(complexId, permission1File, baseUrl)
    : null;
  const permission2Url = permission2File
    ? buildUrl(complexId, permission2File, baseUrl)
    : null;
  const permission3Url = permission3File
    ? buildUrl(complexId, permission3File, baseUrl)
    : null;

  const nearbyPlaces = normalizeNearbyPlaces(body.nearbyPlaces);
  const amenities = normalizeAmenities(body.amenities);
  const nearbyPlacesJson = nearbyPlaces.length ? JSON.stringify(nearbyPlaces) : null;
  const amenitiesJson = amenities.length ? JSON.stringify(amenities) : null;

  const created = await prisma.complex.create({
    data: {
      id: complexId,
      title: body.title,
      description: body.description,
      locationText: body.locationText,
      locationLat: body.locationLat,
      locationLng: body.locationLng,
      bannerImageUrl,
      permission1Url,
      permission2Url,
      permission3Url,
      walkabilityRating: body.walkabilityRating,
      airQualityRating: body.airQualityRating,
      nearbyNote: body.nearbyNote ?? null,
      nearbyPlaces: nearbyPlacesJson,
      amenities: amenitiesJson,
      createdById: reqUser?.id ?? null,

      // legacy fields for compatibility
      name: body.title,
      address: body.locationText,
      city: body.city || 'Unknown',
      latitude: body.locationLat,
      longitude: body.locationLng,
      walkabilityScore: body.walkabilityRating,
      airQualityScore: body.airQualityRating,
      nearbyInfrastructure: body.nearbyNote ?? null,
      permissions: buildPermissionsPayload({ permission1Url, permission2Url, permission3Url }),
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
    updates.title = body.title;
    updates.name = body.title;
  }
  if (body.description !== undefined) updates.description = body.description;
  if (body.locationText !== undefined) {
    updates.locationText = body.locationText;
    updates.address = body.locationText;
  }
  if (body.locationLat !== undefined) {
    updates.locationLat = body.locationLat;
    updates.latitude = body.locationLat;
  }
  if (body.locationLng !== undefined) {
    updates.locationLng = body.locationLng;
    updates.longitude = body.locationLng;
  }
  if (body.walkabilityRating !== undefined) {
    updates.walkabilityRating = body.walkabilityRating;
    updates.walkabilityScore = body.walkabilityRating;
  }
  if (body.airQualityRating !== undefined) {
    updates.airQualityRating = body.airQualityRating;
    updates.airQualityScore = body.airQualityRating;
  }
  if (body.nearbyNote !== undefined) {
    updates.nearbyNote = body.nearbyNote;
    updates.nearbyInfrastructure = body.nearbyNote;
  }
  if (body.nearbyPlaces !== undefined) {
    updates.nearbyPlaces = JSON.stringify(normalizeNearbyPlaces(body.nearbyPlaces));
  }
  if (body.amenities !== undefined) {
    updates.amenities = JSON.stringify(normalizeAmenities(body.amenities));
  }
  if (body.city !== undefined) updates.city = body.city;

  const bannerFile = getFile(files, 'banner');
  const permission1File = getFile(files, 'permission1', 'permission_1');
  const permission2File = getFile(files, 'permission2', 'permission_2');
  const permission3File = getFile(files, 'permission3', 'permission_3');

  if (bannerFile) {
    deleteFileByUrl(existing.bannerImageUrl);
    updates.bannerImageUrl = buildUrl(id, bannerFile, baseUrl);
  }
  if (permission1File) {
    deleteFileByUrl(existing.permission1Url);
    updates.permission1Url = buildUrl(id, permission1File, baseUrl);
  }
  if (permission2File) {
    deleteFileByUrl(existing.permission2Url);
    updates.permission2Url = buildUrl(id, permission2File, baseUrl);
  }
  if (permission3File) {
    deleteFileByUrl(existing.permission3Url);
    updates.permission3Url = buildUrl(id, permission3File, baseUrl);
  }

  if (permission1File || permission2File || permission3File) {
    const nextPermission1 = updates.permission1Url || existing.permission1Url;
    const nextPermission2 = updates.permission2Url || existing.permission2Url;
    const nextPermission3 = updates.permission3Url || existing.permission3Url;
    updates.permissions = buildPermissionsPayload({
      permission1Url: nextPermission1,
      permission2Url: nextPermission2,
      permission3Url: nextPermission3,
    });
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

  deleteFileByUrl(existing.bannerImageUrl);
  deleteFileByUrl(existing.permission1Url);
  deleteFileByUrl(existing.permission2Url);
  deleteFileByUrl(existing.permission3Url);
  removeComplexDirIfEmpty(existing.id);

  await prisma.complex.delete({ where: { id } });
  return { success: true };
}

module.exports = { list, getById, create, update, remove };
