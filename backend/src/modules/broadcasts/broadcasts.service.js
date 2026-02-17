const { prisma } = require('../../config/db');

async function listPublic(data) {
  try {
    const { limit = 5 } = data.query;
    const result = await prisma.broadcast.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      select: {
        id: true,
        title: true,
        message: true,
        isActive: true,
        createdAt: true,
        createdById: true,
      },
    });
    return result;
  } catch (error) {
    console.error('Error in broadcasts.listPublic:', error);
    // If table doesn't exist, return empty array instead of crashing
    if (error.message && error.message.includes('does not exist')) {
      return [];
    }
    throw error;
  }
}

async function create(data, reqUser) {
  const { title, message, isActive } = data.body;
  return prisma.broadcast.create({
    data: {
      title,
      message,
      isActive: isActive ?? true,
      createdById: reqUser.id,
    },
    select: {
      id: true,
      title: true,
      message: true,
      isActive: true,
      createdAt: true,
      createdById: true,
    },
  });
}

async function update(id, data) {
  const existing = await prisma.broadcast.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Broadcast not found');
    err.statusCode = 404;
    throw err;
  }

  const updates = {};
  if (data.body.title !== undefined) updates.title = data.body.title;
  if (data.body.message !== undefined) updates.message = data.body.message;
  if (data.body.isActive !== undefined) updates.isActive = data.body.isActive;

  return prisma.broadcast.update({
    where: { id },
    data: updates,
    select: {
      id: true,
      title: true,
      message: true,
      isActive: true,
      createdAt: true,
      createdById: true,
    },
  });
}

async function remove(id) {
  const existing = await prisma.broadcast.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Broadcast not found');
    err.statusCode = 404;
    throw err;
  }

  await prisma.broadcast.delete({ where: { id } });
  return { success: true };
}

module.exports = { listPublic, create, update, remove };
