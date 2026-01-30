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

async function getUserById(id, reqUser) {
  const user = await prisma.user.findUnique({
    where: { id },
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

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  // Check permissions
  if (reqUser.role === ROLES.MANAGER_ADMIN && user.role !== ROLES.ADMIN) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  return user;
}

async function updateUser(id, data, reqUser) {
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  // Check permissions
  if (reqUser.role === ROLES.MANAGER_ADMIN && existingUser.role !== ROLES.ADMIN) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  const updates = {};
  if (data.body.firstName !== undefined) updates.firstName = data.body.firstName;
  if (data.body.lastName !== undefined) updates.lastName = data.body.lastName;
  if (data.body.phone !== undefined) updates.phone = data.body.phone;
  if (data.body.role !== undefined && canCreateRole(reqUser.role, data.body.role)) {
    updates.role = data.body.role;
  }

  return prisma.user.update({
    where: { id },
    data: updates,
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
}

async function deleteUser(id, reqUser) {
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  // Check permissions - can't delete users with equal or higher role
  if (!canCreateRole(reqUser.role, existingUser.role)) {
    const err = new Error('Cannot delete user with equal or higher role');
    err.statusCode = 403;
    throw err;
  }

  await prisma.user.delete({ where: { id } });
  return { success: true };
}

module.exports = { 
  createUser, 
  listUsers, 
  getUserById, 
  updateUser, 
  deleteUser 
};
