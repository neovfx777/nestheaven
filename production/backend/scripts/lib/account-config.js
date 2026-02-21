require('dotenv').config();

const ACCOUNT_SHAPES = [
  {
    role: 'OWNER_ADMIN',
    emailEnv: 'OWNER_ADMIN_EMAIL',
    passwordEnv: 'OWNER_ADMIN_PASSWORD',
    firstName: 'Owner',
    lastName: 'Admin',
    phone: '+998905555555',
  },
  {
    role: 'ADMIN',
    emailEnv: 'ADMIN_EMAIL',
    passwordEnv: 'ADMIN_PASSWORD',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+998903333333',
  },
  {
    role: 'MANAGER_ADMIN',
    emailEnv: 'MANAGER_ADMIN_EMAIL',
    passwordEnv: 'MANAGER_ADMIN_PASSWORD',
    firstName: 'Manager',
    lastName: 'Admin',
    phone: '+998904444444',
  },
  {
    role: 'SELLER',
    emailEnv: 'SELLER_EMAIL',
    passwordEnv: 'SELLER_PASSWORD',
    firstName: 'Primary',
    lastName: 'Seller',
    phone: '+998902222222',
  },
];

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

function loadConfiguredAccounts() {
  return ACCOUNT_SHAPES.map((shape) => ({
    email: requireEnv(shape.emailEnv).toLowerCase(),
    password: requireEnv(shape.passwordEnv),
    role: shape.role,
    firstName: shape.firstName,
    lastName: shape.lastName,
    phone: shape.phone,
  }));
}

module.exports = {
  loadConfiguredAccounts,
};
