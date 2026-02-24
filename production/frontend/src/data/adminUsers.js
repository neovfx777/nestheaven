// Admin users data for seeding
// These users will be created in the database with different roles

import bcrypt from 'bcryptjs';

export const adminUsers = [
  {
    id: "admin-001",
    email: "admin@nestheaven.uz",
    password: "Admin123!",
    role: "ADMIN",
    firstName: "Super",
    lastName: "Admin",
    phone: "+998901234567"
  },
  {
    id: "manager-001", 
    email: "manager@nestheaven.uz",
    password: "Manager123!",
    role: "MANAGER_ADMIN",
    firstName: "Manager",
    lastName: "Admin",
    phone: "+998902345678"
  },
  {
    id: "owner-001",
    email: "owner@nestheaven.uz", 
    password: "Owner123!",
    role: "OWNER_ADMIN",
    firstName: "Owner",
    lastName: "Admin",
    phone: "+998903456789"
  }
];

// Hash passwords for database storage
export const hashedAdminUsers = adminUsers.map(user => ({
  ...user,
  passwordHash: bcrypt.hashSync(user.password, 10)
}));

// Remove plain password from final export
export const adminUsersForDB = hashedAdminUsers.map(({ password, ...user }) => user);

export default {
  users: adminUsersForDB,
  plainCredentials: adminUsers
};
