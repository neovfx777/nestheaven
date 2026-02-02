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

async function listUsers(filters, reqUser) {
  const { roleFilter, searchTerm, searchBy } = filters;
  const isOwnerAdmin = reqUser.role === ROLES.OWNER_ADMIN;
  const isManagerAdmin = reqUser.role === ROLES.MANAGER_ADMIN;

  // Build the where clause
  const where = {};
  
  // Add role filter if specified
  if (roleFilter) {
    where.role = roleFilter;
  }
  
  // If Manager Admin, can only see ADMINS (unless searching)
  if (isManagerAdmin && !isOwnerAdmin) {
    // If no specific role filter is set, limit to ADMIN role
    if (!roleFilter) {
      where.role = ROLES.ADMIN;
    }
    // If role filter is set, ensure it's not higher than ADMIN
    else if (roleFilter === ROLES.MANAGER_ADMIN || roleFilter === ROLES.OWNER_ADMIN) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      throw err;
    }
  }
  
  // Add search filter if searchTerm is provided
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