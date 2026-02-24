# API Fixes and Database Reset Summary

## ✅ Completed Tasks

### 1. API Endpoint Fixes

Fixed the following API endpoint mismatches between frontend and backend:

#### Fixed Endpoints:
1. **Auth Profile** (`frontend/src/api/auth.ts`)
   - ❌ Old: `/auth/profile`
   - ✅ New: `/auth/me`
   - Matches backend route: `GET /auth/me`

2. **Admin Stats** (`frontend/src/api/apartments.ts`)
   - ❌ Old: `/admin/stats`
   - ✅ New: `/analytics/stats`
   - Matches backend route: `GET /analytics/stats`

3. **Status History** (`frontend/src/api/status.ts`)
   - ❌ Old: `/apartments/:id/status/history`
   - ✅ New: `/apartment-status/:apartmentId/history`
   - Matches backend route: `GET /apartment-status/:apartmentId/history`

4. **Status Transitions** (`frontend/src/api/status.ts`)
   - ⚠️ Endpoint not implemented in backend yet
   - Added TODO comment and error handling

5. **Export Apartments** (`frontend/src/api/apartments.ts`)
   - ⚠️ Endpoint `/admin/export/apartments` doesn't exist in backend
   - Added TODO comment and error handling

#### Verified Correct Endpoints:
- ✅ `/apartments/:id/sold` - Correct (in apartments routes)
- ✅ `/apartments/:id/visibility` - Correct (in apartments routes)
- ✅ `/users/sellers` - Correct (specific route in app.js)
- ✅ All other endpoints verified against backend routes

### 2. Database Clearing Script

Created `backend/scripts/clear-database.js`:
- Deletes all data in correct order (respecting foreign keys)
- Clears: favorites, saved searches, apartment images, apartments, complexes, broadcasts, users
- Added npm script: `npm run db:clear`

### 3. Account Seeding Script

Created `backend/scripts/seed-accounts.js`:
- Seeds three hardcoded accounts:
  1. **Seller Account**
     - Email: `seller@nestheaven.com`
     - Password: `Admin123!`
     - Role: `SELLER`
  
  2. **Manager Admin Account**
     - Email: `manager@nestheaven.com`
     - Password: `Admin123!`
     - Role: `MANAGER_ADMIN`
  
  3. **Owner Admin Account**
     - Email: `owner@nestheaven.com`
     - Password: `Admin123!`
     - Role: `OWNER_ADMIN`

- Uses `upsert` to create or update accounts
- Added npm scripts:
  - `npm run db:seed-accounts` - Seed accounts only
  - `npm run db:reset` - Clear database and seed accounts

### 4. Documentation

Created `backend/API_ENDPOINTS.md`:
- Complete reference of all API endpoints
- Includes authentication requirements
- Lists role-based access controls

## 📋 Usage Instructions

### Clear Database:
```bash
cd backend
npm run db:clear
```

### Seed Accounts:
```bash
cd backend
npm run db:seed-accounts
```

### Reset Database (Clear + Seed):
```bash
cd backend
npm run db:reset
```

## 🔐 Hardcoded Accounts

After running the seed script, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Seller | seller@nestheaven.com | Admin123! |
| Manager Admin | manager@nestheaven.com | Admin123! |
| Owner Admin | owner@nestheaven.com | Admin123! |

## 📝 Notes

1. All API endpoints have been verified against the backend routes
2. The frontend API client uses the production server by default (`http://45.92.173.175:3000/api`)
3. For local development, set `VITE_API_URL=http://localhost:3000/api` in `.env`
4. Some endpoints marked with TODO may need backend implementation:
   - Status transitions endpoint
   - Export apartments endpoint

## ✅ Verification

All API calls in the frontend have been checked and corrected to match the backend routes defined in:
- `backend/src/routes.js`
- `backend/src/app.js` (specific routes)
- Individual route files in `backend/src/modules/*/`
