const { prisma } = require('../../config/db');
const { ROLES } = require('../../utils/roles');

function ensureI18n(val) {
  if (typeof val === 'string') return { uz: val, ru: val, en: val };
  return val;
}

async function list(reqUser) {
  return prisma.complex.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { apartments: true } },
    },
  });
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
  return complex;
}

async function create(data, reqUser) {
  const name = ensureI18n(data.body.name);
  const address = data.body.address ? ensureI18n(data.body.address) : null;

  return prisma.complex.create({
    data: {
      name: JSON.stringify(name),
      address: address ? JSON.stringify(address) : null,
      city: data.body.city,
    },
  });
}

async function update(id, data, reqUser) {
  const existing = await prisma.complex.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Complex not found');
    err.statusCode = 404;
    throw err;
  }

  const updates = {};
  if (data.body.name !== undefined) updates.name = JSON.stringify(ensureI18n(data.body.name));
  if (data.body.address !== undefined) updates.address = data.body.address ? JSON.stringify(ensureI18n(data.body.address)) : null;
  if (data.body.city !== undefined) updates.city = data.body.city;

  return prisma.complex.update({
    where: { id },
    data: updates,
  });
}

async function remove(id, reqUser) {
  const existing = await prisma.complex.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Complex not found');
    err.statusCode = 404;
    throw err;
  }
  await prisma.complex.delete({ where: { id } });
  return { success: true };
}

module.exports = { list, getById, create, update, remove };
