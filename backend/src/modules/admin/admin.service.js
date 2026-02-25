const bcrypt = require('bcrypt');
const { prisma } = require('../../config/db');
const { canCreateRole } = require('../../utils/roles');
const { ROLES } = require('../../utils/roles');
const { getFirebaseAuth } = require('../../utils/firebaseAdmin');

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
      isActive: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
    },
  });

  try {
    const auth = getFirebaseAuth();
    const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    await auth.createUser({
      email: user.email,
      password: data.body.password,
      emailVerified: user.emailVerified !== false,
      ...(displayName && { displayName }),
    });
  } catch (error) {
    if (error?.code !== 'auth/email-already-exists') {
      console.warn('[firebase] Failed to create firebase user for admin-created account:', {
        email: user.email,
        code: error?.code,
        message: error?.message,
      });
    }
  }

  return user;
}

async function listUsers(filters, reqUser) {
  const { roleFilter, searchTerm, searchBy, mode } = filters;
  const isOwnerAdmin = reqUser.role === ROLES.OWNER_ADMIN;

  const where = {};

  const allowedRoles = isOwnerAdmin
    ? [ROLES.USER, ROLES.SELLER, ROLES.ADMIN, ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN]
    : [ROLES.USER, ROLES.SELLER, ROLES.ADMIN];

  let scopedRoles = allowedRoles;
  if (mode === 'users') {
    scopedRoles = allowedRoles.filter((role) => [ROLES.USER, ROLES.SELLER].includes(role));
  } else if (mode === 'admins') {
    scopedRoles = allowedRoles.filter((role) => [ROLES.ADMIN, ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN].includes(role));
  }

  if (roleFilter) {
    if (!scopedRoles.includes(roleFilter)) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      throw err;
    }
    where.role = roleFilter;
  } else {
    where.role = scopedRoles.length === 1 ? scopedRoles[0] : { in: scopedRoles };
  }
  
  if (searchTerm && searchTerm.trim() !== '') {
    const searchTermLower = searchTerm.toLowerCase().trim();
    // For SQLite, we use string functions for case-insensitive search
    // SQLite doesn't support mode: 'insensitive' directly
    
    switch(searchBy) {
      case 'name':
        // Search in firstName OR lastName (case insensitive)
        where.AND = [
          {
            OR: [
              {
                firstName: {
                  contains: searchTermLower
                }
              },
              {
                lastName: {
                  contains: searchTermLower
                }
              }
            ]
          }
        ];
        break;
        
      case 'email':
        // Search in email (case insensitive)
        where.email = {
          contains: searchTermLower
        };
        break;
        
      case 'phone':
        // Search in phone number
        where.phone = {
          contains: searchTermLower
        };
        break;
        
      case 'all':
      default:
        // Search across all searchable fields
        where.AND = [
          {
            OR: [
              {
                firstName: {
                  contains: searchTermLower
                }
              },
              {
                lastName: {
                  contains: searchTermLower
                }
              },
              {
                email: {
                  contains: searchTermLower
                }
              },
              {
                phone: {
                  contains: searchTermLower
                }
              }
            ]
          }
        ];
        break;
    }
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get total count for pagination info
  const totalCount = await prisma.user.count({ where });
  
  // Since SQLite doesn't support case-insensitive search natively,
  // we need to filter the results manually
  let filteredUsers = users;
  if (searchTerm && searchTerm.trim() !== '') {
    const searchTermLower = searchTerm.toLowerCase().trim();
    
    filteredUsers = users.filter(user => {
      switch(searchBy) {
        case 'name':
          return (
            (user.firstName && user.firstName.toLowerCase().includes(searchTermLower)) ||
            (user.lastName && user.lastName.toLowerCase().includes(searchTermLower))
          );
        case 'email':
          return user.email.toLowerCase().includes(searchTermLower);
        case 'phone':
          return user.phone && user.phone.includes(searchTermLower);
        case 'all':
        default:
          return (
            (user.firstName && user.firstName.toLowerCase().includes(searchTermLower)) ||
            (user.lastName && user.lastName.toLowerCase().includes(searchTermLower)) ||
            user.email.toLowerCase().includes(searchTermLower) ||
            (user.phone && user.phone.includes(searchTermLower))
          );
      }
    });
  }
  
  return {
    users: filteredUsers,
    total: filteredUsers.length,
    filters: {
      role: roleFilter,
      searchTerm,
      searchBy
    },
    search: {
      term: searchTerm || null,
      by: searchBy || 'all',
      performed: !!(searchTerm && searchTerm.trim() !== '')
    }
  };
}

async function getUserById(id, reqUser) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
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
  if (reqUser.role === ROLES.MANAGER_ADMIN && [ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN].includes(user.role)) {
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

  // Manager admin cannot manage other managers or owner
  if (reqUser.role === ROLES.MANAGER_ADMIN) {
    if ([ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN].includes(existingUser.role)) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      throw err;
    }
  }

  const updates = {};
  if (data.body.firstName !== undefined) updates.firstName = data.body.firstName;
  if (data.body.lastName !== undefined) updates.lastName = data.body.lastName;
  if (data.body.phone !== undefined) updates.phone = data.body.phone;
  if (data.body.role !== undefined) {
    if (!canCreateRole(reqUser.role, data.body.role)) {
      const err = new Error('Cannot assign this role');
      err.statusCode = 403;
      throw err;
    }
    updates.role = data.body.role;
  }

  if (data.body.isActive !== undefined) {
    if (reqUser.id === existingUser.id && data.body.isActive === false) {
      const err = new Error('You cannot deactivate yourself');
      err.statusCode = 400;
      throw err;
    }
    if (reqUser.role === ROLES.MANAGER_ADMIN) {
      if ([ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN].includes(existingUser.role)) {
        const err = new Error('Forbidden');
        err.statusCode = 403;
        throw err;
      }
    }
    updates.isActive = data.body.isActive;
    if (data.body.isActive === false) {
      updates.deactivatedAt = new Date();
      updates.deactivatedById = reqUser.id;
    } else {
      updates.deactivatedAt = null;
      updates.deactivatedById = null;
    }
  }

  return prisma.user.update({
    where: { id },
    data: updates,
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
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
  if (reqUser.id === existingUser.id) {
    const err = new Error('You cannot delete yourself');
    err.statusCode = 400;
    throw err;
  }

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
