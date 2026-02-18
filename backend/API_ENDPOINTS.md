# API Endpoints Reference

This document lists all available API endpoints in the backend.

## Base URL
- Local: `http://localhost:3000/api`
- Production: `http://45.92.173.175:3000/api`

## Authentication (`/auth`)
- `POST /auth/login` - Login user
- `POST /auth/register` - Register new user
- `GET /auth/me` - Get current user profile (authenticated)

## Users (`/users`)
- `GET /users/me` - Get user profile
- `PATCH /users/me` - Update user profile
- `GET /users/favorites` - Get user favorites
- `POST /users/favorites` - Add favorite
- `POST /users/favorites/:apartmentId` - Add favorite by apartment ID
- `DELETE /users/favorites/:apartmentId` - Remove favorite
- `GET /users/favorites/status/:apartmentId` - Check favorite status
- `GET /users/saved-searches` - Get saved searches
- `POST /users/saved-searches` - Create saved search
- `DELETE /users/saved-searches/:id` - Delete saved search
- `GET /users/sellers` - Get sellers list (Manager Admin only)

## Sellers (`/users/sellers`) - Specific route
- `GET /users/sellers` - Get all sellers (Manager Admin only)
- `GET /users/sellers/:id` - Get seller by ID (Manager Admin only)

## Apartments (`/apartments`)
- `GET /apartments` - List apartments (public, optional auth)
- `GET /apartments/:id` - Get apartment by ID (public, optional auth)
- `GET /apartments/seller/my` - Get seller's own listings (Seller only)
- `POST /apartments` - Create apartment (Seller only)
- `POST /apartments/:id/sold` - Mark apartment as sold (Seller only)
- `PATCH /apartments/:id` - Update apartment (Seller or Owner Admin)
- `DELETE /apartments/:id` - Delete apartment (Owner Admin only)
- `PATCH /apartments/:id/visibility` - Change visibility (Admin only)
- `POST /apartments/:id/images` - Upload images (Seller only)

## Apartment Status (`/apartment-status`)
- `GET /apartment-status/:apartmentId/history` - Get status history
- `PATCH /apartment-status/:apartmentId/status` - Change status (Admin only)
- `POST /apartment-status/:apartmentId/sold` - Mark as sold (Seller only)
- `POST /apartment-status/bulk/status` - Bulk status change (Admin only)
- `POST /apartment-status/bulk/sold` - Bulk mark as sold (Seller only)

## Complexes (`/complexes`)
- `GET /complexes` - List complexes (public)
- `GET /complexes/:id` - Get complex by ID (public)
- `GET /complexes/for-seller` - Get complexes for seller (Seller only)
- `POST /complexes` - Create complex (Manager Admin only)
- `PATCH /complexes/:id` - Update complex (Manager Admin only)
- `DELETE /complexes/:id` - Delete complex (Owner Admin only)

## Analytics (`/analytics`)
- `GET /analytics/stats` - Get statistics (authenticated users)

## Admin (`/admin`)
- `POST /admin/users` - Create user (Manager Admin only)
- `GET /admin/users` - List users (Manager Admin only)
- `GET /admin/users/:id` - Get user by ID (Manager Admin only)
- `PATCH /admin/users/:id` - Update user (Manager Admin only)
- `DELETE /admin/users/:id` - Delete user (Owner Admin only)

## Broadcasts (`/broadcasts`)
- `GET /broadcasts` - List broadcasts (public)
- `POST /broadcasts` - Create broadcast (Owner Admin only)
- `PATCH /broadcasts/:id` - Update broadcast (Owner Admin only)
- `DELETE /broadcasts/:id` - Delete broadcast (Owner Admin only)

## Notes
- All endpoints except public ones require authentication via Bearer token
- Role-based access control is enforced on all endpoints
- File uploads use `multipart/form-data` content type
