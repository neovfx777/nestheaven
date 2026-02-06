const { prisma } = require('../../config/db');

function ensureI18n(val) {
  if (typeof val === 'string') return { uz: val, ru: val, en: val };
  return val;
}

function mapPermissionsFromFiles(files) {
  const fields = ['permission_1', 'permission_2', 'permission_3'];
  const items = fields.map((field) => {
    const file = files[field]?.[0];
    if (!file) return null;
    return {
      id: field,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      filename: file.filename,
      url: `/uploads/${file.filename}`,
    };
  });

  return JSON.stringify(items.filter(Boolean));
}

function formatComplex(complex) {
  // Parse i18n JSON fields back to objects for API consumers
  let name = complex.name;
  let address = complex.address;
  try {
    if (typeof name === 'string') {
      name = JSON.parse(name);
    }
  } catch {
    // keep as-is
  }
  try {
    if (typeof address === 'string') {
      address = JSON.parse(address);
    }
  } catch {
    // keep as-is
  }

  let permissions = null;
  if (typeof complex.permissions === 'string') {
    try {
      permissions = JSON.parse(complex.permissions);
    } catch {
      permissions = null;
    }
  }

  return {
    id: complex.id,
    title: name,
    description: complex.description,
    address,
    city: complex.city,
    location: {
      latitude: complex.latitude,
      longitude: complex.longitude,
    },
    walkabilityScore: complex.walkabilityScore,
    airQualityScore: complex.airQualityScore,
    airQualityNote: complex.airQualityNote,
    nearbyInfrastructureText: complex.nearbyInfrastructure,
    permissions,
    createdAt: complex.createdAt,
    updatedAt: complex.updatedAt,
    _count: complex._count,
  };
}

async function list(reqUser) {
  const complexes = await prisma.complex.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { apartments: true } },
    },
  });

  return complexes.map(formatComplex);
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

async function create(data, reqUser) {
  const body = data.body;
  const files = data.files || {};

  const title = ensureI18n(body.title);
  const address = body.address ? ensureI18n(body.address) : null;
  const permissionsJson = mapPermissionsFromFiles(files);

  const created = await prisma.complex.create({
    data: {
      name: JSON.stringify(title),
      address: address ? JSON.stringify(address) : null,
      city: body.city,
      description: body.description,
      permissions: permissionsJson,
      latitude: body.latitude,
      longitude: body.longitude,
      walkabilityScore: body.walkabilityScore,
      airQualityScore: body.airQualityScore ?? null,
      airQualityNote: body.airQualityNote ?? null,
      nearbyInfrastructure: body.nearbyInfrastructureText,
    },
    include: {
      _count: { select: { apartments: true } },
    },
  });

  return formatComplex(created);
}

async function update(id, data, reqUser) {
  const existing = await prisma.complex.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Complex not found');
    err.statusCode = 404;
    throw err;
  }

  const body = data.body;
  const updates = {};

  if (body.title !== undefined) {
    updates.name = JSON.stringify(ensureI18n(body.title));
  }
  if (body.address !== undefined) {
    updates.address = body.address ? JSON.stringify(ensureI18n(body.address)) : null;
  }
  if (body.city !== undefined) updates.city = body.city;
  if (body.description !== undefined) updates.description = body.description;
  if (body.latitude !== undefined) updates.latitude = body.latitude;
  if (body.longitude !== undefined) updates.longitude = body.longitude;
  if (body.walkabilityScore !== undefined)
    updates.walkabilityScore = body.walkabilityScore;
  if (body.airQualityScore !== undefined)
    updates.airQualityScore = body.airQualityScore;
  if (body.airQualityNote !== undefined)
    updates.airQualityNote = body.airQualityNote;
  if (body.nearbyInfrastructureText !== undefined)
    updates.nearbyInfrastructure = body.nearbyInfrastructureText;

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

  // Behavioral rule: deleting a complex must NOT delete apartments.
  // We restrict deletion if apartments exist.
  if (existing._count.apartments > 0) {
    const err = new Error(
      'Cannot delete complex with existing apartments. Unlink or move apartments first.'
    );
    err.statusCode = 400;
    throw err;
  }

  await prisma.complex.delete({ where: { id } });
  return { success: true };
}

module.exports = { list, getById, create, update, remove };
