# Good Home - Real Estate Backend API

API-only backend for newly built apartments. Plain Node.js + Express.js, no TypeScript.

## Quick Start (Local)

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env: set DATABASE_URL (SQLite), JWT_SECRET

# Generate Prisma client
npx prisma generate

# Create database schema (choose one)
npx prisma db push          # Quick dev setup, no migration files
# OR
npx prisma migrate dev      # Creates migration, applies it (dev only)

# Seed OWNER_ADMIN (optional)
npx prisma db seed

# Run
node src/server.js
# Or with auto-reload: npm run dev
```

Default OWNER_ADMIN: `owner@goodhome.uz` / `admin123` (override via OWNER_ADMIN_EMAIL, OWNER_ADMIN_PASSWORD)

---

## VPS / SSH Deployment

### Tezkor deploy (PM2 + deploy skripti)

```bash
# 1. Serverga SSH orqali ulaning
ssh user@your-server

# 2. Loyihani yuklab oling
cd /var/www
git clone <repo-url> good-home
cd good-home/backend

# 3. .env faylini sozlang
cp .env.example .env
nano .env
# DATABASE_URL, JWT_SECRET, PORT, CORS_ORIGINS o'rnating

# 4. Deploy skriptini ishga tushiring
chmod +x deploy.sh
./deploy.sh
```

### Qo'lda sozlash

```bash
npm install --production
npx prisma generate
npx prisma db push          # yoki: npx prisma migrate deploy
npx prisma db seed

# PM2 bilan ishga tushirish
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### systemd (PM2 o'rniga)

```bash
sudo cp good-home.service /etc/systemd/system/
# good-home.service ichida WorkingDirectory va User/Group ni tekshiring
sudo systemctl daemon-reload
sudo systemctl enable good-home
sudo systemctl start good-home
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | - | Self-register (USER) |
| POST | /api/auth/login | - | Login |
| GET | /api/auth/me | Bearer | Current user |
| GET | /api/apartments | optional | List (active+sold for users) |
| GET | /api/apartments/:id | optional | Get one |
| POST | /api/apartments | Bearer SELLER | Create |
| PATCH | /api/apartments/:id | Bearer SELLER/OWNER | Update |
| DELETE | /api/apartments/:id | Bearer SELLER/OWNER | Delete |
| POST | /api/apartments/:id/sold | Bearer SELLER | Mark sold |
| PATCH | /api/apartments/:id/visibility | Bearer ADMIN+ | Hide/unhide |
| POST | /api/apartments/:id/images | Bearer SELLER | Upload images |
| GET | /api/complexes | - | List complexes |
| GET | /api/complexes/:id | - | Get one |
| POST | /api/complexes | Bearer ADMIN | Create |
| PATCH | /api/complexes/:id | Bearer ADMIN | Update |
| DELETE | /api/complexes/:id | Bearer ADMIN | Delete |
| GET | /api/users/me | Bearer | Profile |
| PATCH | /api/users/me | Bearer | Update profile |
| GET | /api/users/favorites | Bearer | Favorites |
| POST | /api/users/favorites/:apartmentId | Bearer | Add favorite |
| DELETE | /api/users/favorites/:apartmentId | Bearer | Remove favorite |
| GET | /api/users/saved-searches | Bearer | Saved searches |
| POST | /api/users/saved-searches | Bearer | Create saved search |
| DELETE | /api/users/saved-searches/:id | Bearer | Delete saved search |
| GET | /api/analytics/stats | Bearer ADMIN | Stats |
| POST | /api/admin/users | Bearer MANAGER+ | Create user (role by creator) |
| GET | /api/admin/users | Bearer MANAGER+ | List users |

---

## Complex Docs

See `docs/complex.md` for multipart payload examples and field details.

## Tech Stack

- Node.js (>=18)
- Express.js
- Prisma ORM
- SQLite
- JWT, bcrypt, multer, zod, dotenv, cors
