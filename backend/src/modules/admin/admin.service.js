const bcrypt = require('bcrypt');
const { prisma } = require('../../config/db');
const { canCreateRole } = require('../../utils/roles');
const { ROLES } = require('../../utils/roles');

async function createUser(data, reqUser) {
  const { role } = data.body;

  if (!canCreateRole(reqUser.role, role)) {
    const err = new Error(`You cannot create users with role ${role}`);
    err.statusCode = 403;
    throw err;
  }

  const existing = await prisma.user.findUnique({
    where: { email: data.body.email.toLowerCase() },
  });

  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(data.body.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.body.email.toLowerCase(),
      passwordHash,
      role,
      firstName: data.body.firstName,
      lastName: data.body.lastName,
      phone: data.body.phone,
      createdById: reqUser.id,
    },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
    },
  });

  return user;
}

async function listUsers(roleFilter, reqUser) {
  const isOwnerAdmin = reqUser.role === ROLES.OWNER_ADMIN;
  const isManagerAdmin = reqUser.role === ROLES.MANAGER_ADMIN;

  const where = {};
  if (roleFilter) {
    where.role = roleFilter;
  }
  if (isManagerAdmin) {
    where.role = ROLES.ADMIN;
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return users;
}

module.exports = { createUser, listUsers };
