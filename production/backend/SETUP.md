# Backend Setup Instructions

## 1. Environment Configuration

Create a `.env` file in the backend directory with the following content:

```env
# Server
NODE_ENV=development
PORT=3000

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/good_home?schema=public"

# JWT
JWT_SECRET=nestheaven-super-secret-jwt-key-change-in-production-2024

# Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10

# CORS (comma-separated origins, or * for all)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Seed (optional - for initial OWNER_ADMIN)
OWNER_ADMIN_EMAIL=admin@nestheaven.uz
OWNER_ADMIN_PASSWORD=Admin123!
```

## 2. Database Setup

1. Install PostgreSQL and create a database named `good_home`
2. Update the `DATABASE_URL` in your `.env` file with your PostgreSQL credentials
3. Run database migrations:
   ```bash
   npx prisma migrate dev
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

This will create three admin users:
- **Super Admin**: `admin@nestheaven.uz` / `Admin123!`
- **Manager Admin**: `manager@nestheaven.uz` / `Manager123!`
- **Owner Admin**: `owner@nestheaven.uz` / `Owner123!`

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
- Verify PostgreSQL is running
- Check the DATABASE_URL format
- Ensure the database `good_home` exists

### Frontend-Backend Connection
- Backend: http://localhost:3000
- Frontend: http://localhost:5173
- API calls: http://localhost:3000/api/*
