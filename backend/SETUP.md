# Backend Setup Instructions

## 1. Environment Configuration

Create a `.env` file in the backend directory with the following content:

```env
# Server
NODE_ENV=development
PORT=3000

# Database (SQLite - default)
DATABASE_URL="file:./prisma/dev.db"

# JWT
JWT_SECRET=nestheaven-super-secret-jwt-key-change-in-production-2024

# Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10

# CORS (comma-separated origins, or * for all)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Seed/reset accounts
OWNER_ADMIN_EMAIL=
OWNER_ADMIN_PASSWORD=
ADMIN_EMAIL=
ADMIN_PASSWORD=
MANAGER_ADMIN_EMAIL=
MANAGER_ADMIN_PASSWORD=
SELLER_EMAIL=
SELLER_PASSWORD=
```

## 2. Database Setup

1. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
2. Create/update DB schema:
   ```bash
   npx prisma db push
   # or: npx prisma migrate dev
   ```

## 3. Install Dependencies

```bash
npm install
```

## 4. Seed Database

Run the seed script to create admin users:

```bash
npx prisma db seed
```

Seed uses explicit account credentials from environment variables
(`OWNER_ADMIN_*`, `ADMIN_*`, `MANAGER_ADMIN_*`, `SELLER_*`).

## 5. Start Backend Server

```bash
npm start
```

The backend will run on `http://localhost:3000`

## 6. Test Frontend Integration

The frontend should now be able to connect to the backend at `http://localhost:3000/api`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user

### Apartments
- `GET /api/apartments` - Get apartments
- `POST /api/apartments` - Create apartment (authenticated)
- `GET /api/apartments/:id` - Get apartment details

### Complexes
- `GET /api/complexes` - Get complexes
- `POST /api/complexes` - Create complex (admin)

### Admin
- `GET /api/admin/stats` - Get statistics (admin)
- `GET /api/admin/apartments` - Manage apartments (admin)

## Troubleshooting

### 401 Unauthorized Error
- Make sure the backend server is running on port 3000
- Check that the database is seeded with admin users
- Verify the CORS origins include your frontend URL
- Check that JWT_SECRET is set in .env

### Database Connection Issues
- Check the `DATABASE_URL` format
- Delete `backend/prisma/dev.db` and re-run `npx prisma db push` if schema changes

### Frontend-Backend Connection
- Backend: http://localhost:3000
- Frontend: http://localhost:5173
- API calls: http://localhost:3000/api/*
