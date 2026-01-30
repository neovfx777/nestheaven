# Admin Login Credentials

## Default Admin Accounts

### Super Admin
**Email:** `admin@nestheaven.uz`  
**Password:** `Admin123!`  
**Role:** ADMIN - Full system access

### Manager Admin  
**Email:** `manager@nestheaven.uz`  
**Password:** `Manager123!`  
**Role:** MANAGER_ADMIN - Can manage apartments and complexes

### Owner Admin
**Email:** `owner@nestheaven.uz`  
**Password:** `Owner123!`  
**Role:** OWNER_ADMIN - Can manage everything including users

> **Note:** These are default admin accounts. Please change passwords after first login for security purposes.

## Role Permissions

### ADMIN (Super Admin)
- Full system access
- User management
- All apartment and complex operations
- System configuration
- Analytics and reports

### MANAGER_ADMIN
- Apartment management (create, edit, delete)
- Complex management
- View analytics
- Cannot manage other admin users

### OWNER_ADMIN
- All ADMIN permissions
- Additional owner-specific features
- System ownership controls

## Admin Features

### Apartment Management
- View all apartment listings
- Change apartment status (active, hidden, sold)
- Toggle Featured status (Free) - Makes apartment appear in "Qaynoq sotilyotgan uylar" carousel
- Toggle Recommended status (Paid) - Makes apartment appear in "Tavsiya etilgan uylar" carousel
- Bulk operations on multiple apartments

### Featured vs Recommended
- **Featured (Free)**: Appears in "Qaynoq sotilyotgan uylar" carousel - No payment required
- **Recommended (Paid)**: Appears in "Tavsiya etilgan uylar" carousel - Requires payment from seller

## How to Use

1. Navigate to `/login`
2. Enter admin credentials based on your role
3. After login, go to `/dashboard`
4. Access admin features from the dashboard
5. Admin routes are available under `/dashboard/admin/`

## Security Note

⚠️ **Important:** Change the default passwords immediately after first login!

## API Access

Admin users can access the following protected endpoints:
- `GET /api/admin/analytics` - Analytics dashboard
- `GET /api/admin/apartments` - All apartments management
- `POST /api/admin/apartments` - Create new apartment
- `PUT /api/admin/apartments/:id` - Update apartment
- `DELETE /api/admin/apartments/:id` - Delete apartment
- `GET /api/admin/complexes` - All complexes management
- `POST /api/admin/complexes` - Create new complex
- `PUT /api/admin/complexes/:id` - Update complex
- `DELETE /api/admin/complexes/:id` - Delete complex
