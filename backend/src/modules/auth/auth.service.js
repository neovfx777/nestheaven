const bcrypt = require('bcrypt');
const { prisma } = require('../../config/db');
const { signToken } = require('../../utils/jwt');
const { ROLES } = require('../../utils/roles');

async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      createdAt: user.createdAt,
    },
  };
}

async function register(data) {
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
      role: ROLES.USER,
      firstName: data.body.firstName,
      lastName: data.body.lastName,
      phone: data.body.phone,
    },
  });

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      createdAt: user.createdAt,
    },
  };
}

module.exports = { login, register };
